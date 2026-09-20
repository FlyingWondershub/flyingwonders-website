import fs from "fs";
import path from "path";
import http from "http";
import url from "url";
import readline from "readline";
import { exec } from "child_process";
import { google } from "googleapis";
import * as XLSX from "xlsx";

const SCRIPT_DIR = path.resolve(import.meta.dirname || ".");
const CREDENTIALS_PATH = path.join(SCRIPT_DIR, "credentials.json");
const TOKENS_DIR = path.join(SCRIPT_DIR, "tokens");
const DATA_DIR = path.join(SCRIPT_DIR, "data");
const OUTPUT_DIR = path.join(SCRIPT_DIR, "output");
const STATE_FILE = path.join(DATA_DIR, "sync_state.json");
const DB_FILE = path.join(DATA_DIR, "master_leads_db.json");

[TOKENS_DIR, DATA_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

// JUNK / NOISE FILTERS
const JUNK_PREFIXES = [
  "noreply", "no-reply", "donotreply", "do-not-reply",
  "mailer-daemon", "bounce", "bounces", "postmaster",
  "notifications", "notification", "alert", "alerts",
  "billing", "invoice", "invoices", "receipts", "receipt",
  "security", "security-noreply", "account-protection",
  "automated", "auto-confirm", "system"
];

const JUNK_DOMAINS = new Set([
  "accounts.google.com", "google.com", "github.com", "stripe.com",
  "paypal.com", "aws.amazon.com", "notifications.google.com",
  "cloudflare.com", "docker.com", "vercel.com", "npmjs.com"
]);

const CONSUMER_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com",
  "outlook.com", "hotmail.com", "live.com", "icloud.com",
  "aol.com", "zoho.com", "proton.me", "protonmail.com"
]);

const RELEVANT_KEYWORDS = [
  "event", "events", "festival", "festivals", "conference", "summit",
  "expo", "exhibition", "brand", "marketing", "sponsorship", "sponsor",
  "activation", "celebration", "wedding", "planner", "agency", "production",
  "entertainment", "concert", "drone", "lighting", "creative", "experiential",
  "show", "aerial", "corporate", "tourism", "convention", "fair"
];

const TITLE_PATTERNS = [
  /founder(?:\s+(&|and)\s+ceo)?/i,
  /co-founder/i,
  /chief\s+executive\s+officer|ceo/i,
  /chief\s+marketing\s+officer|cmo/i,
  /chief\s+creative\s+officer|cco/i,
  /director\s+of\s+events?/i,
  /event\s+(?:director|manager|producer|planner|coordinator)/i,
  /marketing\s+(?:director|manager|lead|head|vp)/i,
  /head\s+of\s+(?:marketing|brand|events?|partnerships?)/i,
  /brand\s+(?:manager|director|lead)/i,
  /producer|creative\s+director|art\s+director/i,
  /general\s+manager|managing\s+director/i,
  /business\s+development/i
];

// Industry Accreditations & Certifications
const ACCREDITATION_PATTERNS = [
  /\bISO\s*9001\b/i,
  /\bISO\s*27001\b/i,
  /\bISO\s*\d{4,5}\b/i,
  /\bEEMA\b/i, // Event and Entertainment Management Association
  /\bILEA\b/i, // International Live Events Association
  /\bMPI\b/i,  // Meeting Professionals International
  /\bIAAPA\b/i,// Global Association for Attractions & Entertainment
  /\bFICCI\b/i,
  /\bCII\b/i,
  /\bForbes\s+(?:Council|30\s*under\s*30)\b/i,
  /\bGreat\s+Place\s+to\s+Work\b/i,
  /\bGoogle\s+Partner\b/i,
  /\bMeta\s+Business\s+Partner\b/i,
  /\bAward-Winning\b/i,
  /\bBest\s+(?:Agency|Production|Event\s+Company)\b/i
];

function loadSyncState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveSyncState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

function loadMasterDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch {
      return { leads: {}, companies: {}, inquiries: [] };
    }
  }
  return { leads: {}, companies: {}, inquiries: [] };
}

function saveMasterDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function extractDomain(email) {
  if (!email || !email.includes("@")) return "";
  const domain = email.split("@")[1].toLowerCase().trim();
  const parts = domain.split(".");
  if (parts.length > 2) {
    const secondLast = parts[parts.length - 2];
    if (["co", "com", "org", "gov", "net", "edu"].includes(secondLast)) {
      return parts.slice(-3).join(".");
    }
    return parts.slice(-2).join(".");
  }
  return domain;
}

function parseEmailHeader(raw) {
  if (!raw) return { name: "", email: "" };
  const match = raw.match(/(.*?)<([^>]+)>/);
  if (match) {
    const name = match[1].replace(/["']/g, "").trim();
    const email = match[2].toLowerCase().trim();
    return { name, email };
  }
  const cleanEmail = raw.replace(/["']/g, "").toLowerCase().trim();
  return { name: "", email: cleanEmail };
}

function isJunkEmail(email) {
  if (!email || !email.includes("@")) return true;
  const [localPart, domain] = email.toLowerCase().split("@");
  if (JUNK_DOMAINS.has(domain)) return true;
  for (const junk of JUNK_PREFIXES) {
    if (localPart === junk || localPart.startsWith(`${junk}+`) || localPart.startsWith(`${junk}-`)) {
      return true;
    }
  }
  return false;
}

function decodeBase64Url(data) {
  if (!data) return "";
  const buff = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  return buff.toString("utf-8");
}

function extractBodyText(payload) {
  let body = "";
  if (!payload) return "";
  if (payload.body && payload.body.data) {
    body += decodeBase64Url(payload.body.data) + " ";
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        body += decodeBase64Url(part.body.data) + " ";
      } else if (part.mimeType === "text/html" && part.body?.data) {
        const html = decodeBase64Url(part.body.data);
        body += html.replace(/<[^>]+>/g, " ") + " ";
      } else if (part.parts) {
        body += extractBodyText(part) + " ";
      }
    }
  }
  return body.replace(/\s+/g, " ").trim();
}

function extractPhonesAndWhatsApp(text) {
  const phones = new Set();
  const whatsapps = new Set();

  const waRegex = /(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/??([+\d]{7,16})/gi;
  let waMatch;
  while ((waMatch = waRegex.exec(text)) !== null) {
    whatsapps.add(waMatch[1].replace(/[^\d+]/g, ""));
  }

  const phoneRegex = /(?:(?:\+|00)[1-9]\d{0,2}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,5}/g;
  const rawMatches = text.match(phoneRegex) || [];
  
  for (const raw of rawMatches) {
    const cleaned = raw.replace(/[^\d+]/g, "");
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      if (!cleaned.startsWith("19") && !cleaned.startsWith("20")) {
        phones.add(cleaned);
      }
    }
  }

  return {
    phoneList: Array.from(phones).slice(0, 3).join(", "),
    whatsappList: Array.from(whatsapps).slice(0, 2).join(", ")
  };
}

function extractSocialsAndWeb(text, emailDomain) {
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+/i);
  const instagramMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/i);
  const twitterMatch = text.match(/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i);
  const calendlyMatch = text.match(/https?:\/\/(?:www\.)?(?:calendly\.com|meetings\.hubspot\.com)\/[a-zA-Z0-9_-]+/i);

  // Explicit website link in signature (e.g. www.xyz.com or https://xyz.com)
  const webMatch = text.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/i);
  let website = "";
  if (webMatch && !CONSUMER_DOMAINS.has(webMatch[1].toLowerCase())) {
    website = `https://${webMatch[1].toLowerCase()}`;
  } else if (emailDomain && !CONSUMER_DOMAINS.has(emailDomain)) {
    website = `https://${emailDomain}`;
  }

  return {
    linkedin: linkedinMatch ? linkedinMatch[0] : "",
    instagram: instagramMatch ? instagramMatch[0] : "",
    twitter: twitterMatch ? twitterMatch[0] : "",
    meetingLink: calendlyMatch ? calendlyMatch[0] : "",
    website
  };
}

function extractAccreditations(text) {
  const matches = new Set();
  for (const pattern of ACCREDITATION_PATTERNS) {
    const m = text.match(pattern);
    if (m) matches.add(m[0].trim());
  }
  return Array.from(matches).join(", ");
}

function extractTaxAndLegalId(text) {
  // Indian GSTIN pattern (15 chars)
  const gstMatch = text.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/);
  if (gstMatch) return `GST: ${gstMatch[0]}`;

  // CIN pattern (21 chars)
  const cinMatch = text.match(/\b[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/);
  if (cinMatch) return `CIN: ${cinMatch[0]}`;

  return "";
}

function extractDesignation(text) {
  for (const pattern of TITLE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return "";
}

function extractLocation(text) {
  const cities = ["Mumbai", "Delhi", "Bengaluru", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa", "Dubai", "Singapore", "London", "New York", "Noida", "Gurugram", "Gurgaon"];
  for (const city of cities) {
    const regex = new RegExp(`\\b${city}\\b`, "i");
    if (regex.test(text)) return city;
  }
  return "";
}

function classifyLead(email, name, subject, fullText) {
  const localPart = email.split("@")[0].toLowerCase();
  const isDept = /^(marketing|events|event|partnerships|partner|pr|press|hello|hi|contact|info|sales|media|team|connect)($|\+|\.)/i.test(localPart);
  const isIndividual = !isDept && /[a-z]+(\.[a-z]+|_|-)?/i.test(localPart) && (name.includes(" ") || !name.toLowerCase().includes("team"));

  const combinedText = `${name} ${subject} ${fullText}`.toLowerCase();
  let score = 0;
  const matchedKeywords = [];
  for (const kw of RELEVANT_KEYWORDS) {
    if (combinedText.includes(kw)) {
      score += 1;
      matchedKeywords.push(kw);
    }
  }

  let leadType = "General Brand / Newsletter";
  if (isIndividual) leadType = "Direct Individual";
  else if (isDept) leadType = "Department Inbox";

  let priority = "Normal";
  if (score >= 2 || (isIndividual && score >= 1)) priority = "High";
  else if (score === 1 || isDept) priority = "Medium";

  return { leadType, priority, score, matchedKeywords: matchedKeywords.slice(0, 5).join(", ") };
}

async function getClientCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`\n❌ Error: credentials.json not found!`);
    console.error(`Please place credentials.json in:\n  ${CREDENTIALS_PATH}\n`);
    process.exit(1);
  }
  const content = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  return content.installed || content.web;
}

async function authorizeAccount(accountLabel, clientKeys) {
  const tokenFile = path.join(TOKENS_DIR, `${accountLabel}.json`);
  const oauth2Client = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    "http://localhost:3000/oauth2callback"
  );

  if (fs.existsSync(tokenFile)) {
    const token = JSON.parse(fs.readFileSync(tokenFile, "utf-8"));
    oauth2Client.setCredentials(token);
    return oauth2Client;
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url.startsWith("/oauth2callback")) {
          const queryObject = url.parse(req.url, true).query;
          if (queryObject.code) {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`<h2>✅ Authorized "${accountLabel}" successfully! Close this tab and return to the terminal.</h2>`);
            server.close();
            
            const { tokens } = await oauth2Client.getToken(queryObject.code);
            oauth2Client.setCredentials(tokens);
            fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
            console.log(`\n✅ Saved token for account: ${accountLabel}\n`);
            resolve(oauth2Client);
          }
        }
      } catch (e) {
        reject(e);
      }
    }).listen(3000, () => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent"
      });

      console.log("\n=======================================================");
      console.log(`🔐 LOGIN FOR ACCOUNT: [${accountLabel}]`);
      console.log("Opening browser to log into this Gmail account...");
      console.log(`If it doesn't open automatically, open:\n${authUrl}\n`);
      console.log("=======================================================\n");

      exec(`start "" "${authUrl}"`);
    });
  });
}

async function main() {
  console.log("==================================================================");
  console.log("🎯 COMPREHENSIVE GMAIL LEAD EXTRACTOR & INCREMENTAL SYNC ENGINE");
  console.log("   Extracts: Mobiles, WhatsApp, Websites, Accreditations, GST/CIN");
  console.log("==================================================================\n");

  const clientKeys = await getClientCredentials();
  const syncState = loadSyncState();
  const masterDB = loadMasterDB();

  // 1. Account Selection
  const existingTokens = fs.readdirSync(TOKENS_DIR).filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""));
  console.log("Connected Gmail Accounts:");
  if (existingTokens.length === 0) {
    console.log("  (None yet - connect a new account)");
  } else {
    existingTokens.forEach((acc, i) => {
      const lastSync = syncState[acc]?.lastScanDate ? `(Last synced: ${syncState[acc].lastScanDate})` : "(Never synced)";
      console.log(`  [${i + 1}] ${acc} ${lastSync}`);
    });
  }

  console.log("\nAccount Mode:");
  console.log("  [A] Add / Connect a New Gmail Account");
  if (existingTokens.length > 0) {
    console.log("  [1.." + existingTokens.length + "] Select a specific account");
    console.log("  [ALL] Run across ALL connected accounts");
  }

  // Support automated / non-interactive flags via CLI args
  const isAuto = process.argv.includes("--auto") || process.argv.includes("--cron");
  let accChoice = isAuto ? "ALL" : (await ask("\nEnter choice: ")).trim();
  let accountsToRun = [];

  if (accChoice.toUpperCase() === "ALL" && existingTokens.length > 0) {
    accountsToRun = existingTokens;
  } else if (accChoice.toUpperCase() === "A" || existingTokens.length === 0) {
    const newName = isAuto ? "default" : (await ask("Enter nickname or email for this account: ")).trim() || "default";
    await authorizeAccount(newName, clientKeys);
    accountsToRun = [newName];
  } else {
    const idx = parseInt(accChoice, 10) - 1;
    if (idx >= 0 && idx < existingTokens.length) {
      accountsToRun = [existingTokens[idx]];
    } else {
      accountsToRun = existingTokens.length > 0 ? [existingTokens[0]] : ["default"];
    }
  }

  // 2. Sync Mode: Incremental (Append) vs Full Re-scan
  console.log("\nSync Mode:");
  console.log("  [1] ⚡ Incremental Sync (Fast - Scans only NEW emails since last run & appends)");
  console.log("  [2] 🔄 Full Re-scan (Scans history from scratch & updates database)");

  const syncChoice = isAuto ? "1" : (await ask("\nEnter sync mode [1-2] (Default: 1): ")).trim() || "1";
  const isIncremental = syncChoice !== "2";

  // 3. Mailbox / Category Selection
  let baseQuery = "category:promotions";
  if (!isAuto) {
    console.log("\nSelect Mailbox / Category:");
    console.log("  [1] 🏷️  Promotions (category:promotions)");
    console.log("  [2] 📥 Primary / Inbound (in:inbox -category:promotions)");
    console.log("  [3] 🔔 Updates & Notifications (category:updates)");
    console.log("  [4] 🌟 All Categories (Promotions + Updates + Inbox)");
    console.log("  [5] ✍️  Custom query");

    const boxChoice = (await ask("\nEnter choice [1-5] (Default: 1): ")).trim() || "1";
    if (boxChoice === "2") baseQuery = "in:inbox -category:promotions";
    else if (boxChoice === "3") baseQuery = "category:updates";
    else if (boxChoice === "4") baseQuery = "category:promotions OR category:updates OR in:inbox";
    else if (boxChoice === "5") baseQuery = (await ask("Enter custom search query: ")).trim() || "category:promotions";
  }

  const maxThreads = isAuto ? 500 : parseInt((await ask("\nMax threads to scan per account? [Default: 300]: ")).trim(), 10) || 300;
  rl.close();

  let newlyAddedCount = 0;
  let enrichedCount = 0;

  for (const accountLabel of accountsToRun) {
    let finalQuery = baseQuery;
    const accState = syncState[accountLabel] || {};

    if (isIncremental && accState.lastScanDate) {
      // Build incremental query using Gmail's after: parameter
      finalQuery = `(${baseQuery}) after:${accState.lastScanDate}`;
      console.log(`\n==================================================================`);
      console.log(`⚡ INCREMENTAL SYNC: [${accountLabel}]`);
      console.log(`   Searching only NEW emails received after: ${accState.lastScanDate}`);
      console.log(`   Query: "${finalQuery}"`);
      console.log(`==================================================================`);
    } else {
      console.log(`\n==================================================================`);
      console.log(`🔄 FULL SCAN: [${accountLabel}]`);
      console.log(`   Query: "${finalQuery}" | Limit: ${maxThreads} threads`);
      console.log(`==================================================================`);
    }

    const auth = await authorizeAccount(accountLabel, clientKeys);
    const gmail = google.gmail({ version: "v1", auth });

    const listRes = await gmail.users.threads.list({
      userId: "me",
      q: finalQuery,
      maxResults: maxThreads
    });

    const threads = listRes.data.threads || [];
    console.log(`📬 Found ${threads.length} threads in ${accountLabel}. Processing...`);

    let count = 0;
    for (const t of threads) {
      count++;
      if (count % 25 === 0 || count === threads.length) {
        process.stdout.write(`\r⏳ Processed ${count} / ${threads.length} threads...`);
      }

      try {
        const threadDetail = await gmail.users.threads.get({
          userId: "me",
          id: t.id,
          format: "full"
        });

        const messages = threadDetail.data.messages || [];
        if (messages.length === 0) continue;
        const firstMsg = messages[0];

        const headers = firstMsg.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        const rawFrom = getHeader("From");
        const rawReplyTo = getHeader("Reply-To");
        const subject = getHeader("Subject") || "(No Subject)";
        const dateStr = getHeader("Date") || "";
        const snippet = firstMsg.snippet || "";
        const fullBodyText = extractBodyText(firstMsg.payload) || snippet;

        const fromParsed = parseEmailHeader(rawFrom);
        const replyToParsed = parseEmailHeader(rawReplyTo);

        let bestEmail = fromParsed.email;
        let bestName = fromParsed.name;

        if (replyToParsed.email && !isJunkEmail(replyToParsed.email)) {
          bestEmail = replyToParsed.email;
          if (replyToParsed.name) bestName = replyToParsed.name;
        }

        if (isJunkEmail(bestEmail)) continue;

        const domain = extractDomain(bestEmail);
        if (!domain) continue;

        const { phoneList, whatsappList } = extractPhonesAndWhatsApp(fullBodyText);
        const { linkedin, instagram, twitter, meetingLink, website } = extractSocialsAndWeb(fullBodyText, domain);
        const designation = extractDesignation(fullBodyText);
        const location = extractLocation(fullBodyText);
        const accreditations = extractAccreditations(fullBodyText);
        const taxLegalId = extractTaxAndLegalId(fullBodyText);
        const classification = classifyLead(bestEmail, bestName, subject, fullBodyText);

        // Check for buried inquiry
        const isInboundInquiry = /(quote|inquiry|proposal|budget|pricing|booking|cost|hire|service)/i.test(subject) && !getHeader("List-Unsubscribe");
        if (isInboundInquiry) {
          masterDB.inquiries.push({
            "Source Account": accountLabel,
            "Contact Name": bestName || "N/A",
            "Email": bestEmail,
            "Phone / Mobile": phoneList || "N/A",
            "Website": website || "N/A",
            "Subject": subject,
            "Date": dateStr,
            "Snippet Preview": snippet.slice(0, 150)
          });
        }

        // Check if lead already exists in master database
        if (!masterDB.leads[bestEmail]) {
          newlyAddedCount++;
          masterDB.leads[bestEmail] = {
            "Priority": classification.priority,
            "Contact Name": bestName || "N/A",
            "Designation": designation || "N/A",
            "Email Address": bestEmail,
            "Lead Type": classification.leadType,
            "Company / Domain": domain,
            "Website": website || "N/A",
            "Mobile / Phone": phoneList || "N/A",
            "WhatsApp Link": whatsappList ? `https://wa.me/${whatsappList.split(",")[0].trim()}` : "N/A",
            "Accreditations & Certifications": accreditations || "None",
            "Tax / Legal ID": taxLegalId || "N/A",
            "City / Location": location || "N/A",
            "LinkedIn": linkedin || "N/A",
            "Instagram": instagram || "N/A",
            "Calendly / Meeting": meetingLink || "N/A",
            "Relevant Keywords": classification.matchedKeywords || "None",
            "Subject Sample": subject,
            "Source Account": accountLabel,
            "First Discovered": new Date().toISOString().slice(0, 10),
            "Date Received": dateStr
          };
        } else {
          // Enrich existing lead with newly found attributes!
          const existing = masterDB.leads[bestEmail];
          let updated = false;

          if (existing["Mobile / Phone"] === "N/A" && phoneList) {
            existing["Mobile / Phone"] = phoneList;
            updated = true;
          }
          if (existing["WhatsApp Link"] === "N/A" && whatsappList) {
            existing["WhatsApp Link"] = `https://wa.me/${whatsappList.split(",")[0].trim()}`;
            updated = true;
          }
          if (existing["Website"] === "N/A" && website) {
            existing["Website"] = website;
            updated = true;
          }
          if (existing["Accreditations & Certifications"] === "None" && accreditations) {
            existing["Accreditations & Certifications"] = accreditations;
            updated = true;
          }
          if (existing["Designation"] === "N/A" && designation) {
            existing["Designation"] = designation;
            updated = true;
          }
          if (existing["Tax / Legal ID"] === "N/A" && taxLegalId) {
            existing["Tax / Legal ID"] = taxLegalId;
            updated = true;
          }
          if (updated) enrichedCount++;
        }

        // Company Accounts Master
        if (!CONSUMER_DOMAINS.has(domain)) {
          if (!masterDB.companies[domain]) {
            const companyName = bestName && !bestName.includes(" ") ? bestName : domain.split(".")[0].toUpperCase();
            masterDB.companies[domain] = {
              "Domain": domain,
              "Company / Brand": companyName,
              "Website": website || `https://${domain}`,
              "Key Contact": bestEmail,
              "Direct Phone": phoneList || "N/A",
              "Accreditations": accreditations || "None",
              "Tax / Legal ID": taxLegalId || "N/A",
              "Instagram": instagram || "N/A",
              "LinkedIn": linkedin || "N/A",
              "Location": location || "N/A",
              "Relevance Priority": classification.priority,
              "Total Emails Logged": 1
            };
          } else {
            const c = masterDB.companies[domain];
            c["Total Emails Logged"] = (c["Total Emails Logged"] || 1) + 1;
            if (c["Direct Phone"] === "N/A" && phoneList) c["Direct Phone"] = phoneList;
            if (c["Accreditations"] === "None" && accreditations) c["Accreditations"] = accreditations;
            if (c["Tax / Legal ID"] === "N/A" && taxLegalId) c["Tax / Legal ID"] = taxLegalId;
          }
        }
      } catch (err) {
        // Continue on single thread error
      }
    }

    // Update state for this account with today's date formatted as YYYY/MM/DD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    syncState[accountLabel] = {
      lastScanDate: `${yyyy}/${mm}/${dd}`,
      lastRunTimestamp: Date.now()
    };
  }

  // Save updated state and master DB
  saveSyncState(syncState);
  saveMasterDB(masterDB);

  console.log("\n\n==================================================================");
  console.log("📊 SYNC & EXTRACTION SUMMARY");
  console.log("==================================================================");
  console.log(`   • New Leads Added:           ${newlyAddedCount}`);
  console.log(`   • Existing Leads Enriched:   ${enrichedCount}`);
  console.log(`   • Total Database Size:       ${Object.keys(masterDB.leads).length} Verified Contacts`);
  console.log(`   • Total Corporate Accounts:  ${Object.keys(masterDB.companies).length} Companies`);

  // Build Output Workbook
  const pOrder = { "High": 1, "Medium": 2, "Normal": 3 };
  const allLeadsList = Object.values(masterDB.leads).sort((a, b) => (pOrder[a.Priority] || 99) - (pOrder[b.Priority] || 99));
  const highPriorityLeads = allLeadsList.filter(l => l.Priority === "High" || l["Lead Type"] === "Direct Individual");
  const mobilesList = allLeadsList.filter(l => l["Mobile / Phone"] !== "N/A" || l["WhatsApp Link"] !== "N/A");
  const accreditedList = allLeadsList.filter(l => l["Accreditations & Certifications"] !== "None" || l["Tax / Legal ID"] !== "N/A");
  const socialsList = allLeadsList.filter(l => l["Instagram"] !== "N/A" || l["LinkedIn"] !== "N/A");
  const companiesList = Object.values(masterDB.companies).sort((a, b) => (b["Total Emails Logged"] || 0) - (a["Total Emails Logged"] || 0));

  const masterXlsxPath = path.join(OUTPUT_DIR, "Master_Marketing_Leads.xlsx");
  const masterCsvPath = path.join(OUTPUT_DIR, "Master_Marketing_Leads.csv");

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(highPriorityLeads), "🌟 High Priority Leads");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mobilesList), "📱 Mobile & WhatsApp");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(accreditedList), "🏆 Accredited & Verified");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(socialsList), "📸 Social & Instagram");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(companiesList), "🏢 Corporate Accounts");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allLeadsList), "👥 Master Directory");

  if (masterDB.inquiries && masterDB.inquiries.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(masterDB.inquiries), "🚨 Buried Inquiries");
  }

  XLSX.writeFile(wb, masterXlsxPath);
  console.log(`\n📁 Master Excel File Updated:\n   -> ${masterXlsxPath}`);

  if (allLeadsList.length > 0) {
    fs.writeFileSync(masterCsvPath, XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(allLeadsList)), "utf-8");
    console.log(`📁 Master CSV File Updated:\n   -> ${masterCsvPath}`);
  }

  // Optional: Auto-sync to Sanity CMS if .env.local exists in root
  try {
    const rootEnvPath = path.resolve(SCRIPT_DIR, "../../.env.local");
    if (fs.existsSync(rootEnvPath)) {
      const envContent = fs.readFileSync(rootEnvPath, "utf-8");
      const tokenMatch = envContent.match(/SANITY_WRITE_TOKEN=["']?([^"'\r\n]+)["']?/);
      const projectMatch = envContent.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=["']?([^"'\r\n]+)["']?/);
      const datasetMatch = envContent.match(/NEXT_PUBLIC_SANITY_DATASET=["']?([^"'\r\n]+)["']?/);

      if (tokenMatch && projectMatch) {
        const token = tokenMatch[1].trim();
        const projectId = projectMatch[1].trim();
        const dataset = (datasetMatch ? datasetMatch[1].trim() : "production");

        console.log(`\n☁️  Syncing ${allLeadsList.length} leads directly to Sanity Studio (${dataset})...`);
        const mutations = allLeadsList.slice(0, 500).map(l => {
          const cleanEmail = (l["Email Address"] || "").toLowerCase().trim();
          const cleanPhone = (l["Mobile / Phone"] || "").replace(/[^\d+]/g, "");
          const idSeed = (cleanEmail || cleanPhone || Math.random().toString()).replace(/[^a-zA-Z0-9_-]/g, "_");
          return {
            createOrReplace: {
              _id: `marketingLead-${idSeed}`.slice(0, 128),
              _type: "marketingLead",
              name: l["Contact Name"] !== "N/A" ? l["Contact Name"] : "",
              email: cleanEmail,
              phone: l["Mobile / Phone"] !== "N/A" ? l["Mobile / Phone"] : "",
              whatsapp: l["WhatsApp Link"] !== "N/A" ? l["WhatsApp Link"] : "",
              designation: l["Designation"] !== "N/A" ? l["Designation"] : "",
              company: l["Company / Domain"] || "",
              website: l["Website"] !== "N/A" ? l["Website"] : "",
              city: l["City / Location"] !== "N/A" ? l["City / Location"] : "",
              accreditations: l["Accreditations & Certifications"] !== "None" ? l["Accreditations & Certifications"] : "",
              taxId: l["Tax / Legal ID"] !== "N/A" ? l["Tax / Legal ID"] : "",
              priority: (l.Priority || "normal").toLowerCase(),
              leadType: l["Lead Type"] === "Direct Individual" ? "individual" : "department",
              status: "new",
              source: "gmail",
              instagram: l["Instagram"] !== "N/A" ? l["Instagram"] : "",
              linkedin: l["LinkedIn"] !== "N/A" ? l["LinkedIn"] : "",
              relevantKeywords: l["Relevant Keywords"] !== "None" ? l["Relevant Keywords"] : "",
              subjectSample: l["Subject Sample"] || "",
              internalNotes: `Auto-extracted from Gmail account: ${l["Source Account"]}`
            }
          };
        });

        // Send in batches of 50
        for (let i = 0; i < mutations.length; i += 50) {
          const chunk = mutations.slice(i, i + 50);
          await fetch(`https://${projectId}.api.sanity.io/v2023-01-01/data/mutate/${dataset}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ mutations: chunk })
          });
        }
        console.log(`✅ Successfully synced ${mutations.length} leads into Sanity Studio! Accessible at /studio.`);
      }
    }
  } catch (sanityErr) {
    console.log("ℹ️  Note: Sanity sync skipped or had a non-fatal error:", sanityErr.message);
  }

  console.log("\n✨ Incremental Sync Completed Successfully!");
}

main().catch(err => {
  console.error("❌ Execution error:", err);
  process.exit(1);
});

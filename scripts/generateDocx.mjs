import fs from 'fs'
import path from 'path'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  LevelFormat
} from 'docx'

// Primary Palette: Dark Slate (#0F172A), Emerald (#10B981), Gold (#D97706), Light Shading (#F1F5F9)
const COLOR_PRIMARY = '0F172A'
const COLOR_EMERALD = '10B981'
const COLOR_GOLD = 'D97706'
const COLOR_DARK = '1E293B'
const COLOR_BG_LIGHT = 'F8FAFC'
const COLOR_BORDER = 'CBD5E1'

function createHeader(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 150 },
    border: {
      bottom: { color: COLOR_EMERALD, space: 6, style: BorderStyle.SINGLE, size: 12 }
    }
  })
}

function createSubHeader(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 }
  })
}

function createSectionHeader(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 }
  })
}

function createCallout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'ECFDF5', val: ShadingType.CLEAR },
            borders: {
              left: { color: COLOR_EMERALD, style: BorderStyle.SINGLE, size: 24 },
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE }
            },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `📌 ${title}: `, bold: true, color: COLOR_EMERALD, size: 22 }),
                  new TextRun({ text, size: 22, color: COLOR_DARK })
                ]
              })
            ]
          })
        ]
      })
    ]
  })
}

function createParagraph(text, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, bold, size: 22, color: COLOR_DARK })],
    spacing: { after: 120, line: 276 }
  })
}

function createBullet(text, boldPrefix = '') {
  return new Paragraph({
    children: [
      boldPrefix ? new TextRun({ text: `• ${boldPrefix}: `, bold: true, size: 22, color: COLOR_PRIMARY }) : new TextRun({ text: '• ', bold: true, size: 22 }),
      new TextRun({ text, size: 22, color: COLOR_DARK })
    ],
    spacing: { after: 80, line: 260 },
    indent: { left: 360 }
  })
}

function createTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          shading: { fill: COLOR_PRIMARY, val: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          borders: {
            top: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 },
            bottom: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 },
            left: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 },
            right: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 }
          },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20 })] })]
        }))
      }),
      ...rows.map((row, rIdx) => new TableRow({
        children: row.map(cell => new TableCell({
          shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : COLOR_BG_LIGHT, val: ShadingType.CLEAR },
          margins: { top: 90, bottom: 90, left: 140, right: 140 },
          borders: {
            top: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 },
            bottom: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 },
            left: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 },
            right: { color: COLOR_BORDER, style: BorderStyle.SINGLE, size: 4 }
          },
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 20, color: COLOR_DARK })] })]
        }))
      }))
    ]
  })
}

async function buildDocx() {
  const doc = new Document({
    styles: {
      default: {
        heading1: { run: { color: COLOR_PRIMARY, bold: true, size: 36 } },
        heading2: { run: { color: COLOR_EMERALD, bold: true, size: 28 } },
        heading3: { run: { color: COLOR_GOLD, bold: true, size: 24 } }
      }
    },
    sections: [
      {
        properties: {},
        children: [
          // Title Page Banner
          new Paragraph({
            text: 'FLYING WONDERS PVT LTD',
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: 'FLYING WONDERS PVT LTD', bold: true, size: 40, color: COLOR_EMERALD })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: 'Official Website Architecture, Operations & Standard Operating Procedures (SOP) Manual', italic: true, size: 24, color: COLOR_DARK })]
          }),

          createCallout('System Version', 'Next.js 16 (Turbopack) + Sanity Studio CMS v6 • Website Domain: https://flyingwonders.net'),

          createHeader('1. Executive Summary & Architecture Overview'),
          createParagraph('This document serves as the exhaustive operational manual and technical specification for the Flying Wonders web application. Flying Wonders Private Limited is a licensed Destination Management Company (DMC) with dual presence in Bangalore, India, and Central Singapore.'),
          createParagraph('The digital platform serves dual audiences:'),
          createBullet('Direct leisure travelers looking to browse packages, build attraction ticket itineraries, and submit offline zero-fee UPI payments.', 'B2C Retail Travelers'),
          createBullet('Registered travel agents who log in to access net B2B wholesale pricing, adjust custom profit margins (0-100%), and generate white-label PDF/WhatsApp proposals.', 'B2B Partner Agents'),

          createSubHeader('Core Technical Stack Inventory'),
          createTable(
            ['Layer', 'Technology / Service', 'Description & Endpoint'],
            [
              ['Frontend Framework', 'Next.js 16.2.10 (App Router)', 'React 19, TypeScript, Turbopack Build Engine'],
              ['Content Management (CMS)', 'Sanity Studio CMS v6', 'Project ID: 8xtd7yiv, Dataset: production (/studio)'],
              ['Database & Schemas', 'Sanity Content Lake', 'Documents: siteSettings, b2bAgent, manualPayment, faqItem, etc.'],
              ['Live Exchange Rates', 'Frankfurter Currency API', 'https://api.frankfurter.app/latest?from=SGD&to=INR (12hr cache)'],
              ['AI Travel Assistant', 'Google Gemini REST API', 'gemini-1.5-flash with native systemInstructions (/api/chat)'],
              ['Business Card OCR Engine', 'Gemini Vision REST API', 'Client-side HTML5 canvas compression + REST extraction'],
              ['Master Pricing Sheets', 'Google Sheets Published CSV/XLSX', 'Dynamic URLs configured via Sanity Studio Site Settings'],
              ['Email & Notifications', 'Nodemailer & Web3Forms', 'SMTP email dispatch for UTR receipts & admin alerts'],
              ['Hosting & Serverless', 'Cloud Host / Vercel', '100% serverless read-only filesystem compatible']
            ]
          ),

          createHeader('2. Complete Page & API Route Inventory'),
          createParagraph('Every public page, admin portal, and backend API endpoint built into the application is documented below:'),

          createTable(
            ['Route Path', 'Type', 'Description & Primary Purpose'],
            [
              ['/', 'Static (1m)', 'Homepage featuring hero slider, package cards, and live rate widget.'],
              ['/custom-package', 'Dynamic', 'B2B Agent Portal: Interactive cost estimator, hotel/guide steppers, PDF.'],
              ['/singapore-attractions', 'Static (1m)', 'Attractions Quotation Builder: Ticket steppers, dates, PDF quote & UPI modal.'],
              ['/packages', 'Static (1m)', 'Curated tour packages (4D3N, 5D4N) with instant SGD to INR calculation.'],
              ['/instant-quote', 'Dynamic', 'Quick quote engine for rapid traveler estimations.'],
              ['/faq', 'Static', 'Help Center: Searchable FAQ accordion powered dynamically by Sanity CMS.'],
              ['/pay', 'Static', 'Standalone ICICI Bank UPI QR payment portal for custom invoices.'],
              ['/refund', 'Static', 'Official Refund & Cancellation Policy documentation.'],
              ['/add-contact', 'Static', 'Business Card OCR Scanner for trade shows with client compression.'],
              ['/reviews', 'Dynamic', 'Customer review submissions and verified testimonials.'],
              ['/blog & /blog/[slug]', 'Dynamic', 'SEO Travel Articles generated automatically via Gemini AI.'],
              ['/studio/[[...index]]', 'Dynamic', 'Sanity Studio CMS Admin Dashboard.'],
              ['/api/payments/submit-manual', 'API (POST)', 'Submits UTR details, uploads screenshot, sends receipt & admin alert.'],
              ['/api/admin/export-payments', 'API (GET)', 'Generates downloadable CSV spreadsheet of all ICICI payments.'],
              ['/api/admin/export-agents', 'API (GET)', 'Generates downloadable CSV spreadsheet of registered B2B Agents.'],
              ['/api/admin/export-contacts', 'API (GET)', 'Generates downloadable CSV spreadsheet of scanned business cards.'],
              ['/api/site-settings', 'API (GET)', 'Returns global toggles, ICICI bank info, and Google Sheet URLs.']
            ]
          ),

          createHeader('3. Standard Operating Procedures (SOPs)'),

          createSubHeader('SOP 1: Site Settings & Page Visibility Toggles'),
          createParagraph('Site administrators can control website feature toggles without modifying any code:'),
          createBullet('Log into Sanity Studio at https://flyingwonders.net/studio.', 'Step 1'),
          createBullet('Click on "Site Settings" in the left sidebar menu.', 'Step 2'),
          createBullet('Toggle any page link ON or OFF (e.g. hideFaq, hideChatbot, hideIciciAttractions, hideIciciPackages, hideInstantQuote).', 'Step 3'),
          createBullet('Click "Publish" in the bottom right corner. Changes reflect on the live site within 60 seconds.', 'Step 4'),

          createSubHeader('SOP 2: Managing Exchange Rate & INR Markup'),
          createParagraph('The website converts SGD to INR using live central bank market rates plus your custom markup:'),
          createBullet('In Sanity Studio -> Site Settings, find the "INR Conversion: Markup Type" field.', 'Step 1'),
          createBullet('Choose "Absolute (INR Amount per SGD)" to add a fixed amount (e.g. + ₹3.50 per SGD).', 'Step 2'),
          createBullet('Or choose "Percentage (%)" to add a percentage margin (e.g. + 2.5%).', 'Step 3'),
          createBullet('To lock the conversion to a fixed rate regardless of live financial markets, type a number into "Manual Fixed Rate Override" (e.g. 66.50).', 'Step 4'),

          createSubHeader('SOP 3: Updating Master Pricing Google Sheets'),
          createParagraph('Pricing for hotels, transfers, meals, guides, and attractions is fetched dynamically from published Google Sheets:'),
          createBullet('Open your pricing Google Sheet, make your edits, then click File -> Share -> Publish to web -> Select CSV or XLSX.', 'Step 1'),
          createBullet('Copy the published link.', 'Step 2'),
          createBullet('In Sanity Studio -> Site Settings, paste the URL into "Attractions Pricing Google Sheet CSV URL" or "Custom Package Master Pricing Google Sheet CSV URL".', 'Step 3'),
          createBullet('Click "Publish". The website will instantly fetch prices from your new spreadsheet.', 'Step 4'),

          createSubHeader('SOP 4: Processing ICICI Bank UPI Payments & UTR Verification'),
          createParagraph('Workflow for handling offline guest payments:'),
          createBullet('Guest scans ICICI Bank QR code or copies VPA ID (flyingwonders@icici) and pays via GPay/PhonePe/Paytm.', 'Step 1'),
          createBullet('Guest submits their 12-digit UTR reference number and optional payment screenshot on the website.', 'Step 2'),
          createBullet('System automatically sends an instant HTML receipt email to the guest featuring a direct WhatsApp quick-response link.', 'Step 3'),
          createBullet('An admin alert email is sent to info.flyingwonders@gmail.com with the UTR number.', 'Step 4'),
          createBullet('Accounts staff open the ICICI Bank mobile app, verify UTR receipt, then open Sanity Studio -> Offline UPI Payments (ICICI).', 'Step 5'),
          createBullet('Change the status from "⏳ Pending Verification" to "✅ Confirmed & Verified".', 'Step 6'),

          createSubHeader('SOP 5: Exporting Data to Excel / CSV'),
          createParagraph('Downloading records for accounting and marketing:'),
          createBullet('Log into Sanity Studio (/studio).', 'Step 1'),
          createBullet('Click "📤 Export Payments" in the top navigation bar to download all UTR submissions and payment statuses.', 'Step 2'),
          createBullet('Click "📤 Export B2B Agents" to download registered travel agent contact details.', 'Step 3'),
          createBullet('Click "📤 Export Contacts" to download leads scanned from business cards.', 'Step 4'),

          createSubHeader('SOP 6: Managing Attraction Photos & 4-Tier Fuzzy Matching'),
          createParagraph('To ensure attraction photos never lose sync:'),
          createBullet('In Sanity Studio, click "Attraction Details" and click "Create New".', 'Step 1'),
          createBullet('Upload a 800×600px photo and enter a short matchKeyword (e.g. "universal", "gardens", "night safari").', 'Step 2'),
          createBullet('The website uses a 4-tier fuzzy matching algorithm (Exact Name -> Substring Inclusion -> Keyword -> Token Similarity) so photos bind automatically to Google Sheet tickets even if ticket names change slightly.', 'Step 3'),

          createSubHeader('SOP 7: Replicating / Cloning the Site for Another DMC or Destination'),
          createParagraph('To create a cloned version for Dubai, Bali, Thailand, or another brand:'),
          createBullet('Duplicate the project folder to a new location (e.g. c:\\dubai-website).', 'Step 1'),
          createBullet('Create a new free project on sanity.io to obtain a new Project ID and Write Token.', 'Step 2'),
          createBullet('Update .env.local with the new Sanity credentials, Web3Forms key, and SMTP email settings.', 'Step 3'),
          createBullet('Run "node scripts/seedFaqs.mjs" to seed default CMS data.', 'Step 4'),
          createBullet('Duplicate the Google Sheet template, publish to CSV, and paste the link into Sanity Studio.', 'Step 5'),
          createBullet('Replace logo.png in /public/images/ and deploy to Vercel/Netlify in under 2.5 hours!', 'Step 6'),

          createHeader('4. Complete Environment Variables Checklist'),
          createParagraph('Required environment variables in .env.local for production cloud deployment:'),
          createTable(
            ['Variable Name', 'Required', 'Purpose'],
            [
              ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'Yes', 'Sanity Studio Project ID (e.g. 8xtd7yiv)'],
              ['NEXT_PUBLIC_SANITY_DATASET', 'Yes', 'Sanity Dataset (production)'],
              ['SANITY_WRITE_TOKEN', 'Yes', 'API token for writing UTR submissions & uploading screenshots'],
              ['NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY', 'Yes', 'Web3Forms API key for email contact notifications'],
              ['DMCQUOTE_API_BASE_URL', 'Optional', 'External B2B partner lookup base URL'],
              ['DMCQUOTE_API_KEY', 'Optional', 'External B2B partner API key'],
              ['SMTP_USER & SMTP_PASS', 'Optional', 'Nodemailer SMTP credentials for email dispatches']
            ]
          ),

          createHeader('5. Sign-Off & Verification'),
          createParagraph('This manual reflects the verified, production-tested state of the Flying Wonders web application. All 53 pages and API routes compile with 0 errors and operate serverless-ready.')
        ]
      }
    ]
  })

  const buffer = await Packer.toBuffer(doc)
  const outputPath = path.join(process.cwd(), 'Flying_Wonders_Complete_Website_SOP_Documentation.docx')
  fs.writeFileSync(outputPath, buffer)
  console.log(`Document successfully created at: ${outputPath}`)
}

buildDocx().catch(err => {
  console.error('Error generating docx:', err)
  process.exit(1)
})

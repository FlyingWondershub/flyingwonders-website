# 🎯 Comprehensive Multi-Account Gmail & WhatsApp Lead Extractor

Extracts verified leads, mobile/WhatsApp numbers, official websites, accreditations/certifications, GST/tax IDs, Instagram profiles, job designations, and corporate accounts directly from your Gmail accounts into a structured, perpetually updating master Excel workbook.

---

## 🌟 What It Scrapes

1. 🌐 **Direct Websites**: Discovers explicit company websites in signatures and footers, resolving tracking redirects.
2. 🏆 **Accreditations & Certifications**: Scrapes industry memberships, certifications, and awards:
   - *ISO 9001, ISO 27001*
   - *EEMA* (Event and Entertainment Management Association)
   - *IAAPA* (International Association of Amusement Parks & Attractions)
   - *ILEA, MPI, FICCI, CII*
   - *Forbes Council, Great Place to Work, Google Partner, Meta Business Partner, Award-Winning*
3. 📜 **GST / CIN Legal IDs**: Indian GST numbers and corporate registration numbers from footers (instant legitimacy check).
4. 📞 **Mobile & Phone Numbers**: Validated, clean phone numbers.
5. 💬 **Direct WhatsApp Click-to-Chat Links**: Ready-to-click `https://wa.me/...` links.
6. 🏷️ **Job Designations & Titles**: *Founder & CEO, Event Producer, Marketing Director, Brand Lead, Creative Director, etc.*
7. 📸 **Instagram & LinkedIn Handles**: Direct profile and company links.
8. 📍 **City / Location**: Geographic city from signature addresses.
9. 🚨 **Buried Inquiries**: Inbound client quotation requests mistakenly routed to Promotions.

---

## ⚡ Incremental Sync & Appending (How It Runs Frequently)

Instead of rescanning hundreds or thousands of old emails every time:
- The system stores a persistent master database in `data/master_leads_db.json`.
- It remembers the exact timestamp/date of your last scan in `data/sync_state.json`.
- **On every subsequent run**:
  - It automatically applies `after:YYYY/MM/DD` to Gmail's search query.
  - It only downloads **NEW** emails received since your last run (finishes in seconds!).
  - **New leads are appended** to your master database.
  - **Existing leads are automatically enriched** (e.g., if a new email reveals a WhatsApp number, new website, or accreditation that wasn't previously known, it updates the record).
  - Automatically regenerates `output/Master_Marketing_Leads.xlsx`.

---

## 🚀 Running the Extractor

### 1-Click Fast Sync:
- Double click [`sync-now.bat`](sync-now.bat) anytime, or run:
  ```powershell
  npm run sync
  ```
  *(Runs across all connected accounts in incremental append mode in ~5–10 seconds).*

### Interactive Mode:
- Double click [`run.bat`](run.bat), or run:
  ```powershell
  npm run extract
  ```
  *(Allows connecting new accounts, switching mailboxes, or triggering a full historical re-scan).*

---

## ⏰ Automated Scheduling (Windows Task Scheduler)

To make it run automatically every morning (e.g., at 9:00 AM) without you having to click anything:
1. Open Windows **Task Scheduler**.
2. Click **Create Basic Task** $\rightarrow$ Name: `Gmail Lead Incremental Sync`.
3. Trigger: **Daily** at `09:00 AM`.
4. Action: **Start a program**:
   - Program/script: `cmd.exe`
   - Add arguments: `/c "c:\website\scripts\gmail-lead-extractor\sync-now.bat"`
5. Click **Finish**. Your master Excel spreadsheet will update automatically every day in the background!

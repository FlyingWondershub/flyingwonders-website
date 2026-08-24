# Flying Wonders WhatsApp Group Inquiries Gateway (Oracle VM)

This lightweight service connects to WhatsApp via Baileys and relays travel inquiries from whitelisted WhatsApp groups (e.g. *DMC SUPPORT EACH OTHER*) straight to the Flying Wonders B2B Leads Board (`flyingwonders.net/b2b-leads`).

---

## 🚀 Setup on Your Oracle Free VM (Step-by-Step)

### 1. Connect to your Oracle VM
```bash
ssh -i /path/to/your-key.key ubuntu@<YOUR_ORACLE_VM_IP>
```

---

### 2. Verify / Install Node.js & PM2
```bash
# Check if node is installed
node -v

# If not installed, install Node 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2
```

---

### 3. Copy or Create the Gateway Directory
```bash
mkdir -p ~/fw-whatsapp-gateway
cd ~/fw-whatsapp-gateway
```

Upload or copy `package.json` and `server.js` to `~/fw-whatsapp-gateway`.

---

### 4. Create your `.env` configuration file
```bash
nano .env
```
Paste the following:
```env
WEBHOOK_URL="https://flyingwonders.net/api/inquiries/webhook"
WEBHOOK_SECRET="fw_lead_secret_key_2026"
BOT_PHONE_NUMBER="+919876543210"
SESSION_FOLDER="auth_info_baileys"
```
*(Press `Ctrl + O` to save, `Enter`, then `Ctrl + X` to exit)*

---

### 5. Install Dependencies & Scan WhatsApp QR Code Once
```bash
npm install
npm start
```
1. A QR code will be printed in your terminal.
2. Open WhatsApp on your dedicated phone number.
3. Tap **Linked Devices** → **Link a Device**.
4. Scan the terminal QR code.
5. You will see:
   `✅ WhatsApp Gateway Connected & Listening 24/7!`

---

### 6. Run 24/7 in Background with PM2
Press `Ctrl + C` to stop the interactive session, then launch it with PM2:

```bash
# Start background worker
pm2 start server.js --name "fw-whatsapp-gateway"

# Save PM2 process list (auto-restarts on VM reboot)
pm2 save
pm2 startup
```

---

## 🛠️ Management Commands

* **View live logs & incoming messages**:
  ```bash
  pm2 logs fw-whatsapp-gateway
  ```
* **Restart service**:
  ```bash
  pm2 restart fw-whatsapp-gateway
  ```
* **Stop service**:
  ```bash
  pm2 stop fw-whatsapp-gateway
  ```
* **To switch to a different phone number**:
  ```bash
  pm2 stop fw-whatsapp-gateway
  rm -rf auth_info_baileys
  npm start
  # Scan new QR code, then restart PM2
  ```

---

## 🔒 Multi-Number Support
To run multiple WhatsApp numbers on the same Oracle VM, simply copy the directory or run a second PM2 instance with a different session folder:
```bash
SESSION_FOLDER="auth_info_line2" pm2 start server.js --name "fw-wa-line2"
```

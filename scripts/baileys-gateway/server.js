const {
  default: makeWASocket,
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const path = require('path')
require('dotenv').config()

// Configuration from .env
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://flyingwonders.net/api/inquiries/webhook'
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''
const BOT_PHONE_NUMBER = process.env.BOT_PHONE_NUMBER || ''
const SESSION_FOLDER = process.env.SESSION_FOLDER || 'auth_info_baileys'

// In-memory group name cache to avoid fetching metadata repeatedly
const groupNameCache = new Map()

async function startWhatsAppGateway() {
  const authPath = path.resolve(__dirname, SESSION_FOLDER)
  const { state, saveCreds } = await useMultiFileAuthState(authPath)
  const { version, isLatest } = await fetchLatestBaileysVersion()

  console.log(`[FW-Gateway] Starting Baileys v${version.join('.')} (isLatest: ${isLatest})...`)
  console.log(`[FW-Gateway] Webhook Target: ${WEBHOOK_URL}`)

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    generateHighQualityLinkPreview: false,
    // Identify as Official Native Desktop Client (suppresses iOS web session push banners)
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: false,
    markOnlineOnConnect: false, // Stealth Mode: Do NOT broadcast online presence
    shouldSyncHistoryMessage: () => false, // Do NOT request history downloads from phone
    fireInitQueries: false, // Suppress initial query storms to phone
    emitOwnEvents: false,
    cachedGroupMetadata: async (jid) => groupNameCache.get(jid),
    keepAliveIntervalMs: 60000,
    defaultQueryTimeoutMs: 60000,
    connectTimeoutMs: 60000,
    getMessage: async () => ({ conversation: '' }),
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n======================================================')
      console.log('📌 SCAN THIS QR CODE IN WHATSAPP (Linked Devices):')
      console.log('======================================================\n')
      qrcode.generate(qr, { small: true })
      console.log('\n======================================================\n')
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      console.log(`[FW-Gateway] ⚠️ Connection closed. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`)

      if (shouldReconnect) {
        setTimeout(startWhatsAppGateway, 3000)
      } else {
        console.log('[FW-Gateway] 🛑 Session logged out. Please delete auth_info_baileys folder and restart to rescan QR.')
      }
    } else if (connection === 'open') {
      console.log('\n======================================================')
      console.log('✅ WhatsApp Gateway Connected & Listening 24/7!')
      console.log(`📱 User JID: ${sock.user?.id || 'Connected'}`)
      console.log('======================================================\n')
    }
  })

  // Listen to new messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      // Ignore outgoing messages sent by the bot itself
      if (msg.key.fromMe) continue

      const remoteJid = msg.key.remoteJid || ''
      const isGroup = remoteJid.endsWith('@g.us')
      if (!isGroup) continue // Ignore direct messages sent to the bot phone number

      // Extract message text from conversation, extendedTextMessage, or image caption
      const messageContent = msg.message
      if (!messageContent) continue

      const text =
        messageContent.conversation ||
        messageContent.extendedTextMessage?.text ||
        messageContent.imageMessage?.caption ||
        messageContent.videoMessage?.caption ||
        ''

      if (!text || text.trim().length < 5) continue

      let groupName = 'Direct Message'
      if (isGroup) {
        if (groupNameCache.has(remoteJid)) {
          groupName = groupNameCache.get(remoteJid)
        } else {
          try {
            const meta = await sock.groupMetadata(remoteJid)
            groupName = meta.subject || 'WhatsApp Group'
            groupNameCache.set(remoteJid, groupName)
          } catch (e) {
            groupName = 'WhatsApp Group'
          }
        }
      }

      const senderJid = msg.key.participant || msg.key.remoteJid || ''
      const senderPhone = senderJid.split('@')[0]
      const senderName = msg.pushName || ''
      const timestamp = new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString()

      console.log(`[FW-Gateway] 📩 Processing msg from [${groupName}] (${senderName} / ${senderPhone})`)

      // Forward to Flying Wonders Next.js Webhook
      try {
        const headers = { 'Content-Type': 'application/json' }
        if (WEBHOOK_SECRET) {
          headers['Authorization'] = `Bearer ${WEBHOOK_SECRET}`
        }

        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            groupName,
            sender: senderPhone,
            senderName,
            text,
            botNumber: BOT_PHONE_NUMBER,
            timestamp,
          }),
        })

        const resData = await response.json().catch(() => ({}))
        console.log(`[FW-Gateway] 🚀 Webhook Status: ${response.status}`, resData)
      } catch (err) {
        console.error('[FW-Gateway] ❌ Failed to dispatch webhook:', err.message)
      }
    }
  })
}

// Start Gateway
startWhatsAppGateway().catch((err) => {
  console.error('[FW-Gateway] Fatal Startup Error:', err)
})

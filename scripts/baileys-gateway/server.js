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
const UNSUBSCRIBE_URL = process.env.UNSUBSCRIBE_URL || 'https://flyingwonders.net/api/inquiries/unsubscribe'
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''
const BOT_PHONE_NUMBER = process.env.BOT_PHONE_NUMBER || ''
const SESSION_FOLDER = process.env.SESSION_FOLDER || 'auth_info_baileys'

// In-memory group name cache to avoid fetching metadata repeatedly
const groupNameCache = new Map()

// Asynchronous Outbound Safe Dispatch Queue
const dispatchQueue = []
let isProcessingQueue = false

async function processDispatchQueue(sock) {
  if (isProcessingQueue || dispatchQueue.length === 0) return
  isProcessingQueue = true

  while (dispatchQueue.length > 0) {
    const alert = dispatchQueue.shift()
    if (!alert || !alert.recipientPhone || !alert.text) continue

    try {
      let targetJid = alert.recipientPhone.replace(/[^\d]/g, '')
      if (!targetJid.includes('@s.whatsapp.net')) {
        targetJid = `${targetJid}@s.whatsapp.net`
      }

      console.log(`[FW-Gateway] 🚀 Sending alert DM to ${alert.recipientName || 'Subscriber'} (${targetJid})...`)
      await sock.sendMessage(targetJid, { text: alert.text })

      // Randomized human jitter pause between 3.5s and 6.5s to ensure 100% account safety
      const jitterMs = Math.floor(Math.random() * 3000) + 3500
      await new Promise((resolve) => setTimeout(resolve, jitterMs))
    } catch (err) {
      console.error(`[FW-Gateway] ❌ Failed to dispatch alert to ${alert.recipientPhone}:`, err.message)
    }
  }

  isProcessingQueue = false
}

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
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    shouldSyncHistoryMessage: () => false,
    fireInitQueries: false,
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

  // Listen to incoming messages (Group Inquiries & 2-Way Bot Commands)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (msg.key.fromMe) continue

      const remoteJid = msg.key.remoteJid || ''
      const isGroup = remoteJid.endsWith('@g.us')

      const messageContent = msg.message
      if (!messageContent) continue

      const text = (
        messageContent.conversation ||
        messageContent.extendedTextMessage?.text ||
        messageContent.imageMessage?.caption ||
        messageContent.videoMessage?.caption ||
        ''
      ).trim()

      if (!text) continue

      const senderJid = msg.key.participant || msg.key.remoteJid || ''
      const senderPhone = senderJid.split('@')[0]
      const senderName = msg.pushName || ''

      // CASE 1: 1-on-1 Direct Message to the Bot (Two-Way Interactive Commands: STOP / START / STATUS)
      if (!isGroup) {
        const upper = text.toUpperCase().trim()
        if (['STOP', 'UNSUB', 'UNSUBSCRIBE', 'PAUSE', 'START', 'RESUME', 'STATUS', 'HELP'].includes(upper)) {
          console.log(`[FW-Gateway] 🤖 Received bot command [${upper}] from ${senderPhone}`)
          try {
            const unsubRes = await fetch(UNSUBSCRIBE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: senderPhone, command: upper }),
            })
            const data = await unsubRes.json()
            const replyMsg = data.message || 'Command processed.'
            await sock.sendMessage(remoteJid, { text: replyMsg })
          } catch (e) {
            console.error('[FW-Gateway] Error executing bot command:', e.message)
          }
        }
        continue
      }

      // CASE 2: Group Message (B2B Lead Processing)
      if (text.length < 5) continue

      let groupName = 'WhatsApp Group'
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

      const timestamp = new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString()
      console.log(`[FW-Gateway] 📩 Processing msg from [${groupName}] (${senderName} / ${senderPhone})`)

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
            botNumber: BOT_PHONE_NUMBER || sock.user?.id?.split(':')[0] || '',
            timestamp,
          }),
        })

        const result = await response.json()
        console.log(`[FW-Gateway] ↳ Webhook response:`, result.status || (result.success ? 'saved' : 'error'))

        // If matching subscriber alerts were returned, push to safe dispatch queue
        if (result.matchedAlerts && Array.isArray(result.matchedAlerts) && result.matchedAlerts.length > 0) {
          console.log(`[FW-Gateway] 🔔 ${result.matchedAlerts.length} subscriber alert(s) matched. Queueing safe DMs...`)
          for (const alert of result.matchedAlerts) {
            dispatchQueue.push(alert)
          }
          processDispatchQueue(sock)
        }

      } catch (err) {
        console.error(`[FW-Gateway] ❌ Failed to forward to webhook:`, err.message)
      }
    }
  })
}

// Start Gateway
startWhatsAppGateway().catch((err) => {
  console.error('[FW-Gateway] Fatal crash:', err)
})

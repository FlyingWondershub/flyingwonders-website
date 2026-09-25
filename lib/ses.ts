import { SESClient, SendEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses'

interface SendEmailSesParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  senderName?: string
  senderEmail?: string
  replyTo?: string
  bcc?: string | string[]
}

const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()
const region = process.env.AWS_REGION?.trim() || 'us-east-1'

let sesClient: SESClient | null = null

if (accessKeyId && secretAccessKey) {
  sesClient = new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

export function isSesConfigured(): boolean {
  return Boolean(sesClient && accessKeyId && secretAccessKey)
}

/**
 * Fetch live AWS SES send quota (limit, rate, sent today)
 */
export async function getSesSendQuota(): Promise<{
  max24HourSend: number
  maxSendRate: number
  sentLast24Hours: number
} | null> {
  if (!sesClient) return null
  try {
    const res = await sesClient.send(new GetSendQuotaCommand({}))
    return {
      max24HourSend: res.Max24HourSend ?? 200,
      maxSendRate: res.MaxSendRate ?? 1,
      sentLast24Hours: res.SentLast24Hours ?? 0,
    }
  } catch (err: any) {
    console.warn('Failed to fetch AWS SES quota:', err.message)
    return null
  }
}

/**
 * Dispatches transactional & marketing email via Amazon SES
 */
export async function sendEmailSes({
  to,
  subject,
  html,
  text,
  senderName = 'Flying Wonders',
  senderEmail = 'contact@flyingwonders.net',
  replyTo = 'contact@flyingwonders.net',
  bcc,
}: SendEmailSesParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!sesClient) {
    return { success: false, error: 'Amazon SES is not configured in environment variables.' }
  }

  try {
    const toAddresses = (Array.isArray(to) ? to : [to]).map(e => e.trim()).filter(Boolean)
    const bccAddresses = bcc
      ? (Array.isArray(bcc) ? bcc : [bcc]).map(e => e.trim()).filter(Boolean)
      : undefined

    if (toAddresses.length === 0) {
      return { success: false, error: 'No recipient email addresses provided.' }
    }

    const command = new SendEmailCommand({
      Source: `"${senderName}" <${senderEmail}>`,
      Destination: {
        ToAddresses: toAddresses,
        BccAddresses: bccAddresses && bccAddresses.length > 0 ? bccAddresses : undefined,
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html,
          },
          ...(text ? { Text: { Charset: 'UTF-8', Data: text } } : {}),
        },
      },
      ReplyToAddresses: [replyTo],
    })

    let attempts = 0
    while (attempts < 3) {
      try {
        const response = await sesClient.send(command)
        return { success: true, messageId: response.MessageId }
      } catch (sendErr: any) {
        attempts++
        const isThrottled =
          sendErr.name === 'ThrottlingException' ||
          sendErr.name === 'Throttling' ||
          sendErr.message?.toLowerCase().includes('rate exceeded') ||
          sendErr.$metadata?.httpStatusCode === 429

        if (isThrottled && attempts < 3) {
          const backoffMs = attempts * 1000 + Math.floor(Math.random() * 400)
          console.warn(`[Amazon SES] Rate throttled (attempt ${attempts}/3). Backing off for ${backoffMs}ms...`)
          await new Promise(resolve => setTimeout(resolve, backoffMs))
          continue
        }

        console.error('Amazon SES dispatch error:', sendErr.message)
        return { success: false, error: sendErr.message || 'Failed to dispatch via Amazon SES' }
      }
    }

    return { success: false, error: 'Amazon SES dispatch exceeded retry limit.' }
  } catch (err: any) {
    console.error('Amazon SES dispatch preparation error:', err.message)
    return { success: false, error: err.message || 'Failed to dispatch via Amazon SES' }
  }
}

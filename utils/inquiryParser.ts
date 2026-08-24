/**
 * Utility to parse, sanitize, and extract structured fields from raw WhatsApp travel inquiry messages.
 */

export interface ParsedInquiry {
  title: string
  destination: string
  category: 'hotels' | 'transport' | 'dmc_package' | 'visa_fairs' | 'activities' | 'flights' | 'other'
  rawMessage: string
  requesterName: string
  phoneNumber: string
  city: string
  urgency: 'urgent' | 'normal'
  isLikelyInquiry: boolean
  rejectionReason?: string
}

const DESTINATION_KEYWORDS = [
  // India Destinations
  'Andaman', 'Port Blair', 'Havelock', 'Neil Island',
  'Ayodhya', 'Varanasi', 'Kashi', 'Prayagraj', 'Lucknow',
  'Mathura', 'Vrindavan', 'Agra', 'Taj Mahal',
  'Kashmir', 'Srinagar', 'Gulmarg', 'Pahalgam', 'Ladakh', 'Leh',
  'Goa', 'North Goa', 'South Goa',
  'Kerala', 'Munnar', 'Alleppey', 'Kochi', 'Wayanad', 'Varkala',
  'Himachal', 'Manali', 'Shimla', 'Dharamshala', 'Spiti',
  'Uttarakhand', 'Rishikesh', 'Haridwar', 'Mussoorie', 'Nainital', 'Chardham', 'Kedarnath', 'Badrinath',
  'Rajasthan', 'Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer',
  'Karnataka', 'Coorg', 'Kabini', 'Mysore', 'Bangalore', 'Hampi', 'Gokarna',
  'Sikkim', 'Gangtok', 'Darjeeling', 'Meghalaya', 'Shillong', 'Assam', 'Kaziranga',
  // International Hubs
  'Singapore', 'Malaysia', 'Kuala Lumpur', 'Langkawi', 'Penang', 'Genting',
  'Thailand', 'Bangkok', 'Phuket', 'Pattaya', 'Krabi', 'Samui',
  'Bali', 'Indonesia', 'Vietnam', 'Da Nang', 'Hanoi', 'Ho Chi Minh', 'Phu Quoc',
  'Dubai', 'UAE', 'Abu Dhabi', 'Oman', 'Saudi Arabia', 'Qatar',
  'Maldives', 'Sri Lanka', 'Nepal', 'Bhutan', 'Mauritius',
  'China', 'Canton Fair', 'Guangzhou', 'Shanghai', 'Beijing', 'Hong Kong', 'Macau',
  'Japan', 'Tokyo', 'Osaka', 'Kyoto',
  'South Korea', 'Seoul',
  'Europe', 'Switzerland', 'France', 'Paris', 'Italy', 'Rome', 'London', 'UK', 'Spain', 'Georgia', 'Baku', 'Azerbaijan', 'Almaty', 'Kazakhstan', 'Uzbekistan', 'Tashkent', 'Turkey', 'Istanbul'
]

const SPAM_GREETINGS = [
  'good morning', 'good evening', 'good afternoon', 'gm all', 'gm everyone',
  'happy independence day', 'happy new year', 'happy diwali', 'happy holi',
  'congratulations', 'welcome', 'thanks', 'thank you', 'ok', 'yes', 'no'
]

export function parseWhatsAppMessage(
  rawText: string,
  senderPhone?: string,
  senderPushName?: string
): ParsedInquiry {
  const cleaned = (rawText || '').trim()
  const lower = cleaned.toLowerCase()

  // 1. Basic Spam / Chit-chat filtering
  if (!cleaned || cleaned.length < 8) {
    return {
      title: 'Short Message',
      destination: '',
      category: 'other',
      rawMessage: cleaned,
      requesterName: senderPushName || '',
      phoneNumber: senderPhone || '',
      city: '',
      urgency: 'normal',
      isLikelyInquiry: false,
      rejectionReason: 'Message too short to be an actionable inquiry.',
    }
  }

  // Check if pure greeting
  const isPureGreeting = SPAM_GREETINGS.some(
    (greet) => lower === greet || lower === `${greet}!` || lower === `${greet} all` || lower === `${greet} everyone`
  )
  if (isPureGreeting && cleaned.length < 35) {
    return {
      title: 'Greeting / Chit-chat',
      destination: '',
      category: 'other',
      rawMessage: cleaned,
      requesterName: senderPushName || '',
      phoneNumber: senderPhone || '',
      city: '',
      urgency: 'normal',
      isLikelyInquiry: false,
      rejectionReason: 'Pure greeting or general chit-chat.',
    }
  }

  // 2. Extract Phone Number
  let phone = ''
  // Regex to find Indian or international formatted numbers inside the message text
  // e.g. +91 94299 65850, +919429965850, 99530 22691, 9876543210
  const phoneRegex = /(?:\+?\d{1,3}[-\s]?)?(?:\(?\d{2,5}\)?[-\s]?)?\d{5,6}[-\s]?\d{4,5}|\b[6-9]\d{9}\b/g
  const phoneMatches = cleaned.match(phoneRegex)

  if (phoneMatches && phoneMatches.length > 0) {
    // Pick the longest valid looking number
    const sorted = phoneMatches.map(p => p.trim().replace(/[^\d+]/g, '')).filter(p => p.length >= 10)
    if (sorted.length > 0) {
      phone = sorted[0]
      if (!phone.startsWith('+') && phone.length === 10) {
        phone = `+91${phone}`
      }
    }
  }

  if (!phone && senderPhone) {
    phone = senderPhone.startsWith('+') ? senderPhone : `+${senderPhone.replace(/[^\d]/g, '')}`
  }

  // 3. Extract Destination
  let destination = ''
  for (const dest of DESTINATION_KEYWORDS) {
    const destRegex = new RegExp(`\\b${dest}\\b`, 'i')
    if (destRegex.test(cleaned)) {
      destination = dest
      break
    }
  }

  // 4. Extract Requester Name & City heuristic
  let requesterName = senderPushName || ''
  let city = ''

  // Common pattern in messages:
  // Name at last line or after phone number: "GAJESH Girdhar", "Dipika", "Sujata Mukarjee"
  // City: "MUZZAFARNAGAR", "DELHI", "MUMBAI"
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length >= 2) {
    const lastLine = lines[lines.length - 1]
    const secondLastLine = lines[lines.length - 2]

    // If last line has a name-like string (no numbers, 2-30 chars)
    if (/^[A-Za-z\s.]{2,35}$/.test(lastLine) && !DESTINATION_KEYWORDS.some(d => d.toLowerCase() === lastLine.toLowerCase())) {
      requesterName = requesterName || lastLine
    }

    // Check if second last or last line is a city (e.g. ALL CAPS or matching known cities)
    if (/^[A-Z\s]{3,25}$/.test(secondLastLine) && !secondLastLine.toLowerCase().includes('agent')) {
      city = secondLastLine
    }
  }

  // 5. Categorization
  let category: ParsedInquiry['category'] = 'other'
  if (
    lower.includes('hotel') ||
    lower.includes('resort') ||
    lower.includes('room') ||
    lower.includes('stay') ||
    lower.includes('villa') ||
    lower.includes('property') ||
    lower.includes('deal for')
  ) {
    category = 'hotels'
  } else if (
    lower.includes('transport') ||
    lower.includes('transportor') ||
    lower.includes('transporter') ||
    lower.includes('cab') ||
    lower.includes('tempo') ||
    lower.includes('traveller') ||
    lower.includes('traveler') ||
    lower.includes('bus') ||
    lower.includes('taxi') ||
    lower.includes('car rental')
  ) {
    category = 'transport'
  } else if (
    lower.includes('fair') ||
    lower.includes('canton') ||
    lower.includes('exhibition') ||
    lower.includes('visa') ||
    lower.includes('expo')
  ) {
    category = 'visa_fairs'
  } else if (
    lower.includes('flight') ||
    lower.includes('air ticket') ||
    lower.includes('airline') ||
    lower.includes('pnr')
  ) {
    category = 'flights'
  } else if (
    lower.includes('ticket') ||
    lower.includes('sightseeing') ||
    lower.includes('attraction') ||
    lower.includes('cruise') ||
    lower.includes('pass')
  ) {
    category = 'activities'
  } else if (
    lower.includes('supplier') ||
    lower.includes('dmc') ||
    lower.includes('ground') ||
    lower.includes('land package') ||
    lower.includes('package') ||
    lower.includes('operating') ||
    lower.includes('quote')
  ) {
    category = 'dmc_package'
  }

  // 6. Urgency detection
  const isUrgent =
    lower.includes('urgent') ||
    lower.includes('today') ||
    lower.includes('immediately') ||
    lower.includes('tomorrow') ||
    lower.includes('asap') ||
    lower.includes('emergency') ||
    lower.includes('fast')

  // 7. Title Generation
  // Strip common prefix wrappers like "Agent Inquiry", "Agent asking", "Hi,", "Hello"
  let mainQueryLine = ''
  for (const line of lines) {
    const lLow = line.toLowerCase()
    if (
      lLow.startsWith('agent inquiry') ||
      lLow.startsWith('agent asking') ||
      lLow.startsWith('dmc support') ||
      lLow.startsWith('good morning') ||
      /^\+?[\d\s-]{8,}$/.test(line) // phone number line
    ) {
      continue
    }
    mainQueryLine = line
    break
  }

  let title = mainQueryLine || lines[0] || 'Travel Requirement'
  // Clean up title
  title = title.replace(/^[-*•\s]+/, '').trim()
  if (title.length > 70) {
    title = title.substring(0, 67) + '...'
  }

  // Final check: is it an inquiry?
  // It is likely an inquiry if it has a destination, or categorized, or mentions inquiry/supplier/transport/deal/looking for, or has phone number
  const isLikelyInquiry = Boolean(
    destination ||
    category !== 'other' ||
    lower.includes('looking for') ||
    lower.includes('anyone') ||
    lower.includes('any ') ||
    lower.includes('need ') ||
    lower.includes('require') ||
    lower.includes('inquiry') ||
    lower.includes('dmc') ||
    lower.includes('rate') ||
    lower.includes('cost') ||
    phone
  )

  return {
    title: title || (destination ? `${destination} Inquiry` : 'B2B Travel Requirement'),
    destination,
    category,
    rawMessage: cleaned,
    requesterName: requesterName || 'Travel Partner',
    phoneNumber: phone,
    city,
    urgency: isUrgent ? 'urgent' : 'normal',
    isLikelyInquiry,
  }
}

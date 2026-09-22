import * as XLSX from 'xlsx'

export interface ParsedContact {
  name?: string
  email?: string
  phone?: string
  whatsapp?: string
  company?: string
  designation?: string
  city?: string
  accreditations?: string
  priority?: 'high' | 'medium' | 'normal'
  audienceType?: 'b2b' | 'b2c' | 'lead'
  leadType?: string
  source?: string
}

export const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'yahoo.co.uk',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com',
  'rediffmail.com', 'rediff.com', 'zoho.com', 'zohomail.com', 'protonmail.com',
  'proton.me', 'aol.com', 'ymail.com', 'mail.com', 'gmx.com'
])

export const KNOWN_CITIES = [
  'Bangalore', 'Bengaluru', 'Mumbai', 'Bombay', 'Delhi', 'New Delhi', 'Chennai', 'Madras',
  'Kolkata', 'Calcutta', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Panaji',
  'Kochi', 'Cochin', 'Trivandrum', 'Thiruvananthapuram', 'Coimbatore', 'Madurai', 'Mysore',
  'Mysuru', 'Mangalore', 'Mangaluru', 'Hubli', 'Dharwad', 'Chandigarh', 'Lucknow', 'Kanpur',
  'Surat', 'Indore', 'Bhopal', 'Nagpur', 'Patna', 'Vadodara', 'Visakhapatnam', 'Vizag',
  'Agra', 'Varanasi', 'Amritsar', 'Guwahati', 'Nashik', 'Rajkot', 'Srinagar', 'Noida',
  'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Singapore', 'Dubai', 'Abu Dhabi',
  'Bangkok', 'Kuala Lumpur', 'Doha', 'Muscat', 'Colombo'
]

export const ACCREDITATIONS_LIST = ['IATA', 'TAAI', 'TAFI', 'ADTOI', 'OTOAI', 'IAAPI', 'ATOAI', 'ISO', 'MOT']

export const COMPANY_KEYWORDS = [
  'tours', 'travels', 'travel', 'holidays', 'vacations', 'voyages', 'destinations',
  'tourism', 'adventures', 'trip', 'trips', 'journeys', 'expeditions', 'getaways',
  'resorts', 'hospitality', 'ticketing', 'express', 'air', 'logistics', 'routes',
  'innovations', 'pvt ltd', 'private limited', 'llp', 'ltd', 'inc', 'corp', 'agency',
  'services', 'enterprises', 'solutions', 'consultants', 'm/s', 'messrs'
]

/**
 * Standardize Indian and International phone numbers into standard format
 */
export function cleanPhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return `+91${cleaned}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`
  }
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

/**
 * Intelligent Line & Multi-Line Block Ingestion Parser
 */
export function parseRawContactText(
  text: string,
  options?: {
    defaultLeadType?: string
    defaultAudience?: 'b2b' | 'b2c' | 'lead'
    defaultPriority?: 'high' | 'medium' | 'normal'
    defaultCity?: string
    sourceTag?: string
  }
): ParsedContact[] {
  if (!text || !text.trim()) return []

  const rawBlocks = text.split(/\r?\n\s*\r?\n/).map(b => b.trim()).filter(Boolean)
  const useBlocks = rawBlocks.length > 1 && rawBlocks.some(b => b.includes('\n'))
  const units = useBlocks ? rawBlocks : text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  const results: ParsedContact[] = []
  const seenKeys = new Set<string>()

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
  const phoneRegex = /(?:(?:\+?91[\s.-]?)?[6-9]\d{9})|(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{4,5}/

  for (const unit of units) {
    let currentText = unit
    let email = ''
    let phone = ''

    // 1. Extract Email
    const emailMatch = currentText.match(emailRegex)
    if (emailMatch) {
      email = emailMatch[0].toLowerCase().trim()
      currentText = currentText.replace(emailMatch[0], ' ')
    }

    // 2. Extract Phone
    const phoneMatch = currentText.match(phoneRegex)
    if (phoneMatch) {
      const rawP = phoneMatch[0].trim()
      const cleanedP = cleanPhone(rawP)
      if (cleanedP.replace(/[^\d]/g, '').length >= 10) {
        phone = cleanedP
        currentText = currentText.replace(phoneMatch[0], ' ')
      }
    }

    if (!email && !phone) continue

    let company = ''
    let name = ''
    let city = options?.defaultCity || ''
    let accreditations = ''

    // Check for explicit field labels if present
    const labeledCompany = unit.match(/(?:company|agency|firm|business|organization)\s*[:=\-–]\s*([^\n\r,;|]+)/i)
    if (labeledCompany) company = labeledCompany[1].trim()

    const labeledName = unit.match(/(?:contact|name|attn|rep|person)\s*[:=\-–]\s*([^\n\r,;|]+)/i)
    if (labeledName) name = labeledName[1].trim()

    const labeledCity = unit.match(/(?:city|location|branch|place)\s*[:=\-–]\s*([^\n\r,;|]+)/i)
    if (labeledCity) city = labeledCity[1].trim()

    // Clean delimiters and tokenize remainder
    let remainder = currentText
      .replace(/(?:company|agency|firm|business|name|contact|email|phone|mobile|tel|whatsapp|city|location)\s*[:=\-–]/gi, ' ')
      .replace(/[\r\n\t]+/g, ' | ')
      .replace(/\s{2,}/g, ' | ')
      .replace(/\s*[,|–—]\s*/g, ' | ')
      .replace(/\s+-\s+/g, ' | ')
      .trim()

    remainder = remainder.replace(/^[|\s-]+|[|\s-]+$/g, '').trim()
    const tokens = remainder.split('|').map(t => t.trim()).filter(Boolean)

    for (const token of tokens) {
      const lower = token.toLowerCase()

      // Check City
      const matchedCity = KNOWN_CITIES.find(c => new RegExp(`\\b${c}\\b`, 'i').test(token))
      if (matchedCity && !city) {
        city = matchedCity
        if (token.length <= matchedCity.length + 3) continue
      }

      // Check Accreditations
      const matchedAcc = ACCREDITATIONS_LIST.find(a => new RegExp(`\\b${a}\\b`, 'i').test(token))
      if (matchedAcc && !accreditations) {
        accreditations = matchedAcc
        if (token.length <= matchedAcc.length + 2) continue
      }

      // Check Company indicators or M/S
      const isCompanyLike = COMPANY_KEYWORDS.some(kw => lower.includes(kw)) ||
        /^m\/s/i.test(token) || /^messrs/i.test(token)

      if (isCompanyLike && !company) {
        company = token
      } else if (!name && !isCompanyLike && /^[a-zA-Z\s.'’-]{2,35}$/.test(token)) {
        name = token
      } else if (!company) {
        company = token
      }
    }

    if (!company && tokens.length > 0) {
      company = tokens[0]
    }

    // Company fallback from corporate domain
    if (!company && email) {
      const domain = email.split('@')[1] || ''
      if (!GENERIC_EMAIL_DOMAINS.has(domain.toLowerCase())) {
        const domainName = domain.split('.')[0]
        if (domainName && domainName.length > 2) {
          company = domainName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        }
      }
    }

    // Contact name fallback from email handle if human-like
    if (!name && email) {
      const username = email.split('@')[0] || ''
      const cleanUser = username.replace(/[0-9_.]+/g, ' ').trim()
      const isGenericHandle = ['info', 'contact', 'admin', 'sales', 'packages', 'support', 'booking', 'bookings', 'help'].some(w => cleanUser.toLowerCase().includes(w))
      const hasCompanyKeyword = COMPANY_KEYWORDS.some(kw => cleanUser.toLowerCase().includes(kw))

      if (cleanUser.length >= 3 && !isGenericHandle && !hasCompanyKeyword) {
        name = cleanUser.replace(/\b\w/g, c => c.toUpperCase())
      }
    }

    if (company) {
      if (city && company.toLowerCase().endsWith(city.toLowerCase())) {
        company = company.slice(0, -city.length).replace(/[-–,\s]+$/, '').trim()
      }
      company = company.replace(/\s+/g, ' ').trim()
    }

    const uniqueKey = (email || phone).toLowerCase()
    if (seenKeys.has(uniqueKey)) continue
    seenKeys.add(uniqueKey)

    results.push({
      name: name || '',
      email: email,
      phone: phone,
      whatsapp: phone ? `https://wa.me/${phone.replace(/[^\d]/g, '')}` : '',
      company: company,
      designation: '',
      city: city,
      accreditations: accreditations,
      priority: phone ? 'high' : (options?.defaultPriority || 'normal'),
      leadType: options?.defaultLeadType || 'agent',
      audienceType: options?.defaultAudience || 'b2b',
      source: options?.sourceTag || 'manual_text_paste',
    })
  }

  return results
}

/**
 * CSV / Excel Spreadsheet Parser with Header Auto-Matching
 */
export function parseSpreadsheetBuffer(
  buffer: ArrayBuffer,
  options?: {
    defaultLeadType?: string
    defaultAudience?: 'b2b' | 'b2c' | 'lead'
    defaultPriority?: 'high' | 'medium' | 'normal'
    sourceTag?: string
  }
): ParsedContact[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

  const extracted: ParsedContact[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    const findVal = (keys: string[]) => {
      for (const k of Object.keys(row)) {
        const lk = k.toLowerCase().trim()
        if (keys.some(key => lk === key || lk.includes(key))) {
          return String(row[k] || '').trim()
        }
      }
      return ''
    }

    const name = findVal(['name', 'contact', 'full name', 'lead name'])
    const email = findVal(['email', 'e-mail', 'mail'])
    const phone = findVal(['phone', 'mobile', 'cell', 'whatsapp', 'tel', 'contact number'])
    let company = findVal(['company', 'organization', 'agency', 'business', 'corp'])
    const designation = findVal(['designation', 'role', 'title', 'position'])
    const city = findVal(['city', 'location', 'state', 'country'])
    const accreditations = findVal(['accreditation', 'tags', 'source', 'notes'])
    const audience = findVal(['audience', 'type', 'group'])

    if (email || phone || name || company) {
      const cleanedP = phone ? cleanPhone(phone) : ''
      const cleanEmail = email ? email.toLowerCase().trim() : ''

      if (!company && cleanEmail) {
        const domain = cleanEmail.split('@')[1] || ''
        if (!GENERIC_EMAIL_DOMAINS.has(domain.toLowerCase())) {
          const domainName = domain.split('.')[0]
          if (domainName && domainName.length > 2) {
            company = domainName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          }
        }
      }

      const key = (cleanEmail || cleanedP).toLowerCase()
      if (key && !seen.has(key)) {
        seen.add(key)
        extracted.push({
          name: name || '',
          email: cleanEmail,
          phone: cleanedP,
          whatsapp: cleanedP ? `https://wa.me/${cleanedP.replace(/[^\d]/g, '')}` : '',
          company: company,
          designation: designation,
          city: city,
          accreditations: accreditations,
          priority: cleanedP ? 'high' : (options?.defaultPriority || 'normal'),
          leadType: options?.defaultLeadType || 'agent',
          audienceType: (audience.toLowerCase().includes('b2c') ? 'b2c' : options?.defaultAudience) || 'b2b',
          source: options?.sourceTag || 'csv_import',
        })
      }
    }
  }

  return extracted
}

/**
 * WhatsApp Chat Transcript (.txt) Parser
 */
export function parseWhatsAppChatText(
  text: string,
  options?: {
    defaultLeadType?: string
    defaultAudience?: 'b2b' | 'b2c' | 'lead'
    defaultPriority?: 'high' | 'medium' | 'normal'
    sourceTag?: string
  }
): ParsedContact[] {
  const lines = text.split('\n')
  const extracted = new Map<string, ParsedContact>()

  const phoneRegex = /(?:(?:\+?91[\s.-]?)?[6-9]\d{9})|(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{4,5}/
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i

  for (const line of lines) {
    const emailMatch = line.match(emailRegex)
    const senderMatch = line.match(/\]\s*([^:]+):/)
    const sender = senderMatch ? senderMatch[1].trim() : ''

    let senderPhone = ''
    if (/[\d+]{7,15}/.test(sender)) {
      senderPhone = cleanPhone(sender)
    }

    const email = emailMatch ? emailMatch[0].toLowerCase().trim() : ''

    let messagePhone = ''
    const contentPhoneMatch = line.match(phoneRegex)
    if (contentPhoneMatch) {
      const cp = cleanPhone(contentPhoneMatch[0])
      if (cp.replace(/[^\d]/g, '').length >= 10) messagePhone = cp
    }

    const effectivePhone = senderPhone || messagePhone
    const contactName = senderPhone ? '' : sender

    if (email || effectivePhone) {
      const key = (email || effectivePhone).toLowerCase()
      if (!extracted.has(key)) {
        let company = ''
        if (email) {
          const domain = email.split('@')[1] || ''
          if (!GENERIC_EMAIL_DOMAINS.has(domain.toLowerCase())) {
            const domainName = domain.split('.')[0]
            if (domainName && domainName.length > 2) {
              company = domainName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            }
          }
        }

        extracted.set(key, {
          name: contactName,
          email: email,
          phone: effectivePhone,
          whatsapp: effectivePhone ? `https://wa.me/${effectivePhone.replace(/[^\d]/g, '')}` : '',
          company: company,
          designation: '',
          city: '',
          accreditations: '',
          priority: effectivePhone ? 'high' : (options?.defaultPriority || 'normal'),
          leadType: options?.defaultLeadType || 'whatsapp',
          audienceType: options?.defaultAudience || 'b2b',
          source: options?.sourceTag || 'whatsapp_chat',
        })
      }
    }
  }

  return Array.from(extracted.values())
}

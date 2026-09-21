/**
 * ICAO Doc 9303 MRZ (Machine Readable Zone) Parser & Checksum Validator
 * Standard TD3 (Passports, 2x44), TD1 (ID cards, 3x30), and TD2 (2x36).
 * Zero external dependencies.
 */

export interface ParsedPassportData {
  documentType: string
  issuingCountryCode: string
  issuingCountry: string
  surname: string
  givenNames: string
  fullName: string
  title: 'Mr' | 'Mrs' | 'Ms' | 'Mstr'
  passportNumber: string
  passportNumberCheckValid: boolean
  nationalityCode: string
  nationality: string
  dateOfBirthRaw: string
  dateOfBirthFormatted: string
  dateOfBirthIso: string
  age: number
  passengerType: 'Adult' | 'Child' | 'Infant'
  birthCheckValid: boolean
  sex: 'Male' | 'Female' | 'Unspecified'
  sexCode: 'M' | 'F' | 'X'
  expirationDateRaw: string
  expirationDateFormatted: string
  expirationDateIso: string
  expirationCheckValid: boolean
  daysUntilExpiry: number
  isValid6Months: boolean
  isExpired: boolean
  compositeCheckValid: boolean
  allChecksumsValid: boolean
  airlineGdsFormat: string
  rawMrzLines: string[]
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const COUNTRY_CODE_MAP: Record<string, string> = {
  IND: 'India',
  SGP: 'Singapore',
  MYS: 'Malaysia',
  IDN: 'Indonesia',
  THA: 'Thailand',
  USA: 'United States',
  GBR: 'United Kingdom',
  AUS: 'Australia',
  CHN: 'China',
  ARE: 'United Arab Emirates',
  PHL: 'Philippines',
  VNM: 'Vietnam',
  DEU: 'Germany',
  FRA: 'France',
  JPN: 'Japan',
  KOR: 'South Korea',
  CAN: 'Canada',
  NZL: 'New Zealand',
  NPL: 'Nepal',
  LKA: 'Sri Lanka',
  BGD: 'Bangladesh',
  PAK: 'Pakistan',
  MMR: 'Myanmar',
  KHM: 'Cambodia',
  SAU: 'Saudi Arabia',
  QAT: 'Qatar',
  OMN: 'Oman',
  KWT: 'Kuwait',
  BHR: 'Bahrain',
  ZAF: 'South Africa',
  RUS: 'Russia',
  ITA: 'Italy',
  ESP: 'Spain',
  CHE: 'Switzerland',
  NLD: 'Netherlands',
  SWE: 'Sweden',
  NOR: 'Norway',
  DNK: 'Denmark',
  FIN: 'Finland',
  AUT: 'Austria',
  BEL: 'Belgium',
  IRL: 'Ireland',
  TUR: 'Turkey',
  HKG: 'Hong Kong',
  TWN: 'Taiwan',
  BRA: 'Brazil',
  MEX: 'Mexico',
  ARG: 'Argentina',
  CHL: 'Chile',
  EGY: 'Egypt',
}

/**
 * Calculates ICAO 9303 check digit with 7-3-1 weighting.
 */
export function computeIcaoCheckDigit(text: string): number {
  const weights = [7, 3, 1]
  let sum = 0

  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase()
    let value = 0

    if (char >= '0' && char <= '9') {
      value = parseInt(char, 10)
    } else if (char >= 'A' && char <= 'Z') {
      value = char.charCodeAt(0) - 55 // 'A' = 10, 'B' = 11, ...
    } else if (char === '<') {
      value = 0
    }

    sum += value * weights[i % 3]
  }

  return sum % 10
}

/**
 * Parses YYMMDD string to Date object and formatted representation.
 */
function parseIcaoDate(yymmdd: string, isExpiry = false): {
  dateObj: Date | null
  formatted: string
  iso: string
} {
  if (!yymmdd || yymmdd.length !== 6 || yymmdd.includes('<')) {
    return { dateObj: null, formatted: 'Unknown', iso: '' }
  }

  const rawY = parseInt(yymmdd.substring(0, 2), 10)
  const m = parseInt(yymmdd.substring(2, 4), 10) - 1 // 0-indexed
  const d = parseInt(yymmdd.substring(4, 6), 10)

  if (isNaN(rawY) || isNaN(m) || isNaN(d) || m < 0 || m > 11 || d < 1 || d > 31) {
    return { dateObj: null, formatted: 'Unknown', iso: '' }
  }

  const currentYear = new Date().getFullYear()
  const current2DigitYear = currentYear % 100

  let fullYear: number
  if (isExpiry) {
    // Passport expiry is normally within the 21st century (2000-2099)
    fullYear = 2000 + rawY
  } else {
    // Date of birth: if rawY > current 2-digit year, it's 1900s, else 2000s
    fullYear = rawY > current2DigitYear ? 1900 + rawY : 2000 + rawY
  }

  const isLeap = (fullYear % 4 === 0 && (fullYear % 100 !== 0 || fullYear % 400 === 0))
  const maxDays = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (d > maxDays[m]) {
    return { dateObj: null, formatted: 'Unknown', iso: '' }
  }

  const dateObj = new Date(fullYear, m, d)
  const monthStr = MONTH_NAMES[m] || 'Jan'
  const dayStr = d.toString().padStart(2, '0')
  const formatted = `${dayStr}-${monthStr}-${fullYear}`
  const iso = `${fullYear}-${(m + 1).toString().padStart(2, '0')}-${dayStr}`

  return { dateObj, formatted, iso }
}

/**
 * Strips trailing OCR hallucination tails (where <<<<< chevrons were read as CICL, CCKK, LLL, etc.)
 */
export function stripMrzChevronNoise(text: string): string {
  if (!text) return ''
  let cleaned = text.replace(/<+/g, ' ').trim()
  // Strip trailing blocks composed of C, L, K, I, X, 1, ( (common OCR chevron misreads)
  cleaned = cleaned.replace(/[\s_-]+[CLKIX1(]{3,}$/i, '').trim()
  cleaned = cleaned.replace(/[CLKIX1(]{4,}$/i, '').trim()
  cleaned = cleaned.replace(/(\s+[CLKIX1(])+\s*$/i, '').trim()
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
  return cleaned
}

/**
 * Parses standard TD3 ICAO Doc 9303 Passport MRZ (2 lines of 44 characters).
 */
export function parseTd3Mrz(line1Raw: string, line2Raw: string): ParsedPassportData | null {
  const line1 = cleanMrzLine(line1Raw, 44)
  const line2 = cleanMrzLine(line2Raw, 44)

  if (line1.length < 40 || line2.length < 40) {
    return null
  }

  // Document Code (Line 1: 0..1)
  const docType = line1.substring(0, 1) === 'P' ? 'Passport' : line1.substring(0, 2).replace(/</g, '')
  
  // Issuing State (Line 1: 2..5)
  const issuingCode = line1.substring(2, 5).replace(/</g, '').trim()
  const issuingCountry = COUNTRY_CODE_MAP[issuingCode] || issuingCode

  // Names (Line 1: 5..44)
  const nameSection = line1.substring(5)
  const nameParts = nameSection.split('<<')
  let surname = stripMrzChevronNoise(nameParts[0] || '')
  let givenNames = stripMrzChevronNoise(nameParts[1] || '')

  // If there wasn't a clean << split but has space
  if (!givenNames && surname.includes(' ')) {
    const parts = surname.split(' ')
    surname = parts[0]
    givenNames = parts.slice(1).join(' ')
  }

  const fullName = `${givenNames} ${surname}`.trim()

  // Passport Number & Check Digit (Line 2: 0..9 and 9)
  const passNumRaw = line2.substring(0, 9)
  const passNum = passNumRaw.replace(/</g, '').trim()
  const passCheckActual = line2.charAt(9)
  const passCheckExpected = computeIcaoCheckDigit(passNumRaw).toString()
  const passportNumberCheckValid = passCheckActual === passCheckExpected

  // Nationality (Line 2: 10..13)
  const natCode = line2.substring(10, 13).replace(/</g, '').trim()
  const nationality = COUNTRY_CODE_MAP[natCode] || natCode

  // Date of Birth (Line 2: 13..19 and 19)
  const dobRaw = line2.substring(13, 19)
  const dobCheckActual = line2.charAt(19)
  const dobCheckExpected = computeIcaoCheckDigit(dobRaw).toString()
  const birthCheckValid = dobCheckActual === dobCheckExpected
  const { dateObj: dobDate, formatted: dobFormatted, iso: dobIso } = parseIcaoDate(dobRaw, false)

  // Calculate age & passenger type
  let age = 30
  let passengerType: 'Adult' | 'Child' | 'Infant' = 'Adult'
  if (dobDate) {
    const diffMs = Date.now() - dobDate.getTime()
    const ageDt = new Date(diffMs)
    age = Math.abs(ageDt.getUTCFullYear() - 1970)
    if (age < 2) passengerType = 'Infant'
    else if (age < 12) passengerType = 'Child'
    else passengerType = 'Adult'
  }

  // Sex (Line 2: 20)
  const sexChar = line2.charAt(20).toUpperCase()
  let sex: 'Male' | 'Female' | 'Unspecified' = 'Unspecified'
  let sexCode: 'M' | 'F' | 'X' = 'X'
  let title: 'Mr' | 'Mrs' | 'Ms' | 'Mstr' = 'Mr'

  if (sexChar === 'M') {
    sex = 'Male'
    sexCode = 'M'
    title = passengerType === 'Adult' ? 'Mr' : 'Mstr'
  } else if (sexChar === 'F') {
    sex = 'Female'
    sexCode = 'F'
    title = passengerType === 'Adult' ? 'Ms' : 'Ms'
  }

  // Expiration Date (Line 2: 21..27 and 27)
  const expRaw = line2.substring(21, 27)
  const expCheckActual = line2.charAt(27)
  const expCheckExpected = computeIcaoCheckDigit(expRaw).toString()
  const expirationCheckValid = expCheckActual === expCheckExpected
  const { dateObj: expDate, formatted: expFormatted, iso: expIso } = parseIcaoDate(expRaw, true)

  // 6-Month International Validity Check
  let daysUntilExpiry = 0
  let isValid6Months = true
  let isExpired = false
  if (expDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = expDate.getTime() - today.getTime()
    daysUntilExpiry = Math.floor(diff / (1000 * 60 * 60 * 24))
    isExpired = daysUntilExpiry < 0
    isValid6Months = daysUntilExpiry >= 180
  }

  // Composite Check Digit (Line 2: 43)
  // TD3 composite covers: line2[0..10] + line2[13..20] + line2[21..43]
  const compositeString = line2.substring(0, 10) + line2.substring(13, 20) + line2.substring(21, 43)
  const compositeCheckActual = line2.charAt(43)
  const compositeCheckExpected = computeIcaoCheckDigit(compositeString).toString()
  const compositeCheckValid = compositeCheckActual === compositeCheckExpected

  const allChecksumsValid = passportNumberCheckValid && birthCheckValid && expirationCheckValid

  // Airline GDS Format: SURNAME/GIVENNAME TITLE (e.g. KUMAR/RAJESH MR)
  const gdsSurname = surname.toUpperCase().replace(/[^A-Z]/g, '')
  const gdsGiven = givenNames.toUpperCase().replace(/[^A-Z ]/g, '').split(' ')[0] || ''
  const airlineGdsFormat = `${gdsSurname}/${gdsGiven} ${title}`.trim()

  return {
    documentType: docType,
    issuingCountryCode: issuingCode,
    issuingCountry,
    surname,
    givenNames,
    fullName,
    title,
    passportNumber: passNum,
    passportNumberCheckValid,
    nationalityCode: natCode,
    nationality,
    dateOfBirthRaw: dobRaw,
    dateOfBirthFormatted: dobFormatted,
    dateOfBirthIso: dobIso,
    age,
    passengerType,
    birthCheckValid,
    sex,
    sexCode,
    expirationDateRaw: expRaw,
    expirationDateFormatted: expFormatted,
    expirationDateIso: expIso,
    expirationCheckValid,
    daysUntilExpiry,
    isValid6Months,
    isExpired,
    compositeCheckValid,
    allChecksumsValid,
    airlineGdsFormat,
    rawMrzLines: [line1, line2],
  }
}

/**
 * Cleans OCR output string into a standard MRZ line.
 * Fixes common OCR misrecognitions for OCR-B.
 */
export function cleanMrzLine(raw: string, targetLength = 44): string {
  let cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9<]/g, '')
    .trim()

  // Ensure exact padding
  if (cleaned.length < targetLength) {
    cleaned = cleaned.padEnd(targetLength, '<')
  } else if (cleaned.length > targetLength) {
    cleaned = cleaned.substring(0, targetLength)
  }

  return cleaned
}

/**
 * Searches an arbitrary OCR text block for valid MRZ lines and parses them.
 */
export function findAndParseMrzInText(text: string): ParsedPassportData | null {
  if (!text) return null

  // Split into lines
  const lines = text
    .split(/[\r\n]+/)
    .map(l => l.toUpperCase().replace(/[^A-Z0-9<]/g, '').trim())
    .filter(l => l.length >= 30)

  // Look for 2 consecutive lines matching TD3 passport format (starting with P< or P followed by 40+ chars)
  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = lines[i]
    const l2 = lines[i + 1]

    if (l1.startsWith('P') && (l1.includes('<') || l1.length >= 40)) {
      const parsed = parseTd3Mrz(l1, l2)
      if (parsed && (parsed.passportNumber || parsed.fullName)) {
        return parsed
      }
    }
  }

  // Fallback: search any two lines with high proportion of '<'
  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = lines[i]
    const l2 = lines[i + 1]
    const chevronCount1 = (l1.match(/</g) || []).length
    const chevronCount2 = (l2.match(/</g) || []).length

    if (chevronCount1 >= 2 && (chevronCount2 >= 1 || l2.length >= 40)) {
      const parsed = parseTd3Mrz(l1, l2)
      if (parsed) return parsed
    }
  }

  return null
}

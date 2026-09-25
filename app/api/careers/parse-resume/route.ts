import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 60

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No resume file provided' }, { status: 400 })
    }

    const candidateKeys = [
      process.env.Aiplanner_API_key,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY,
    ]
      .map((k) => (k || '').trim())
      .filter(Boolean)

    if (candidateKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key is not configured' },
        { status: 500 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    let mimeType = file.type || 'application/pdf'
    if (file.name.endsWith('.pdf')) mimeType = 'application/pdf'
    if (file.name.endsWith('.png')) mimeType = 'image/png'
    if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg'
    if (file.name.endsWith('.txt')) mimeType = 'text/plain'

    const prompt = `You are a high-precision executive recruitment AI parser.
Analyze this resume or curriculum vitae document and extract the candidate's core profile information.
Return ONLY valid JSON with the following exact keys:
{
  "applicantName": "Full Name",
  "email": "email@domain.com",
  "phone": "+65 ... or contact number with country code",
  "currentLocation": "City, Country",
  "linkedinUrl": "https://linkedin.com/in/... (or empty string)",
  "portfolioUrl": "Website/GitHub/Portfolio link (or empty string)",
  "yearsOfExperience": "e.g. 4 Years",
  "currentCompany": "Current or most recent company",
  "currentRole": "Current or most recent job title",
  "coverLetter": "A crisp, compelling 2-3 sentence executive elevator pitch summarizing the candidate's core strengths, domain expertise, and suitability for tourism/travel operations or their field."
}

CRITICAL RULES:
1. Extract REAL data from the document only. Do not invent details. If a field is not present in the CV, set it to an empty string "".
2. For phone number, preserve country code if present.
3. Clean LinkedIn URL so it is a standard valid URL (e.g. https://www.linkedin.com/in/...).
4. Output raw JSON ONLY. No markdown ticks, no conversational filler.`

    let parsedResult: any = null
    let lastError = ''

    for (const apiKey of candidateKeys) {
      if (parsedResult) break
      const genAI = new GoogleGenerativeAI(apiKey)

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          })

          const contentParts: any[] = []

          if (mimeType === 'text/plain') {
            const textContent = buffer.toString('utf-8')
            contentParts.push({ text: `Resume Content:\n${textContent}\n\n${prompt}` })
          } else {
            contentParts.push({
              inlineData: {
                data: base64Data,
                mimeType,
              },
            })
            contentParts.push({ text: prompt })
          }

          const result = await model.generateContent(contentParts)
          const text = result.response.text()

          if (text) {
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            parsedResult = JSON.parse(cleaned)
            break
          }
        } catch (err: any) {
          lastError = err.message
          console.warn(`[Resume Parser] ${modelName} failed:`, err.message)
        }
      }
    }

    if (!parsedResult) {
      return NextResponse.json(
        { success: false, error: lastError || 'Failed to parse resume with AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      parsed: parsedResult,
      message: 'Resume parsed successfully!',
    })
  } catch (err: any) {
    console.error('Resume Parser Route Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error while parsing resume' },
      { status: 500 }
    )
  }
}

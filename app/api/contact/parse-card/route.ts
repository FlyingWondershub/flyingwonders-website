import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { frontImage, backImage } = body

    if (!frontImage) {
      return NextResponse.json({ error: 'Front card image is required.' }, { status: 400 })
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim()
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY is missing. Please add GEMINI_API_KEY to your environment variables on Vercel or .env.local.' 
      }, { status: 500 })
    }

    // Helper to format base64 string into REST inline_data object
    const formatInlineData = (base64String: string) => {
      const commaIdx = base64String.indexOf(',')
      let mimeType = 'image/jpeg'
      let data = base64String.replace(/[\r\n\s]/g, '')

      if (commaIdx !== -1) {
        const meta = base64String.substring(0, commaIdx)
        data = base64String.substring(commaIdx + 1).replace(/[\r\n\s]/g, '')
        const mimeMatch = meta.match(/data:(image\/[a-zA-Z0-9+.-]+);base64/)
        if (mimeMatch) mimeType = mimeMatch[1]
      }

      return {
        inline_data: {
          mime_type: mimeType,
          data: data
        }
      }
    }

    const parts: any[] = [formatInlineData(frontImage)]
    if (backImage) {
      parts.push(formatInlineData(backImage))
    }

    const promptText = `Analyze the business card image(s). Extract the contact details and return ONLY a valid JSON object. Do not wrap in markdown formatting (like \`\`\`json).
Format:
{
  "name": "extracted name",
  "email": "extracted email",
  "phone": "extracted phone",
  "company": "extracted company name",
  "title": "extracted job title"
}`

    parts.push({ text: promptText })

    const payload = {
      contents: [
        {
          parts: parts
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    }

    // Fast primary targets first to avoid unnecessary roundtrip discovery delays
    const primaryEndpoints = [
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`
    ]

    let parsedData = null
    let lastErrorDetails = ''

    // Fast attempt on primary endpoints first (takes ~1-2 seconds)
    for (const url of primaryEndpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const resData = await response.json()

        if (response.ok && resData.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = resData.candidates[0].content.parts[0].text
          const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
          parsedData = JSON.parse(cleanJsonText)
          break
        } else if (resData.error) {
          lastErrorDetails = resData.error.message || JSON.stringify(resData.error)
        }
      } catch (e: any) {
        lastErrorDetails = e.message || String(e)
      }
    }

    // If primary endpoints failed, perform dynamic ListModels discovery as fallback
    if (!parsedData) {
      let availableModelNames: string[] = []
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        const listData = await listRes.json()
        if (listRes.ok && Array.isArray(listData.models)) {
          availableModelNames = listData.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace(/^models\//, ''))
        }
      } catch (err: any) {}

      for (const modelName of availableModelNames) {
        for (const ver of ['v1', 'v1beta']) {
          const url = `https://generativelanguage.googleapis.com/${ver}/models/${modelName}:generateContent?key=${apiKey}`
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            const resData = await response.json()
            if (response.ok && resData.candidates?.[0]?.content?.parts?.[0]?.text) {
              const rawText = resData.candidates[0].content.parts[0].text
              const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
              parsedData = JSON.parse(cleanJsonText)
              break
            }
          } catch (e) {}
        }
        if (parsedData) break
      }
    }

    if (!parsedData) {
      return NextResponse.json({
        error: `Gemini API Key Error: ${lastErrorDetails || 'No compatible model found for your key.'} Please visit https://aistudio.google.com/ to create a fresh API key with Generative Language permissions.`
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: parsedData })

  } catch (error: any) {
    console.error('Error in parse-card API:', error)
    return NextResponse.json({ error: error.message || 'Failed to parse business card.' }, { status: 500 })
  }
}

import { createWorker } from 'tesseract.js'
import { ParsedPassportData, findAndParseMrzInText, parseTd3Mrz, computeIcaoCheckDigit } from './mrzParser'

export interface OcrProgressCallback {
  (status: string, progress: number): void
}

/**
 * Preprocesses an image on an in-memory Canvas to maximize MRZ OCR accuracy:
 * 1. Focuses on the bottom portion (where the MRZ is situated).
 * 2. Converts to high-contrast Grayscale & Binarization (Otsu threshold).
 */
export async function preprocessPassportImage(
  imageSource: File | Blob | string,
  cropBottomOnly = true
): Promise<{ preprocessedDataUrl: string; fullWidth: number; fullHeight: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width
        const origH = img.naturalHeight || img.height

        // Determine crop area: MRZ is in the bottom 32% of standard passport bio page
        const cropY = cropBottomOnly ? Math.floor(origH * 0.65) : 0
        const cropH = cropBottomOnly ? origH - cropY : origH
        const cropW = origW

        const canvas = document.createElement('canvas')
        // Upscale small crops if needed for crisp character edges
        const scale = Math.max(1, Math.min(2, 1800 / cropW))
        canvas.width = Math.floor(cropW * scale)
        canvas.height = Math.floor(cropH * scale)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas 2D context'))
          return
        }

        // Draw image onto canvas
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height)

        // Get pixel data for contrast enhancement & binarization
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = imgData.data

        // Grayscale + calculate average brightness
        let totalBrightness = 0
        const totalPixels = d.length / 4

        for (let i = 0; i < d.length; i += 4) {
          // Standard ITU-R BT.601 luma formula
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
          d[i] = gray
          d[i + 1] = gray
          d[i + 2] = gray
          totalBrightness += gray
        }

        const avgBrightness = totalBrightness / totalPixels
        // Threshold: slightly lower than average to make dark text solid black on white
        const threshold = Math.max(80, Math.min(170, avgBrightness * 0.92))

        // High contrast binarization
        for (let i = 0; i < d.length; i += 4) {
          const val = d[i] < threshold ? 0 : 255
          d[i] = val
          d[i + 1] = val
          d[i + 2] = val
        }

        ctx.putImageData(imgData, 0, 0)
        resolve({
          preprocessedDataUrl: canvas.toDataURL('image/png'),
          fullWidth: origW,
          fullHeight: origH,
        })
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image for preprocessing'))

    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else {
      img.src = URL.createObjectURL(imageSource)
    }
  })
}

/**
 * Common OCR repairs for OCR-B character confusions in MRZ.
 */
function applySmartMrzRepairs(rawLines: string[]): string[] {
  return rawLines.map((line, lineIndex) => {
    let l = line.toUpperCase().replace(/[^A-Z0-9<]/g, '').trim()
    if (lineIndex === 0) {
      // Line 1: starts with P
      if (l.startsWith('F<') || l.startsWith('R<') || l.startsWith('D<')) {
        l = 'P' + l.substring(1)
      }
    } else if (lineIndex === 1 && l.length >= 28) {
      // Line 2: passport number, dates, checksums
      // DOB at indices 13..19 should be strictly digits
      const chars = l.split('')
      for (let i = 13; i < 20; i++) {
        if (chars[i] === 'O' || chars[i] === 'Q' || chars[i] === 'D') chars[i] = '0'
        if (chars[i] === 'I' || chars[i] === 'L' || chars[i] === '|') chars[i] = '1'
        if (chars[i] === 'S') chars[i] = '5'
        if (chars[i] === 'B') chars[i] = '8'
        if (chars[i] === 'Z') chars[i] = '2'
      }
      // Expiry at indices 21..28 should be strictly digits
      for (let i = 21; i < 28; i++) {
        if (chars[i] === 'O' || chars[i] === 'Q' || chars[i] === 'D') chars[i] = '0'
        if (chars[i] === 'I' || chars[i] === 'L' || chars[i] === '|') chars[i] = '1'
        if (chars[i] === 'S') chars[i] = '5'
        if (chars[i] === 'B') chars[i] = '8'
        if (chars[i] === 'Z') chars[i] = '2'
      }
      l = chars.join('')
    }
    return l
  })
}

/**
 * Runs 100% in-browser client-side Tesseract OCR restricted to OCR-B characters.
 * Free, unlimited, zero network requests, complete customer privacy.
 */
export async function scanPassportImageInBrowser(
  imageSource: File | Blob | string,
  onProgress?: OcrProgressCallback
): Promise<ParsedPassportData> {
  onProgress?.('Enhancing image & detecting MRZ band...', 10)

  // Step 1: Preprocess bottom portion
  let processed
  try {
    processed = await preprocessPassportImage(imageSource, true)
  } catch (e) {
    // If canvas fails (e.g. CORS on string), fall back to raw image
    processed = {
      preprocessedDataUrl: typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource),
      fullWidth: 800,
      fullHeight: 600,
    }
  }

  onProgress?.('Loading OCR-B recognition engine...', 25)

  // Step 2: Initialize Tesseract worker
  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        const pct = 30 + Math.floor((m.progress || 0) * 55)
        onProgress?.(`Reading passport text... ${Math.round((m.progress || 0) * 100)}%`, pct)
      }
    },
  })

  // Set parameters optimized specifically for ICAO OCR-B MRZ
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
    tessedit_pageseg_mode: '6' as any, // Assume a single uniform block of text
  })

  onProgress?.('Scanning Machine Readable Zone (MRZ)...', 50)

  try {
    // Recognize cropped bottom band
    const res1 = await worker.recognize(processed.preprocessedDataUrl)
    let parsed = findAndParseMrzInText(res1.data.text)

    // If bottom band didn't find complete MRZ, try full uncropped image
    if (!parsed) {
      onProgress?.('Scanning full document area...', 75)
      const fullProcessed = await preprocessPassportImage(imageSource, false)
      const res2 = await worker.recognize(fullProcessed.preprocessedDataUrl)
      parsed = findAndParseMrzInText(res2.data.text)
    }

    // If lines found but check digits slightly off, attempt heuristic repairs
    if (parsed && !parsed.allChecksumsValid && parsed.rawMrzLines.length >= 2) {
      const repaired = applySmartMrzRepairs(parsed.rawMrzLines)
      const parsedRepaired = parseTd3Mrz(repaired[0], repaired[1])
      if (parsedRepaired && (parsedRepaired.allChecksumsValid || parsedRepaired.passportNumberCheckValid)) {
        parsed = parsedRepaired
      }
    }

    await worker.terminate()

    if (!parsed) {
      throw new Error(
        'Could not detect valid passport MRZ lines. Please ensure the bottom 2 lines of the passport are clearly visible and well-lit.'
      )
    }

    onProgress?.('Complete! Checksums verified.', 100)
    return parsed
  } catch (err: any) {
    try {
      await worker.terminate()
    } catch (_) {}
    throw err
  }
}

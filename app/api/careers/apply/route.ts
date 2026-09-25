import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendJobApplicationNotifications } from '../../../../lib/careerEmails'

export const dynamic = 'force-dynamic'

const SANITY_WRITE_TOKEN =
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_API_TOKEN ||
  'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let applicantName = ''
    let email = ''
    let phone = ''
    let currentLocation = ''
    let linkedinUrl = ''
    let portfolioUrl = ''
    let jobOpeningId = ''
    let jobTitle = 'General / Talent Network Application'
    let yearsOfExperience = ''
    let currentCompany = ''
    let currentRole = ''
    let noticePeriod = ''
    let expectedSalary = ''
    let coverLetter = ''

    let resumeBuffer: Buffer | null = null
    let resumeOriginalName = ''
    let resumeSize = 0
    let resumeMimeType = 'application/octet-stream'

    if (contentType.includes('application/json')) {
      // ── JSON PAYLOAD (Ultra-reliable on iOS Safari & Android mobile) ──
      const json = await req.json()
      applicantName = (json.applicantName as string)?.trim() || ''
      email = (json.email as string)?.trim().toLowerCase() || ''
      phone = (json.phone as string)?.trim() || ''
      currentLocation = (json.currentLocation as string)?.trim() || ''
      linkedinUrl = (json.linkedinUrl as string)?.trim() || ''
      portfolioUrl = (json.portfolioUrl as string)?.trim() || ''
      jobOpeningId = (json.jobOpeningId as string)?.trim() || ''
      jobTitle = (json.jobTitle as string)?.trim() || 'General / Talent Network Application'
      yearsOfExperience = (json.yearsOfExperience as string)?.trim() || ''
      currentCompany = (json.currentCompany as string)?.trim() || ''
      currentRole = (json.currentRole as string)?.trim() || ''
      noticePeriod = (json.noticePeriod as string)?.trim() || ''
      expectedSalary = (json.expectedSalary as string)?.trim() || ''
      coverLetter = (json.coverLetter as string)?.trim() || ''

      if (json.resumeBase64) {
        const base64Str = json.resumeBase64 as string
        const match = base64Str.match(/^data:(.+);base64,(.+)$/)
        if (match) {
          resumeMimeType = match[1] || 'application/pdf'
          resumeBuffer = Buffer.from(match[2], 'base64')
        } else {
          resumeBuffer = Buffer.from(base64Str, 'base64')
        }
        resumeOriginalName = json.resumeFileName || `resume-${Date.now()}.pdf`
        resumeSize = resumeBuffer.length
      }
    } else {
      // ── MULTIPART / FORMDATA PAYLOAD ──
      try {
        const formData = await req.formData()
        applicantName = (formData.get('applicantName') as string)?.trim() || ''
        email = (formData.get('email') as string)?.trim().toLowerCase() || ''
        phone = (formData.get('phone') as string)?.trim() || ''
        currentLocation = (formData.get('currentLocation') as string)?.trim() || ''
        linkedinUrl = (formData.get('linkedinUrl') as string)?.trim() || ''
        portfolioUrl = (formData.get('portfolioUrl') as string)?.trim() || ''
        jobOpeningId = (formData.get('jobOpeningId') as string)?.trim() || ''
        jobTitle = (formData.get('jobTitle') as string)?.trim() || 'General / Talent Network Application'
        yearsOfExperience = (formData.get('yearsOfExperience') as string)?.trim() || ''
        currentCompany = (formData.get('currentCompany') as string)?.trim() || ''
        currentRole = (formData.get('currentRole') as string)?.trim() || ''
        noticePeriod = (formData.get('noticePeriod') as string)?.trim() || ''
        expectedSalary = (formData.get('expectedSalary') as string)?.trim() || ''
        coverLetter = (formData.get('coverLetter') as string)?.trim() || ''

        const resumeFile = formData.get('resume') as File | null
        if (resumeFile && resumeFile.size > 0) {
          resumeOriginalName = resumeFile.name || `resume-${Date.now()}`
          resumeSize = resumeFile.size
          resumeMimeType = resumeFile.type || 'application/octet-stream'
          resumeBuffer = Buffer.from(await resumeFile.arrayBuffer())
        }
      } catch (formErr: any) {
        // Fallback: Attempt parsing body as JSON if formData failed
        try {
          const json = await req.json()
          applicantName = (json.applicantName as string)?.trim() || ''
          email = (json.email as string)?.trim().toLowerCase() || ''
          phone = (json.phone as string)?.trim() || ''
          currentLocation = (json.currentLocation as string)?.trim() || ''
          linkedinUrl = (json.linkedinUrl as string)?.trim() || ''
          portfolioUrl = (json.portfolioUrl as string)?.trim() || ''
          jobOpeningId = (json.jobOpeningId as string)?.trim() || ''
          jobTitle = (json.jobTitle as string)?.trim() || 'General / Talent Network Application'
          yearsOfExperience = (json.yearsOfExperience as string)?.trim() || ''
          currentCompany = (json.currentCompany as string)?.trim() || ''
          currentRole = (json.currentRole as string)?.trim() || ''
          noticePeriod = (json.noticePeriod as string)?.trim() || ''
          expectedSalary = (json.expectedSalary as string)?.trim() || ''
          coverLetter = (json.coverLetter as string)?.trim() || ''
        } catch {
          console.warn('FormData and JSON fallback parsing both failed:', formErr.message)
        }
      }
    }

    // Validation
    if (!applicantName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Full Name, Email Address, and Phone Number are required.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Handle Resume / Profile Upload (supports PDF, DOC, DOCX, TXT, RTF, images, and any format!)
    let sanityAssetDoc: any = null
    let resumeUrl = ''

    if (resumeBuffer && resumeBuffer.length > 0) {
      // Limit to 20MB
      if (resumeBuffer.length > 20 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Resume file size exceeds the 20MB limit. Please upload a smaller file.' },
          { status: 400 }
        )
      }

      try {
        sanityAssetDoc = await writeClient.assets.upload('file', resumeBuffer, {
          filename: resumeOriginalName,
          contentType: resumeMimeType,
        })
        resumeUrl = sanityAssetDoc?.url || ''
      } catch (assetErr: any) {
        console.warn('Failed to upload resume to Sanity Asset Store:', assetErr.message)
      }
    }

    // Read Careers Settings from Sanity (or fallback defaults)
    let settings: any = null
    try {
      settings = await writeClient.fetch(`*[_type == "jobSettings"][0]`)
    } catch (e) {
      // Ignore settings fetch failure, fallback to defaults
    }

    const appliedAt = new Date().toISOString()

    // Create the Application document in Sanity
    const applicationDocPayload: any = {
      _type: 'jobApplication',
      applicantName,
      email,
      phone,
      currentLocation,
      linkedinUrl: linkedinUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      jobTitle,
      yearsOfExperience,
      currentCompany,
      currentRole,
      noticePeriod,
      expectedSalary,
      coverLetter,
      status: 'new',
      rating: 0,
      appliedAt,
      acknowledgementSent: false,
    }

    if (jobOpeningId && !jobOpeningId.startsWith('sample-')) {
      applicationDocPayload.jobOpening = {
        _type: 'reference',
        _ref: jobOpeningId,
      }
    }

    if (sanityAssetDoc) {
      applicationDocPayload.resume = {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: sanityAssetDoc._id,
        },
      }
      applicationDocPayload.resumeUrl = resumeUrl
      applicationDocPayload.resumeOriginalName = resumeOriginalName
      applicationDocPayload.resumeSize = resumeSize
      applicationDocPayload.resumeMimeType = resumeMimeType
    }

    let createdDoc: any = null
    try {
      createdDoc = await writeClient.create(applicationDocPayload)
    } catch (createErr: any) {
      console.error('Failed to create jobApplication in Sanity:', createErr)
      return NextResponse.json(
        { success: false, error: 'Could not record application in database. Please contact us on WhatsApp.' },
        { status: 500 }
      )
    }

    const applicationId = createdDoc?._id || `APP-${Date.now()}`

    // Dispatch Candidate Auto-acknowledgement Mail and Admin Notification Alert Email
    const autoReplyEnabled = settings?.autoReplyEnabled !== false
    const subjectTemplate = settings?.acknowledgementEmailSubject
    const customMessage = settings?.acknowledgementCustomMessage
    const adminNotificationEmails = settings?.adminNotificationEmails

    const dispatchResult = await sendJobApplicationNotifications(
      {
        candidateName: applicantName,
        candidateEmail: email,
        jobTitle,
        applicationId,
        appliedAt,
        customMessage,
      },
      {
        candidateName: applicantName,
        candidateEmail: email,
        candidatePhone: phone,
        candidateLocation: currentLocation,
        jobTitle,
        applicationId,
        appliedAt,
        linkedinUrl,
        portfolioUrl,
        resumeUrl,
        resumeOriginalName,
        yearsOfExperience,
        currentCompany,
        currentRole,
        noticePeriod,
        expectedSalary,
        coverLetter,
        adminNotificationEmails,
      },
      {
        autoReplyEnabled,
        adminEmails: adminNotificationEmails,
        subjectTemplate,
      }
    )

    // Update document with acknowledgement email result if sent
    if (createdDoc && dispatchResult.candidateEmailSent) {
      try {
        await writeClient
          .patch(createdDoc._id)
          .set({
            acknowledgementSent: true,
            acknowledgementMessageId: dispatchResult.candidateMessageId || undefined,
          })
          .commit()
      } catch (patchErr) {
        // Non-blocking patch failure
      }
    }

    return NextResponse.json({
      success: true,
      applicationId,
      candidateEmailSent: dispatchResult.candidateEmailSent,
      adminEmailSent: dispatchResult.adminEmailSent,
      message: 'Application received successfully! An acknowledgement email has been sent to your inbox.',
    })
  } catch (err: any) {
    console.error('Job Apply API Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'An unexpected error occurred while submitting your application.' },
      { status: 500 }
    )
  }
}

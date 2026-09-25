import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendJobApplicationNotifications } from '../../../../lib/careerEmails'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const applicantName = (formData.get('applicantName') as string)?.trim()
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const phone = (formData.get('phone') as string)?.trim()
    const currentLocation = (formData.get('currentLocation') as string)?.trim() || ''
    const linkedinUrl = (formData.get('linkedinUrl') as string)?.trim() || ''
    const portfolioUrl = (formData.get('portfolioUrl') as string)?.trim() || ''
    const jobOpeningId = (formData.get('jobOpeningId') as string)?.trim() || ''
    const jobTitle = (formData.get('jobTitle') as string)?.trim() || 'General / Talent Network Application'
    const yearsOfExperience = (formData.get('yearsOfExperience') as string)?.trim() || ''
    const currentCompany = (formData.get('currentCompany') as string)?.trim() || ''
    const currentRole = (formData.get('currentRole') as string)?.trim() || ''
    const noticePeriod = (formData.get('noticePeriod') as string)?.trim() || ''
    const expectedSalary = (formData.get('expectedSalary') as string)?.trim() || ''
    const coverLetter = (formData.get('coverLetter') as string)?.trim() || ''

    const resumeFile = formData.get('resume') as File | null

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
    let resumeOriginalName = ''
    let resumeSize = 0
    let resumeMimeType = ''

    if (resumeFile && resumeFile.size > 0) {
      // Limit to 20MB
      if (resumeFile.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Resume file size exceeds the 20MB limit. Please upload a smaller file.' },
          { status: 400 }
        )
      }

      resumeOriginalName = resumeFile.name || `resume-${Date.now()}`
      resumeSize = resumeFile.size
      resumeMimeType = resumeFile.type || 'application/octet-stream'

      try {
        const fileBuffer = Buffer.from(await resumeFile.arrayBuffer())
        sanityAssetDoc = await writeClient.assets.upload('file', fileBuffer, {
          filename: resumeOriginalName,
          contentType: resumeMimeType,
        })
        resumeUrl = sanityAssetDoc.url || ''
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

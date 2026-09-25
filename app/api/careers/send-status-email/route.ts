import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendEmail } from '../../../../lib/brevo'
import {
  generateInterviewInviteEmailHtml,
  generateShortlistEmailHtml,
  generateOfferEmailHtml,
  generateRegretEmailHtml,
} from '../../../../lib/careerEmails'

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
    const body = await req.json()
    const {
      applicationId,
      candidateEmail,
      candidateName,
      jobTitle,
      templateType,
      subject,
      interviewDate,
      interviewFormat = 'Google Meet (Video Conference)',
      meetingLinkOrLocation = 'Link will be sent prior to call',
      proposedRole,
      remuneration,
      startDate,
      customMessage,
    } = body

    if (!applicationId || !candidateEmail || !templateType) {
      return NextResponse.json(
        { success: false, error: 'Application ID, candidate email, and template type are required.' },
        { status: 400 }
      )
    }

    let mailHtml = ''
    let defaultSubject = ''
    let newStatus = ''

    if (templateType === 'interview') {
      defaultSubject = `Invitation to Interview: ${jobTitle} at Flying Wonders`
      mailHtml = generateInterviewInviteEmailHtml({
        candidateName,
        candidateEmail,
        jobTitle,
        interviewDate: interviewDate || 'To be confirmed',
        interviewFormat,
        meetingLinkOrLocation,
        customMessage,
      })
      newStatus = 'interview_scheduled'
    } else if (templateType === 'shortlist') {
      defaultSubject = `Application Update: Shortlisted for ${jobTitle} - Flying Wonders`
      mailHtml = generateShortlistEmailHtml({
        candidateName,
        jobTitle,
        customMessage,
      })
      newStatus = 'shortlisted'
    } else if (templateType === 'offer') {
      defaultSubject = `Employment Offer: ${proposedRole || jobTitle} at Flying Wonders`
      mailHtml = generateOfferEmailHtml({
        candidateName,
        jobTitle,
        proposedRole,
        remuneration,
        startDate,
        customMessage,
      })
      newStatus = 'offered'
    } else if (templateType === 'regret') {
      defaultSubject = `Update regarding your application for ${jobTitle} - Flying Wonders`
      mailHtml = generateRegretEmailHtml({
        candidateName,
        jobTitle,
        customMessage,
      })
      newStatus = 'rejected'
    } else {
      return NextResponse.json({ success: false, error: 'Invalid template type' }, { status: 400 })
    }

    const finalSubject = subject || defaultSubject

    // 1. Dispatch email to candidate
    const dispatchRes = await sendEmail({
      to: candidateEmail.trim(),
      subject: finalSubject,
      html: mailHtml,
      senderName: 'Flying Wonders Careers',
      senderEmail: 'contact@flyingwonders.net',
      replyTo: 'contact@flyingwonders.net',
    })

    if (!dispatchRes.success) {
      return NextResponse.json(
        { success: false, error: dispatchRes.error || 'Failed to dispatch email' },
        { status: 500 }
      )
    }

    // 2. Update status and notes in Sanity
    try {
      const nowStr = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const noteEntry = `\n[${nowStr}] Sent ${templateType.toUpperCase()} email: "${finalSubject}"`

      const patch = writeClient.patch(applicationId)
      if (newStatus) patch.set({ status: newStatus })
      if (interviewDate && templateType === 'interview') {
        patch.set({ interviewDate: new Date(interviewDate).toISOString() })
      }

      // Append to internal notes
      const existing = await writeClient.fetch(
        `*[_type == "jobApplication" && _id == $id][0].internalNotes`,
        { id: applicationId }
      )
      patch.set({ internalNotes: (existing || '') + noteEntry })

      await patch.commit()
    } catch (patchErr: any) {
      console.warn('Failed to update status after email dispatch:', patchErr.message)
    }

    return NextResponse.json({
      success: true,
      newStatus,
      messageId: dispatchRes.messageId,
      message: `Status email successfully sent to ${candidateEmail}!`,
    })
  } catch (err: any) {
    console.error('Send Status Email Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process email dispatch' },
      { status: 500 }
    )
  }
}

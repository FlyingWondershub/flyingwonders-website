import { sendEmail } from './brevo'

interface CandidateEmailParams {
  candidateName: string
  candidateEmail: string
  jobTitle: string
  applicationId: string
  appliedAt: string
  customMessage?: string
}

interface AdminAlertEmailParams {
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  candidateLocation?: string
  jobTitle: string
  applicationId: string
  appliedAt: string
  linkedinUrl?: string
  portfolioUrl?: string
  resumeUrl?: string
  resumeOriginalName?: string
  yearsOfExperience?: string
  currentCompany?: string
  currentRole?: string
  noticePeriod?: string
  expectedSalary?: string
  coverLetter?: string
  adminNotificationEmails?: string
}

/**
 * Generates responsive, high-deliverability branded HTML for Candidate Acknowledgement
 */
export function generateCandidateAcknowledgementHtml({
  candidateName,
  jobTitle,
  applicationId,
  appliedAt,
  customMessage,
}: CandidateEmailParams): string {
  const formattedDate = new Date(appliedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const nextStepsNote =
    customMessage ||
    'Thank you for taking the time to share your background with us. Our hiring and operations leadership reviews all submissions carefully. If your skills match our current focus, our team will reach out within 48 to 72 hours for an exploratory conversation.'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - Flying Wonders</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #800020 0%, #4A0012 100%); padding: 36px 30px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 8px 0 0 0; font-size: 13px; color: #F1D4DB; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
    .badge { display: inline-block; background-color: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 36px 32px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
    .intro { font-size: 15px; color: #475569; margin-bottom: 24px; }
    .summary-card { background-color: #F1F5F9; border-left: 4px solid #800020; border-radius: 8px; padding: 18px 20px; margin-bottom: 28px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .summary-row:last-child { margin-bottom: 0; }
    .summary-label { color: #64748B; font-weight: 500; }
    .summary-value { color: #0F172A; font-weight: 700; }
    .timeline-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 24px 0 16px 0; display: flex; align-items: center; gap: 8px; }
    .timeline-step { display: flex; gap: 14px; margin-bottom: 14px; }
    .step-number { width: 26px; height: 26px; border-radius: 50%; background-color: #FEF2F2; color: #800020; border: 1px solid #FECACA; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-text h4 { margin: 0; font-size: 14px; font-weight: 600; color: #1E293B; }
    .step-text p { margin: 2px 0 0 0; font-size: 13px; color: #64748B; }
    .cta-box { background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 18px 20px; margin-top: 28px; text-align: center; }
    .cta-box p { margin: 0 0 12px 0; font-size: 14px; color: #92400E; font-weight: 500; }
    .cta-btn { display: inline-block; background-color: #800020; color: #FFFFFF !important; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 22px; border-radius: 6px; }
    .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94A3B8; }
    .footer a { color: #800020; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>Flying Wonders Careers</p>
      <h1>Application Received</h1>
      <div class="badge">Reference ID: ${applicationId.slice(-8).toUpperCase()}</div>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ${candidateName},</div>
      <p class="intro">
        Thank you for submitting your application for the <strong>${jobTitle}</strong> position at Flying Wonders. We are excited about your interest in helping us craft memorable travel journeys across Southeast Asia and beyond!
      </p>

      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Applied Role:</span>
          <span class="summary-value">${jobTitle}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Submitted On:</span>
          <span class="summary-value">${formattedDate}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Status:</span>
          <span class="summary-value" style="color: #059669;">Under Review</span>
        </div>
      </div>

      <div class="timeline-title">What Happens Next</div>
      
      <div class="timeline-step">
        <div class="step-number">1</div>
        <div class="step-text">
          <h4>Profile Review</h4>
          <p>${nextStepsNote}</p>
        </div>
      </div>

      <div class="timeline-step">
        <div class="step-number">2</div>
        <div class="step-text">
          <h4>Exploratory Chat</h4>
          <p>A 20-30 minute conversation to discuss your background, expectations, and culture fit.</p>
        </div>
      </div>

      <div class="timeline-step">
        <div class="step-number">3</div>
        <div class="step-text">
          <h4>Team Discussion & Offer</h4>
          <p>Meet leadership, discuss practical project scenarios, and formalize offer terms.</p>
        </div>
      </div>

      <div class="cta-box">
        <p>In the meantime, feel free to explore our services and destination catalogs:</p>
        <a class="cta-btn" href="https://flyingwonders.net" target="_blank">Explore Flying Wonders</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>Flying Wonders Travel & Tours</strong></p>
      <p style="margin: 0 0 6px 0;">Singapore HQ & Bangalore Operations Hub</p>
      <p style="margin: 0;">Have a question about your application? Reply directly to this email or write to <a href="mailto:contact@flyingwonders.net">contact@flyingwonders.net</a>.</p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Generates an internal notification alert for the Admin / HR team
 */
export function generateAdminAlertHtml(params: AdminAlertEmailParams): string {
  const formattedDate = new Date(params.appliedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const waNumber = params.candidatePhone.replace(/[^0-9]/g, '')
  const waUrl = waNumber ? `https://wa.me/${waNumber}` : null

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Job Application Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; color: #1E293B; margin: 0; padding: 20px; }
    .box { max-width: 620px; margin: 0 auto; background: #FFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
    .header { background: #0F172A; color: #FFF; padding: 20px 24px; }
    .header h2 { margin: 0; font-size: 18px; }
    .body { padding: 24px; }
    .badge { display: inline-block; background: #E0E7FF; color: #3730A3; font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 14px; }
    td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; vertical-align: top; }
    td.label { width: 35%; color: #64748B; font-weight: 600; }
    td.val { color: #0F172A; font-weight: 500; }
    .actions { margin-top: 24px; display: flex; gap: 10px; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 9px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; color: #FFF !important; }
    .btn-primary { background: #800020; }
    .btn-linkedin { background: #0A66C2; }
    .btn-wa { background: #25D366; }
    .btn-resume { background: #475569; }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">
      <h2>🔔 New Candidate Application Alert</h2>
      <div style="font-size: 13px; color: #94A3B8; margin-top: 4px;">Role: <strong>${params.jobTitle}</strong></div>
    </div>
    <div class="body">
      <div class="badge">Applicant: ${params.candidateName}</div>
      <table>
        <tr>
          <td class="label">Candidate Name:</td>
          <td class="val"><strong>${params.candidateName}</strong></td>
        </tr>
        <tr>
          <td class="label">Applied Position:</td>
          <td class="val"><strong>${params.jobTitle}</strong></td>
        </tr>
        <tr>
          <td class="label">Email Address:</td>
          <td class="val"><a href="mailto:${params.candidateEmail}">${params.candidateEmail}</a></td>
        </tr>
        <tr>
          <td class="label">Phone / WhatsApp:</td>
          <td class="val"><a href="tel:${params.candidatePhone}">${params.candidatePhone}</a></td>
        </tr>
        ${params.candidateLocation ? `<tr><td class="label">Current Location:</td><td class="val">${params.candidateLocation}</td></tr>` : ''}
        ${params.yearsOfExperience ? `<tr><td class="label">Experience:</td><td class="val">${params.yearsOfExperience}</td></tr>` : ''}
        ${params.currentCompany ? `<tr><td class="label">Current Employer:</td><td class="val">${params.currentCompany} ${params.currentRole ? `(${params.currentRole})` : ''}</td></tr>` : ''}
        ${params.noticePeriod ? `<tr><td class="label">Notice Period:</td><td class="val">${params.noticePeriod}</td></tr>` : ''}
        ${params.expectedSalary ? `<tr><td class="label">Expected Salary:</td><td class="val">${params.expectedSalary}</td></tr>` : ''}
        <tr>
          <td class="label">Submitted At:</td>
          <td class="val">${formattedDate}</td>
        </tr>
        ${params.coverLetter ? `<tr><td class="label">Pitch / Cover Note:</td><td class="val" style="white-space: pre-wrap; font-size: 13px; color: #334155;">${params.coverLetter}</td></tr>` : ''}
      </table>

      <div class="actions" style="margin-top: 24px;">
        ${params.resumeUrl ? `<a class="btn btn-resume" href="${params.resumeUrl}" target="_blank">📄 View Resume (${params.resumeOriginalName || 'File'})</a>` : ''}
        ${params.linkedinUrl ? `<a class="btn btn-linkedin" href="${params.linkedinUrl}" target="_blank">💼 LinkedIn Profile</a>` : ''}
        ${waUrl ? `<a class="btn btn-wa" href="${waUrl}" target="_blank">💬 WhatsApp Chat</a>` : ''}
        <a class="btn btn-primary" href="https://flyingwonders.net/admin-dashboard#section-job-openings" target="_blank">🚀 Open Admin Portal</a>
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Dispatches candidate auto-acknowledgement and admin notification emails concurrently
 */
export async function sendJobApplicationNotifications(
  candidateParams: CandidateEmailParams,
  adminAlertParams: AdminAlertEmailParams,
  options: {
    autoReplyEnabled?: boolean
    adminEmails?: string
    subjectTemplate?: string
  } = {}
): Promise<{
  candidateEmailSent: boolean
  candidateMessageId?: string
  candidateError?: string
  adminEmailSent: boolean
  adminMessageId?: string
}> {
  let candidateEmailSent = false
  let candidateMessageId: string | undefined
  let candidateError: string | undefined

  const { autoReplyEnabled = true, adminEmails, subjectTemplate } = options

  // 1. Dispatch candidate auto-acknowledgement email
  if (autoReplyEnabled && candidateParams.candidateEmail) {
    try {
      const subject = (
        subjectTemplate || 'Application Received: {{jobTitle}} at Flying Wonders'
      )
        .replace(/\{\{\s*jobTitle\s*\}\}/gi, candidateParams.jobTitle)
        .replace(/\{\{\s*candidateName\s*\}\}/gi, candidateParams.candidateName)

      const html = generateCandidateAcknowledgementHtml(candidateParams)

      const res = await sendEmail({
        to: candidateParams.candidateEmail,
        subject,
        html,
        senderName: 'Flying Wonders Careers',
        senderEmail: 'contact@flyingwonders.net',
        replyTo: 'contact@flyingwonders.net',
      })

      if (res.success) {
        candidateEmailSent = true
        candidateMessageId = res.messageId
      } else {
        candidateError = res.error
      }
    } catch (err: any) {
      console.warn('[Careers Dispatch] Failed candidate email:', err.message)
      candidateError = err.message
    }
  }

  // 2. Dispatch internal Admin notification alert email
  let adminEmailSent = false
  let adminMessageId: string | undefined

  const targetAdminEmails = (
    adminEmails ||
    adminAlertParams.adminNotificationEmails ||
    'contact@flyingwonders.net, info.flyingwonders@gmail.com'
  )
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (targetAdminEmails.length > 0) {
    try {
      const adminSubject = `🚨 New Candidate Application: ${candidateParams.candidateName} for ${candidateParams.jobTitle}`
      const adminHtml = generateAdminAlertHtml(adminAlertParams)

      const adminRes = await sendEmail({
        to: targetAdminEmails,
        subject: adminSubject,
        html: adminHtml,
        senderName: 'Flying Wonders Talent Alert',
        senderEmail: 'contact@flyingwonders.net',
        replyTo: candidateParams.candidateEmail,
      })

      if (adminRes.success) {
        adminEmailSent = true
        adminMessageId = adminRes.messageId
      }
    } catch (adminErr: any) {
      console.warn('[Careers Dispatch] Failed admin alert:', adminErr.message)
    }
  }

  return {
    candidateEmailSent,
    candidateMessageId,
    candidateError,
    adminEmailSent,
    adminMessageId,
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * STATUS UPDATE EMAILS (INTERVIEW, SHORTLIST, OFFER, REGRET)
 * ─────────────────────────────────────────────────────────────
 */

export interface InterviewInviteEmailParams {
  candidateName: string
  candidateEmail: string
  jobTitle: string
  interviewDate: string
  interviewFormat: string
  meetingLinkOrLocation: string
  customMessage?: string
}

export function generateInterviewInviteEmailHtml(params: InterviewInviteEmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Interview Invitation - Flying Wonders</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0F4C3A 0%, #062B21 100%); padding: 36px 30px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0 0; font-size: 13px; color: #A7F3D0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
    .content { padding: 36px 32px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
    .details-box { background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .row:last-child { margin-bottom: 0; }
    .label { color: #166534; font-weight: 600; }
    .val { color: #0F172A; font-weight: 700; }
    .btn { display: inline-block; background-color: #0F4C3A; color: #FFFFFF !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 26px; border-radius: 8px; margin-top: 15px; }
    .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>Flying Wonders Talent Acquisition</p>
      <h1>Interview Invitation</h1>
    </div>
    <div class="content">
      <div class="greeting">Dear ${params.candidateName},</div>
      <p>
        We were very impressed by your background and application for the <strong>${params.jobTitle}</strong> position. We would love to invite you for an interview to explore your experience and discuss how you can contribute to our team!
      </p>

      <div class="details-box">
        <div class="row">
          <span class="label">📅 Scheduled Date & Time:</span>
          <span class="val">${params.interviewDate}</span>
        </div>
        <div class="row">
          <span class="label">📍 Interview Format:</span>
          <span class="val">${params.interviewFormat}</span>
        </div>
        <div class="row">
          <span class="label">🔗 Meeting Link / Location:</span>
          <span class="val">${params.meetingLinkOrLocation}</span>
        </div>
      </div>

      ${params.customMessage ? `<div style="background-color: #F8FAFC; border-left: 3px solid #0F4C3A; padding: 14px 16px; margin: 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">${params.customMessage}</div>` : ''}

      <p style="font-size: 14px; color: #475569;">
        Please reply to this email to confirm your attendance. If you need to reschedule to an alternative time slot, simply let us know.
      </p>

      ${params.meetingLinkOrLocation.startsWith('http') ? `<div style="text-align: center;"><a class="btn" href="${params.meetingLinkOrLocation}" target="_blank">Join Meeting Room</a></div>` : ''}
    </div>
    <div class="footer">
      <p style="margin: 0;">Flying Wonders Travel • Singapore HQ & International Operations</p>
    </div>
  </div>
</body>
</html>`
}

export function generateShortlistEmailHtml(params: { candidateName: string; jobTitle: string; customMessage?: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Application Shortlisted - Flying Wonders</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; }
    .header { background: linear-gradient(135deg, #1E40AF 0%, #172554 100%); padding: 36px 30px; text-align: center; color: #FFFFFF; }
    .content { padding: 36px 32px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
    .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #93C5FD; font-weight: 700;">Flying Wonders Careers</div>
      <h1 style="margin: 6px 0 0 0; font-size: 22px;">You've Been Shortlisted!</h1>
    </div>
    <div class="content">
      <div class="greeting">Hi ${params.candidateName},</div>
      <p>
        Great news! Following an initial review of your qualifications, our hiring committee has shortlisted your profile for the <strong>${params.jobTitle}</strong> position.
      </p>
      ${params.customMessage ? `<div style="background-color: #EFF6FF; border-left: 3px solid #2563EB; padding: 14px 16px; margin: 20px 0; font-size: 14px; color: #1E3A8A; line-height: 1.6;">${params.customMessage}</div>` : ''}
      <p>
        Our team will follow up shortly with specific details regarding the next interview round and schedule.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">Flying Wonders Travel • Talent & People Operations</p>
    </div>
  </div>
</body>
</html>`
}

export function generateOfferEmailHtml(params: { candidateName: string; jobTitle: string; proposedRole?: string; remuneration?: string; startDate?: string; customMessage?: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Job Offer - Flying Wonders</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; }
    .header { background: linear-gradient(135deg, #800020 0%, #3B000E 100%); padding: 36px 30px; text-align: center; color: #FFFFFF; }
    .content { padding: 36px 32px; line-height: 1.6; }
    .box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 18px; margin: 20px 0; }
    .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #FCA5A5; font-weight: 700;">Flying Wonders Career Opportunity</div>
      <h1 style="margin: 6px 0 0 0; font-size: 24px;">🎉 Congratulations on Your Offer!</h1>
    </div>
    <div class="content">
      <div style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">Dear ${params.candidateName},</div>
      <p>
        On behalf of Flying Wonders, we are thrilled to extend a formal offer of employment for the position of <strong>${params.proposedRole || params.jobTitle}</strong>. We were thoroughly impressed by your experience and enthusiasm, and believe you will play a pivotal role in our growth!
      </p>

      <div class="box">
        ${params.remuneration ? `<div style="margin-bottom: 8px;"><strong>Remuneration Package:</strong> ${params.remuneration}</div>` : ''}
        ${params.startDate ? `<div style="margin-bottom: 8px;"><strong>Anticipated Start Date:</strong> ${params.startDate}</div>` : ''}
        <div><strong>Department / Reporting:</strong> Travel Operations & Executive Leadership</div>
      </div>

      ${params.customMessage ? `<div style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 18px;">${params.customMessage}</div>` : ''}

      <p style="font-size: 14px; color: #475569;">
        Please review the attached or discussed terms and reply to confirm your acceptance. Welcome to the Flying Wonders family!
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">Flying Wonders Travel • Executive Office</p>
    </div>
  </div>
</body>
</html>`
}

export function generateRegretEmailHtml(params: { candidateName: string; jobTitle: string; customMessage?: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Application Update - Flying Wonders</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; }
    .header { background: #1E293B; padding: 32px 30px; text-align: center; color: #FFFFFF; }
    .content { padding: 36px 32px; line-height: 1.6; font-size: 15px; color: #334155; }
    .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; font-weight: 700;">Flying Wonders Careers</div>
      <h1 style="margin: 6px 0 0 0; font-size: 20px;">Application Update</h1>
    </div>
    <div class="content">
      <div style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">Dear ${params.candidateName},</div>
      <p>
        Thank you for taking the time to consider Flying Wonders and for sharing your background with us for the <strong>${params.jobTitle}</strong> position.
      </p>
      <p>
        After careful consideration of our current team requirements, we have decided to move forward with other candidates whose experience aligns more closely with our immediate focus areas.
      </p>
      ${params.customMessage ? `<div style="background-color: #F1F5F9; border-left: 3px solid #64748B; padding: 12px 16px; margin: 18px 0; font-size: 14px; color: #334155; line-height: 1.6;">${params.customMessage}</div>` : ''}
      <p>
        We have retained your resume in our talent network and will reach out if future positions matching your background arise. We wish you every success in your ongoing career journey.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">Flying Wonders Travel • Talent & People Operations</p>
    </div>
  </div>
</body>
</html>`
}


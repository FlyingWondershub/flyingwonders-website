import { defineField, defineType } from 'sanity'

export const jobApplicationSchema = defineType({
  name: 'jobApplication',
  title: 'Job Applications & Candidates',
  type: 'document',
  fields: [
    defineField({
      name: 'applicantName',
      title: 'Candidate Full Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone / WhatsApp Number',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'currentLocation',
      title: 'Current City / Country',
      type: 'string',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn Profile URL',
      type: 'url',
      description: 'e.g. https://www.linkedin.com/in/applicant-name',
    }),
    defineField({
      name: 'portfolioUrl',
      title: 'Portfolio / GitHub / Website URL',
      type: 'url',
    }),
    defineField({
      name: 'resume',
      title: 'Uploaded Resume / Profile Document',
      type: 'file',
      description: 'PDF, DOC, DOCX, TXT, or scan image uploaded by candidate.',
    }),
    defineField({
      name: 'resumeUrl',
      title: 'Direct Resume CDN Link',
      type: 'url',
      description: 'Direct accessible URL for immediate review or downloading.',
    }),
    defineField({
      name: 'resumeOriginalName',
      title: 'Resume Original File Name',
      type: 'string',
    }),
    defineField({
      name: 'resumeSize',
      title: 'Resume File Size (Bytes)',
      type: 'number',
    }),
    defineField({
      name: 'resumeMimeType',
      title: 'Resume MIME Type',
      type: 'string',
    }),
    defineField({
      name: 'jobOpening',
      title: 'Applied Job Opening',
      type: 'reference',
      to: [{ type: 'jobOpening' }],
      description: 'Leave empty for General / Talent Network submissions.',
    }),
    defineField({
      name: 'jobTitle',
      title: 'Applied Role Title',
      type: 'string',
      description: 'Snapshot of the role title at time of application.',
      initialValue: 'General / Talent Pool Application',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'yearsOfExperience',
      title: 'Years of Experience',
      type: 'string',
    }),
    defineField({
      name: 'currentCompany',
      title: 'Current / Most Recent Employer',
      type: 'string',
    }),
    defineField({
      name: 'currentRole',
      title: 'Current / Most Recent Role',
      type: 'string',
    }),
    defineField({
      name: 'noticePeriod',
      title: 'Notice Period / Availability',
      type: 'string',
      options: {
        list: [
          { title: 'Immediate / Ready to start', value: 'Immediate' },
          { title: '15 Days or less', value: '15 Days' },
          { title: '1 Month', value: '1 Month' },
          { title: '2 Months', value: '2 Months' },
          { title: '3 Months', value: '3 Months' },
          { title: 'Other / Negotiable', value: 'Negotiable' },
        ],
      },
    }),
    defineField({
      name: 'expectedSalary',
      title: 'Expected Salary / Remuneration',
      type: 'string',
    }),
    defineField({
      name: 'coverLetter',
      title: 'Cover Note / Elevator Pitch',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'status',
      title: 'Application Pipeline Status',
      type: 'string',
      options: {
        list: [
          { title: '🆕 New Application', value: 'new' },
          { title: '👀 Reviewing', value: 'reviewing' },
          { title: '⭐ Shortlisted', value: 'shortlisted' },
          { title: '📅 Interview Scheduled', value: 'interview_scheduled' },
          { title: '🎉 Offered', value: 'offered' },
          { title: '❌ Rejected', value: 'rejected' },
          { title: '📦 Archived', value: 'archived' },
        ],
      },
      initialValue: 'new',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Candidate Score Rating (1 - 5)',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).max(5),
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal Interview & Hiring Notes',
      type: 'text',
      rows: 4,
      description: 'Private team notes on interview feedback, strengths, compensation discussions.',
    }),
    defineField({
      name: 'interviewDate',
      title: 'Scheduled Interview Date & Time',
      type: 'datetime',
    }),
    defineField({
      name: 'appliedAt',
      title: 'Applied At Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'acknowledgementSent',
      title: 'Acknowledgement Email Dispatched',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'acknowledgementMessageId',
      title: 'Email Dispatch Message ID',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      applicantName: 'applicantName',
      jobTitle: 'jobTitle',
      status: 'status',
      appliedAt: 'appliedAt',
    },
    prepare({ applicantName, jobTitle, status, appliedAt }) {
      const dateStr = appliedAt ? new Date(appliedAt).toLocaleDateString() : ''
      return {
        title: applicantName || 'Unknown Applicant',
        subtitle: `${jobTitle || 'General'} • [${(status || 'new').toUpperCase()}] ${dateStr}`,
      }
    },
  },
})

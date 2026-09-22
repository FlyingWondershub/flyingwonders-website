import { defineField, defineType } from 'sanity'

export const newsletterCampaignSchema = defineType({
  name: 'newsletterCampaign',
  title: 'Newsletters & Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Campaign Name (Internal)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subject',
      title: 'Email Subject Line',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'preheader',
      title: 'Inbox Preview Snippet (Preheader)',
      type: 'string',
      description: 'The preview text shown next to the subject in Gmail/iPhone Mail before opening the email.',
    }),
    defineField({
      name: 'content',
      title: 'Email Content (HTML or Plain Text)',
      type: 'text',
      description: 'Write the email content. Support standard HTML formatting (like <p>, <a>, <strong>, etc.)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Sending Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft / Template', value: 'draft' },
          { title: 'Active (Sent)', value: 'sent' },
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'sentAt',
      title: 'First Sent At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'sentToCount',
      title: 'Total Emails Sent To',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'dispatchCount',
      title: 'Total Times Dispatched',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'lastSentAt',
      title: 'Last Dispatched At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'lastSentToCount',
      title: 'Last Sent Count',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'dispatchHistory',
      title: 'Dispatch Audit History',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'dispatchedAt', type: 'datetime', title: 'Date & Time' },
            { name: 'targetAudience', type: 'string', title: 'Target Audience' },
            { name: 'sentCount', type: 'number', title: 'Successfully Delivered' },
            { name: 'errorCount', type: 'number', title: 'Errors / Bounces' },
            { name: 'dispatchedBy', type: 'string', title: 'Admin' },
            { name: 'notes', type: 'string', title: 'Notes / Recipient Details' },
          ],
        },
      ],
      readOnly: true,
    }),
    defineField({
      name: 'structuredData',
      title: 'Structured Builder Data (JSON)',
      type: 'text',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      sentAt: 'sentAt',
    },
    prepare({ title, status, sentAt }) {
      return {
        title: title,
        subtitle: status === 'sent' ? `Sent on: ${new Date(sentAt).toLocaleDateString()}` : 'Draft',
      }
    },
  },
})

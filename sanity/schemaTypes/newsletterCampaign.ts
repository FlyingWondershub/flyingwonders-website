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
          { title: 'Draft', value: 'draft' },
          { title: 'Sent', value: 'sent' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'sentAt',
      title: 'Sent At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'sentToCount',
      title: 'Total Emails Sent To',
      type: 'number',
      readOnly: true,
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

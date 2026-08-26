import { defineType, defineField } from 'sanity'

export const b2bLeadAuditLogSchema = defineType({
  name: 'b2bLeadAuditLog',
  title: 'B2B Lead Audit Logs',
  type: 'document',
  fields: [
    defineField({
      name: 'inquiryTitle',
      title: 'Inquiry Summary / Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'inquiryRef',
      title: 'Inquiry Document Reference',
      type: 'reference',
      to: [{ type: 'b2bLeadInquiry' }],
    }),
    defineField({
      name: 'subscriberRef',
      title: 'Subscriber Document Reference',
      type: 'reference',
      to: [{ type: 'b2bLeadSubscriber' }],
    }),
    defineField({
      name: 'recipientPhone',
      title: 'Recipient Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'recipientEmail',
      title: 'Recipient Email',
      type: 'string',
    }),
    defineField({
      name: 'matchedDestination',
      title: 'Matched Destination / Tag',
      type: 'string',
    }),
    defineField({
      name: 'dispatchChannel',
      title: 'Dispatch Channel',
      type: 'string',
      options: {
        list: [
          { title: 'WhatsApp', value: 'whatsapp' },
          { title: 'Email', value: 'email' },
        ],
      },
    }),
    defineField({
      name: 'deliveryStatus',
      title: 'Delivery Status',
      type: 'string',
      options: {
        list: [
          { title: '✅ Sent / Dispatched', value: 'sent' },
          { title: '❌ Failed / Error', value: 'failed' },
          { title: '⏸️ Rate Limited (Daily Cap Exceeded)', value: 'rate_limited' },
          { title: '🌙 Suppressed (Quiet Hours)', value: 'quiet_hours_delayed' },
        ],
      },
      initialValue: 'sent',
    }),
    defineField({
      name: 'dispatchedAt',
      title: 'Dispatched Date & Time',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error Message (if failed)',
      type: 'text',
      rows: 2,
    }),
  ],
  orderings: [
    {
      title: 'Dispatched Date (Newest First)',
      name: 'dispatchedAtDesc',
      by: [{ field: 'dispatchedAt', direction: 'desc' }],
    },
  ],
})

import { defineField, defineType } from 'sanity'

export const newsletterSubscriberSchema = defineType({
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscribers',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active Subscription',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'audienceType',
      title: 'Audience Type',
      type: 'string',
      options: {
        list: [
          { title: 'B2B Travel Partner', value: 'b2b' },
          { title: 'Website Subscriber (B2C)', value: 'b2c' },
          { title: 'Inquiry / Lead', value: 'lead' },
        ],
      },
      initialValue: 'b2b',
    }),
    defineField({
      name: 'name',
      title: 'Contact Name',
      type: 'string',
    }),
    defineField({
      name: 'company',
      title: 'Company / Agency',
      type: 'string',
    }),
    defineField({
      name: 'source',
      title: 'Acquisition Source',
      type: 'string',
      initialValue: 'b2b_leads_directory',
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'subscribedAt',
    },
  },
})

import { defineField, defineType } from 'sanity'

export const businessCardSchema = defineType({
  name: 'businessCard',
  title: 'Business Card Leads',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
    }),
    defineField({
      name: 'frontCardImage',
      title: 'Business Card Front Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'backCardImage',
      title: 'Business Card Back Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'capturedAt',
      title: 'Captured At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'company',
    },
  },
})

import { defineType, defineField } from 'sanity'

export const travelConsultantSchema = defineType({
  name: 'travelConsultant',
  title: 'Travel Consultants & Specialists',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Consultant Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'avatar',
      title: 'Profile Photo Avatar',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'title',
      title: 'Designation / Specialty',
      type: 'string',
      initialValue: 'Senior Singapore & Malaysia DMC Specialist',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio & Background',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'languages',
      title: 'Spoken Languages',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['English', 'Hindi', 'Tamil'],
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Contact Number',
      type: 'string',
    }),
    defineField({
      name: 'meetingLink',
      title: 'Default Google Meet / Video Call Link',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'Active for Booking Assignments?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

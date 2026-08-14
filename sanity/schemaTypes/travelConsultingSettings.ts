import { defineType, defineField } from 'sanity'

export const travelConsultingSettingsSchema = defineType({
  name: 'travelConsultingSettings',
  title: 'Travel Consulting Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Tailored Travel Consulting for Singapore & Malaysia',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      initialValue: 'Get 1-on-1 bespoke itinerary planning, VIP on-ground support, and B2B circuit strategies from local Singapore DMC experts. 100% of your consulting fee is credited towards your final booking!',
    }),
    defineField({
      name: 'feeCreditPolicy',
      title: '100% Fee Adjustment Credit Policy Text',
      type: 'text',
      initialValue: 'Book with confidence: 100% of your consulting fee is credited as a direct discount on your final package, attraction ticket, or hotel booking balance.',
    }),
    defineField({
      name: 'timeSlotWindows',
      title: 'Selectable Time Windows',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: [
        'Morning (9:00 AM – 12:00 PM SGT)',
        'Afternoon (1:00 PM – 5:00 PM SGT)',
        'Evening (6:00 PM – 9:00 PM SGT)',
      ],
    }),
    defineField({
      name: 'defaultMeetingLink',
      title: 'Default Company Google Meet / Video Call Link',
      type: 'url',
      initialValue: 'https://meet.google.com/flyingwonders-consulting',
      description: 'Global default Google Meet link used when no specific consultant meeting link is provided.',
    }),
    defineField({
      name: 'availableLanguages',
      title: 'Available Languages',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['English', 'Hindi', 'Tamil', 'Malay', 'Mandarin'],
    }),
  ],
})

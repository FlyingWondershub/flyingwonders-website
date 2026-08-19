import { defineField, defineType } from 'sanity'

export const karnatakaSettingsSchema = defineType({
  name: 'karnatakaSettings',
  title: 'Karnataka Page Settings & WhatsApp',
  type: 'document',
  fields: [
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Contact Number for Bookings',
      type: 'string',
      description: 'Enter phone number with country code without + or spaces (e.g. 6596890101 or 919845012345).',
      initialValue: '6596890101',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroBadge',
      title: 'Hero Badge Text',
      type: 'string',
      initialValue: 'One State • Many Worlds • Official KSTDC Circuits',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Explore Magnificent Karnataka Tour Packages',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
      initialValue: 'From royal palaces in Mysuru and UNESCO heritage ruins in Hampi, to misty coffee plantations in Coorg and the Bengaluru Double-Decker HOHO Bus. Book your verified Karnataka tour directly on WhatsApp.',
    }),
    defineField({
      name: 'hohoTitle',
      title: 'HOHO Section Title',
      type: 'string',
      initialValue: 'Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker',
    }),
    defineField({
      name: 'hohoPriceINR',
      title: 'HOHO Ticket Price (INR)',
      type: 'number',
      initialValue: 180,
    }),
    defineField({
      name: 'hohoTimings',
      title: 'HOHO Operating Hours',
      type: 'string',
      initialValue: '10:30 AM – 8:00 PM',
    }),
    defineField({
      name: 'hohoBoardingHub',
      title: 'HOHO Boarding Point',
      type: 'string',
      initialValue: 'Ravindra Kalakshetra, JC Road, Bengaluru',
    }),
  ],
  preview: {
    select: {
      title: 'heroTitle',
      subtitle: 'whatsappNumber',
    },
  },
})

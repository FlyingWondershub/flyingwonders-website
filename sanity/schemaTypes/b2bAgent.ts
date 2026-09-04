import { defineField, defineType } from 'sanity'

export const b2bAgentSchema = defineType({
  name: 'b2bAgent',
  title: 'B2B Agent Accounts',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company / Agency Name',
      type: 'string',
    }),
    defineField({
      name: 'agentName',
      title: 'Agent Name',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Agency Logo',
      description: 'Upload high-resolution agency logo for white-label PDF proposals and itineraries.',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone / WhatsApp Number',
      type: 'string',
    }),
    defineField({
      name: 'isActive',
      title: 'Account Active?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'otp',
      title: 'OTP (Temporary Verification Code)',
      type: 'string',
    }),
    defineField({
      name: 'otpExpiry',
      title: 'OTP Expiry Time (ISO String)',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'companyName',
      subtitle: 'email',
      media: 'logo',
    },
  },
})

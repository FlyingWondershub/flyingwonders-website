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
      readOnly: true,
    }),
    defineField({
      name: 'otpExpiry',
      title: 'OTP Expiry Time',
      type: 'datetime',
      readOnly: true,
    }),
  ],
})

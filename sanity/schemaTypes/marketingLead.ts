import { defineField, defineType } from 'sanity'

export const marketingLeadSchema = defineType({
  name: 'marketingLead',
  title: 'Marketing Leads',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Contact Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (rule) => rule.lowercase(),
    }),
    defineField({
      name: 'phone',
      title: 'Mobile / Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp Click-to-Chat Link',
      type: 'url',
    }),
    defineField({
      name: 'designation',
      title: 'Job Title / Designation',
      type: 'string',
    }),
    defineField({
      name: 'company',
      title: 'Company / Brand Name',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Official Website',
      type: 'url',
    }),
    defineField({
      name: 'city',
      title: 'City / Location',
      type: 'string',
    }),
    defineField({
      name: 'accreditations',
      title: 'Accreditations & Certifications',
      type: 'string',
      description: 'ISO, EEMA, IAAPA, ILEA, FICCI, Google/Meta Partner, etc.',
    }),
    defineField({
      name: 'taxId',
      title: 'GSTIN / CIN Legal ID',
      type: 'string',
    }),
    defineField({
      name: 'priority',
      title: 'Priority Level',
      type: 'string',
      options: {
        list: [
          { title: '🌟 High Priority (VIP / Decision Maker)', value: 'high' },
          { title: '⚡ Medium Priority', value: 'medium' },
          { title: '🔵 Normal Priority', value: 'normal' },
        ],
      },
      initialValue: 'normal',
    }),
    defineField({
      name: 'leadType',
      title: 'Lead Type',
      type: 'string',
      options: {
        list: [
          { title: 'Direct Individual', value: 'individual' },
          { title: 'Department Inbox', value: 'department' },
          { title: 'Company Account', value: 'company' },
          { title: 'WhatsApp Contact / Group Member', value: 'whatsapp' },
        ],
      },
      initialValue: 'individual',
    }),
    defineField({
      name: 'status',
      title: 'Outreach Pipeline Status',
      type: 'string',
      options: {
        list: [
          { title: '🔵 New / Uncontacted', value: 'new' },
          { title: '🟡 Contacted (Email/WhatsApp Sent)', value: 'contacted' },
          { title: '🟢 In Discussion / Proposal Sent', value: 'in_discussion' },
          { title: '🟣 Closed / Booked Deal', value: 'closed' },
          { title: '🔴 Unqualified / Opt-Out', value: 'opt_out' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'source',
      title: 'Lead Source',
      type: 'string',
      options: {
        list: [
          { title: 'Gmail Promotions & Inbound', value: 'gmail' },
          { title: 'WhatsApp Chat Export', value: 'whatsapp_chat' },
          { title: 'WhatsApp Group Member List', value: 'whatsapp_group' },
          { title: 'Google Contacts Phonebook', value: 'google_contacts' },
          { title: 'Manual Entry', value: 'manual' },
        ],
      },
      initialValue: 'gmail',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram Profile',
      type: 'url',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn Profile / Company',
      type: 'url',
    }),
    defineField({
      name: 'meetingLink',
      title: 'Calendly / Meeting Link',
      type: 'url',
    }),
    defineField({
      name: 'relevantKeywords',
      title: 'Matched Industry Keywords',
      type: 'string',
    }),
    defineField({
      name: 'subjectSample',
      title: 'Latest Subject / Discussion Note',
      type: 'string',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal Team Notes',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'lastContactedAt',
      title: 'Last Contacted Date',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'company',
      email: 'email',
      phone: 'phone',
      priority: 'priority',
      status: 'status',
    },
    prepare({ title, subtitle, email, phone, priority, status }) {
      const priorityEmoji = priority === 'high' ? '🌟 ' : priority === 'medium' ? '⚡ ' : ''
      const contactInfo = phone || email || 'No contact'
      return {
        title: `${priorityEmoji}${title || email || 'Unnamed Lead'}`,
        subtitle: `${subtitle ? subtitle + ' • ' : ''}${contactInfo} [${status || 'new'}]`,
      }
    },
  },
})

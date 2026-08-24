import { defineType, defineField } from 'sanity'

export const b2bLeadInquirySchema = defineType({
  name: 'b2bLeadInquiry',
  title: 'B2B WhatsApp Leads & Inquiries',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Inquiry Summary / Title',
      type: 'string',
      description: 'Short headline of the requirement (e.g., "Ayodhya Ramayana Hotel deal", "Andaman supplier")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'destination',
      title: 'Destination / Region',
      type: 'string',
      description: 'Primary location (e.g. "Ayodhya", "Andaman", "Canton Fair / China", "Mathura Vrindavan", "Singapore")',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: '🏨 Hotels & Stays', value: 'hotels' },
          { title: '🚗 Transport & Cabs', value: 'transport' },
          { title: '🏖️ DMC Ground Packages', value: 'dmc_package' },
          { title: '🎟️ Trade Fairs & Visas', value: 'visa_fairs' },
          { title: '🎡 Sightseeing & Activities', value: 'activities' },
          { title: '✈️ Flight & Air Tickets', value: 'flights' },
          { title: '📦 General / Other', value: 'other' },
        ],
      },
      initialValue: 'other',
    }),
    defineField({
      name: 'rawMessage',
      title: 'Raw Message Content',
      type: 'text',
      rows: 4,
      description: 'The exact unedited text from the WhatsApp post.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requesterName',
      title: 'Agent / Requester Name',
      type: 'string',
      description: 'Name of the travel agent who posted the inquiry (e.g. "Dipika", "GAJESH Girdhar")',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'WhatsApp Contact Number',
      type: 'string',
      description: 'Phone number (with or without country code) for 1-click WhatsApp linking.',
    }),
    defineField({
      name: 'city',
      title: 'Agent City / Location',
      type: 'string',
      description: 'Origin city of the agent if mentioned (e.g., "Muzzafarnagar", "Mumbai", "Delhi")',
    }),
    defineField({
      name: 'groupName',
      title: 'Source WhatsApp Group',
      type: 'string',
      initialValue: 'DMC SUPPORT EACH OTHER',
    }),
    defineField({
      name: 'botNumber',
      title: 'Ingested by Bot Number',
      type: 'string',
    }),
    defineField({
      name: 'urgency',
      title: 'Urgency Level',
      type: 'string',
      options: {
        list: [
          { title: '⚡ Urgent / Today', value: 'urgent' },
          { title: 'Normal', value: 'normal' },
        ],
      },
      initialValue: 'normal',
    }),
    defineField({
      name: 'status',
      title: 'Inquiry Status',
      type: 'string',
      options: {
        list: [
          { title: '🟢 Open / Looking for Supplier', value: 'open' },
          { title: '🟡 In Progress / Connecting', value: 'in_progress' },
          { title: '⚪ Cleared / Closed', value: 'closed' },
        ],
      },
      initialValue: 'open',
    }),
    defineField({
      name: 'closedBy',
      title: 'Cleared By / Closure Note',
      type: 'string',
      description: 'Optional note or name of supplier who handled this request.',
    }),
    defineField({
      name: 'postedAt',
      title: 'Posted Date & Time',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: 'Posted Date (Newest First)',
      name: 'postedAtDesc',
      by: [{ field: 'postedAt', direction: 'desc' }],
    },
  ],
})

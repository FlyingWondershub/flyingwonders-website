import { defineType, defineField } from 'sanity'

export const b2bLeadSubscriberSchema = defineType({
  name: 'b2bLeadSubscriber',
  title: 'B2B Lead Subscribers',
  type: 'document',
  fields: [
    defineField({
      name: 'agentName',
      title: 'Agent Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'companyName',
      title: 'Company / Agency Name',
      type: 'string',
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Contact Number',
      type: 'string',
      description: 'Phone number formatted with country code (e.g. +919876543210)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Required if Email alerts are enabled.',
    }),
    defineField({
      name: 'subscribedDestinations',
      title: 'Subscribed Destinations & Hubs',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of destinations the agent wants leads for (e.g., Singapore, Thailand, Andaman, Ayodhya, or "All Destinations").',
      initialValue: ['All Destinations'],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'subscribedCategories',
      title: 'Subscribed Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '🌍 All Types', value: 'all' },
          { title: '🏨 Hotels & Stays', value: 'hotels' },
          { title: '🚗 Transport & Cabs', value: 'transport' },
          { title: '🏖️ DMC Ground Packages', value: 'dmc_package' },
          { title: '🎟️ Trade Fairs & Visas', value: 'visa_fairs' },
          { title: '🎡 Sightseeing & Passes', value: 'activities' },
          { title: '✈️ Flight Tickets', value: 'flights' },
        ],
      },
      initialValue: ['all'],
    }),
    defineField({
      name: 'customKeywords',
      title: 'Custom Keywords (Optional)',
      type: 'string',
      description: 'Comma-separated custom triggers (e.g. "MICE, 5 Star, Luxury, Coach, Ramayana Hotel").',
    }),
    defineField({
      name: 'alertFrequency',
      title: 'Alert Frequency',
      type: 'string',
      options: {
        list: [
          { title: '⚡ Instant Alerts (Real-time)', value: 'instant' },
          { title: '☀️ Daily Morning Digest (9:00 AM)', value: 'daily_digest' },
        ],
      },
      initialValue: 'instant',
    }),
    defineField({
      name: 'preferredChannel',
      title: 'Preferred Alert Channel',
      type: 'string',
      options: {
        list: [
          { title: '📱 WhatsApp Only', value: 'whatsapp' },
          { title: '📧 Email Only', value: 'email' },
          { title: '📱 + 📧 Both (WhatsApp & Email)', value: 'both' },
        ],
      },
      initialValue: 'whatsapp',
    }),
    defineField({
      name: 'status',
      title: 'Subscription Status',
      type: 'string',
      options: {
        list: [
          { title: '🟢 Active', value: 'active' },
          { title: '🟡 Paused', value: 'paused' },
          { title: '🔴 Unsubscribed', value: 'unsubscribed' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'maxDailyAlerts',
      title: 'Max Alerts Per Day',
      type: 'number',
      description: 'Frequency cap to prevent notification fatigue (default: 6 per day).',
      initialValue: 6,
    }),
    defineField({
      name: 'totalAlertsSent',
      title: 'Total Alerts Dispatched',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'lastAlertSentAt',
      title: 'Last Alert Dispatched At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: 'Subscribed Date (Newest First)',
      name: 'subscribedAtDesc',
      by: [{ field: 'subscribedAt', direction: 'desc' }],
    },
  ],
})

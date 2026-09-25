import { defineField, defineType } from 'sanity'

export const jobSettingsSchema = defineType({
  name: 'jobSettings',
  title: 'Careers & Job Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroBadge',
      title: 'Hero Badge Text',
      type: 'string',
      initialValue: 'WE ARE HIRING TALENT',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Shape the Future of Global Experiential Travel',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
      initialValue: 'Join our passionate team delivering extraordinary journeys across Singapore, Southeast Asia, and worldwide. Explore open roles or join our talent network.',
    }),
    defineField({
      name: 'adminNotificationEmails',
      title: 'Admin Alert Notification Emails',
      type: 'string',
      description: 'Comma-separated email addresses that receive immediate notification when a candidate applies.',
      initialValue: 'contact@flyingwonders.net, info.flyingwonders@gmail.com',
    }),
    defineField({
      name: 'autoReplyEnabled',
      title: 'Enable Candidate Auto-Acknowledgement Email',
      type: 'boolean',
      initialValue: true,
      description: 'Automatically dispatch a branded confirmation email to candidates as soon as their profile is submitted.',
    }),
    defineField({
      name: 'acknowledgementEmailSubject',
      title: 'Auto-Acknowledgement Email Subject',
      type: 'string',
      initialValue: 'Application Received: {{jobTitle}} at Flying Wonders',
      description: 'You can use tokens like {{jobTitle}} and {{candidateName}}.',
    }),
    defineField({
      name: 'acknowledgementCustomMessage',
      title: 'Auto-Acknowledgement Custom Note / Next Steps',
      type: 'text',
      rows: 4,
      initialValue: 'Thank you for taking the time to share your background with us. Our hiring and operations leadership reviews all submissions carefully. If your skills match our current focus, our team will reach out within 48 to 72 hours for an exploratory conversation.',
    }),
    defineField({
      name: 'acceptGeneralApplications',
      title: 'Accept General / Talent Pool Submissions',
      type: 'boolean',
      initialValue: true,
      description: 'Show an open talent pool card for candidates whose profile doesn’t match an existing posting.',
    }),
    defineField({
      name: 'generalApplicationPrompt',
      title: 'Talent Pool Prompt Text',
      type: 'string',
      initialValue: "Don't see your specific role? Join our Talent Network and we'll reach out when matching opportunities arise.",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Careers & Job Openings Settings',
        subtitle: 'Email notifications, auto-replies, hero copy',
      }
    },
  },
})

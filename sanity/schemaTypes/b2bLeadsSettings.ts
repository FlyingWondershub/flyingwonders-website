import { defineType, defineField } from 'sanity'

export const b2bLeadsSettingsSchema = defineType({
  name: 'b2bLeadsSettings',
  title: 'B2B Leads Board Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'isPageHidden',
      title: 'Hide Entire B2B Leads Board?',
      type: 'boolean',
      description: 'Toggle ON to temporarily hide/disable the /b2b-leads page across the website.',
      initialValue: false,
    }),
    defineField({
      name: 'hiddenMessage',
      title: 'Hidden Page Notice Message',
      type: 'string',
      initialValue: 'The B2B Leads Board is currently undergoing routine maintenance. Please check back shortly.',
    }),
    defineField({
      name: 'heroBadge',
      title: 'Hero Top Badge Text',
      type: 'string',
      initialValue: '🔥 Live WhatsApp Agent Requirements',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title Heading',
      type: 'string',
      initialValue: 'Live B2B Inquiries & Supplier Exchange',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle Description',
      type: 'text',
      rows: 2,
      initialValue: 'Real-time verified travel requirements from WhatsApp partner groups. Connect directly with requesting agents, pitch your contracted rates, or mark fulfilled.',
    }),
    defineField({
      name: 'allowedGroups',
      title: 'Whitelisted WhatsApp Group Names',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Group names authorized to sync inquiries. Leave empty to allow any group the bot is a member of.',
      initialValue: ['DMC SUPPORT EACH OTHER'],
    }),
    defineField({
      name: 'authorizedBotNumbers',
      title: 'Authorized WhatsApp Gateway Phone Numbers',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Phone numbers of WhatsApp bot sessions authorized to push inquiries. Leave empty to allow all registered sessions.',
    }),
    defineField({
      name: 'autoArchiveDays',
      title: 'Auto-Archive Older Than (Days)',
      type: 'number',
      description: 'Inquiries older than this number of days will be moved to Archive (Default: 14 days).',
      initialValue: 14,
    }),
    defineField({
      name: 'requirePinToClose',
      title: 'Require Team PIN to Mark as Closed?',
      type: 'boolean',
      description: 'If enabled, users must enter the 4-digit Team PIN to mark an inquiry as Cleared / Closed.',
      initialValue: false,
    }),
    defineField({
      name: 'closurePin',
      title: 'Team 4-Digit Closure PIN',
      type: 'string',
      description: 'PIN code required if Require Team PIN is enabled.',
      initialValue: '1234',
    }),
  ],
})

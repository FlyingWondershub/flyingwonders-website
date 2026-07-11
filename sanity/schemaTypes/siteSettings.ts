export const siteSettingsSchema = {
  name: 'siteSettings',
  title: 'Site Settings & Content',
  type: 'document',
  fields: [
    {
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Where the Future Lives. Experience Singapore.',
    },
    {
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      initialValue: 'Discover a global hub of innovation, Michelin-starred heritage, and luxury living wrapped inside a city of tomorrow.',
    },
    {
      name: 'whatsappNumber',
      title: 'WhatsApp Contact Number',
      type: 'string',
      initialValue: '+919886171251',
    },
    {
      name: 'contactEmail',
      title: 'Contact Email Address',
      type: 'string',
      initialValue: 'info.flyingwonders@gmail.com',
    },
    {
      name: 'officeAddress',
      title: 'Office Address',
      type: 'text',
      initialValue: '#74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560050',
    },
  ],
}

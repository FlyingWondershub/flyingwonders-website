export const adminUser = {
  name: 'adminUser',
  title: 'Admin Users',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule: any) => Rule.required().email(),
      description: 'The email address authorized to access the Admin Dashboard. Note: info.flyingwonders@gmail.com is the Master Root Admin.',
    },
    {
      name: 'name',
      title: 'Name / Designation',
      type: 'string',
      description: 'e.g. Master Admin, Operations Manager, Regional Desk',
    },
    {
      name: 'notes',
      title: 'Access Notes / Department',
      type: 'text',
      rows: 2,
    },
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'name',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      const isMaster = title?.toLowerCase() === 'info.flyingwonders@gmail.com'
      return {
        title: title || 'No Email',
        subtitle: isMaster ? `👑 MASTER ROOT ADMIN — ${subtitle || ''}` : (subtitle || 'Sub-Admin'),
      }
    },
  },
}

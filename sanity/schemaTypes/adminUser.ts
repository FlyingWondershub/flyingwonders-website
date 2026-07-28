export const adminUserSchema = {
  name: 'adminUser',
  title: 'Admin Users',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule: any) => Rule.required().email(),
      description: 'The email address of the user who should have access to the Admin Dashboard.',
    },
    {
      name: 'name',
      title: 'Name (Optional)',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'name',
    },
  },
}

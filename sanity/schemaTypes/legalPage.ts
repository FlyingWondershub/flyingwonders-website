export const legalPageSchema = {
  name: 'legalPage',
  title: 'Legal Pages (Privacy / Terms)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Privacy Policy',
    },
    {
      name: 'slug',
      title: 'Page Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'subtitle',
      title: 'Page Subtitle / Tagline',
      type: 'string',
      initialValue: 'Understand how we handle, secure, and protect your travel data.',
    },
    {
      name: 'sections',
      title: 'Policy / Terms Sections (Tabs)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'legalSection',
          title: 'Legal Section Tab',
          fields: [
            {
              name: 'id',
              title: 'Section ID (Unique, lowercase, e.g. "intro")',
              type: 'string',
            },
            {
              name: 'title',
              title: 'Section Tab Title',
              type: 'string',
            },
            {
              name: 'content',
              title: 'Section Content Text',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}

export const faqItemSchema = {
  name: 'faqItem',
  title: 'FAQ Questions & Answers',
  type: 'document',
  fields: [
    {
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'answer',
      title: 'Answer',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: '🏛️ General & DMC Services', value: 'general' },
          { title: '💳 Payments & Rates', value: 'payments' },
          { title: '🎟️ E-Tickets & Attractions', value: 'tickets' },
          { title: '✈️ Visas & Transfers', value: 'visas' },
          { title: '🔄 Refunds & Policy', value: 'refunds' },
        ],
      },
      initialValue: 'general',
    },
    {
      name: 'sortOrder',
      title: 'Sort Order Index',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'isActive',
      title: 'Is Active / Published',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'question',
      category: 'category',
      isActive: 'isActive',
    },
    prepare(selection: any) {
      const { title, category, isActive } = selection
      const statusIcon = isActive === false ? '🙈' : '❓'
      return {
        title: `${statusIcon} ${title || 'Untitled Question'}`,
        subtitle: `Category: ${category || 'general'}`,
      }
    },
  },
}

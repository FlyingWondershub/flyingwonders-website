import { defineField, defineType } from 'sanity'

export const attractionBundleSchema = defineType({
  name: 'attractionBundle',
  title: 'Attractions Bundle',
  type: 'document',
  icon: () => '🎁',
  description: 'Configure curated bundle presets shown on the Singapore Attractions quotation page.',
  fields: [
    defineField({
      name: 'label',
      title: 'Bundle Name',
      type: 'string',
      description: 'e.g. "Best 3-Day Combo"',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'emoji',
      title: 'Emoji Icon',
      type: 'string',
      description: 'A single emoji to represent this bundle. e.g. 🏆',
      validation: Rule => Rule.required().max(4)
    }),
    defineField({
      name: 'description',
      title: 'Bundle Description',
      type: 'text',
      rows: 2,
      description: 'Short tagline shown on the bundle card. e.g. "The top highlights — Gardens, Night Safari & Universal Studios"',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'isActive',
      title: 'Show on Website',
      type: 'boolean',
      description: 'Toggle to show or hide this bundle from the website without deleting it.',
      initialValue: true
    }),
    defineField({
      name: 'adultQty',
      title: 'Default Adult Quantity',
      type: 'number',
      description: 'How many adult tickets to pre-fill when this bundle is applied.',
      initialValue: 2,
      validation: Rule => Rule.min(0).max(20)
    }),
    defineField({
      name: 'childQty',
      title: 'Default Child Quantity',
      type: 'number',
      description: 'How many child tickets to pre-fill when this bundle is applied.',
      initialValue: 0,
      validation: Rule => Rule.min(0).max(20)
    }),
    defineField({
      name: 'attractionKeywords',
      title: 'Attraction Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords that match attraction names from the pricing sheet. Case-insensitive partial match. e.g. ["universal", "gardens", "night safari"]',
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'sortOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first. e.g. 1, 2, 3',
      initialValue: 10
    })
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'description',
      emoji: 'emoji',
      active: 'isActive'
    },
    prepare({ title, subtitle, emoji, active }) {
      return {
        title: `${emoji || '📦'} ${title}`,
        subtitle: active ? subtitle : `[HIDDEN] ${subtitle}`
      }
    }
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }]
    }
  ]
})

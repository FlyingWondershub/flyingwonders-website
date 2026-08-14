import { defineType, defineField } from 'sanity'

export const travelConsultingPackageSchema = defineType({
  name: 'travelConsultingPackage',
  title: 'Travel Consulting Package Tiers',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Package Tier Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Short Summary / Tagline',
      type: 'string',
    }),
    defineField({
      name: 'priceSgd',
      title: 'Price in SGD ($)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priceInr',
      title: 'Price in INR (₹)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'inclusions',
      title: 'Inclusions & Deliverables (Bullet Points)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'badgeText',
      title: 'Highlight Badge (e.g. Most Popular / Best for B2B)',
      type: 'string',
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience Segment',
      type: 'string',
      options: {
        list: [
          { title: '🧳 Leisure & Family Travelers', value: 'b2c' },
          { title: '🛡️ Registered Travel Agents (B2B)', value: 'b2b' },
          { title: '🌟 All Audiences', value: 'all' },
        ]
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'order',
      title: 'Display Order Position',
      type: 'number',
      initialValue: 1,
    }),
  ],
})

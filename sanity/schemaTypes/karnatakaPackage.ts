import { defineField, defineType } from 'sanity'

export const karnatakaPackageSchema = defineType({
  name: 'karnatakaPackage',
  title: 'Karnataka Tour Packages',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tour Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (Anchor ID)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / Short Summary',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'category',
      title: 'Tour Category',
      type: 'string',
      options: {
        list: [
          { title: 'Heritage & UNESCO', value: 'heritage' },
          { title: 'Hills & Coffee Estates', value: 'hills' },
          { title: 'Wildlife & Jungle Safaris', value: 'wildlife' },
          { title: 'Coastal & Beaches', value: 'coastal' },
          { title: 'Temple & Pilgrimage', value: 'temple' },
          { title: 'Bengaluru City & HOHO', value: 'city' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (e.g. 4 Nights / 5 Days, 1 Day)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'route',
      title: 'Route / Circuit (e.g. Bengaluru → Badami → Hampi → Bengaluru)',
      type: 'string',
    }),
    defineField({
      name: 'priceINR',
      title: 'Starting Price (INR ₹)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'priceSGD',
      title: 'Starting Price (SGD S$)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'badge',
      title: 'Card Badge (e.g. KSTDC Flagship, UNESCO Circuit, Best Seller)',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Guest Rating (e.g. 4.9)',
      type: 'number',
      initialValue: 4.9,
    }),
    defineField({
      name: 'reviewsCount',
      title: 'Review Count (e.g. 1420)',
      type: 'number',
      initialValue: 850,
    }),
    defineField({
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      title: 'Fallback Image URL (CDN / Unsplash)',
      type: 'url',
    }),
    defineField({
      name: 'highlights',
      title: 'Key Highlights',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'inclusions',
      title: 'Package Inclusions',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'kstdcCode',
      title: 'KSTDC Tour Code (Optional)',
      type: 'string',
      description: 'e.g. KSTDC-B01, KSTDC-HOHO',
    }),
    defineField({
      name: 'departureCity',
      title: 'Departure City',
      type: 'string',
      initialValue: 'Bengaluru',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 10,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'duration',
      media: 'image',
    },
  },
})

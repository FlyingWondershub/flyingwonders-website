import { defineField, defineType } from 'sanity'

export const karnatakaPackageSchema = defineType({
  name: 'karnatakaPackage',
  title: 'Karnataka Tour Packages (KSTDC Bengaluru)',
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
      name: 'kstdcUrl',
      title: 'Official KSTDC Package URL',
      type: 'url',
      description: 'Direct link on kstdc.co (e.g. https://kstdc.co/package-tours/... or https://kstdc.co/activities/...)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'kstdcCode',
      title: 'KSTDC Tour Code / Reference',
      type: 'string',
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
          { title: 'Bengaluru City & HOHO', value: 'city' },
          { title: 'Heritage & UNESCO', value: 'heritage' },
          { title: 'Hill Stations & Nature', value: 'hills' },
          { title: 'Coastal & Waterfalls', value: 'coastal' },
          { title: 'Pilgrimage & Temples', value: 'pilgrimage' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (e.g. 1 Day, 4 Nights / 5 Days)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'departureTime',
      title: 'Departure Time (e.g. 08:00 AM, 06:30 AM, 10:00 PM)',
      type: 'string',
    }),
    defineField({
      name: 'returnTime',
      title: 'Return Time (e.g. 06:30 PM, 10:00 PM)',
      type: 'string',
    }),
    defineField({
      name: 'departureLocation',
      title: 'Boarding / Departure Location',
      type: 'string',
      initialValue: 'KSTDC Booking Counter, BMTC Bus Stand, Yeshwanthpura, Bengaluru',
    }),
    defineField({
      name: 'operatingDays',
      title: 'Operating Frequency (e.g. Daily, Every Thursday, Oct to Jan)',
      type: 'string',
      initialValue: 'Daily',
    }),
    defineField({
      name: 'placesCovered',
      title: 'Places Covered (Sightseeing List)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'priceINR',
      title: 'Starting Tariff (INR ₹)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'priceSGD',
      title: 'Starting Tariff (SGD S$)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'badge',
      title: 'Badge (e.g. KSTDC Official, Daily Departure, UNESCO Circuit)',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Rating (e.g. 4.9)',
      type: 'number',
      initialValue: 4.8,
    }),
    defineField({
      name: 'reviewsCount',
      title: 'Reviews Count',
      type: 'number',
      initialValue: 500,
    }),
    defineField({
      name: 'image',
      title: 'Cover Image (Sanity Upload)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      title: 'Image URL (CDN / Preview)',
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
      title: 'Inclusions (from KSTDC Details Tab)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'exclusions',
      title: 'Exclusions (from KSTDC Details Tab)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'importantNotes',
      title: 'Important Passenger Notes & Rules',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'itinerary',
      title: 'Detailed Itinerary (from KSTDC Itinerary Tab)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'timeOrDay', title: 'Day / Time (e.g. Day 1, 08:45 AM)', type: 'string' },
            { name: 'title', title: 'Stop / Activity Title', type: 'string' },
            { name: 'description', title: 'Detailed Description', type: 'text', rows: 2 },
            { name: 'places', title: 'Key Spots', type: 'array', of: [{ type: 'string' }] },
          ],
        },
      ],
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

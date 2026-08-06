import { defineField, defineType } from 'sanity'

export const readyPackageTemplateSchema = defineType({
  name: 'readyPackageTemplate',
  title: 'Ready-Made Package Templates (B2B)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Template Package Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      placeholder: 'e.g. 4N/5D Singapore Classic & Sentosa Highlights',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'nightsCount',
      title: 'Number of Nights',
      type: 'number',
      initialValue: 4,
      validation: (Rule) => Rule.required().min(1).max(30),
    }),
    defineField({
      name: 'category',
      title: 'Package Category / Theme',
      type: 'string',
      options: {
        list: [
          { title: 'Popular / Best Value', value: 'popular' },
          { title: 'Family Special', value: 'family' },
          { title: 'Luxury & Private', value: 'luxury' },
          { title: 'Budget Saver', value: 'budget' },
          { title: 'MICE / Corporate', value: 'mice' },
        ],
      },
      initialValue: 'popular',
    }),
    defineField({
      name: 'badgeText',
      title: 'Badge Ribbon Text (Optional)',
      type: 'string',
      placeholder: 'e.g. Bestseller, 15% Off MICE',
    }),
    defineField({
      name: 'coverImage',
      title: 'Package Cover Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'summary',
      title: 'Brief Highlights Summary',
      type: 'text',
      placeholder: 'Includes Gardens by the Bay, Universal Studios, Night Safari, Airport Private Transfers...',
    }),
    defineField({
      name: 'startingPriceSGD',
      title: 'Estimated Starting Net Cost / Pax (SGD)',
      type: 'number',
    }),
    defineField({
      name: 'hideTemplate',
      title: '🙈 Hide This Specific Template from B2B Portal',
      type: 'boolean',
      initialValue: false,
    }),

    // DAYWISE ITINERARY TEMPLATE STRUCTURE
    defineField({
      name: 'itinerary',
      title: 'Daywise Pre-Configured Itinerary',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Day Plan',
          fields: [
            defineField({
              name: 'dayTitle',
              title: 'Day Subtitle / Focus',
              type: 'string',
              placeholder: 'e.g. Arrival & Changi Jewel Tour',
            }),
            defineField({
              name: 'isBreakTrip',
              title: 'Is Custom Day / Break Trip',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'transfers',
              title: 'Transfers',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'vehicleIndex', title: 'Vehicle Type Index (0=Sedan, 1=7-Seater, 2=13-Seater Minibus, 3=Coach)', type: 'number', initialValue: 0 }),
                    defineField({ name: 'time', title: 'Pickup Time', type: 'string', initialValue: '09:00' }),
                    defineField({ name: 'description', title: 'Transfer Description', type: 'string', placeholder: 'e.g. Changi Airport to Hotel Private Transfer' }),
                    defineField({ name: 'qty', title: 'Vehicle Quantity', type: 'number', initialValue: 1 }),
                  ],
                },
              ],
            }),
            defineField({
              name: 'attractions',
              title: 'Attraction Tickets',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'attractionIndex', title: 'Attraction Index (Corresponds to master list)', type: 'number', initialValue: 0 }),
                    defineField({ name: 'attractionName', title: 'Attraction Name (Fallback match)', type: 'string' }),
                    defineField({ name: 'time', title: 'Time Slot', type: 'string', initialValue: '10:00' }),
                    defineField({ name: 'adultQty', title: 'Adult Quantity', type: 'number', initialValue: 2 }),
                    defineField({ name: 'childQty', title: 'Child Quantity', type: 'number', initialValue: 0 }),
                    defineField({ name: 'pickupNotes', title: 'Special Notes / Options', type: 'string' }),
                  ],
                },
              ],
            }),
            defineField({
              name: 'breakfast',
              title: 'Breakfast Included',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'lunch',
              title: 'Lunch Included',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'dinner',
              title: 'Dinner Included',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'guides',
              title: 'Guide Escort Assigned',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'guideType', title: 'Guide Type Index (0=Half Day 4h, 1=Full Day 8h)', type: 'number', initialValue: 0 }),
                    defineField({ name: 'notes', title: 'Languages / Special Instructions', type: 'string', initialValue: 'English Speaking Licensed Guide' }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
  ],
})

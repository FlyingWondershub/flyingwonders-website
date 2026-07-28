import { defineField, defineType } from 'sanity'

export const reviewSchema = defineType({
  name: 'review',
  title: 'Customer & B2B Review',
  type: 'document',
  fields: [
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'agent_company',
      title: 'Agent Company / Agency Name',
      type: 'string',
      description: 'Leave blank for regular retail clients',
    }),
    defineField({
      name: 'origin_city',
      title: 'Origin City (e.g. Mumbai, Bangalore)',
      type: 'string',
    }),
    defineField({
      name: 'segment_type',
      title: 'Travel Segment',
      type: 'string',
      options: {
        list: [
          { title: 'Couple Packages', value: 'Couple Packages' },
          { title: 'Honeymoon Packages', value: 'Honeymoon Packages' },
          { title: 'Family Packages', value: 'Family Packages' },
          { title: 'Small Groups', value: 'Small Groups' },
          { title: 'Large Groups', value: 'Large Groups' },
        ],
      },
      initialValue: 'Couple Packages',
    }),
    defineField({
      name: 'passenger_count',
      title: 'Passenger Count',
      type: 'number',
      initialValue: 2,
    }),
    defineField({
      name: 'content',
      title: 'Review Content / Testimonial',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
      initialValue: 5,
    }),
    defineField({
      name: 'operational_tags',
      title: 'Operational Tags (Keywords)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Private Yacht", "Jain Meals", "Hotel Upgrade"',
    }),
    defineField({
      name: 'isApproved',
      title: 'Approved for Display',
      type: 'boolean',
      initialValue: false,
      description: 'Approve this review to display on the live website',
    }),
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'agent_company',
      rating: 'rating',
    },
    prepare({ title, subtitle, rating }) {
      return {
        title: title || 'Anonymous',
        subtitle: `${subtitle || 'Retail Guest'} - ${'★'.repeat(rating || 5)}`,
      }
    },
  },
})

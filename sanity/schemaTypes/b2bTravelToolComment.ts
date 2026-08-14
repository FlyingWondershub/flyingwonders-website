import { defineType, defineField } from 'sanity'

export const b2bTravelToolCommentSchema = defineType({
  name: 'b2bTravelToolComment',
  title: 'Travel Tools Comments & Tips',
  type: 'document',
  fields: [
    defineField({
      name: 'toolId',
      title: 'Tool ID / Key',
      type: 'string',
      description: 'The tool key e.g. visa-checker, currency-converter, sgac-guide, packing-checklist',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorRole',
      title: 'Author Role',
      type: 'string',
      options: {
        list: [
          { title: '🧳 Traveler / Tourist', value: 'Traveler' },
          { title: '🛡️ Registered Travel Agent', value: 'Travel Agent' },
          { title: '📍 Flying Wonders Specialist', value: 'Destination Specialist' },
        ],
      },
      initialValue: 'Traveler',
    }),
    defineField({
      name: 'commentText',
      title: 'Comment / Travel Tip',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'likesCount',
      title: 'Upvotes / Likes Count',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'isApproved',
      title: 'Approved & Featured?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Pin as Top Tip?',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})

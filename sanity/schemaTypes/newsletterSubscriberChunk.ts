import { defineField, defineType } from 'sanity'

export const newsletterSubscriberChunkSchema = defineType({
  name: 'newsletterSubscriberChunk',
  title: 'Newsletter Subscriber Chunk',
  type: 'document',
  fields: [
    defineField({
      name: 'chunkIndex',
      title: 'Chunk Index',
      type: 'number',
    }),
    defineField({
      name: 'count',
      title: 'Subscribers Count',
      type: 'number',
    }),
    defineField({
      name: 'subscribers',
      title: 'Subscribers Array',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'ID', type: 'string' },
            { name: 'email', title: 'Email', type: 'string' },
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'company', title: 'Company', type: 'string' },
            { name: 'audienceType', title: 'Audience Type', type: 'string' },
            { name: 'source', title: 'Source', type: 'string' },
            { name: 'isActive', title: 'Active', type: 'boolean' },
            { name: 'subscribedAt', title: 'Subscribed At', type: 'string' },
            { name: 'createdAt', title: 'Created At', type: 'string' },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      chunkIndex: 'chunkIndex',
      count: 'count',
    },
    prepare({ chunkIndex, count }: any) {
      return {
        title: `Subscriber Chunk #${chunkIndex ?? 0}`,
        subtitle: `${count ?? 0} subscribers`,
      }
    },
  },
})

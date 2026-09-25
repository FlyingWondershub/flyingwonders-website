import { defineField, defineType } from 'sanity'

export const marketingLeadChunkSchema = defineType({
  name: 'marketingLeadChunk',
  title: 'Marketing Lead Chunk',
  type: 'document',
  fields: [
    defineField({
      name: 'chunkIndex',
      title: 'Chunk Index',
      type: 'number',
    }),
    defineField({
      name: 'count',
      title: 'Leads Count',
      type: 'number',
    }),
    defineField({
      name: 'leads',
      title: 'Leads Array',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'ID', type: 'string' },
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'email', title: 'Email', type: 'string' },
            { name: 'phone', title: 'Phone', type: 'string' },
            { name: 'whatsapp', title: 'WhatsApp', type: 'string' },
            { name: 'company', title: 'Company', type: 'string' },
            { name: 'city', title: 'City', type: 'string' },
            { name: 'designation', title: 'Designation', type: 'string' },
            { name: 'accreditations', title: 'Accreditations', type: 'string' },
            { name: 'priority', title: 'Priority', type: 'string' },
            { name: 'leadType', title: 'Lead Type', type: 'string' },
            { name: 'status', title: 'Status', type: 'string' },
            { name: 'source', title: 'Source', type: 'string' },
            { name: 'relevantKeywords', title: 'Relevant Keywords', type: 'string' },
            { name: 'notes', title: 'Notes', type: 'string' },
            { name: '_createdAt', title: 'Created At', type: 'string' },
            { name: '_updatedAt', title: 'Updated At', type: 'string' },
          ],
        },
      ],
    }),
  ],
})

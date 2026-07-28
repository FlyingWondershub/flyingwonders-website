import { defineField, defineType } from 'sanity'

export const promotionSchema = defineType({
  name: 'promotion',
  title: 'Attraction Promotions',
  type: 'document',
  fields: [
    defineField({
      name: 'attractionName',
      title: 'Name of Attraction',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Promotion Price (S$)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'validTill',
      title: 'Valid Till (Expiry Date)',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Promotion Offer Description',
      type: 'text',
    }),
  ],
})

import { defineField, defineType } from 'sanity'

export const competitorPriceSchema = defineType({
  name: 'competitorPrice',
  title: 'Competitor Attraction Pricing',
  type: 'document',
  fields: [
    defineField({
      name: 'attractionName',
      title: 'Attraction Name',
      type: 'string',
      initialValue: 'Universal Studios - Fixed Date',
    }),
    defineField({
      name: 'platform',
      title: 'Platform / OTA Name',
      type: 'string',
      description: 'klook, kkday, trip, pelago, traveloka, or tiket',
    }),
    defineField({
      name: 'adultPrice',
      title: 'Adult Price (SGD)',
      type: 'number',
    }),
    defineField({
      name: 'childPrice',
      title: 'Child Price (SGD)',
      type: 'number',
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking Link URL',
      type: 'url',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated Timestamp',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'attractionName',
      subtitle: 'platform',
      price: 'adultPrice',
    },
    prepare({ title, subtitle, price }) {
      return {
        title: `${title || 'Attraction'} - ${subtitle ? subtitle.toUpperCase() : 'Unknown'}`,
        subtitle: price ? `Adult: S$ ${price}` : 'No price set',
      }
    },
  },
})

import { defineField, defineType } from 'sanity'

export const proposalSchema = defineType({
  name: 'proposal',
  title: 'Custom Package Proposals',
  type: 'document',
  fields: [
    defineField({
      name: 'proposalNumber',
      title: 'Proposal Number (FW-YYYY-XXXX)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'agent',
      title: 'B2B Agent Account',
      type: 'reference',
      to: [{ type: 'b2bAgent' }],
    }),
    defineField({
      name: 'guestName',
      title: 'Guest Name',
      type: 'string',
    }),
    defineField({
      name: 'adults',
      title: 'Number of Adults',
      type: 'number',
    }),
    defineField({
      name: 'kids',
      title: 'Number of Children',
      type: 'number',
    }),
    defineField({
      name: 'nights',
      title: 'Number of Nights',
      type: 'number',
    }),
    defineField({
      name: 'arrivalDate',
      title: 'Singapore Arrival Date',
      type: 'string',
    }),
    defineField({
      name: 'hotelRequired',
      title: 'Accommodation Required',
      type: 'boolean',
    }),
    defineField({
      name: 'hotelName',
      title: 'Hotel Name',
      type: 'string',
    }),
    defineField({
      name: 'roomType',
      title: 'Room Type',
      type: 'string',
    }),
    defineField({
      name: 'roomCount',
      title: 'Room Quantity',
      type: 'number',
    }),
    defineField({
      name: 'supplementType',
      title: 'Supplement Room Type',
      type: 'string',
    }),
    defineField({
      name: 'supplementCount',
      title: 'Supplement Quantity',
      type: 'number',
    }),
    defineField({
      name: 'customHotelEnabled',
      title: 'Custom Hotel Enabled',
      type: 'boolean',
    }),
    defineField({
      name: 'customHotelPrice',
      title: 'Custom Room Price per Night (S$)',
      type: 'number',
    }),
    defineField({
      name: 'customHotelSuppCost',
      title: 'Custom Supplement Price per Night (S$)',
      type: 'number',
    }),
    defineField({
      name: 'costBreakdown',
      title: 'Pricing Breakdown Details',
      type: 'object',
      fields: [
        { name: 'roomCostTotal', type: 'number', title: 'Rooms Net Total (S$)' },
        { name: 'suppCostTotal', type: 'number', title: 'Supplements Net Total (S$)' },
        { name: 'transportTotal', type: 'number', title: 'Transport Net Total (S$)' },
        { name: 'attractionTotal', type: 'number', title: 'Attractions Net Total (S$)' },
        { name: 'mealTotal', type: 'number', title: 'Meals Net Total (S$)' },
        { name: 'guideTotal', type: 'number', title: 'Guides Net Total (S$)' },
        { name: 'netCost', type: 'number', title: 'Subtotal Net (S$)' },
        { name: 'totalClientPrice', type: 'number', title: 'Total Client Price (S$)' },
        { name: 'totalClientPriceINR', type: 'number', title: 'Total Client Price approx (₹)' },
        { name: 'adultQuote', type: 'number', title: 'Price per Adult (S$)' },
        { name: 'childQuote', type: 'number', title: 'Price per Child (S$)' },
      ]
    }),
    defineField({
      name: 'itinerary',
      title: 'Itinerary Custom Structure (JSON)',
      type: 'text',
    }),
  ],
})

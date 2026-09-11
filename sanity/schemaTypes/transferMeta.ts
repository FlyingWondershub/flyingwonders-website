import { defineField, defineType } from 'sanity'
import { LiveTransferNameInput } from '../components/LiveTransferNameInput'

export const transferMetaSchema = defineType({
  name: 'transferMeta',
  title: 'Transfer & Fleet Details',
  type: 'document',
  icon: () => '🚗',
  description: 'Upload vehicle photos and configure descriptions for transfers and fleet options.',
  fields: [
    defineField({
      name: 'name',
      title: 'Transfer Option (Vehicle - Transfer Type - Rate Type - Service Name)',
      type: 'string',
      description: 'Select dynamically from the live Google Sheet Transfers catalog or type manually.',
      components: {
        input: LiveTransferNameInput,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'photo',
      title: 'Vehicle / Transfer Photo',
      type: 'image',
      description: 'High-resolution photo of the vehicle or transfer service (recommended: 800×600px, landscape).',
      options: { hotspot: true }
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      description: 'Additional interior, exterior, or luggage boot photos.',
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: '1-2 sentences used in PDF timeline rows and itinerary cards. e.g. "Toyota HiAce 13-seater high roof air-conditioned minibus with dedicated chauffeur."'
    }),
    defineField({
      name: 'longDescription',
      title: 'Full Description & Inclusions',
      type: 'text',
      rows: 4,
      description: 'Detailed overview of chauffeur service, meet & greet protocols, and comfort features.'
    }),
    defineField({
      name: 'passengerCapacity',
      title: 'Max Passenger Capacity',
      type: 'string',
      description: 'e.g. "Up to 9 Passengers" or "Up to 13 Passengers"'
    }),
    defineField({
      name: 'luggageCapacity',
      title: 'Luggage Capacity',
      type: 'string',
      description: 'e.g. "9 Large Suitcases (28\") + 4 Handbags"'
    }),
    defineField({
      name: 'vehicleCategory',
      title: 'Vehicle Fleet Category',
      type: 'string',
      options: {
        list: [
          { title: 'Private Sedan (4-Seater)', value: 'Sedan' },
          { title: 'Luxury MPV (7-Seater / Alphard)', value: 'MPV' },
          { title: 'High-Roof Minibus (13-Seater)', value: 'Minibus' },
          { title: 'Medium Coach (20-24 Seater)', value: 'Medium Coach' },
          { title: 'Full Coach (40-45 Seater)', value: 'Full Coach' },
          { title: 'Super Coach (49-55 Seater)', value: 'Super Coach' },
          { title: 'Shared Coach (SIC)', value: 'SIC' },
          { title: 'Other Service', value: 'Other' },
        ]
      }
    }),
    defineField({
      name: 'features',
      title: 'Key Features & Amenities',
      type: 'array',
      description: 'e.g. "Air Conditioned", "Changi Airport Meet & Greet", "Luggage Assistance", "Bottled Water"',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'passengerCapacity',
      media: 'photo',
      category: 'vehicleCategory'
    },
    prepare({ title, subtitle, media, category }) {
      return {
        title: title || 'Untitled Transfer Option',
        subtitle: [category, subtitle].filter(Boolean).join(' • ') || 'No specs added',
        media
      }
    }
  }
})

import { defineField, defineType } from 'sanity'
import { LiveHotelNameInput } from '../components/LiveHotelNameInput'

export const hotelMetaSchema = defineType({
  name: 'hotelMeta',
  title: 'Hotel Property Details',
  type: 'document',
  icon: () => '🏨',
  description: 'Upload property facade photos, room galleries, and amenities for hotel options.',
  fields: [
    defineField({
      name: 'name',
      title: 'Hotel Name',
      type: 'string',
      description: 'Select dynamically from the live Google Sheet Hotel catalog or type manually.',
      components: {
        input: LiveHotelNameInput,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'starRating',
      title: 'Star Rating',
      type: 'string',
      options: {
        list: [
          { title: '3★ Comfortable / Value', value: '3★' },
          { title: '4★ Premium / Deluxe', value: '4★' },
          { title: '5★ Luxury / Iconic', value: '5★' },
          { title: 'Boutique / Heritage', value: 'Boutique' },
        ]
      }
    }),
    defineField({
      name: 'photo',
      title: 'Hotel Facade / Main Photo',
      type: 'image',
      description: 'Primary high-resolution photo of the hotel exterior or lobby (recommended: 800×600px, landscape).',
      options: { hotspot: true }
    }),
    defineField({
      name: 'gallery',
      title: 'Property & Room Gallery',
      type: 'array',
      description: 'Additional room, swimming pool, restaurant, and lobby photos.',
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: '1-2 sentences used in PDF accommodation card. e.g. "Centrally located modern hotel near Lavender MRT, offering rooftop swimming pool and easy access to vibrant city attractions."'
    }),
    defineField({
      name: 'longDescription',
      title: 'Full Property Narrative',
      type: 'text',
      rows: 4,
      description: 'Detailed property overview highlighting location, hospitality, dining options, and guest comforts.'
    }),
    defineField({
      name: 'addressLocation',
      title: 'Address & Neighborhood',
      type: 'string',
      description: 'e.g. "500 Jalan Sultan, Lavender / Kampong Glam, Singapore"'
    }),
    defineField({
      name: 'amenities',
      title: 'Hotel Amenities & Highlights',
      type: 'array',
      description: 'e.g. "Swimming Pool", "Free High-Speed Wi-Fi", "Daily Indian Breakfast Available", "Near MRT Station", "Fitness Center"',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'checkInTime',
      title: 'Check-In Policy Time',
      type: 'string',
      description: 'e.g. "15:00 hrs"'
    }),
    defineField({
      name: 'checkOutTime',
      title: 'Check-Out Policy Time',
      type: 'string',
      description: 'e.g. "11:00 hrs / 12:00 hrs"'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'addressLocation',
      starRating: 'starRating',
      media: 'photo'
    },
    prepare({ title, subtitle, starRating, media }) {
      return {
        title: `${starRating ? `${starRating} ` : ''}${title || 'Untitled Hotel'}`,
        subtitle: subtitle || 'Accommodation Option',
        media
      }
    }
  }
})

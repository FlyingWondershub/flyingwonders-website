import { defineField, defineType } from 'sanity'
import { LiveMealNameInput } from '../components/LiveMealNameInput'

export const mealMetaSchema = defineType({
  name: 'mealMeta',
  title: 'Meals & Dining Details',
  type: 'document',
  icon: () => '🍽️',
  description: 'Upload food photos, restaurant details, and dietary highlights for meals.',
  fields: [
    defineField({
      name: 'name',
      title: 'Meal Option / Restaurant Name (from Google Sheet)',
      type: 'string',
      description: 'Select dynamically from the live Google Sheet Meals Plan catalog or type manually.',
      components: {
        input: LiveMealNameInput,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'mealType',
      title: 'Meal Category',
      type: 'string',
      options: {
        list: [
          { title: 'Breakfast', value: 'Breakfast' },
          { title: 'Lunch Buffet', value: 'Lunch' },
          { title: 'Dinner Buffet', value: 'Dinner' },
          { title: 'Special Dining / Experiential', value: 'Special' },
        ]
      }
    }),
    defineField({
      name: 'photo',
      title: 'Dining / Food Spread Photo',
      type: 'image',
      description: 'High-resolution photo of the restaurant spread or cuisine (recommended: 800×600px, landscape).',
      options: { hotspot: true }
    }),
    defineField({
      name: 'gallery',
      title: 'Food & Ambience Gallery',
      type: 'array',
      description: 'Additional photos of dining area and specialties.',
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: '1-2 sentences used in PDF itinerary cards. e.g. "Delicious authentic Indian buffet featuring freshly baked naans, paneer curries, dal tadka, basmati rice, and traditional desserts."'
    }),
    defineField({
      name: 'longDescription',
      title: 'Full Dining Narrative & Menu Highlights',
      type: 'text',
      rows: 4,
      description: 'Full culinary overview including dining atmosphere, dietary flexibility, and menu highlights.'
    }),
    defineField({
      name: 'cuisine',
      title: 'Cuisine Style',
      type: 'string',
      description: 'e.g. "Authentic North & South Indian Buffet", "International Buffet", "Continental / Pan-Asian"'
    }),
    defineField({
      name: 'dietaryBadges',
      title: 'Dietary & Special Options',
      type: 'array',
      description: 'e.g. "100% Pure Vegetarian Available", "Jain Meals Available", "Halal Certified", "Kids Friendly"',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'cuisine',
      media: 'photo',
      mealType: 'mealType'
    },
    prepare({ title, subtitle, media, mealType }) {
      return {
        title: title || 'Untitled Meal Option',
        subtitle: [mealType, subtitle].filter(Boolean).join(' • ') || 'Dining Service',
        media
      }
    }
  }
})

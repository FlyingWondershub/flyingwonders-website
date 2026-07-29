import { defineField, defineType } from 'sanity'
import { ATTRACTION_NAMES } from './attractionsList'

export const attractionMetaSchema = defineType({
  name: 'attractionMeta',
  title: 'Attraction Details',
  type: 'document',
  icon: () => '🎡',
  description: 'Upload photos and configure details for individual attractions shown on the Singapore Attractions page.',
  groups: [
    { name: 'identity',    title: '📌 Identity & Photo' },
    { name: 'content',     title: '📝 Content & Descriptions' },
    { name: 'logistics',   title: '🕐 Logistics & Info' },
    { name: 'meta',        title: '🏷 Display & Badges' },
  ],
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Attraction Name',
      group: 'identity',
      type: 'string',
      description: 'Select the attraction name to match from the Google Sheet pricing list.',
      options: {
        list: ATTRACTION_NAMES.map(name => ({ title: name, value: name })),
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'matchKeyword',
      title: 'Match Keyword',
      group: 'identity',
      type: 'string',
      description: 'A single lowercase keyword used to match this record against attraction names. e.g. "universal", "night safari", "gardens". Keep it short and unique.',
      validation: Rule => Rule.required().lowercase()
    }),
    defineField({
      name: 'photo',
      title: 'Attraction Photo',
      group: 'identity',
      type: 'image',
      description: 'Upload a high-quality photo (recommended: 800×600px, landscape). This replaces the default placeholder image on the card.',
      options: { hotspot: true }
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      group: 'identity',
      type: 'array',
      description: 'Additional photos shown in the attraction detail panel.',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),

    // ── Content ───────────────────────────────────────────────────────────────
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      group: 'content',
      type: 'text',
      rows: 3,
      description: 'A 1-2 sentence teaser shown on the card and at the top of the detail panel.'
    }),
    defineField({
      name: 'longDescription',
      title: 'Full Description',
      group: 'content',
      type: 'text',
      rows: 6,
      description: 'A detailed 3-5 sentence description used in PDF itineraries and the attraction detail drawer.'
    }),
    defineField({
      name: 'highlights',
      title: 'Key Highlights',
      group: 'content',
      type: 'array',
      description: 'Bullet-point highlights shown in the detail panel and PDF. e.g. "Hollywood-themed zones", "Live shows & entertainment"',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'tips',
      title: 'Traveller Tips',
      group: 'content',
      type: 'text',
      rows: 3,
      description: 'Insider tips for visitors. e.g. "Arrive 30 mins early to avoid queues at peak hours."'
    }),

    // ── Logistics ─────────────────────────────────────────────────────────────
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "10:00 AM – 8:00 PM (Extended hours on weekends)"'
    }),
    defineField({
      name: 'duration',
      title: 'Recommended Duration',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "3 – 5 hours", "Half Day", "Full Day"'
    }),
    defineField({
      name: 'location',
      title: 'Location / Area',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "Sentosa Island", "Gardens by the Bay, Marina Bay", "Mandai Wildlife Reserve"'
    }),
    defineField({
      name: 'ageRecommendation',
      title: 'Age Recommendation',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "Suitable for all ages", "Best for 3+", "Height restriction: 107cm for certain rides"'
    }),
    defineField({
      name: 'officialWebsite',
      title: 'Official Website URL',
      group: 'logistics',
      type: 'url',
      description: 'The official attraction website link.'
    }),
    defineField({
      name: 'rating',
      title: 'Customer Rating',
      group: 'logistics',
      type: 'number',
      description: 'Rating out of 5. e.g. 4.8',
      validation: Rule => Rule.min(1).max(5).precision(1)
    }),

    // ── Display & Badges ──────────────────────────────────────────────────────
    defineField({
      name: 'category',
      title: 'Category',
      group: 'meta',
      type: 'string',
      description: 'Which filter tab this attraction appears under.',
      options: {
        list: [
          { title: 'Theme Parks', value: 'Theme Parks' },
          { title: 'Nature', value: 'Nature' },
          { title: 'Culture', value: 'Culture' },
          { title: 'Adventure', value: 'Adventure' },
          { title: 'Family', value: 'Family' },
          { title: 'Other', value: 'Other' },
        ]
      }
    }),
    defineField({
      name: 'isPopular',
      title: 'Mark as Most Popular',
      group: 'meta',
      type: 'boolean',
      description: 'Show the "⭐ Most Popular" badge on this attraction card.',
      initialValue: false
    }),
    defineField({
      name: 'isTrending',
      title: 'Mark as Trending',
      group: 'meta',
      type: 'boolean',
      description: 'Show the "🔥 Trending" badge on this attraction card.',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'matchKeyword',
      media: 'photo',
      popular: 'isPopular',
      trending: 'isTrending'
    },
    prepare({ title, subtitle, media, popular, trending }) {
      const badges = [popular && '⭐', trending && '🔥'].filter(Boolean).join(' ')
      return {
        title: `${badges ? badges + ' ' : ''}${title}`,
        subtitle: `keyword: "${subtitle}"`,
        media
      }
    }
  }
})

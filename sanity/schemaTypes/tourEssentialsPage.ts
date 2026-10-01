import { defineType, defineField } from 'sanity'

export const tourEssentialsPageSchema = defineType({
  name: 'tourEssentialsPage',
  title: 'Tour Essentials Showcase (Landing Page)',
  type: 'document',
  icon: () => '⭐',
  description: 'Manage curated showcases of selected cards (Collections, Hotels, Attractions, Dining, Malls, Tours) for /tour-essentials and newsletters.',
  groups: [
    { name: 'identity',    title: '📌 Header & Identity' },
    { name: 'curated',     title: '⭐ Selected Showcase Cards' },
    { name: 'marketing',   title: '📣 Newsletter & WhatsApp' },
  ],
  fields: [
    // ── IDENTITY ─────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Showcase Title',
      group: 'identity',
      type: 'string',
      initialValue: 'Singapore & Malaysia Tour Essentials Guide',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      group: 'identity',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'URL: /tour-essentials (or /tour-essentials/[slug] for campaign-specific editions)',
      initialValue: { current: 'tour-essentials' },
    }),
    defineField({
      name: 'isDefaultShowcase',
      title: 'Set as Default Active Showcase?',
      group: 'identity',
      type: 'boolean',
      description: 'When enabled, this showcase will be displayed as the primary view on /tour-essentials and /services-catalog.',
      initialValue: true,
    }),
    defineField({
      name: 'heroBadge',
      title: 'Hero Badge Ribbon',
      group: 'identity',
      type: 'string',
      placeholder: 'e.g. CURATED SHOWCASE · 2026 EDITION',
      initialValue: 'CURATED SHOWCASE · 2026 EDITION',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Main Title',
      group: 'identity',
      type: 'string',
      initialValue: 'Destination Tour Essentials',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle / Description',
      group: 'identity',
      type: 'text',
      rows: 3,
      initialValue: 'A hand-picked editor shortlist of signature travel collections, premier partner hotels, iconic attractions, authentic dining, and retail hubs for Singapore & Malaysia.',
    }),

    // ── SELECTED SHOWCASE CARDS ──────────────────────────────────────────────
    defineField({
      name: 'featuredCollections',
      title: '✨ Selected Curated Collections (Pick 2–4)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'curatedCollection' }],
        },
      ],
      description: 'The top itinerary blueprints (e.g. Family Wonder, Cross-Border Explorer, Corporate MICE).',
    }),
    defineField({
      name: 'featuredHotels',
      title: '🏨 Selected Partner Hotels (Pick 3–6)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'hotelMeta' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'Recommended stays vetted for prime MRT access and hospitality.',
    }),
    defineField({
      name: 'featuredAttractions',
      title: '🎡 Selected Must-Do Attractions (Pick 4–8)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'attractionMeta' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'Signature must-see sights and experiences for the destination.',
    }),
    defineField({
      name: 'featuredDining',
      title: '🍽️ Selected Restaurants & Dining (Pick 3–6)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'restaurantMeta' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'Hand-picked dining spots, authentic Indian cuisine, halal buffets, and hawker legends.',
    }),
    defineField({
      name: 'featuredShoppingMalls',
      title: '🛍️ Selected Shopping Malls & Outlets (Pick 2–4)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'shoppingMall' }],
        },
      ],
      description: 'Top shopping centers and designer outlet complexes with 9% GST tax refund.',
    }),
    defineField({
      name: 'featuredTours',
      title: '🚍 Selected Guided Circuits (Pick 1–3)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'readyPackageTemplate' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'Signature tour packages providing on-ground coach transfers and guided sightseeing.',
    }),

    // ── MARKETING & NEWSLETTER ───────────────────────────────────────────────
    defineField({
      name: 'newsletterSnippet',
      title: '📧 Newsletter Blurb (Copy-Paste Ready)',
      group: 'marketing',
      type: 'text',
      rows: 4,
      description: 'Pre-formatted promotional copy ready to insert into newsletter campaigns.',
    }),
    defineField({
      name: 'customWhatsAppMessage',
      title: '💬 Custom WhatsApp Inquiry Message Template',
      group: 'marketing',
      type: 'string',
      initialValue: 'Hi Flying Wonders! I am browsing the Tour Essentials Showcase and would like to inquire about customized pricing and reservations.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'heroSubtitle',
      isDefault: 'isDefaultShowcase',
    },
    prepare({ title, subtitle, isDefault }) {
      return {
        title: `${isDefault ? '⭐ [DEFAULT] ' : ''}${title || 'Untitled Showcase'}`,
        subtitle: subtitle || 'Curated essentials landing page',
      }
    },
  },
})

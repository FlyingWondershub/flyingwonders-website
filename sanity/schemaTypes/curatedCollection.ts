import { defineType, defineField } from 'sanity'

export const curatedCollectionSchema = defineType({
  name: 'curatedCollection',
  title: 'Curated Collections (Itinerary Essentials)',
  type: 'document',
  icon: () => '✨',
  description: 'Single-page curated tour essentials (hotels, attractions, dining, shopping, tours) tailored for newsletters, marketing campaigns, and specific travel sectors.',
  groups: [
    { name: 'identity',    title: '📌 Overview & Identity' },
    { name: 'curated',     title: '⭐ Curated Services' },
    { name: 'itinerary',   title: '📅 Day-by-Day Schedule' },
    { name: 'marketing',   title: '📣 Newsletter & WhatsApp' },
  ],
  fields: [
    // ── IDENTITY ─────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Collection Title',
      group: 'identity',
      type: 'string',
      placeholder: 'e.g. Singapore Family Wonder Essentials (4D3N)',
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
      validation: (Rule) => Rule.required(),
      description: 'Public page URL: /services-catalog/collections/[slug]',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline / Short Pitch',
      group: 'identity',
      type: 'string',
      placeholder: 'e.g. Handcrafted 4D3N Family Vacation Itinerary featuring Resorts World Sentosa & Halal/Veg Dining',
    }),
    defineField({
      name: 'category',
      title: 'Target Sector / Category',
      group: 'identity',
      type: 'string',
      options: {
        list: [
          { title: '👨‍👩‍👧‍👦 Family & Kids', value: 'family' },
          { title: '💼 Corporate MICE & VIP Incentives', value: 'corporate' },
          { title: '💍 Honeymoon & Couples', value: 'honeymoon' },
          { title: '🍛 Culture, Heritage & Foodies', value: 'culture' },
          { title: '🚍 Cross-Border Overland (SG + MY)', value: 'cross-border' },
          { title: '🎒 Student & Educational Groups', value: 'student' },
          { title: '💎 Luxury & Exclusive Stays', value: 'luxury' },
          { title: '🏷️ Budget & Value Seekers', value: 'budget' },
        ],
      },
      initialValue: 'family',
    }),
    defineField({
      name: 'badge',
      title: 'Badge Ribbon (Optional)',
      group: 'identity',
      type: 'string',
      placeholder: 'e.g. FAMILY FAVORITE, NEWSLETTER SPECIAL, BESTSELLER',
      initialValue: 'CURATED ESSENTIALS',
    }),
    defineField({
      name: 'duration',
      title: 'Trip Duration',
      group: 'identity',
      type: 'string',
      placeholder: 'e.g. 4 Days / 3 Nights',
      initialValue: '4 Days / 3 Nights',
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      group: 'identity',
      type: 'string',
      options: {
        list: [
          { title: 'Singapore', value: 'Singapore' },
          { title: 'Malaysia', value: 'Malaysia' },
          { title: 'Cross Border (Singapore + Malaysia)', value: 'Cross Border' },
        ],
      },
      initialValue: 'Singapore',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Hero Image (Upload)',
      group: 'identity',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Fallback Cover Image URL (Unsplash / CDN)',
      group: 'identity',
      type: 'url',
      description: 'Used if no direct image file is uploaded.',
    }),
    defineField({
      name: 'overview',
      title: 'Curator Overview & Narrative',
      group: 'identity',
      type: 'text',
      rows: 4,
      description: 'Explain why this collection was created and who will enjoy it most.',
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience Profile',
      group: 'identity',
      type: 'string',
      placeholder: 'e.g. Multi-generation families traveling with toddlers, teenagers, and senior citizens',
    }),
    defineField({
      name: 'highlights',
      title: 'Key Collection Highlights & Inclusions',
      group: 'identity',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet points highlighting the standout value of this collection.',
    }),

    // ── CURATED SERVICES ─────────────────────────────────────────────────────
    defineField({
      name: 'featuredHotels',
      title: '🏨 Curated Hotels (Selected Stays)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'hotelMeta' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'Choose 1 to 3 hand-picked hotels ideal for this collection.',
    }),
    defineField({
      name: 'featuredAttractions',
      title: '🎡 Curated Attractions (Must-Do Experiences)',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'attractionMeta' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'Select the primary attractions and activities recommended in this guide.',
    }),
    defineField({
      name: 'featuredDining',
      title: '🍽️ Curated Dining & Food Highlights',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'restaurantMeta' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'Hand-picked dining options, hawkers, buffets, or halal/vegetarian eateries.',
    }),
    defineField({
      name: 'featuredShopping',
      title: '🛍️ Curated Shopping Malls & Retail Hubs',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'shoppingMall' }],
        },
      ],
      description: 'Top shopping centers and souvenir hubs matching this trip.',
    }),
    defineField({
      name: 'featuredTours',
      title: '🚍 Curated Tour Circuit / Land Package',
      group: 'curated',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'readyPackageTemplate' }, { type: 'b2bServiceMedia' }],
        },
      ],
      description: 'The signature guided itinerary or overland package underpinning this collection.',
    }),

    // ── DAY-BY-DAY ITINERARY SCHEDULE ────────────────────────────────────────
    defineField({
      name: 'itinerarySchedule',
      title: '📅 Day-by-Day Tour Blueprint (Optional)',
      group: 'itinerary',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'day', title: 'Day Label', type: 'string', placeholder: 'e.g. Day 1' },
            { name: 'title', title: 'Day Theme / Title', type: 'string', placeholder: 'e.g. Arrival & Gardens by the Bay' },
            { name: 'description', title: 'Day Summary', type: 'text', rows: 3 },
            { name: 'morning', title: 'Morning Plan', type: 'string' },
            { name: 'afternoon', title: 'Afternoon Plan', type: 'string' },
            { name: 'evening', title: 'Evening Plan', type: 'string' },
            { name: 'recommendedDining', title: 'Recommended Dining / Meal', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'insiderTips',
      title: '💡 Curator Insider Tips & Practical Advice',
      group: 'itinerary',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Pro-tips for transit, ticket booking, weather, and timing.',
    }),

    // ── MARKETING & NEWSLETTER ───────────────────────────────────────────────
    defineField({
      name: 'newsletterTeaser',
      title: '📧 Newsletter Blurb (Copy-Paste Ready)',
      group: 'marketing',
      type: 'text',
      rows: 4,
      description: 'Clean pre-written snippet ready to be inserted directly into Sanity Newsletter Campaigns or Brevo email blasts.',
    }),
    defineField({
      name: 'customWhatsAppMessage',
      title: '💬 Custom WhatsApp Inquiry Message Template',
      group: 'marketing',
      type: 'string',
      description: 'Pre-fills message when a client clicks "Inquire This Collection on WhatsApp". Supports {collectionTitle}.',
      initialValue: 'Hi Flying Wonders! I would like to inquire about customized pricing and booking for the {collectionTitle} Curated Collection.',
    }),
    defineField({
      name: 'isPublished',
      title: 'Published & Live on Website',
      group: 'marketing',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle OFF to save as draft without displaying on the public collections catalog.',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Feature on Services Catalog Homepage?',
      group: 'marketing',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON to feature this collection prominently at the top of /services-catalog.',
    }),
    defineField({
      name: 'order',
      title: 'Display Sorting Order',
      group: 'marketing',
      type: 'number',
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tagline',
      category: 'category',
      media: 'coverImage',
    },
    prepare({ title, subtitle, category, media }) {
      return {
        title: title || 'Untitled Collection',
        subtitle: `${category ? `[${category.toUpperCase()}] ` : ''}${subtitle || ''}`,
        media,
      }
    },
  },
})

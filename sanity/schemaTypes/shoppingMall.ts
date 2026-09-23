import { defineField, defineType } from 'sanity'

export const shoppingMallSchema = defineType({
  name: 'shoppingMall',
  title: 'Shopping Mall & Retail Destination',
  type: 'document',
  icon: () => '🛍️',
  description: 'Manage shopping destinations, outlet malls, and street markets featured in Travel Tools and the Singapore Shopping Guide.',
  groups: [
    { name: 'identity',    title: '📌 Identity & Media' },
    { name: 'content',     title: '📝 Overview & Must-Do' },
    { name: 'stores',      title: '🛍️ Stores & Discounts' },
    { name: 'logistics',   title: '🕐 Hours & Crowd Logistics' },
    { name: 'tips',        title: '💡 Insider Hacks & Tips' },
    { name: 'app',         title: '📱 Mobile App' },
    { name: 'media',       title: '▶️ Video & Media' },
    { name: 'transit',     title: '📍 Transit & Map' },
    { name: 'dining',      title: '🍜 Dining & Facilities' },
    { name: 'faqs',        title: '❓ FAQs' },
  ],
  fields: [
    // ── 1. IDENTITY & MEDIA ──
    defineField({
      name: 'name',
      title: 'Mall / Destination Name',
      group: 'identity',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. "IMM Outlet Mall", "Mustafa Centre", "The Shoppes at Marina Bay Sands"'
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      group: 'identity',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'The URL path under /travel-tools/shopping-malls/[slug]'
    }),
    defineField({
      name: 'alternateName',
      title: 'Native / Local Name (Optional)',
      group: 'identity',
      type: 'string',
      description: 'e.g. Chinese characters or Tamil name for cultural landmarks'
    }),
    defineField({
      name: 'tagline',
      title: 'Short Tagline',
      group: 'identity',
      type: 'string',
      description: 'e.g. "Singapore\'s Largest Factory Outlet Mall with 90+ Designer Brands"'
    }),
    defineField({
      name: 'category',
      title: 'Shopping Category',
      group: 'identity',
      type: 'string',
      options: {
        list: [
          { title: 'Outlet & Discount Mall', value: 'Outlet & Discount Mall' },
          { title: '24/7 Mega Superstore & Bazaar', value: '24/7 Mega Superstore & Bazaar' },
          { title: 'Bargain Street Market', value: 'Bargain Street Market' },
          { title: 'Ultra-Luxury Flagships & Lifestyle', value: 'Ultra-Luxury Flagships & Lifestyle' },
          { title: 'Premier Shopping Belt & Department Stores', value: 'Premier Shopping Belt & Department Stores' },
          { title: 'Heritage & Cultural Souvenir Bazaar', value: 'Heritage & Cultural Souvenir Bazaar' },
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'budgetTier',
      title: 'Price Tier Indicator',
      group: 'identity',
      type: 'string',
      options: {
        list: [
          { title: '$ (Budget / Bargain)', value: '$' },
          { title: '$$ (Affordable / Mid-Range)', value: '$$' },
          { title: '$$$ (Premium / Outlet Designer)', value: '$$$' },
          { title: '$$$$ (Ultra Luxury / Haute Couture)', value: '$$$$' },
        ]
      },
      initialValue: '$$'
    }),
    defineField({
      name: 'starRating',
      title: 'Star Rating',
      group: 'identity',
      type: 'string',
      initialValue: '4.8',
    }),
    defineField({
      name: 'reviewCount',
      title: 'Review Count Text',
      group: 'identity',
      type: 'string',
      initialValue: '12,500+ Reviews'
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image Upload (Direct File Upload)',
      group: 'identity',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload high-resolution landscape cover photo directly from your computer or phone.'
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Cover Image URL (Alternative Text Link)',
      group: 'identity',
      type: 'url',
      description: 'Or paste an image URL e.g. https://images.unsplash.com/...'
    }),
    defineField({
      name: 'galleryUploaded',
      title: 'Photo Gallery Uploads (Direct Multiple Photo Upload)',
      group: 'identity',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Upload multiple photos of the mall, stores, exhibits, food, or interiors directly from your device.'
    }),
    defineField({
      name: 'galleryImages',
      title: 'Photo Gallery URLs (Alternative Text Links)',
      group: 'identity',
      type: 'array',
      of: [{ type: 'url' }],
      description: 'Or paste direct image URLs for the interactive photo lightbox slider'
    }),

    // ── 2. CONTENT & MUST-DO ──
    defineField({
      name: 'overview',
      title: 'Mall Overview & History',
      group: 'content',
      type: 'text',
      rows: 5,
      description: 'Detailed description of the destination, atmosphere, scale, and vibe'
    }),
    defineField({
      name: 'mustDoThings',
      title: 'Must-Do Things & Signature Experiences',
      group: 'content',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Numbered signature highlights visitors must experience'
    }),
    defineField({
      name: 'keyHighlights',
      title: 'Key Selling Highlights',
      group: 'content',
      type: 'array',
      of: [
        defineField({
          name: 'highlight',
          title: 'Highlight',
          type: 'object',
          fields: [
            { name: 'title', title: 'Highlight Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'string' },
            { name: 'badge', title: 'Badge (e.g. Up to 80% Off)', type: 'string' }
          ]
        })
      ]
    }),

    // ── 3. STORES & BRANDS ──
    defineField({
      name: 'topStoresAndBrands',
      title: 'Top Stores & Brand Directory',
      group: 'stores',
      type: 'array',
      of: [
        defineField({
          name: 'storeCategory',
          title: 'Store Category',
          type: 'object',
          fields: [
            { name: 'categoryName', title: 'Category Name (e.g. Designer Handbags)', type: 'string' },
            { name: 'discountBadge', title: 'Discount Badge (e.g. 30% - 70% Off)', type: 'string' },
            { name: 'brands', title: 'Brands / Shops', type: 'array', of: [{ type: 'string' }] },
            { name: 'description', title: 'Notes or Location Tips', type: 'string' }
          ]
        })
      ]
    }),

    // ── 4. LOGISTICS & OPERATING HOURS ──
    defineField({
      name: 'timings',
      title: 'Daily Operating Hours',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "10:00 AM – 10:00 PM Daily" or "24 Hours Open (365 Days)"'
    }),
    defineField({
      name: 'bestTimeToVisit',
      title: 'Optimal Entry Slot / Best Visiting Time',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "Weekday mornings (10:30 AM – 1:00 PM) for minimal queues"'
    }),
    defineField({
      name: 'peakCrowdTimes',
      title: 'Peak Crowd Notice',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "Saturday & Sunday afternoons from 2:00 PM to 7:00 PM"'
    }),
    defineField({
      name: 'recommendedDuration',
      title: 'Recommended Duration of Visit',
      group: 'logistics',
      type: 'string',
      initialValue: '2 to 4 Hours'
    }),

    // ── 5. INSIDER TIPS ──
    defineField({
      name: 'tipsAndTricks',
      title: 'Insider Shopping Hacks & Pro-Tips',
      group: 'tips',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Insider tips on tourist discount booklets, size hunting, tax refunds, bag zip-tying, etc.'
    }),

    // ── 6. MOBILE APP ──
    defineField({
      name: 'appDetails',
      title: 'Official Mobile Visitor App',
      group: 'app',
      type: 'object',
      fields: [
        { name: 'appName', title: 'App Name', type: 'string' },
        { name: 'appDescription', title: 'App Description', type: 'text', rows: 2 },
        { name: 'appStoreUrl', title: 'Apple App Store URL', type: 'url' },
        { name: 'playStoreUrl', title: 'Google Play Store URL', type: 'url' },
        { name: 'appFeatures', title: 'Key App Features', type: 'array', of: [{ type: 'string' }] }
      ]
    }),

    // ── 7. VIDEO & MEDIA ──
    defineField({
      name: 'videoFile',
      title: 'Video Showcase Upload (Direct MP4/WebM Video Upload)',
      group: 'media',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Upload video file directly from your computer (MP4, WebM, MOV).'
    }),
    defineField({
      name: 'videoUrl',
      title: '4K Video Walkthrough URL (YouTube / Vimeo / MP4 Link)',
      group: 'media',
      type: 'url',
      description: 'Or paste a YouTube video URL for full embedded walking tour'
    }),
    defineField({
      name: 'shorts',
      title: 'Curated Video Shorts',
      group: 'media',
      type: 'array',
      of: [
        defineField({
          name: 'shortItem',
          title: 'Short',
          type: 'object',
          fields: [
            { name: 'id', title: 'YouTube Short ID', type: 'string' },
            { name: 'title', title: 'Short Title', type: 'string' },
            { name: 'duration', title: 'Duration (e.g. 0:45)', type: 'string' },
            { name: 'creator', title: 'Creator / Channel', type: 'string' },
            { name: 'videoFile', title: 'Short Video File Upload (Direct MP4)', type: 'file', options: { accept: 'video/*' } },
            { name: 'thumbnailImage', title: 'Thumbnail Image Upload', type: 'image', options: { hotspot: true } },
            { name: 'thumbnailUrl', title: 'Thumbnail URL (Alternative Link)', type: 'url' },
            { name: 'youtubeVideoId', title: 'YouTube Video ID', type: 'string' }
          ]
        })
      ]
    }),

    // ── 8. TRANSIT & LOCATION ──
    defineField({
      name: 'locationAddress',
      title: 'Full Physical Address',
      group: 'transit',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'mapEmbedUrl',
      title: 'Google Maps Embed URL',
      group: 'transit',
      type: 'url'
    }),
    defineField({
      name: 'nearestMrt',
      title: 'Nearest MRT Station Details',
      group: 'transit',
      type: 'object',
      fields: [
        { name: 'station', title: 'Station Name (e.g. Jurong East)', type: 'string' },
        { name: 'line', title: 'Line Codes (e.g. NS1 / EW24)', type: 'string' },
        { name: 'exit', title: 'Exit Code (e.g. Exit A via J-Walk bridge)', type: 'string' },
        { name: 'walkingTime', title: 'Walking Time (e.g. 5 Mins Sheltered Walk)', type: 'string' }
      ]
    }),
    defineField({
      name: 'busLines',
      title: 'Connecting Bus Lines',
      group: 'transit',
      type: 'string',
      description: 'e.g. "52, 105, 188, 333, 502, 990"'
    }),

    // ── 9. DINING & FACILITIES ──
    defineField({
      name: 'diningHighlights',
      title: 'Dining & Food Court Highlights',
      group: 'dining',
      type: 'object',
      fields: [
        { name: 'description', title: 'Dining Overview', type: 'text', rows: 3 },
        { name: 'topPicks', title: 'Must-Try Eateries / Stalls', type: 'array', of: [{ type: 'string' }] }
      ]
    }),
    defineField({
      name: 'facilities',
      title: 'Amenities & Facilities Badges',
      group: 'dining',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "GST Tourist Refund (eTRS)", "24-Hour Money Changer", "Luggage Lockers", "Prayer Rooms"'
    }),
    defineField({
      name: 'nearbyAttractions',
      title: 'Nearby Itinerary Pairings',
      group: 'transit',
      type: 'array',
      of: [
        defineField({
          name: 'pairing',
          title: 'Pairing',
          type: 'object',
          fields: [
            { name: 'name', title: 'Attraction / Spot Name', type: 'string' },
            { name: 'distance', title: 'Distance / Travel Time', type: 'string' },
            { name: 'travelTip', title: 'Tip on How to Combine', type: 'string' }
          ]
        })
      ]
    }),

    // ── 10. FAQS ──
    defineField({
      name: 'faqs',
      title: 'Frequently Asked Questions',
      group: 'faqs',
      type: 'array',
      of: [
        defineField({
          name: 'faqItem',
          title: 'FAQ Item',
          type: 'object',
          fields: [
            { name: 'question', title: 'Question', type: 'string' },
            { name: 'answer', title: 'Answer', type: 'text', rows: 3 }
          ]
        })
      ]
    }),
    defineField({
      name: 'isDisplayed',
      title: 'Published & Visible Online',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      budget: 'budgetTier',
      rating: 'starRating',
      media: 'coverImage',
    },
    prepare({ title, subtitle, budget, rating, media }: any) {
      return {
        title: title || 'Untitled Shopping Destination',
        subtitle: `${subtitle || 'Mall'} · ${budget || '$$'} · ⭐ ${rating || '4.8'}`,
        media: media,
      }
    }
  }
})

import { defineType, defineField } from 'sanity'

export const restaurantMetaSchema = defineType({
  name: 'restaurantMeta',
  title: 'Restaurants & Dining Directory',
  type: 'document',
  icon: () => '🍽️',
  description: 'Manage curated dining spots, buffet palaces, vegetarian/vegan gems, and hawker legends.',
  groups: [
    { name: 'identity',    title: '📌 Identity & Concept' },
    { name: 'media',       title: '🎬 Photos & Video Showcase' },
    { name: 'menu',        title: '🍲 Menu & Must-Try Dishes' },
    { name: 'buffet',      title: '🍽️ Buffet & Pricing' },
    { name: 'logistics',   title: '📍 Location & Hours' },
    { name: 'marketing',   title: '⭐ Badges & WhatsApp' },
  ],
  fields: [
    // ── IDENTITY ─────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Restaurant / Eatery Name',
      group: 'identity',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
      description: 'Individual restaurant page link, e.g. /services-catalog/restaurants/shahi-maharani',
    }),
    defineField({
      name: 'subtitle',
      title: 'Tagline / Subtitle',
      group: 'identity',
      type: 'string',
      description: 'e.g. "Royal North Indian Dining & Iconic 1-for-1 Lunch Buffet at Raffles City"',
    }),
    defineField({
      name: 'destination',
      title: 'Destination City / Zone',
      group: 'identity',
      type: 'string',
      options: {
        list: [
          { title: 'Singapore', value: 'Singapore' },
          { title: 'Malaysia', value: 'Malaysia' },
          { title: 'Cross Border', value: 'Cross Border' },
        ],
      },
      initialValue: 'Singapore',
    }),
    defineField({
      name: 'cuisineType',
      title: 'Cuisine Style / Specialties',
      group: 'identity',
      type: 'string',
      description: 'e.g. "North Indian Mughlai & Royal Awadhi", "South Indian Pure Vegetarian & Thali", "Chinese Vegetarian Dim Sum"',
    }),
    defineField({
      name: 'categories',
      title: 'Filter Categories (Select all that apply)',
      group: 'identity',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '🎥 Video Showcase Available', value: 'video' },
          { title: '🥗 Pure Vegetarian / Jain', value: 'veg' },
          { title: '🍛 Indian (North & South)', value: 'indian' },
          { title: '🌱 100% Vegan Friendly', value: 'vegan' },
          { title: '🥟 Chinese Vegetarian / Asian', value: 'chinese' },
          { title: '🍽️ Buffet & Thali Spread', value: 'buffet' },
          { title: '🥘 Signature Biryani Specialist', value: 'biryani' },
          { title: '✨ Halal Certified / Muslim Friendly', value: 'halal' },
          { title: '🍷 Fine Dining / Michelin', value: 'fine_dining' },
          { title: '🏮 Little India & Hawker Legend', value: 'hawker' },
        ],
      },
      description: 'Used for dynamic filter tabs on the Services Catalog page.',
    }),
    defineField({
      name: 'dietaryBadges',
      title: 'Dietary Badges & Certifications',
      group: 'identity',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'e.g. "100% Pure Vegetarian", "Jain Meals Available", "Halal Certified", "Vegan Friendly", "No Onion No Garlic"',
    }),
    defineField({
      name: 'priceRange',
      title: 'Price Tier & Average Spend',
      group: 'identity',
      type: 'string',
      options: {
        list: [
          { title: '$ (Under SGD 10 / Hawker)', value: '$ (Under SGD 10)' },
          { title: '$$ (SGD 15 – 35 / Casual Dining)', value: '$$ (SGD 15 – 35)' },
          { title: '$$$ (SGD 35 – 70 / Premium Buffet)', value: '$$$ (SGD 35 – 70)' },
          { title: '$$$$ (SGD 75+ / Luxury & Fine Dining)', value: '$$$$ (SGD 75+)' },
        ],
      },
    }),
    defineField({
      name: 'starRating',
      title: 'Star Rating (out of 5.0)',
      group: 'identity',
      type: 'string',
      initialValue: '4.8',
    }),
    defineField({
      name: 'reviewCount',
      title: 'Reviews Count Text',
      group: 'identity',
      type: 'string',
      description: 'e.g. "1,850+ Google & Tripadvisor Reviews"',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Teaser Description',
      group: 'identity',
      type: 'text',
      rows: 2,
      description: '1-2 sentences shown on catalog cards and quick search previews.',
    }),
    defineField({
      name: 'longDescription',
      title: 'Full Culinary Story & Dining Experience',
      group: 'identity',
      type: 'text',
      rows: 5,
      description: 'Detailed description covering culinary roots, ambiance, chef specialty, and seating experience.',
    }),

    // ── MEDIA (PHOTO & VIDEO) ────────────────────────────────────────────────
    defineField({
      name: 'coverImage',
      title: 'Cover Image Upload',
      group: 'media',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Cover Image URL (Fallback)',
      group: 'media',
      type: 'string',
      description: 'Direct high-res photo link if not uploading asset.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video Showcase URL (YouTube, Vimeo, MP4)',
      group: 'media',
      type: 'string',
      description: 'Embed URL for the full video tour. e.g. https://www.youtube.com/watch?v=...',
    }),
    defineField({
      name: 'shorts',
      title: 'Curated YouTube Shorts (Vertical Reels)',
      group: 'media',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Short Title', type: 'string' },
            { name: 'creator', title: 'Creator / Channel', type: 'string' },
            { name: 'views', title: 'Views Text (e.g. 250K views)', type: 'string' },
            { name: 'thumbnailUrl', title: 'Thumbnail URL', type: 'string' },
            { name: 'youtubeVideoId', title: 'YouTube Short / Video ID', type: 'string' },
          ],
        },
      ],
      description: 'Vertical 9:16 reels showcasing food preparation, thali spreads, and ambiance.',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Photo Gallery Uploads',
      group: 'media',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'galleryImageUrls',
      title: 'Photo Gallery URLs (Fallback)',
      group: 'media',
      type: 'array',
      of: [{ type: 'string' }],
    }),

    // ── MENU & MUST-TRY DISHES ───────────────────────────────────────────────
    defineField({
      name: 'mustTryDishes',
      title: 'Signature Must-Try Dishes',
      group: 'menu',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Dish Name', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'description', title: 'Dish Description & Flavor Profile', type: 'string' },
            { name: 'category', title: 'Dish Category', type: 'string', options: { list: ['Signature Starter', 'Main Course', 'Tandoori / Grill', 'Biryani / Rice', 'Dessert / Sweet', 'Beverage'] } },
            { name: 'isVegetarian', title: 'Vegetarian?', type: 'boolean', initialValue: false },
            { name: 'isJainFriendly', title: 'Jain Friendly?', type: 'boolean', initialValue: false },
            { name: 'isChefSpecial', title: 'Chef Special / Award Winner?', type: 'boolean', initialValue: true },
          ],
        },
      ],
      description: 'Signature dishes that visitors should not miss.',
    }),
    defineField({
      name: 'features',
      title: 'Restaurant Highlights & Amenities',
      group: 'menu',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Live Classical Music", "Private Dining Rooms", "Free High-Speed Wi-Fi", "Outdoor Alfresco Seating"',
    }),

    // ── BUFFET & THALI SPECIALS ──────────────────────────────────────────────
    defineField({
      name: 'hasBuffet',
      title: 'Offers Buffet or Unlimited Thali?',
      group: 'buffet',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'buffetHighlight',
      title: 'Buffet / Thali Headline Offer',
      group: 'buffet',
      type: 'string',
      description: 'e.g. "1-For-1 Weekday Lunch Buffet at $68++ for two" or "Unlimited Lunch & Dinner Thali Buffet"',
    }),
    defineField({
      name: 'buffetDetails',
      title: 'Buffet Inclusions & Pricing Structure',
      group: 'buffet',
      type: 'text',
      rows: 3,
      description: 'Detail pricing for lunch/dinner, child rates, vegetarian vs non-vegetarian spreads, and festive specials.',
    }),

    // ── LOGISTICS & CONTACT ──────────────────────────────────────────────────
    defineField({
      name: 'address',
      title: 'Full Street Address',
      group: 'logistics',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. 252 North Bridge Road, #03-21B Raffles City Shopping Centre, Singapore 179103',
    }),
    defineField({
      name: 'nearestMrt',
      title: 'Nearest MRT Station & Walking Route',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "City Hall MRT (EW13/NS25) — 2 mins walk via Raffles City basement linkway"',
    }),
    defineField({
      name: 'timings',
      title: 'Opening Hours & Operating Schedule',
      group: 'logistics',
      type: 'string',
      description: 'e.g. "Lunch: 12:00 PM – 3:00 PM | Dinner: 6:30 PM – 11:00 PM (Daily)"',
    }),
    defineField({
      name: 'phone',
      title: 'Reservation Phone / Hotline',
      group: 'logistics',
      type: 'string',
    }),
    defineField({
      name: 'officialWebsite',
      title: 'Official Website URL',
      group: 'logistics',
      type: 'url',
    }),
    defineField({
      name: 'menuUrl',
      title: 'Online Menu URL',
      group: 'logistics',
      type: 'url',
    }),
    defineField({
      name: 'reservationUrl',
      title: 'Online Reservation URL (Chope / SevenRooms / Website)',
      group: 'logistics',
      type: 'url',
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps Navigation Link',
      group: 'logistics',
      type: 'url',
    }),
    defineField({
      name: 'tips',
      title: 'Diner Pro-Tips & Recommendations',
      group: 'logistics',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Insider tips for reservations, seating options, best arrival times, or spice customization.',
    }),

    // ── MARKETING & BADGES ───────────────────────────────────────────────────
    defineField({
      name: 'isPopular',
      title: '⭐ Mark as Highly Recommended / Most Popular',
      group: 'marketing',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isTrending',
      title: '🔥 Mark as Trending',
      group: 'marketing',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isDisplayed',
      title: 'Display in Public Catalog',
      group: 'marketing',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'whatsappNumber',
      title: '💬 Custom WhatsApp Booking Number (Override)',
      group: 'marketing',
      type: 'string',
    }),
    defineField({
      name: 'whatsappMessage',
      title: '💬 Custom WhatsApp Inquiry Message (Override)',
      group: 'marketing',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'cuisineType',
      media: 'coverImage',
      mediaUrl: 'coverImageUrl',
      popular: 'isPopular',
      trending: 'isTrending',
    },
    prepare({ title, subtitle, media, popular, trending }) {
      const badges = [popular && '⭐', trending && '🔥'].filter(Boolean).join(' ')
      return {
        title: `${badges ? badges + ' ' : ''}${title}`,
        subtitle: subtitle || 'Dining Spot',
        media,
      }
    },
  },
})

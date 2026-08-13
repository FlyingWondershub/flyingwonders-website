import { defineType, defineField } from 'sanity'

export const b2bServiceMediaSchema = defineType({
  name: 'b2bServiceMedia',
  title: 'Services Catalog Items (Restaurants, Guides, Tours)',
  type: 'document',
  fields: [
    defineField({
      name: 'category',
      title: 'Service Category',
      type: 'string',
      options: {
        list: [
          { title: '🍽️ Restaurant / Dining', value: 'restaurant' },
          { title: '🚩 Licensed Tour Guide', value: 'guide' },
          { title: '🚍 Tour (2N/3N/4N & City Tours)', value: 'tour' },
          { title: '📦 B2B Package Circuit', value: 'package' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Item Title / Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / Tagline',
      type: 'string',
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'string',
      options: {
        list: [
          { title: 'Singapore', value: 'Singapore' },
          { title: 'Malaysia', value: 'Malaysia' },
          { title: 'Cross Border (SG + MY)', value: 'Cross Border' },
        ],
      },
      initialValue: 'Singapore',
    }),
    defineField({
      name: 'description',
      title: 'Detailed Description / Highlights',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image Upload (Direct Computer Upload)',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload cover photo directly from your computer or phone.',
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Cover Image URL (Alternative Text Link)',
      type: 'string',
      description: 'Or paste an image URL e.g. https://images.unsplash.com/...',
    }),
    defineField({
      name: 'videoFile',
      title: 'Video Showcase Upload (Direct MP4/WebM Video Upload)',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Upload video file directly from your computer.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video Showcase URL (YouTube, Vimeo, MP4 link)',
      type: 'string',
      description: 'Or paste a YouTube/Vimeo/MP4 link.',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Photo Gallery Uploads (Direct Multiple Photo Upload)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Upload multiple photos of food, restaurant interiors, or tour highlights.',
    }),
    defineField({
      name: 'galleryImageUrls',
      title: 'Photo Gallery URLs (Alternative Text Links)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'features',
      title: 'Key Features / Tags (comma-separated)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'duration',
      title: 'Duration (For Tours e.g. 2N/3D, Half Day City Tour)',
      type: 'string',
    }),
    defineField({
      name: 'spokenLanguages',
      title: 'Spoken Languages (For Guides)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'cuisineType',
      title: 'Cuisine Type (For Restaurants e.g. Halal, Seafood, Indian)',
      type: 'string',
    }),
  ],
})

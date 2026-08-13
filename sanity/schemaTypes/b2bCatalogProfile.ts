import { defineField, defineType } from 'sanity'

export const b2bCatalogProfileSchema = defineType({
  name: 'b2bCatalogProfile',
  title: 'B2B Catalog Profiles',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company / Agency Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline / Slogan',
      type: 'string',
    }),
    defineField({
      name: 'agentName',
      title: 'Primary Contact Person',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Work Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'secondaryEmail',
      title: 'Secondary / Alternate Email Address',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
    defineField({
      name: 'country',
      title: 'Country / Headquarters Location',
      type: 'string',
    }),
    defineField({
      name: 'logoUrl',
      title: 'Company Logo URL',
      type: 'string',
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Cover Image / Banner URL',
      type: 'string',
    }),
    defineField({
      name: 'aboutCompany',
      title: 'About Company / Bio',
      type: 'text',
    }),
    defineField({
      name: 'destinationsCovered',
      title: 'Destinations Covered',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'servicesMatrix',
      title: 'Services Matrix',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'languagesSupported',
      title: 'Languages Supported',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'fleetTypes',
      title: 'Fleet & Transport Operated',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'paymentMethods',
      title: 'Accepted Payment Methods',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tradeCertifications',
      title: 'Trade Certifications / Accreditations',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'leadTimeNotice',
      title: 'Lead Time Notice',
      type: 'string',
    }),
    defineField({
      name: 'brochurePdfUrl',
      title: 'B2B Tariff / Brochure PDF Link',
      type: 'string',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video Pitch URL (YouTube / Vimeo)',
      type: 'string',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Image URLs',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Official Website URL',
      type: 'string',
    }),
    defineField({
      name: 'likesCount',
      title: 'Likes Count',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'packageHighlights',
      title: 'Package Highlights / Starting Deals',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Package Title', type: 'string' }),
            defineField({ name: 'duration', title: 'Duration (e.g. 3N/4D)', type: 'string' }),
            defineField({ name: 'startingPrice', title: 'Starting Price (SGD)', type: 'number' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'recommendations',
      title: 'Peer Recommendations',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'recommenderEmail', title: 'Recommender Email', type: 'string' }),
            defineField({ name: 'recommenderCompany', title: 'Recommender Company', type: 'string' }),
            defineField({ name: 'recommenderName', title: 'Recommender Name', type: 'string' }),
            defineField({ name: 'comment', title: 'Recommendation Note', type: 'string' }),
            defineField({ name: 'createdAt', title: 'Created At', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'isPublic',
      title: 'Publicly Visible in Directory?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

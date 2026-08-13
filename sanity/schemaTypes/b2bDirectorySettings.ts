import { defineType, defineField } from 'sanity'

export const b2bDirectorySettingsSchema = defineType({
  name: 'b2bDirectorySettings',
  title: 'B2B Directory Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'isPageHidden',
      title: 'Hide Entire B2B Directory Page?',
      type: 'boolean',
      description: 'Toggle ON to temporarily hide/disable the B2B Directory page across the website.',
      initialValue: false,
    }),
    defineField({
      name: 'heroBadgeText',
      title: 'Hero Top Badge Label',
      type: 'string',
      initialValue: '🌐 Global B2B DMC Directory',
    }),
    defineField({
      name: 'heroBadgeSubtext',
      title: 'Hero Second Badge Label',
      type: 'string',
      initialValue: '100% Open & Self-Service',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title Heading',
      type: 'string',
      initialValue: 'Discover Verified Global DMCs & Travel Partners',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle Description',
      type: 'text',
      rows: 3,
      initialValue: 'Connect directly with verified local ground handlers, wholesale attraction suppliers, and transport providers across 70+ countries. Zero middleman fees.',
    }),
    defineField({
      name: 'searchPlaceholder',
      title: 'Search Input Placeholder',
      type: 'string',
      initialValue: 'Search by Company Name, City, Destination, or Country...',
    }),
    defineField({
      name: 'addProfileButtonText',
      title: 'Add/Edit Profile Button Text',
      type: 'string',
      initialValue: 'Add / Edit My Company Profile',
    }),
    defineField({
      name: 'noResultsTitle',
      title: 'No Results Title',
      type: 'string',
      initialValue: 'No B2B Partners Found',
    }),
    defineField({
      name: 'noResultsSubtitle',
      title: 'No Results Subtitle',
      type: 'string',
      initialValue: 'Try clearing filters or be the first partner to register in this region!',
    }),
  ],
})

import { defineType, defineField } from 'sanity'

export const b2bServiceCatalogSettingsSchema = defineType({
  name: 'b2bServiceCatalogSettings',
  title: 'Services Catalog Settings & Toggles',
  type: 'document',
  fields: [
    defineField({
      name: 'isPageHidden',
      title: 'Hide Entire Services Catalog Page?',
      type: 'boolean',
      description: 'Toggle ON to temporarily hide the entire Services Catalog page across the website.',
      initialValue: false,
    }),
    defineField({
      name: 'hideHotels',
      title: 'Hide Hotels Section?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hiddenHotelNames',
      title: 'Hidden Hotel Names (Hide Specific Hotels)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Enter names of specific hotels to hide from the live catalog showcase (e.g. "Hotel Boss", "Grand Hotel").',
    }),
    defineField({
      name: 'hideAttractions',
      title: 'Hide Attractions Section?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideRestaurants',
      title: 'Hide Restaurants Section?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideGuides',
      title: 'Hide Tour Guides Section?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideTours',
      title: 'Hide Tours Section (2N/3N/4N & City Tours)?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hidePackages',
      title: 'Hide Packages Section?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'heroTitle',
      title: 'Catalog Main Title',
      type: 'string',
      initialValue: 'Singapore & Malaysia Destination Services Catalog',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Catalog Main Subtitle',
      type: 'text',
      rows: 2,
      initialValue: 'Explore our complete inventory of Hotels, Attractions, Dining, Licensed Guides, and Tour Circuits.',
    }),
  ],
})

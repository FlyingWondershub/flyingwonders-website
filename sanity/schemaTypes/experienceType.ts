export const experienceSchema = {
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Experience Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Theme Park', value: 'theme_park' },
          { title: 'Nature & Wildlife', value: 'nature' },
          { title: 'Cultural Heritage', value: 'cultural' },
          { title: 'Luxury & Lifestyle', value: 'luxury' },
          { title: 'Food & Culinary', value: 'food' },
          { title: 'Adventure', value: 'adventure' },
        ],
      },
    },
    {
      name: 'priceINR',
      title: 'Price per Person (₹ INR)',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'duration',
      title: 'Duration (e.g. "Half Day", "Full Day")',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Experience Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'included',
      title: 'What\'s Included',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
}

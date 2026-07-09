export const packageSchema = {
  name: 'travelPackage',
  title: 'Travel Package',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Package Title',
      type: 'string',
    },
    {
      name: 'tier',
      title: 'Tier',
      type: 'string',
      options: {
        list: [
          { title: 'Budget', value: 'budget' },
          { title: 'Premium', value: 'premium' },
          { title: 'Solo', value: 'solo' },
          { title: 'Groups/Families', value: 'groups' },
        ],
      },
    },
    {
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Package Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'itinerary',
      title: 'Itinerary Highlights',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
}

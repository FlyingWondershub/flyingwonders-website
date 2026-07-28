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
      title: 'Price (SGD)',
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
      name: 'hotelOptions',
      title: 'Hotel Options',
      type: 'string',
      description: 'E.g., 3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavender',
    },
    {
      name: 'itinerary',
      title: 'Itinerary Days',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'itineraryDay',
          title: 'Itinerary Day',
          fields: [
            { name: 'day', title: 'Day Number', type: 'number' },
            { name: 'title', title: 'Day Title', type: 'string' },
            {
              name: 'activities',
              title: 'Activities',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'activityItem',
                  title: 'Activity Item',
                  fields: [
                    { name: 'time', title: 'Time / Duration', type: 'string', description: 'E.g. 08:00 or 08:00 - 09:00' },
                    { name: 'desc', title: 'Description', type: 'string' },
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
  ],
}

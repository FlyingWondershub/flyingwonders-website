export const reviewSchema = {
  name: 'review',
  title: 'Customer Review',
  type: 'document',
  fields: [
    {
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
    },
    {
      name: 'demographic',
      title: 'Demographic',
      type: 'string',
      options: {
        list: [
          { title: 'Indian', value: 'indian' },
          { title: 'Travel Agent', value: 'travel_agent' },
          { title: 'Corporate', value: 'corporate' },
          { title: 'Solo Traveler', value: 'solo' },
        ],
      },
    },
    {
      name: 'content',
      title: 'Review Content',
      type: 'text',
    },
    {
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1).max(5),
    },
  ],
}

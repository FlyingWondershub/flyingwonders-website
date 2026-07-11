export const bookingRequestSchema = {
  name: 'bookingRequest',
  title: 'Booking Requests (Leads)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Customer Name',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'travelDate',
      title: 'Travel Date',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'tier',
      title: 'Traveler Profile / Tier',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'travelers',
      title: 'Number of Travelers',
      type: 'number',
      readOnly: true,
    },
    {
      name: 'experiences',
      title: 'Selected Experiences',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
    },
    {
      name: 'totalPrice',
      title: 'Estimated Package Value (INR)',
      type: 'number',
      readOnly: true,
    },
    {
      name: 'notes',
      title: 'Special Notes',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    },
  ],
}

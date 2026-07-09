export const recognitionSchema = {
  name: 'recognition',
  title: 'Recognition / Logo',
  type: 'document',
  fields: [
    {
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
    },
    {
      name: 'logo',
      title: 'Company Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'url',
      title: 'Website URL',
      type: 'url',
    },
  ],
}

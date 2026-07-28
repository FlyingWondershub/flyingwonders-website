export const globalContactSchema = {
  name: 'globalContact',
  title: 'Global Contacts & Links',
  type: 'document',
  fields: [
    {
      name: 'officeAddress',
      title: 'Office Address',
      type: 'text',
      initialValue: '#74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560050',
    },
    {
      name: 'contactPhoneSingapore',
      title: 'Singapore Contact Phone',
      type: 'string',
      initialValue: '+65 94722830',
    },
    {
      name: 'contactPhoneIndia',
      title: 'India Contact Phone',
      type: 'string',
      initialValue: '+91 9886171251',
    },
    {
      name: 'contactEmail',
      title: 'Contact Email Address',
      type: 'string',
      initialValue: 'info.flyingwonders@gmail.com',
    },
    {
      name: 'whatsappNumber',
      title: 'WhatsApp Contact Number',
      type: 'string',
      initialValue: '+919886171251',
    },
    {
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'string',
      initialValue: 'https://www.youtube.com/@flyingwonders7886',
    },
    {
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'string',
      initialValue: 'https://www.instagram.com/flyingwonders.sg/',
    },
    {
      name: 'facebookUrl',
      title: 'Facebook URL',
      type: 'string',
      initialValue: 'https://www.facebook.com/profile.php?id=61585495532807',
    },
  ],
}

export const attractionsUserSchema = {
  name: 'attractionsUser',
  title: 'Attractions Live Users',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule: any) => Rule.required().email(),
    },
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
    },
    {
      name: 'company',
      title: 'Company Name',
      type: 'string',
    },
    {
      name: 'isApproved',
      title: 'Approved Access?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'otp',
      title: 'Current OTP Code',
      type: 'string',
    },
    {
      name: 'otpExpiry',
      title: 'OTP Expiry Time',
      type: 'datetime',
    },
  ],
}

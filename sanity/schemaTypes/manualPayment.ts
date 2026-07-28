export const manualPaymentSchema = {
  name: 'manualPayment',
  title: 'Offline UPI Payments (ICICI)',
  type: 'document',
  fields: [
    {
      name: 'bookingReference',
      title: 'Booking Reference / ID',
      type: 'string',
    },
    {
      name: 'guestName',
      title: 'Guest / Agent Name',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Phone / WhatsApp Number',
      type: 'string',
    },
    {
      name: 'amountSgd',
      title: 'Amount (SGD)',
      type: 'number',
    },
    {
      name: 'amountInr',
      title: 'Amount Paid (INR)',
      type: 'number',
    },
    {
      name: 'exchangeRateUsed',
      title: 'Applied Exchange Rate (INR / SGD)',
      type: 'number',
    },
    {
      name: 'utrNumber',
      title: 'UTR / Transaction Reference Number',
      type: 'string',
    },
    {
      name: 'paymentScreenshot',
      title: 'Payment Confirmation Screenshot',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'status',
      title: 'Verification Status',
      type: 'string',
      options: {
        list: [
          { title: '⏳ Pending Verification', value: 'pending_verification' },
          { title: '✅ Confirmed & Verified', value: 'confirmed' },
          { title: '❌ Rejected / Invalid', value: 'rejected' },
        ],
      },
      initialValue: 'pending_verification',
    },
    {
      name: 'submittedAt',
      title: 'Submission Timestamp',
      type: 'datetime',
    },
    {
      name: 'notes',
      title: 'Internal Admin Notes',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'guestName',
      subtitle: 'utrNumber',
      amountInr: 'amountInr',
      status: 'status',
    },
    prepare(selection: any) {
      const { title, subtitle, amountInr, status } = selection
      const statusIcon = status === 'confirmed' ? '✅' : status === 'rejected' ? '❌' : '⏳'
      return {
        title: `${statusIcon} ${title || 'Guest'} - ₹${amountInr || 0}`,
        subtitle: `UTR: ${subtitle || 'N/A'}`,
      }
    },
  },
}

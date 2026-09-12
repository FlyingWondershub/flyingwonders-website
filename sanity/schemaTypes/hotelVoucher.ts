import { defineField, defineType } from 'sanity'

export const hotelVoucherSchema = defineType({
  name: 'hotelVoucher',
  title: 'Group Hotel Confirmation Vouchers',
  type: 'document',
  icon: () => '🏨',
  description: 'Official Embassy-ready group hotel confirmation vouchers with rooming lists and live QR verification.',
  fields: [
    defineField({
      name: 'voucherNumber',
      title: 'Voucher Number (FW-HTL-YYYY-XXXX)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'groupName',
      title: 'Group / Delegation / Corporate Name',
      type: 'string',
      description: 'e.g. "St. Joseph Educational Tour 2026", "Apex Global Leadership Summit"',
    }),
    defineField({
      name: 'hotelName',
      title: 'Hotel Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hotelAddress',
      title: 'Hotel Physical Address',
      type: 'string',
      description: 'Complete address with postal code and country for visa officer verification.',
    }),
    defineField({
      name: 'hotelPhone',
      title: 'Hotel Telephone / Front Desk',
      type: 'string',
      description: 'Official direct contact phone number with country code.',
    }),
    defineField({
      name: 'hotelEmail',
      title: 'Hotel Front Desk / Reservation Email',
      type: 'string',
    }),
    defineField({
      name: 'starRating',
      title: 'Star Rating',
      type: 'string',
      options: {
        list: ['3-Star', '4-Star', '5-Star', 'Boutique / Heritage', 'Luxury Resort'],
      },
    }),
    defineField({
      name: 'hotelConfirmationNo',
      title: 'Hotel CRS / Reservation Confirmation Code',
      type: 'string',
      description: 'Internal hotel booking / PNR reference proving blocked rooms.',
    }),
    defineField({
      name: 'checkInDate',
      title: 'Check-In Date',
      type: 'string',
    }),
    defineField({
      name: 'checkInTime',
      title: 'Check-In Standard Time',
      type: 'string',
      initialValue: '15:00 hrs',
    }),
    defineField({
      name: 'checkOutDate',
      title: 'Check-Out Date',
      type: 'string',
    }),
    defineField({
      name: 'checkOutTime',
      title: 'Check-Out Standard Time',
      type: 'string',
      initialValue: '11:00 hrs',
    }),
    defineField({
      name: 'nights',
      title: 'Total Nights',
      type: 'number',
    }),
    defineField({
      name: 'mealPlan',
      title: 'Meal Plan / Basis',
      type: 'string',
      description: 'e.g. "Bed & Breakfast (CP)", "Room Only (EP)", "Half Board (MAP)"',
      initialValue: 'Daily Buffet Breakfast (CP)',
    }),
    defineField({
      name: 'bookingStatus',
      title: 'Booking Status',
      type: 'string',
      options: {
        list: [
          { title: '🟢 Confirmed & Guaranteed', value: 'Confirmed & Guaranteed' },
          { title: '🟡 Pending Confirmation', value: 'Pending' },
          { title: '🔴 Cancelled', value: 'Cancelled' },
        ],
      },
      initialValue: 'Confirmed & Guaranteed',
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment / Billing Status',
      type: 'string',
      options: {
        list: [
          { title: 'Prepaid / Billed to Flying Wonders DMC', value: 'Prepaid / Billed to Flying Wonders DMC' },
          { title: 'Prepaid by B2B Partner Agency', value: 'Prepaid by B2B Partner Agency' },
          { title: 'Direct Guest Settlement', value: 'Direct Guest Settlement' },
        ],
      },
      initialValue: 'Prepaid / Billed to Flying Wonders DMC',
    }),
    defineField({
      name: 'rooms',
      title: 'Group Rooming List',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'roomNumber', type: 'string', title: 'Room No / Sequence (e.g. 01, 101)' },
            { name: 'roomType', type: 'string', title: 'Room Category (e.g. Deluxe Twin, Standard King)' },
            { name: 'bedding', type: 'string', title: 'Bedding Configuration (Twin / King / Triple)' },
            { name: 'mealBasis', type: 'string', title: 'Specific Room Meal Plan (Optional)' },
            { name: 'checkInDate', type: 'string', title: 'Custom Check-In Date (Optional)' },
            { name: 'checkOutDate', type: 'string', title: 'Custom Check-Out Date (Optional)' },
            {
              name: 'guests',
              type: 'array',
              title: 'Room Occupants',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'title', type: 'string', title: 'Title (Mr / Mrs / Ms / Master / Dr)' },
                    { name: 'fullName', type: 'string', title: 'Full Name (As per Passport)' },
                    { name: 'passportNumber', type: 'string', title: 'Passport Number' },
                    { name: 'nationality', type: 'string', title: 'Nationality' },
                    { name: 'guestType', type: 'string', title: 'Type (Adult / Child)' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'specialRequests',
      title: 'Special Requests & Group Instructions',
      type: 'text',
      rows: 3,
      description: 'e.g. Non-smoking rooms, interconnected rooms, Jain vegetarian breakfast, luggage drop-off timing.',
    }),
    defineField({
      name: 'proposalNumber',
      title: 'Associated Custom Proposal (Optional)',
      type: 'string',
    }),
    defineField({
      name: 'agentName',
      title: 'B2B Agent / Tour Leader Name',
      type: 'string',
    }),
    defineField({
      name: 'agentEmail',
      title: 'Agent / Leader Email',
      type: 'string',
    }),
    defineField({
      name: 'agentPhone',
      title: 'Agent / Leader Phone',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'voucherNumber',
      subtitle: 'hotelName',
      group: 'groupName',
    },
    prepare({ title, subtitle, group }) {
      return {
        title: `${title || 'Hotel Voucher'} - ${subtitle || 'Hotel'}`,
        subtitle: group ? `Group: ${group}` : 'Individual / Group Voucher',
      }
    },
  },
})

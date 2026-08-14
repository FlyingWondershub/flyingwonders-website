import { defineType, defineField } from 'sanity'

export const travelConsultingBookingSchema = defineType({
  name: 'travelConsultingBooking',
  title: 'Consulting Booking Requests & Lead Assignments',
  type: 'document',
  fields: [
    defineField({
      name: 'bookingId',
      title: 'Booking Reference ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'clientName',
      title: 'Client / Agent Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientEmail',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientPhone',
      title: 'WhatsApp / Phone Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userRole',
      title: 'User Category',
      type: 'string',
      options: {
        list: [
          { title: '🧳 Leisure / Family Traveler', value: 'Traveler' },
          { title: '🛡️ Registered Travel Agent (B2B)', value: 'Travel Agent' },
        ],
      },
      initialValue: 'Traveler',
    }),
    defineField({
      name: 'packageTitle',
      title: 'Selected Consulting Package',
      type: 'string',
    }),
    defineField({
      name: 'packagePrice',
      title: 'Package Fee (SGD / INR)',
      type: 'string',
    }),
    defineField({
      name: 'preferredDate',
      title: 'Client Requested Date',
      type: 'date',
    }),
    defineField({
      name: 'preferredTimeWindow',
      title: 'Client Preferred Time Window',
      type: 'string',
    }),
    defineField({
      name: 'preferredLanguage',
      title: 'Preferred Language',
      type: 'string',
      initialValue: 'English',
    }),
    defineField({
      name: 'tripDetails',
      title: 'Trip Notes / Pax / Destinations',
      type: 'text',
      rows: 3,
    }),

    // ADMIN MANUAL ASSIGNMENT FIELDS
    defineField({
      name: 'assignedConsultant',
      title: '👨‍💼 Assigned Consultant (Admin Selection)',
      type: 'reference',
      to: [{ type: 'travelConsultant' }],
      description: 'Select the DMC consultant assigned to handle this session.',
    }),
    defineField({
      name: 'confirmedMeetingTime',
      title: '📅 Confirmed Meeting Date & Time (Admin Set)',
      type: 'datetime',
      description: 'Admin manually sets the exact confirmed date & time for the session.',
    }),
    defineField({
      name: 'meetingLink',
      title: '🔗 Video Call / Meeting Link (Google Meet / Zoom)',
      type: 'url',
      description: 'Admin pastes the Google Meet / Zoom link for the client.',
    }),
    defineField({
      name: 'status',
      title: '📌 Booking Status',
      type: 'string',
      options: {
        list: [
          { title: '⏳ Pending Admin Assignment', value: 'pending' },
          { title: '✅ Assigned & Confirmed', value: 'assigned' },
          { title: '💬 Session In Progress', value: 'in_progress' },
          { title: '🎉 Session Completed', value: 'completed' },
          { title: '🏷️ 100% Fee Credited to Package Booking', value: 'fee_credited' },
          { title: '❌ Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'adminNotes',
      title: 'Admin Internal Notes',
      type: 'text',
      rows: 2,
    }),
  ],
})

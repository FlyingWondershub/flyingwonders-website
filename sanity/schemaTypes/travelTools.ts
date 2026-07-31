import { defineField, defineType } from 'sanity'

export const travelToolsSchema = defineType({
  name: 'travelTools',
  title: 'Travel Tools & Visa Checklist Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Singapore & Malaysia Traveler Hub & Planning Utilities',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      initialValue: 'Your 1-stop portal for ICA SG Arrival Card (SGAC), Malaysia MDAC, Visa Document Checklists, Live Currency Converter, and Smart Packing Lists.',
    }),

    // Official Entry Links
    defineField({
      name: 'sgacOfficialLink',
      title: 'Official Singapore SGAC Entry Portal URL',
      type: 'url',
      initialValue: 'https://eservices.ica.gov.sg/sgarrivalcard/',
    }),
    defineField({
      name: 'mdacOfficialLink',
      title: 'Official Malaysia MDAC Entry Portal URL',
      type: 'url',
      initialValue: 'https://imigresen-online.imi.gov.my/mdac/main',
    }),
    defineField({
      name: 'sgVisaStatusLink',
      title: 'Official Singapore Visa Status Check URL',
      type: 'url',
      initialValue: 'https://eservices.ica.gov.sg/save/sso/login.xhtml',
    }),

    // Emergency Desk Contacts
    defineField({
      name: 'emergencyPhoneSgp',
      title: 'Singapore Operations Desk Emergency Phone',
      type: 'string',
      initialValue: '+65 9472 2830',
    }),
    defineField({
      name: 'emergencyPhoneInd',
      title: 'India Operations Desk Emergency Phone',
      type: 'string',
      initialValue: '+91 98861 71251',
    }),
  ],
})

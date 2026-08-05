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

    // SECTION HIDE TOGGLES
    defineField({
      name: 'hideOfficialPortals',
      title: '🙈 Hide Official Entry Portals Section (SGAC / MDAC)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideScamAdvisory',
      title: '🙈 Hide Fraud / Scam Advisory Banner',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideVisaChecklist',
      title: '🙈 Hide Visa Document Requirements & Checklists Section',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideCurrencyConverter',
      title: '🙈 Hide Live Currency Converter Widget',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideMealEstimator',
      title: '🙈 Hide Meal Budget Estimator Widget',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideInteractiveChecklist',
      title: '🙈 Hide Interactive Pre-Departure Checklist',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideAttractionAllocator',
      title: '🙈 Hide Recommended Attraction Time Allocator Table',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideFlightTracker',
      title: '🙈 Hide AirLabs Live Flight Tracker Widget',
      type: 'boolean',
      initialValue: false,
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

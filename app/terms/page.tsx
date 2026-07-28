import LegalPageClient from '../../components/LegalPageClient'
import { client } from '../../sanity/lib/client'

const FALLBACK_SECTIONS = [
  {
    id: 'general',
    title: '1. General Terms & Access',
    content: `These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Flying Wonders Pvt Ltd ("we", "us", or "our"), concerning your access to and use of the flyingwonders.net website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").

By accessing the Site, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.

Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Service at any time and for any reason.`
  },
  {
    id: 'bookings',
    title: '2. Bookings, Tariffs & Exchange Rates',
    content: `We operate primarily as a B2B Destination Management Company (DMC) specialist for Singapore travel packages.
• Indicative Costing: All tariffs, hotel room prices, supplementary packages, and attraction ticket rates computed using the Customizer tools are indicative estimations. Final bookings are subject to availability and active pricing lists at the moment of reservation deposit execution.
• Currency Multipliers: Estimates display pricing in Singapore Dollars (SGD) and local Indian Rupees (INR) based on fixed conversion multipliers (e.g., S$ 1 = ₹63). We reserve the right to revise invoicing totals in the event of major currency fluctuations exceeding 2.5% between custom package generation and bank settlement date.
• Payments & Deposits: To secure hotel bookings (at standard rates like Orchard Rendezvous Hotel or Boss Hotel) and private ground transport, deposits must be paid strictly in accordance with the timelines outlined in your invoice proposal.`
  },
  {
    id: 'agents',
    title: '3. B2B Agent Portal Rules',
    content: `Registered travel agencies and travel architects gain access to our custom package estimation portal:
• Verification: Access is restricted strictly to verified travel partner desks. Standard accounts are created with manual registration review. Logins by unregistered emails will return an access error.
• Markup Margins: The customizer tool provides sliding markup widgets. It is the agent's sole responsibility to set margin marks that comply with consumer disclosure laws in their home jurisdiction.
• Cost Secrecy: Net costs, supplier rates, and supplemental room details shown inside the Builder Workspace are strictly confidential. Sharing internal net cost sheets or screenshot details with retail end-customers is grounds for immediate termination of your agent partner portal access.`
  },
  {
    id: 'cancellations',
    title: '4. Cancellations, Refunds & No-Shows',
    content: `Cancellation policies depend entirely on our partner supplier guidelines (hotels, transport operators, and amusement parks):
• Sightseeing Passes: Tickets for major attractions (e.g., Universal Studios Singapore entry tickets, Sentosa Cable Car tickets, Wings of Time slots) are strictly non-refundable and non-transferable once purchased.
• Hotel Bookings: Room cancellations must be submitted in writing. Surcharges apply based on peak/off-peak season demands.
• No-Shows: Failure to board scheduled private transport coaches or arrive at reserved hotel check-in desks on the specified arrival date is considered a "No-Show." No-shows are charged at 100% value without exceptions.`
  },
  {
    id: 'force_majeure',
    title: '5. Force Majeure & Liabilities',
    content: `We act strictly as a DMC facilitator coordinating third-party local service providers:
• Limit of Liability: We are not responsible for cancellation, delay, or interruption of sightseeing tours, theme park closures, or ferry cancelations arising from weather events, local government restrictions, strikes, acts of God, or unexpected maintenance shut-downs.
• Flight Disruptions: Outbound or inbound flight delays resulting in missed transfers or hotel nights are outside of our corporate responsibility. Travelers are strongly advised to secure comprehensive international travel insurance covering flight delays and trip cancellations.`
  },
  {
    id: 'disputes',
    title: '6. Arbitration & Governing Law',
    content: `These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of Singapore and India.
• Dispute Resolution: In the event of a dispute, controversy, or claim arising out of or relating to these Terms, the parties shall first attempt to resolve the issue amicably through corporate mediation.
• Jurisdiction: Any legal action or proceeding arising under these terms shall be subject to the exclusive jurisdiction of the competent courts of Bangalore, Karnataka, India.`
  }
]

export default async function TermsOfService() {
  let title = 'Terms of Service'
  let subtitle = 'Review the rules, policies, and conditions of our Singapore travel services.'
  let sections = FALLBACK_SECTIONS

  try {
    const fetchedPage = await client.fetch(`*[_type == "legalPage" && slug.current == "terms-of-service"][0]{
      title,
      subtitle,
      sections[]{
        id,
        title,
        content
      }
    }`)
    if (fetchedPage) {
      title = fetchedPage.title || title
      subtitle = fetchedPage.subtitle || subtitle
      if (fetchedPage.sections && fetchedPage.sections.length > 0) {
        sections = fetchedPage.sections
      }
    }
  } catch (err) {
    console.error('Error fetching Terms of Service from Sanity, using defaults:', err)
  }

  return (
    <LegalPageClient 
      title={title}
      subtitle={subtitle}
      sections={sections}
    />
  )
}

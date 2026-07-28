import LegalPageClient from '../../components/LegalPageClient'
import { client } from '../../sanity/lib/client'

const FALLBACK_SECTIONS = [
  {
    id: 'intro',
    title: 'Refund and Cancellation Policy',
    content: `This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service that you have purchased through the Platform. Under this policy:

Cancellations will only be considered if the request is made 1 days of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to such sellers / merchant(s) listed on the Platform and they have initiated the process of shipping them, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.`
  },
  {
    id: 'perishables',
    title: 'Perishable Items',
    content: `Flying Wonders does not accept cancellation requests for perishable items like flowers, eatables, etc. However, the refund / replacement can be made if the user establishes that the quality of the product delivered is not good.`
  },
  {
    id: 'damaged',
    title: 'Damaged or Defective Items',
    content: `In case of receipt of damaged or defective items, please report to our customer service team. The request would be entertained once the seller/ merchant listed on the Platform, has checked and determined the same at its own end. This should be reported within 1 days of receipt of products.

In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 1 days of receiving the product. The customer service team after looking into your complaint will take an appropriate decision.`
  },
  {
    id: 'warranty',
    title: 'Manufacturer Warranty',
    content: `In case of complaints regarding the products that come with a warranty from the manufacturers, please refer the issue to them.`
  },
  {
    id: 'processing',
    title: 'Refund Processing Time',
    content: `In case of any refunds approved by Flying Wonders, it will take 1 days for the refund to be processed to you.`
  }
]

export default async function RefundPolicy() {
  let title = 'Refund & Cancellation Policy'
  let subtitle = 'Understand cancellation timelines, rules, and refund processing for bookings.'
  let sections = FALLBACK_SECTIONS

  try {
    const fetchedPage = await client.fetch(`*[_type == "legalPage" && slug.current == "refund-policy"][0]{
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
    console.error('Error fetching Refund Policy from Sanity, using defaults:', err)
  }

  return (
    <LegalPageClient 
      title={title}
      subtitle={subtitle}
      sections={sections}
    />
  )
}

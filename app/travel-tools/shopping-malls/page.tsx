import type { Metadata } from 'next'
import { getAllShoppingMalls } from '../../../utils/shoppingMalls'
import ShoppingMallsClient from './ShoppingMallsClient'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Top Singapore Shopping Malls & Outlets Directory | Flying Wonders',
  description: 'Explore Singapore\'s best shopping malls, IMM outlet mall, Mustafa Centre, Bugis Street Market, Orchard Road, MBS, brand discounts, timings, MRT access & 9% GST refund guide.',
  keywords: [
    'Singapore shopping malls',
    'IMM outlet mall Singapore',
    'Mustafa Centre Singapore',
    'Bugis Street Market',
    'Orchard Road malls',
    'The Shoppes at Marina Bay Sands',
    'Chinatown Singapore shopping',
    'Singapore outlet stores',
    'Singapore 9% GST refund'
  ],
  openGraph: {
    title: 'Top Singapore Shopping Malls & Outlets Directory | Flying Wonders',
    description: 'Complete visitor shopping guide to Singapore’s premier retail destinations, factory clearance outlets, 24/7 superstores, and heritage markets.',
    url: 'https://flyingwonders.net/travel-tools/shopping-malls',
    siteName: 'Flying Wonders',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Singapore Shopping Malls Directory'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  alternates: {
    canonical: 'https://flyingwonders.net/travel-tools/shopping-malls'
  }
}

export default async function ShoppingMallsHubPage() {
  const malls = await getAllShoppingMalls()
  return <ShoppingMallsClient initialMalls={malls} />
}

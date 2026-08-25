import PackageList from './PackageList'
import { getLiveExchangeRate } from '../../utils/exchange'
import { getAllPackages } from '../../utils/packages'

export const metadata = {
  title: 'Singapore Tour Packages 2026 (SGD & INR Net Rates) | Flying Wonders',
  description: 'Browse curated 4D3N, 5D4N, and custom Singapore tour packages for families, couples, and B2B travel agents with dual DMC support.',
  keywords: ['Singapore Tour Packages', 'Singapore Holiday Packages 2026', 'Singapore Package from India', 'Singapore 4D3N Itinerary'],
  openGraph: {
    title: 'Singapore Tour Packages 2026 (SGD & INR Net Rates) | Flying Wonders',
    description: 'Explore curated 4D3N and 5D4N Singapore tour packages with live exchange rate calculations.',
    url: 'https://flyingwonders.net/packages',
  }
}

export const revalidate = 600

export default async function PackagesPage() {
  let exchangeRate = 74.81
  try {
    exchangeRate = await getLiveExchangeRate()
  } catch (exErr) {
    console.error('Failed to get live exchange rate:', exErr)
  }

  const packages = await getAllPackages()

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ color: 'var(--gold-accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.25em', fontSize: '0.8rem', display: 'inline-block', marginBottom: '0.75rem' }}>
          Curated Singapore Packages
        </span>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '3rem', color: 'var(--text-dark)', margin: '0 0 1rem 0' }}>
          Explore Our Packages
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', opacity: 0.8, fontSize: '1.05rem', lineHeight: 1.6 }}>
          Find the perfect Singapore experience. Review our detailed itineraries, choose your tier, and customize to delight your travelers.
        </p>
      </div>

      <PackageList initialPackages={packages} exchangeRate={exchangeRate} />
    </div>
  )
}

import { client } from '../../sanity/lib/client'
import PackageList from './PackageList'

export const revalidate = 60 // Revalidate every minute

export default async function PackagesPage() {
  const query = `*[_type == "travelPackage"]{
    _id,
    title,
    tier,
    price,
    description,
    image,
    itinerary
  }`
  
  const packages = await client.fetch(query)

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', color: 'var(--primary-blue)' }}>Explore Our Packages</h1>
      <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto', opacity: 0.8 }}>
        Find the perfect Singapore experience tailored just for you, whether you're traveling solo or seeking a premium luxury escape.
      </p>

      <PackageList initialPackages={packages} />
    </div>
  )
}

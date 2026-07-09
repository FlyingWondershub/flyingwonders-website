import Image from 'next/image'

export default function AboutPage() {
  return (
    <div>
      <section style={{ padding: '6rem 0', background: 'var(--primary-blue)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>About Us</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
            We turn every itinerary into a story worth telling.
          </p>
        </div>
      </section>

      <section style={{ padding: '6rem 0' }}>
        <div className="container" style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ color: 'var(--primary-blue)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Our Story</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.8 }}>
              Flying Wonders Private Limited is a specialist Destination Management Company (DMC) based in India & Singapore. We design and deliver premium travel experiences across Singapore, South-East Asia and beyond — for leisure groups, corporate travellers and trade partners who demand more than a standard package.
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.8 }}>
              With direct hotel partnerships, exclusive ground assets and a passionate team of travel architects, we turn every itinerary into a story worth telling.
            </p>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
              From iconic Singapore sights to hidden regional gems, Flying Wonders brings the destination to life — on time, on budget and beyond expectation.
            </p>
          </div>
          
          <div style={{ flex: '1 1 400px', position: 'relative', height: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <Image 
              src="/images/banner2.jpg" 
              alt="Jewel Changi Singapore"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

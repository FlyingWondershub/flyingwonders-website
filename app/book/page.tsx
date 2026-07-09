import BookingCustomizer from './BookingCustomizer'

export default function BookPage() {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '800px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--primary-blue)' }}>Customize Your Journey</h1>
      <p style={{ textAlign: 'center', margin: '0 auto 3rem auto', opacity: 0.8 }}>
        Design your perfect Singapore experience step by step. Our team will tailor the final itinerary to match your unique story.
      </p>
      
      <div className="glass" style={{ padding: '3rem', borderRadius: '16px' }}>
        <BookingCustomizer />
      </div>
    </div>
  )
}

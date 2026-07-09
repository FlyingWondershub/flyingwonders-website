import BookingCustomizer from './BookingCustomizer'

export default function BookPage() {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Customize Your Journey</h1>
      <p style={{ textAlign: 'center', margin: '0 auto 3rem auto', maxWidth: '600px', opacity: 0.8 }}>
        Design your perfect Singapore experience step by step. Our travel architects will tailor the final itinerary to match your unique story.
      </p>

      <BookingCustomizer />
    </div>
  )
}

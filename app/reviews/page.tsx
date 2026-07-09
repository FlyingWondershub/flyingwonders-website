import { client } from '../../sanity/lib/client'

export const revalidate = 60

export default async function ReviewsPage() {
  const query = `*[_type == "review"]{
    _id,
    authorName,
    demographic,
    content,
    rating
  }`
  
  const reviews = await client.fetch(query)

  // Seeded placeholder reviews if none exist in sanity
  const displayReviews = reviews.length > 0 ? reviews : [
    { _id: '1', authorName: 'Rahul M.', demographic: 'indian', rating: 5, content: 'Flying Wonders planned our entire family trip perfectly! The budget was respected and the experience was premium.' },
    { _id: '2', authorName: 'Priya K.', demographic: 'solo', rating: 5, content: 'As a solo traveler, safety and experience were my top priorities. The Night Safari was breathtaking!' },
    { _id: '3', authorName: 'Rajesh from Global Travels', demographic: 'travel_agent', rating: 4, content: 'A reliable DMC partner. My clients always return happy with their Singapore packages.' },
    { _id: '4', authorName: 'Amit S.', demographic: 'corporate', rating: 5, content: 'Our corporate retreat at Marina Bay was seamless thanks to the Flying Wonders team.' },
    { _id: '5', authorName: 'Neha J.', demographic: 'indian', rating: 5, content: 'The customized itinerary meant we got to see all the hidden gems of Singapore without feeling rushed.' }
  ]

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', color: 'var(--primary-blue)', marginBottom: '1rem' }}>What Our Clients Say</h1>
      <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem auto', opacity: 0.8 }}>
        Don't just take our word for it. Read the stories of travelers and partners who have experienced the magic of Flying Wonders.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {displayReviews.map((review: any) => (
          <div key={review._id} className="glass hover-lift" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{review.authorName}</h3>
              <div style={{ color: '#F59E0B' }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-blue)', fontWeight: 600, marginBottom: '1rem' }}>
              {review.demographic.replace('_', ' ')}
            </span>
            <p style={{ fontStyle: 'italic', opacity: 0.8, flexGrow: 1 }}>
              "{review.content}"
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

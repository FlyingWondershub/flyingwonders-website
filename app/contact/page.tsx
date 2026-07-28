import ContactForm from '../../components/ContactForm'
import { client } from '../../sanity/lib/client'

export default async function ContactPage() {
  let contacts = {
    officeAddress: '#74, 4th Cross, SBM Colony,\nBSK 1st Stage, Bangalore, India - 560050',
    contactPhoneSingapore: '+65 94722830',
    contactPhoneIndia: '+91 9886171251',
    contactEmail: 'info.flyingwonders@gmail.com',
    whatsappNumber: '+919886171251',
    youtubeUrl: 'https://www.youtube.com/@flyingwonders7886',
    instagramUrl: 'https://www.instagram.com/flyingwonders.sg/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61585495532807',
  }

  try {
    const fetchedContacts = await client.fetch(`*[_type == "globalContact"][0]{
      officeAddress,
      contactPhoneSingapore,
      contactPhoneIndia,
      contactEmail,
      whatsappNumber,
      youtubeUrl,
      instagramUrl,
      facebookUrl
    }`)
    if (fetchedContacts) {
      contacts = { ...contacts, ...fetchedContacts }
    }
  } catch (err) {
    console.error('Error fetching contact info from Sanity:', err)
  }

  return (
    <div>
      {/* Hero Banner */}
      <section style={{
        padding: '6rem 0 4rem 0',
        background: 'linear-gradient(135deg, var(--crimson-primary) 0%, #4a0000 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Get in Touch</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
            Have a question, partnership idea, or want a custom travel package? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container contact-grid">
          
          {/* Left: Contact Form */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Send Us a Message</h2>
            <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
              Fill out the form and our team will respond within 24 hours.
            </p>
            <ContactForm />
          </div>

          {/* Right: Contact Information */}
          <div>
            <div style={{ background: 'var(--bg-dark)', color: 'var(--text-light)', padding: '2.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Contact Information</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Office Address</div>
                    <div style={{ opacity: 0.8, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                      {contacts.officeAddress}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>📱</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Phone</div>
                    <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                      Singapore: {contacts.contactPhoneSingapore}<br/>
                      India: {contacts.contactPhoneIndia}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>✉️</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Email</div>
                    <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>{contacts.contactEmail}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>🕐</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Business Hours</div>
                    <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Mon–Sat: 9:00 AM – 7:00 PM (IST)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${contacts.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                background: '#25D366', color: 'white', padding: '1.25rem 2rem',
                borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem',
                textDecoration: 'none', transition: 'transform 0.2s ease',
              }}
            >
              <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor">
                <path d="M16 2a13 13 0 0 0-11 20l-2 7 7-2a13 13 0 1 0 6-25zM16 26a11 11 0 0 1-6-2l-1-1-4 1 1-4-1-1a11 11 0 1 1 11 7z"></path>
                <path d="M21 21c-1 1-2 1-3 1-3-1-6-4-7-7 0-1 0-2 1-3l2-1h1l2 3v1l-1 2c1 2 3 4 5 5l2-1h1l2 2v2z"></path>
              </svg>
              Chat with us on WhatsApp
            </a>

            {/* Social Links */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {contacts.youtubeUrl && <a href={contacts.youtubeUrl} target="_blank" rel="noreferrer" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }}>YouTube</a>}
              {contacts.instagramUrl && <a href={contacts.instagramUrl} target="_blank" rel="noreferrer" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }}>Instagram</a>}
              {contacts.facebookUrl && <a href={contacts.facebookUrl} target="_blank" rel="noreferrer" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }}>Facebook</a>}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

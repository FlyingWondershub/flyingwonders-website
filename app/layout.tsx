import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Flying Wonders | Premium Travel Experiences in Singapore',
  description: 'Flying Wonders Private Limited is a specialist Destination Management Company (DMC) based in India & Singapore, offering premium travel experiences.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--crimson-primary)' }}>
                  Flying Wonders
                </span>
              </div>
            </Link>
            <nav style={{ display: 'flex', gap: '2rem' }}>
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/packages" className="nav-link">Packages</Link>
              <Link href="/book" className="nav-link">Customize</Link>
              <Link href="/about" className="nav-link">About Us</Link>
              <Link href="/reviews" className="nav-link">Reviews</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
            </nav>
            <Link href="/book" className="btn btn-primary">Book Now</Link>
          </div>
        </header>

        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>

        <footer style={{ background: 'var(--bg-dark)', color: 'var(--text-light)', padding: '6rem 0 2rem 0', marginTop: '4rem', borderTop: '4px solid var(--emerald-secondary)' }}>
          <div className="container">
            {/* Lead Magnet Section */}
            <div style={{ background: 'linear-gradient(135deg, var(--crimson-primary) 0%, #4a0000 100%)', padding: '4rem 2rem', borderRadius: '16px', marginBottom: '4rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Unlock the Singapore Insider Guide.</h3>
              <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                Get exclusive itineraries, investment reports, and hidden local gems delivered weekly.
              </p>
              <form style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap' }}>
                <input 
                  type="email" 
                  placeholder="Your elite email address" 
                  required
                  style={{ flexGrow: 1, padding: '1rem 1.5rem', borderRadius: '4px', border: 'none', fontSize: '1rem', minWidth: '250px' }} 
                />
                <button type="submit" style={{ background: 'var(--gold-accent)', color: '#111', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Subscribe
                </button>
              </form>
            </div>

            {/* Standard Footer Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>Flying Wonders</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                  #74, 4th Cross, SBM Colony,<br />
                  BSK 1st Stage, Bangalore, India - 560050
                </p>
              </div>
              <div>
                <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>Contact</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                  Mobile: +65 94722830 / +91 9886171251<br />
                  Email: info.flyingwonders@gmail.com
                </p>
              </div>
              <div>
                <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>Follow Us</h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--emerald-secondary)' }}>
                  <a href="https://www.youtube.com/@flyingwonders7886" target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>YouTube</a>
                  <a href="https://www.instagram.com/flyingwonders.sg/" target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>Instagram</a>
                  <a href="https://www.facebook.com/profile.php?id=61585495532807" target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>Facebook</a>
                </div>
              </div>
            </div>
          </div>
          <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Flying Wonders Pvt Ltd. All rights reserved.
          </div>
        </footer>

        <a href="https://wa.me/919886171251" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <svg viewBox="0 0 32 32" width="32" height="32" fill="currentColor">
            <path d="M16 2a13 13 0 0 0-11 20l-2 7 7-2a13 13 0 1 0 6-25zM16 26a11 11 0 0 1-6-2l-1-1-4 1 1-4-1-1a11 11 0 1 1 11 7z"></path>
            <path d="M21 21c-1 1-2 1-3 1-3-1-6-4-7-7 0-1 0-2 1-3l2-1h1l2 3v1l-1 2c1 2 3 4 5 5l2-1h1l2 2v2z"></path>
          </svg>
        </a>
      </body>
    </html>
  )
}

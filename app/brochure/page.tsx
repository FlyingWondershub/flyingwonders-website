'use client'

import React from 'react'

export default function BrochurePage() {
  return (
    <>
      <title>Flying Wonders - B2B Singapore & Malaysia DMC Brochure</title>
      <meta name="description" content="Visual B2B Partner Brochure for Flying Wonders Singapore & Malaysia DMC." />
      {/* Import Stylesheets & Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Styled Brochure Page CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: #0A2240;
          --primary-light: #164070;
          --accent: #FFD700;
          --accent-secondary: #FF6B6B;
          --text: #1E293B;
          --text-light: #64748B;
          --bg: #F0F4F8;
          --white: #FFFFFF;
          --shadow: 0 15px 35px rgba(10, 34, 64, 0.15);
          --border-radius: 16px;
        }

        .brochure-body {
          font-family: 'Outfit', sans-serif;
          background-color: var(--bg);
          color: var(--text);
          line-height: 1.6;
          padding-bottom: 80px;
          margin: 0;
        }

        /* Hero Header Banner */
        .brochure-header {
          background: var(--white);
          padding: 20px;
          text-align: center;
          border-bottom: 2px solid #E2E8F0;
        }

        .header-logo-img {
          max-width: 450px;
          width: 100%;
          height: auto;
          display: inline-block;
        }

        .brochure-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
          text-align: center;
        }

        /* Action Bar */
        .action-bar {
          background-color: var(--white);
          padding: 15px 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid #E2E8F0;
        }

        .action-bar .brochure-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-btn {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: var(--white);
          border: none;
          padding: 10px 20px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          border-radius: 30px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
          text-decoration: none;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.5);
        }

        /* Page Definition */
        .brochure-page {
          padding: 50px 0;
          border-bottom: 1px dashed #CBD5E1;
          background-color: var(--white);
          position: relative;
        }

        .brochure-page:nth-child(odd) {
          background-color: var(--bg);
        }

        .section-title {
          font-size: 2.2rem;
          color: var(--primary);
          text-align: center;
          margin-bottom: 10px;
          font-family: 'Playfair Display', serif;
        }

        .section-caption {
          font-size: 1.1rem;
          color: var(--text-light);
          max-width: 800px;
          margin: 0 auto 20px auto;
          font-weight: 500;
          text-align: center;
        }

        /* Floating Corner Logo on the Top Right for Pages 2+ */
        .corner-logo {
          position: absolute;
          top: 25px;
          right: 25px;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          border: 3px solid #D4AF37; /* Gold border */
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          z-index: 10;
          background: var(--white);
        }

        /* Large Focused Itinerary Image Container */
        .itinerary-image-container {
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 4px solid var(--white);
          transition: transform 0.3s ease;
          max-width: 660px;
          margin: 0 auto;
        }

        .itinerary-image-container.dmc-focus-img {
          max-width: 770px;
        }

        .itinerary-image-container:hover {
          transform: scale(1.01);
        }

        .itinerary-image {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Accreditations Row style for Page 1 */
        .accreditations-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          margin: 25px auto 35px auto;
          max-width: 800px;
        }

        .accreditation-badge {
          background: #F0F4F8;
          border: 1px solid #CBD5E1;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .accreditation-badge i {
          color: #FF6B6B;
        }

        /* Contact Grid */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          text-align: center;
          margin: 20px auto 0 auto;
          max-width: 900px;
        }

        .contact-box {
          background: var(--bg);
          padding: 25px;
          border-radius: var(--border-radius);
          border: 1px solid #E2E8F0;
          text-align: center;
        }

        .contact-box h3 {
          color: var(--primary);
          margin-bottom: 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .contact-box p {
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 15px;
        }

        .social-badge {
          padding: 8px 16px;
          border-radius: 30px;
          background: var(--primary);
          color: var(--white);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .social-badge:hover {
          background: #FF6B6B;
          transform: translateY(-2px);
        }

        .qr-codes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 25px auto 0 auto;
          max-width: 900px;
          justify-items: center;
        }

        .qr-card {
          background: var(--white);
          border: 1px solid #CBD5E1;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          width: 100%;
          max-width: 170px;
        }

        .qr-img {
          width: 120px;
          height: 120px;
          margin-bottom: 10px;
          border: 1px solid #E2E8F0;
          display: inline-block;
        }

        .qr-label {
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--primary);
        }

        .acc-logos-row {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 25px;
          margin-top: 30px;
        }

        .acc-logo-img {
          max-height: 65px;
          width: auto;
          object-fit: contain;
        }

        /* Sticky Footer */
        .sticky-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #0A2240 0%, #164070 100%);
          color: var(--white);
          padding: 15px 20px;
          z-index: 1000;
          box-shadow: 0 -5px 20px rgba(10, 34, 64, 0.2);
        }

        .scroll-top-float {
          position: fixed;
          bottom: 85px;
          right: 20px;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background-color: var(--primary);
          color: var(--white);
          border: 2px solid var(--accent);
          font-size: 1.2rem;
          cursor: pointer;
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }

        .scroll-top-float:hover {
          background-color: #FF6B6B;
          transform: translateY(-3px);
        }

        .whatsapp-float {
          position: fixed;
          bottom: 140px;
          right: 20px;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background-color: #25D366;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          z-index: 999;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .whatsapp-float:hover {
          transform: scale(1.1) translateY(-3px);
        }

        .footer-container {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .footer-link {
          color: var(--white);
          text-decoration: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: var(--accent);
        }

        .footer-link i {
          font-size: 1.25rem;
        }

        .footer-link.whatsapp i {
          color: #25D366;
        }

        .print-page-footer {
          display: none;
        }

        @media (max-width: 768px) {
          .footer-container, .contact-grid, .qr-codes-grid {
            grid-template-columns: 1fr;
          }
        }

        /* PRINT AND A4 PORTRAIT OPTIMIZATION */
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding-bottom: 0 !important;
          }

          .action-bar, .sticky-footer {
            display: none !important;
          }

          .brochure-header {
            padding: 5px 0 !important;
            margin-bottom: 5px !important;
          }

          .header-logo-img {
            max-width: 260px !important;
          }

          /* Clean page-break bounds without height forcing */
          .brochure-page {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            height: auto !important;
            min-height: 100% !important;
            position: relative !important;
            box-sizing: border-box;
            padding: 20px 0 !important;
            background-color: #ffffff !important;
            border-bottom: none !important;
            display: block !important;
          }

          .brochure-container {
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 10px !important;
            display: block !important;
          }

          /* Scale down images to prevent page overflow */
          .itinerary-image-container {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            max-width: 484px !important;
            margin: 0 auto !important;
          }

          .itinerary-image {
            width: auto !important;
            height: auto !important;
            max-width: 100% !important;
            max-height: 125mm !important; /* Strict height limit to prevent page spills */
            display: block !important;
            margin: 0 auto !important;
          }

          .itinerary-image-container.dmc-focus-img {
            max-width: 572px !important;
          }

          .itinerary-image-container.dmc-focus-img .itinerary-image {
            max-height: 110mm !important; /* DMC image is slightly shorter to fit text above */
          }

          .corner-logo {
            top: 10px !important;
            right: 10px !important;
            left: auto !important;
            width: 35px !important;
            height: 35px !important;
            border: 2px solid #D4AF37 !important;
          }

          .section-title {
            font-size: 1.5rem !important;
            margin-bottom: 3px !important;
            text-align: center !important;
          }

          .section-caption {
            font-size: 0.8rem !important;
            margin-bottom: 6px !important;
            text-align: center !important;
          }

          .accreditations-row {
            margin: 10px auto 15px auto !important;
          }

          .accreditation-badge {
            padding: 4px 10px !important;
            font-size: 0.7rem !important;
          }

          /* Connect With Us print centering fixes */
          .contact-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 25px !important;
            margin-top: 25px !important;
          }

          .contact-box {
            padding: 22px !important;
          }

          .contact-box h3 {
            font-size: 1.25rem !important;
            margin-bottom: 8px !important;
          }

          .contact-box p {
            font-size: 0.95rem !important;
            margin-bottom: 5px !important;
          }

          .qr-codes-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
            margin-top: 25px !important;
          }

          .qr-card {
            padding: 10px !important;
          }

          .qr-img {
            width: 100px !important;
            height: 100px !important;
            margin-bottom: 6px !important;
          }

          .qr-label {
            font-size: 0.85rem !important;
          }

          .social-links {
            margin-top: 20px !important;
            gap: 12px !important;
          }

          .social-badge {
            padding: 8px 16px !important;
            font-size: 0.85rem !important;
          }

          .acc-logos-row {
            gap: 25px !important;
            margin-top: 25px !important;
          }

          .acc-logo-img {
            max-height: 50px !important;
          }

          /* Printed Page Footer naturally sitting at the bottom of flex column */
          .print-page-footer {
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-top: 2px solid #0A2240 !important;
            padding: 8px 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            margin-top: auto !important; /* Pushes footer to the bottom */
          }

          .print-page-footer .footer-link {
            color: #0A2240 !important;
            font-weight: 700 !important;
            font-size: 0.8rem !important;
          }

          .print-page-footer .footer-link.whatsapp i {
            color: #25D366 !important;
          }

          .scroll-top-float, .whatsapp-float {
            display: none !important;
          }
        }
      ` }} />

      <div className="brochure-body">
        {/* Header Logo */}
        <header className="brochure-header">
          <div className="brochure-container">
            <img src="/media__1784061170983.png" alt="Flying Wonders Logo" className="header-logo-img" />
          </div>
        </header>

        {/* Sticky Action Bar */}
        <div className="action-bar">
          <div className="brochure-container">
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}><i className="fa-solid fa-file-pdf"></i> Visual B2B Partner Brochure</span>
            <div>
              <button className="action-btn" onClick={() => window.print()}><i className="fa-solid fa-print"></i> Save / Print A4 PDF</button>
            </div>
          </div>
        </div>

        {/* Page 1: Corporate Profile */}
        <div className="brochure-page" style={{ paddingTop: '60px' }}>
          <div className="brochure-container">
            <h2 className="section-title" style={{ marginBottom: '25px' }}>Who We Are</h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text)', maxWidth: '850px', margin: '0 auto 20px auto', lineHeight: 1.8, fontWeight: 500, textAlign: 'center' }}>
              Established in 2012, evolved in 2016, and globally expanded in 2024, <strong>Flying Wonders</strong> operates as a Trusted Singapore Destination Management Company (DMC) with dual operational & offices in <strong>Bangalore</strong> and <strong>Singapore</strong>.
            </p>
            
            <div className="accreditations-row">
              <div className="accreditation-badge"><i className="fa-solid fa-certificate"></i> NIDHI+</div>
              <div className="accreditation-badge"><i className="fa-solid fa-certificate"></i> TAAI Allied</div>
              <div className="accreditation-badge"><i className="fa-solid fa-certificate"></i> TOA Member</div>
              <div className="accreditation-badge"><i className="fa-solid fa-certificate"></i> ISO 9001</div>
              <div className="accreditation-badge"><i className="fa-solid fa-certificate"></i> Dun & Bradstreet</div>
            </div>

            <div className="itinerary-image-container dmc-focus-img" style={{ marginTop: '65px' }}>
              <img src="/media__1784061241248.jpg" alt="Flying Wonders Singapore DMC Profile" className="itinerary-image" />
            </div>
          </div>

          <div className="print-page-footer">
            <a href="https://wa.me/919886171251" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> India: +91 98861 71251
            </a>
            <a href="http://www.flyingwonders.net" className="footer-link" target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-globe"></i> www.flyingwonders.net
            </a>
            <a href="https://wa.me/6594722830" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> Singapore: +65 9472 2830
            </a>
          </div>
        </div>

        {/* Page 2: Singapore Exotic Package */}
        <div className="brochure-page">
          <img src="/media__1784063661766.png" alt="FW Logo" className="corner-logo" />
          
          <div className="brochure-container">
            <h2 className="section-title">Singapore Exotic Package (4 Days / 3 Nights)</h2>
            <p className="section-caption">
              Complete land-only package rates (INR) based on passenger counts, fully inclusive of daily meals, coach transport, and entry passes.
            </p>
            <div className="itinerary-image-container">
              <img src="/media__1784062754010.jpg" alt="Singapore Exotic Package Rates and Itinerary" className="itinerary-image" />
            </div>
          </div>

          <div className="print-page-footer">
            <a href="https://wa.me/919886171251" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> India: +91 98861 71251
            </a>
            <a href="http://www.flyingwonders.net" className="footer-link" target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-globe"></i> www.flyingwonders.net
            </a>
            <a href="https://wa.me/6594722830" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> Singapore: +65 9472 2830
            </a>
          </div>
        </div>

        {/* Page 3: Singapore Splendor Package */}
        <div className="brochure-page">
          <img src="/media__1784063661766.png" alt="FW Logo" className="corner-logo" />

          <div className="brochure-container">
            <h2 className="section-title">Singapore Splendor Package (4 Days / 3 Nights)</h2>
            <p className="section-caption">
              Premium 4 Days / 3 Nights package options with hotel choices at Hotel Quay or Dash Living and daily multi-cuisine meals.
            </p>
            <div className="itinerary-image-container">
              <img src="/media__1784062753996.jpg" alt="Singapore Splendor Package Rates and Itinerary" className="itinerary-image" />
            </div>
          </div>

          <div className="print-page-footer">
            <a href="https://wa.me/919886171251" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> India: +91 98861 71251
            </a>
            <a href="http://www.flyingwonders.net" className="footer-link" target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-globe"></i> www.flyingwonders.net
            </a>
            <a href="https://wa.me/6594722830" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> Singapore: +65 9472 2830
            </a>
          </div>
        </div>

        {/* Page 4: Kuala Lumpur Malaysia */}
        <div className="brochure-page">
          <img src="/media__1784063661766.png" alt="FW Logo" className="corner-logo" />

          <div className="brochure-container">
            <h2 className="section-title">Kuala Lumpur Tour Packages (Malaysia)</h2>
            <p className="section-caption">
              Direct B2B land-only rates in SGD for 2N/3D and 3N/4D packages including private airport transfers, city tours, and Genting excursions.
            </p>
            <div className="itinerary-image-container">
              <img src="/media__1784062754099.jpg" alt="Kuala Lumpur Malaysia B2B Rates Sheet" className="itinerary-image" />
            </div>
          </div>

          <div className="print-page-footer">
            <a href="https://wa.me/919886171251" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> India: +91 98861 71251
            </a>
            <a href="http://www.flyingwonders.net" className="footer-link" target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-globe"></i> www.flyingwonders.net
            </a>
            <a href="https://wa.me/6594722830" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> Singapore: +65 9472 2830
            </a>
          </div>
        </div>

        {/* Page 5: Singapore Escape & Cruise */}
        <div className="brochure-page">
          <img src="/media__1784063661766.png" alt="FW Logo" className="corner-logo" />

          <div className="brochure-container">
            <h2 className="section-title">Singapore Escape & Cruise Package</h2>
            <p className="section-caption">
              Premium 3 Nights Singapore & 2 Nights Cruise combo package featuring direct ground transfers, hotel bookings, and cruise liner accommodations.
            </p>
            <div className="itinerary-image-container">
              <img src="/media__1784062754112.jpg" alt="Singapore Escape & Cruise Itinerary Map" className="itinerary-image" />
            </div>
          </div>

          <div className="print-page-footer">
            <a href="https://wa.me/919886171251" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> India: +91 98861 71251
            </a>
            <a href="http://www.flyingwonders.net" className="footer-link" target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-globe"></i> www.flyingwonders.net
            </a>
            <a href="https://wa.me/6594722830" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> Singapore: +65 9472 2830
            </a>
          </div>
        </div>

        {/* Page 6: Contact & Social QR Codes */}
        <div className="brochure-page" style={{ pageBreakAfter: 'avoid' }}>
          <img src="/media__1784063661766.png" alt="FW Logo" className="corner-logo" />

          <div className="brochure-container">
            <h2 className="section-title">Connect With Us</h2>
            <p className="section-caption">Get in touch directly with our Singapore & Bangalore DMC Desks</p>
            
            <div className="contact-grid">
              <div className="contact-box">
                <h3><i className="fa-solid fa-location-dot" style={{ color: '#FF6B6B' }}></i> India Office</h3>
                <p><strong>Flying Wonders Pvt Ltd.</strong></p>
                <p>#74, 4th Cross, SBM Colony,</p>
                <p>BSK 1st Stage, Bangalore, India - 560050</p>
                <p style={{ marginTop: '8px' }}><strong>Mob:</strong> +91 98861 71251</p>
                <p><strong>Email:</strong> contact@flyingwonders.net</p>
              </div>

              <div className="contact-box">
                <h3><i className="fa-solid fa-location-dot" style={{ color: '#FF6B6B' }}></i> Singapore Office</h3>
                <p><strong>Flying Wonders Pte Ltd.</strong></p>
                <p>#12-07, Suntec Tower One,</p>
                <p>Singapore - 038987</p>
                <p style={{ marginTop: '8px' }}><strong>Mob:</strong> +65 9472 2830</p>
                <p><strong>Email:</strong> info.flyingwonders@gmail.com</p>
              </div>
            </div>

            <div className="qr-codes-grid">
              <div className="qr-card">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=http://www.flyingwonders.net" alt="Website QR" className="qr-img" />
                <div className="qr-label">Website</div>
              </div>
              <div className="qr-card">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://www.instagram.com/flyingwonders.sg/" alt="Instagram QR" className="qr-img" />
                <div className="qr-label">Instagram</div>
              </div>
              <div className="qr-card">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://www.facebook.com/profile.php?id=61585495532807" alt="Facebook QR" className="qr-img" />
                <div className="qr-label">Facebook</div>
              </div>
            </div>

            <div className="social-links" style={{ justifyContent: 'center', marginTop: '25px' }}>
              <a href="https://www.youtube.com/@flyingwonders7886" className="social-badge" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i> YouTube</a>
              <a href="https://share.google/LExi9ZpJdKj0Q6cEu" className="social-badge" target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-map-location-dot"></i> Google Maps</a>
              <a href="https://g.page/r/CZN7G01CutMmEBM/" className="social-badge" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-google"></i> Business Profile</a>
            </div>

            <div className="acc-logos-row">
              <img src="/media__1784063885771.png" alt="Nidhi+" className="acc-logo-img" />
              <img src="/media__1784063885810.jpg" alt="TAAI" className="acc-logo-img" />
              <img src="/media__1784063934401.png" alt="TOA" className="acc-logo-img" />
              <img src="/media__1784063885761.jpg" alt="ISO 27001" className="acc-logo-img" />
              <img src="/media__1784063885689.png" alt="ISO 9001" className="acc-logo-img" />
              <img src="/media__1784063885679.png" alt="Dun & Bradstreet" className="acc-logo-img" />
            </div>
          </div>

          <div className="print-page-footer">
            <a href="https://wa.me/919886171251" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> India: +91 98861 71251
            </a>
            <a href="http://www.flyingwonders.net" className="footer-link" target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-globe"></i> www.flyingwonders.net
            </a>
            <a href="https://wa.me/6594722830" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> Singapore: +65 9472 2830
            </a>
          </div>
        </div>

        {/* Sticky Screen Footer */}
        <footer className="sticky-footer">
          <div className="footer-container">
            <a href="https://wa.me/919886171251" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> India: +91 98861 71251
            </a>
            <a href="http://www.flyingwonders.net" className="footer-link" target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-globe"></i> www.flyingwonders.net
            </a>
            <a href="https://wa.me/6594722830" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> Singapore: +65 9472 2830
            </a>
          </div>
        </footer>

        {/* Floating Action Buttons */}
        <button className="scroll-top-float" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} aria-label="Scroll to Top">▲</button>
        
        <a href="https://wa.me/919886171251" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.6rem' }}></i>
        </a>
      </div>
    </>
  )
}

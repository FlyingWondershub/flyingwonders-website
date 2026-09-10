const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function getBase64Image(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

// Source attraction photos directly from app/singapore-attractions/AttractionsForm.tsx PHOTO_MAP
const SINGAPORE_ATTRACTIONS_PHOTO_MAP = {
  universal: 'https://www.pelago.com/img/products/SG-Singapore/universal-studios-singapore-express-pass/26453e06-f8b7-4eda-badc-9cdc06a6e229_universal-studios-singapore-express-pass-xlarge.jpg',
  gardens: 'https://www.pelago.com/img/products/SG-Singapore/gardens-by-the-bay/0609-0615_jwe_gbtb_zone-03_petting-zoo_friends-group-selfie-xlarge.jpg',
  'night safari': 'https://www.pelago.com/img/products/SG-Singapore/night-safari-wildlife-park/1114-0139_night-safari-wildlife-park-singapore-pelago6-xlarge.jpg',
  'cable car': 'https://www.pelago.com/img/products/SG-Singapore/singapore-cable-car/0616-0638_1125-0343_pokémon-day-to-night-adventure-presented-by-singapore-cable-car-1-large-xlarge.jpeg',
  wings: 'https://www.pelago.com/img/products/SG-Singapore/wings-of-time--spectacular-light-water-show/0616-0636_0109-0846_1600-x-900_wotfs-(new-2025-dec)-xlarge.jpg',
  mbs: 'https://www.pelago.com/img/products/SG-Singapore/marina-bay-sands-skypark-observation-deck-new/0430-0606_marina-bay-sands-skypark-observation-deck_1-xlarge.jpg'
};

async function renderFlyer() {
  const logoImg = getBase64Image(path.join(__dirname, '../public/images/logo.png'));
  
  // Use singapore-attractions page source photos with local fallback
  const universalImg = SINGAPORE_ATTRACTIONS_PHOTO_MAP.universal || getBase64Image(path.join(__dirname, '../public/images/attractions/universal-studios-singapore/cover.jpg'));
  const nightSafariImg = SINGAPORE_ATTRACTIONS_PHOTO_MAP['night safari'] || getBase64Image(path.join(__dirname, '../public/images/attractions/night-safari-singapore/cover.jpg'));
  const gardensImg = SINGAPORE_ATTRACTIONS_PHOTO_MAP.gardens || getBase64Image(path.join(__dirname, '../public/images/attractions/gardens-by-the-bay/cover.jpg'));
  const cableCarImg = SINGAPORE_ATTRACTIONS_PHOTO_MAP['cable car'] || getBase64Image(path.join(__dirname, '../public/images/attractions/singapore-cable-car/cover.jpg'));

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    body {
      width: 1200px;
      height: 1800px;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #081224;
      color: #FFFFFF;
      position: relative;
    }

    /* ─── Premium Header (No Skyline Image — Focus on Branding & Headline) ─── */
    .header-section {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 275px;
      background: linear-gradient(180deg, #050C18 0%, #09172E 60%, #0C1E3C 100%);
      padding: 24px 50px 20px 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-bottom: 2.5px solid #D4AF37;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      z-index: 20;
    }

    .top-branding-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .agency-branding {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .agency-logo-container {
      background: #FFFFFF;
      padding: 6px 16px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 62px;
    }

    .agency-logo-container img {
      max-height: 50px;
      max-width: 160px;
      object-fit: contain;
    }

    .agency-text-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #FFFFFF;
      text-transform: uppercase;
    }

    .agency-tagline {
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #E2B755;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .dmc-badge {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
      border: 1.5px solid rgba(212, 175, 55, 0.6);
      padding: 9px 24px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #F6D884;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }

    .hero-titles-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-top: 10px;
    }

    .season-ribbon {
      background: linear-gradient(135deg, #F3D279 0%, #C9972E 50%, #E6C265 100%);
      color: #071731;
      font-size: 12.5px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 5px 18px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      margin-bottom: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .hero-headline {
      font-family: 'Cinzel', serif;
      font-size: 42px;
      font-weight: 900;
      line-height: 1.15;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: linear-gradient(180deg, #FFFFFF 20%, #F1F5F9 50%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
      margin-bottom: 4px;
    }

    .hero-subtitle {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 24px;
      font-weight: 700;
      color: #F8E29A;
      letter-spacing: 0.5px;
    }

    /* ─── Main Content Body (y: 295 to 1465 = 1170px of space!) ─── */
    .main-body {
      position: absolute;
      top: 295px;
      left: 50px;
      right: 50px;
      height: 1150px;
      z-index: 15;
      display: flex;
      gap: 36px;
    }

    /* Left Column: Day-Wise Itinerary & Inclusions + Price Card */
    .left-col {
      flex: 1.12;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .inclusions-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid rgba(212, 175, 55, 0.3);
    }

    .inclusions-header-title {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #E2B755;
      text-transform: uppercase;
    }

    .inclusions-list {
      display: flex;
      flex-direction: column;
      gap: 13px;
      flex: 1;
    }

    .inclusion-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 29, 56, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 5px solid #E2B755;
      padding: 13px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }

    .day-badge {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: linear-gradient(135deg, #091D3E 0%, #153265 100%);
      border: 1.5px solid rgba(226, 183, 85, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    }

    .day-badge-lbl {
      font-size: 9px;
      font-weight: 800;
      color: #E2B755;
      letter-spacing: 1px;
      line-height: 1;
    }

    .day-badge-num {
      font-size: 18px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.1;
    }

    .inc-details {
      display: flex;
      flex-direction: column;
    }

    .inc-title {
      font-size: 16px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      line-height: 1.25;
    }

    .inc-tag {
      font-size: 13px;
      font-weight: 600;
      margin-top: 3px;
    }

    .inc-tag.sharing {
      color: #93C5FD;
    }

    .inc-tag.private {
      color: #6EE7B7;
    }

    /* Luxury Price Badge */
    .price-card {
      margin-top: 14px;
      background: linear-gradient(135deg, #06152F 0%, #0D2654 100%);
      border: 2.5px solid #D4AF37;
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 25px rgba(212, 175, 55, 0.15);
      position: relative;
      overflow: hidden;
    }

    .price-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 60%);
      pointer-events: none;
    }

    .price-left {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #E2B755;
      text-transform: uppercase;
    }

    .price-currency {
      font-size: 24px;
      font-weight: 900;
      color: #F8E29A;
      margin-right: 6px;
    }

    .price-figure {
      font-family: 'Cinzel', serif;
      font-size: 56px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1;
      letter-spacing: -1px;
      text-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    }

    .price-right {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .price-unit {
      background: linear-gradient(135deg, #F3D279 0%, #C9972E 100%);
      color: #071731;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .price-note {
      font-size: 12px;
      color: #94A3B8;
      margin-top: 6px;
      font-weight: 600;
    }

    /* ─── Right Column: 4 Landscape Attraction Cards (No Awkward Cropping!) ─── */
    .right-col {
      flex: 1.08;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
    }

    .photo-card {
      position: relative;
      flex: 1;
      min-height: 220px;
      border-radius: 14px;
      overflow: hidden;
      border: 3.5px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
      background: #0B192C;
    }

    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      display: block;
    }

    .photo-label-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(6, 14, 28, 0.94) 100%);
      padding: 26px 16px 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .photo-label {
      font-size: 14px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.8);
    }

    .photo-tag-pill {
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid rgba(212, 175, 55, 0.6);
      color: #F8E29A;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 12px;
      letter-spacing: 1px;
    }

    /* ─── Features Badges Strip ─── */
    .features-strip {
      position: absolute;
      top: 1465px;
      left: 0;
      width: 100%;
      height: 72px;
      background: #050C18;
      border-top: 1.5px solid rgba(212, 175, 55, 0.35);
      border-bottom: 1.5px solid rgba(212, 175, 55, 0.35);
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 40px;
      z-index: 20;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .feature-icon {
      font-size: 20px;
    }

    .feature-text {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #E2E8F0;
      text-transform: uppercase;
    }

    .feature-divider {
      width: 1px;
      height: 30px;
      background: rgba(212, 175, 55, 0.3);
    }

    /* ─── Footer / Agent Details ─── */
    .footer-bar {
      position: absolute;
      top: 1537px;
      left: 0;
      width: 100%;
      height: 263px;
      background: #FFFFFF;
      color: #1E293B;
      padding: 24px 50px;
      z-index: 20;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .contact-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #E2E8F0;
    }

    .contact-pill {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .contact-icon-bg {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .contact-texts {
      display: flex;
      flex-direction: column;
    }

    .contact-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .contact-val {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
    }

    .address-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 40px;
      padding-top: 4px;
    }

    .address-col {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .address-texts {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .address-title {
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
    }

    .address-body {
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
    }

    .bottom-disclaimer {
      font-size: 10px;
      color: #94A3B8;
      text-align: center;
      border-top: 1px solid #F1F5F9;
      padding-top: 8px;
      font-weight: 500;
    }
  </style>
</head>
<body>

  <!-- Top Header Section (No Skyline Image — Focus on Logo & Headline) -->
  <div class="header-section">
    <div class="top-branding-row">
      <div class="agency-branding">
        ${logoImg ? `
        <div class="agency-logo-container">
          <img src="${logoImg}" alt="Agency Logo" />
        </div>
        ` : ''}
        <div>
          <div class="agency-text-title">FLYING WONDERS DMC</div>
          <div class="agency-tagline">SINGAPORE B2B DESTINATION SPECIALIST</div>
        </div>
      </div>
      <div class="dmc-badge">★ EXCLUSIVE DMC RATES ★</div>
    </div>

    <div class="hero-titles-row">
      <div class="season-ribbon">✨ SPECIAL PROMOTIONAL TOUR</div>
      <!-- User requested headline: Guest Name -- followed with Singapore Gateway or Singapore Tour -->
      <h1 class="hero-headline">MR. AMIT SHARMA — SINGAPORE GETAWAY</h1>
      <div class="hero-subtitle">4 Days / 3 Nights · Land Package (Without Hotels)</div>
    </div>
  </div>

  <!-- Main Body -->
  <div class="main-body">
    <!-- Left Column: Day-Wise Itinerary & Inclusions + Price Card -->
    <div class="left-col">
      <div class="inclusions-header">
        <span style="font-size: 16px;">📋</span>
        <span class="inclusions-header-title">DAY-WISE TOUR ITINERARY & INCLUSIONS</span>
      </div>

      <div class="inclusions-list">
        <!-- Day 1 -->
        <div class="inclusion-item">
          <div class="day-badge">
            <span class="day-badge-lbl">DAY</span>
            <span class="day-badge-num">01</span>
          </div>
          <div class="inc-details">
            <div class="inc-title">Return Airport Transfers</div>
            <div class="inc-tag private">Private Air-Conditioned Vehicle (Changi ⇄ Hotel)</div>
          </div>
        </div>

        <!-- Day 2 -->
        <div class="inclusion-item">
          <div class="day-badge">
            <span class="day-badge-lbl">DAY</span>
            <span class="day-badge-num">02</span>
          </div>
          <div class="inc-details">
            <div class="inc-title">Night Safari + Tram Ride</div>
            <div class="inc-tag sharing">World's 1st Nocturnal Wildlife Park (Sharing)</div>
          </div>
        </div>

        <!-- Day 3 -->
        <div class="inclusion-item">
          <div class="day-badge">
            <span class="day-badge-lbl">DAY</span>
            <span class="day-badge-num">03</span>
          </div>
          <div class="inc-details">
            <div class="inc-title">Singapore Panoramic Drive</div>
            <div class="inc-tag sharing">Merlion Park, Civic District & Marina Bay (Sharing)</div>
          </div>
        </div>

        <!-- Day 4 -->
        <div class="inclusion-item">
          <div class="day-badge">
            <span class="day-badge-lbl">DAY</span>
            <span class="day-badge-num">04</span>
          </div>
          <div class="inc-details">
            <div class="inc-title">Sentosa Cable Car + Wings of Time</div>
            <div class="inc-tag sharing">Mount Faber Sky Network & Laser Fireworks Show</div>
          </div>
        </div>

        <!-- Day 5 -->
        <div class="inclusion-item">
          <div class="day-badge">
            <span class="day-badge-lbl">DAY</span>
            <span class="day-badge-num">05</span>
          </div>
          <div class="inc-details">
            <div class="inc-title">Universal Studios Singapore</div>
            <div class="inc-tag sharing">1-Day Full Access Ticket & Thrill Rides (Sharing)</div>
          </div>
        </div>

        <!-- Day 6 -->
        <div class="inclusion-item">
          <div class="day-badge">
            <span class="day-badge-lbl">DAY</span>
            <span class="day-badge-num">06</span>
          </div>
          <div class="inc-details">
            <div class="inc-title">Gardens by the Bay</div>
            <div class="inc-tag sharing">Flower Dome + Cloud Forest Double Domes (Sharing)</div>
          </div>
        </div>
      </div>

      <!-- Price Box -->
      <div class="price-card">
        <div class="price-left">
          <div class="price-label">Special Promotional Rate</div>
          <div style="display: flex; align-items: baseline; margin-top: 2px;">
            <span class="price-currency">SGD</span>
            <span class="price-figure">315</span>
          </div>
        </div>
        <div class="price-right">
          <div class="price-unit">PER PERSON ONLY</div>
          <div class="price-note">≈ Rs. 23,565 INR / Pax</div>
        </div>
      </div>
    </div>

    <!-- Right Column: 4 Landscape Attraction Cards (Sourced from Singapore Attractions, Wide Proportions) -->
    <div class="right-col">
      <!-- 1. Night Safari -->
      <div class="photo-card">
        <img src="${nightSafariImg}" alt="Night Safari" style="object-position: center 35%;" />
        <div class="photo-label-bar">
          <div class="photo-label">Night Safari Wildlife Park</div>
          <div class="photo-tag-pill">MANDAI WILDLIFE</div>
        </div>
      </div>

      <!-- 2. Sentosa Cable Car -->
      <div class="photo-card">
        <img src="${cableCarImg}" alt="Sentosa Cable Car" style="object-position: center 40%;" />
        <div class="photo-label-bar">
          <div class="photo-label">Sentosa Island & Cable Car</div>
          <div class="photo-tag-pill">SCENIC SKY NETWORK</div>
        </div>
      </div>

      <!-- 3. Universal Studios -->
      <div class="photo-card">
        <img src="${universalImg}" alt="Universal Studios" style="object-position: center 30%;" />
        <div class="photo-label-bar">
          <div class="photo-label">Universal Studios Singapore</div>
          <div class="photo-tag-pill">THEME PARK</div>
        </div>
      </div>

      <!-- 4. Gardens by the Bay -->
      <div class="photo-card">
        <img src="${gardensImg}" alt="Gardens by the Bay" style="object-position: center 40%;" />
        <div class="photo-label-bar">
          <div class="photo-label">Gardens by the Bay Double Domes</div>
          <div class="photo-tag-pill">CLOUD FOREST & FLOWER DOME</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features Strip: With/Without Hotels, Private/Group Transfers, Guaranteed Departures, Best Price -->
  <div class="features-strip">
    <div class="feature-item">
      <span class="feature-icon">🏨</span>
      <span class="feature-text">WITHOUT HOTELS</span>
    </div>
    <div class="feature-divider"></div>
    <div class="feature-item">
      <span class="feature-icon">🚐</span>
      <span class="feature-text">PRIVATE TRANSFERS</span>
    </div>
    <div class="feature-divider"></div>
    <div class="feature-item">
      <span class="feature-icon">📅</span>
      <span class="feature-text">GUARANTEED DEPARTURES</span>
    </div>
    <div class="feature-divider"></div>
    <div class="feature-item">
      <span class="feature-icon">💰</span>
      <span class="feature-text">BEST PRICE GUARANTEED</span>
    </div>
  </div>

  <!-- Footer / Contact Card -->
  <div class="footer-bar">
    <div class="contact-row">
      <div class="contact-pill">
        <div class="contact-icon-bg">📞</div>
        <div class="contact-texts">
          <span class="contact-label">Mobile / WhatsApp</span>
          <span class="contact-val">+91 98861 71251</span>
        </div>
      </div>
      <div class="contact-pill">
        <div class="contact-icon-bg">☎️</div>
        <div class="contact-texts">
          <span class="contact-label">Singapore Direct Desk</span>
          <span class="contact-val">+65 9689 0101</span>
        </div>
      </div>
      <div class="contact-pill">
        <div class="contact-icon-bg">✉️</div>
        <div class="contact-texts">
          <span class="contact-label">Email Support</span>
          <span class="contact-val">ops@flyingwonders.com</span>
        </div>
      </div>
    </div>

    <div class="address-row">
      <div class="address-col">
        <div class="contact-icon-bg" style="width:36px; height:36px; font-size:15px;">📍</div>
        <div class="address-texts">
          <span class="address-title">Singapore Headquarters</span>
          <span class="address-body">160 Robinson Road, #14-04 SBF Center, Singapore 068914</span>
        </div>
      </div>
      <div class="address-col">
        <div class="contact-icon-bg" style="width:36px; height:36px; font-size:15px;">🇮🇳</div>
        <div class="address-texts">
          <span class="address-title">India B2B Desk</span>
          <span class="address-body">Bangalore & Delhi NCR B2B Operations Hub</span>
        </div>
      </div>
    </div>

    <div class="bottom-disclaimer">
      Rates are dynamic and subject to seasonal ticket & vehicle availability upon confirmation. White-label B2B generated proposal.
    </div>
  </div>

</body>
</html>
`;

  const outputPath = path.join(__dirname, '../sample_flyer.jpg');
  const artifactPath = 'C:\\Users\\Flying Wonders\\.gemini\\antigravity\\brain\\61d378aa-b049-4400-a34a-0df4d7e82141\\sample_flyer.jpg';

  console.log('Launching browser for test sample...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1800, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));

  console.log('Taking screenshot...');
  const buffer = await page.screenshot({
    type: 'jpeg',
    quality: 85,
    clip: { x: 0, y: 0, width: 1200, height: 1800 }
  });

  await browser.close();

  fs.writeFileSync(outputPath, buffer);
  fs.writeFileSync(artifactPath, buffer);

  const stats = fs.statSync(artifactPath);
  console.log(`Flyer generated successfully!`);
  console.log(`Saved to: ${artifactPath}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
}

renderFlyer().catch(err => {
  console.error('Error generating flyer:', err);
  process.exit(1);
});

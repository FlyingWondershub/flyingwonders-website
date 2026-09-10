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
  const heroImg = getBase64Image(path.join(__dirname, '../public/images/hero/singapore-hero-1.jpg'));
  const logoImg = getBase64Image(path.join(__dirname, '../public/images/logo.png'));
  
  // Use singapore-attractions page source photos with base64 local fallback
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

    /* Top Header Bar */
    .header-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 92px;
      background: linear-gradient(180deg, rgba(6, 14, 28, 0.98) 0%, rgba(8, 18, 36, 0.85) 100%);
      backdrop-filter: blur(8px);
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 50px;
      border-bottom: 2px solid rgba(212, 175, 55, 0.35);
    }

    .agency-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .agency-logo-container {
      background: #FFFFFF;
      padding: 6px 14px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 56px;
    }

    .agency-logo-container img {
      max-height: 44px;
      max-width: 150px;
      object-fit: contain;
    }

    .agency-text-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #FFFFFF;
      text-transform: uppercase;
    }

    .agency-tagline {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2.5px;
      color: #E2B755;
      text-transform: uppercase;
    }

    .dmc-badge {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
      border: 1.5px solid rgba(212, 175, 55, 0.6);
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #F6D884;
      text-transform: uppercase;
    }

    /* Hero Section */
    .hero-banner {
      position: absolute;
      top: 92px;
      left: 0;
      width: 100%;
      height: 485px;
      overflow: hidden;
      z-index: 10;
    }

    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
      filter: brightness(0.85) contrast(1.1);
    }

    .hero-gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, 
        rgba(8, 18, 36, 0.15) 0%, 
        rgba(8, 18, 36, 0.45) 45%, 
        rgba(8, 18, 36, 0.95) 85%, 
        #081224 100%
      );
    }

    .hero-content {
      position: absolute;
      bottom: 25px;
      left: 50px;
      right: 50px;
      z-index: 15;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    /* Season Ribbon */
    .season-ribbon {
      background: linear-gradient(135deg, #F3D279 0%, #C9972E 50%, #E6C265 100%);
      color: #071731;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 20px;
      border-radius: 4px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      margin-bottom: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Bold Title matching user requested formula: Guest Name -- followed with Singapore Gateway or Singapore Tour */
    .hero-headline {
      font-family: 'Cinzel', serif;
      font-size: 44px;
      font-weight: 900;
      line-height: 1.15;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: linear-gradient(180deg, #FFFFFF 20%, #E2E8F0 50%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
      margin-bottom: 6px;
    }

    .hero-subtitle {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 26px;
      font-weight: 700;
      color: #F8E29A;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    }

    /* Main Body (2 Columns) */
    .main-body {
      position: absolute;
      top: 575px;
      left: 50px;
      right: 50px;
      height: 875px;
      z-index: 15;
      display: flex;
      gap: 36px;
    }

    /* Left Column: Inclusions & Price */
    .left-col {
      flex: 1.15;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .inclusions-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .inclusion-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 29, 56, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 4.5px solid #E2B755;
      padding: 12px 18px;
      border-radius: 12px;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }

    .inc-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #091D3E 0%, #153265 100%);
      border: 1.5px solid rgba(226, 183, 85, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
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
      margin-top: 2px;
    }

    .inc-tag.sharing {
      color: #93C5FD;
    }

    .inc-tag.private {
      color: #6EE7B7;
    }

    /* Luxury Price Badge */
    .price-card {
      margin-top: 15px;
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
      font-size: 58px;
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

    /* Right Column: Photo Collage */
    .right-col {
      flex: 1.05;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 16px;
    }

    .photo-card {
      position: relative;
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
      display: block;
    }

    .photo-label-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(6, 14, 28, 0.92) 100%);
      padding: 24px 12px 10px 12px;
    }

    .photo-label {
      font-size: 13px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.8);
    }

    /* Features Badges Strip */
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

    /* Footer / Agent Details */
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

  <!-- Top Header Bar -->
  <div class="header-bar">
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

  <!-- Hero Section -->
  <div class="hero-banner">
    <img class="hero-bg-img" src="${heroImg}" alt="Singapore Skyline" />
    <div class="hero-gradient-overlay"></div>
    <div class="hero-content">
      <div class="season-ribbon">✨ SPECIAL PROMOTIONAL TOUR</div>
      <!-- User requested headline: Guest Name -- followed with Singapore Gateway or Singapore Tour -->
      <h1 class="hero-headline">MR. AMIT SHARMA — SINGAPORE GETAWAY</h1>
      <div class="hero-subtitle">4 Days / 3 Nights (Land Package & Transfers)</div>
    </div>
  </div>

  <!-- Main Body -->
  <div class="main-body">
    <!-- Left Column: Inclusions & Price -->
    <div class="left-col">
      <div class="inclusions-list">
        <div class="inclusion-item">
          <div class="inc-icon-circle">🚗</div>
          <div class="inc-details">
            <div class="inc-title">Return Airport Transfers</div>
            <div class="inc-tag private">Private Air-Conditioned Vehicle</div>
          </div>
        </div>

        <div class="inclusion-item">
          <div class="inc-icon-circle">🦁</div>
          <div class="inc-details">
            <div class="inc-title">Night Safari + Tram Ride</div>
            <div class="inc-tag sharing">Admission & Tram Ride Included (Sharing)</div>
          </div>
        </div>

        <div class="inclusion-item">
          <div class="inc-icon-circle">🏙️</div>
          <div class="inc-details">
            <div class="inc-title">Singapore Panoramic Drive</div>
            <div class="inc-tag sharing">Merlion Park, Civic District & Marina Bay (Sharing)</div>
          </div>
        </div>

        <div class="inclusion-item">
          <div class="inc-icon-circle">🚡</div>
          <div class="inc-details">
            <div class="inc-title">Sentosa Cable Car + Wings of Time</div>
            <div class="inc-tag sharing">Mount Faber Line & Evening Spectacular (Sharing)</div>
          </div>
        </div>

        <div class="inclusion-item">
          <div class="inc-icon-circle">🎢</div>
          <div class="inc-details">
            <div class="inc-title">Universal Studios Singapore</div>
            <div class="inc-tag sharing">1-Day Full Access Ticket (Sharing)</div>
          </div>
        </div>

        <div class="inclusion-item">
          <div class="inc-icon-circle">🌸</div>
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

    <!-- Right Column: Photo Collage -->
    <div class="right-col">
      <div class="photo-card">
        <img src="${nightSafariImg}" alt="Night Safari" />
        <div class="photo-label-bar">
          <div class="photo-label">Night Safari</div>
        </div>
      </div>

      <div class="photo-card">
        <img src="${cableCarImg}" alt="Sentosa Cable Car" />
        <div class="photo-label-bar">
          <div class="photo-label">Sentosa Island</div>
        </div>
      </div>

      <div class="photo-card">
        <img src="${universalImg}" alt="Universal Studios" />
        <div class="photo-label-bar">
          <div class="photo-label">Universal Studios</div>
        </div>
      </div>

      <div class="photo-card">
        <img src="${gardensImg}" alt="Gardens by the Bay" />
        <div class="photo-label-bar">
          <div class="photo-label">Gardens by the Bay</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features Strip -->
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

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1800, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

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

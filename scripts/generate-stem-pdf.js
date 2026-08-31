const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generatePDF() {
  const outputDir = path.join(__dirname, '..', 'public', 'brochures');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'Singapore-4D3N-STEM-School-Tour-Itinerary.pdf');

  // Convert logo to base64 if available
  let logoBase64 = '';
  const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
  if (fs.existsSync(logoPath)) {
    logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>4D3N Singapore STEM, Sustainability & Discovery Explorer</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 16mm 16mm 16mm;
      position: relative;
      background: #FFF;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Top Brand Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #093E30;
      margin-bottom: 16px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-img {
      height: 42px;
      object-fit: contain;
    }

    .brand-text h2 {
      font-size: 16px;
      font-weight: 800;
      color: #093E30;
      letter-spacing: -0.02em;
    }

    .brand-text p {
      font-size: 9px;
      font-weight: 600;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .header-badge {
      text-align: right;
      font-size: 9px;
      color: #475569;
      line-height: 1.4;
    }

    .header-badge strong {
      color: #093E30;
      font-size: 11px;
      display: block;
    }

    /* Cover Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, #05241B 0%, #093E30 60%, #0B2545 100%);
      color: #FFF;
      border-radius: 14px;
      padding: 22px 24px;
      margin-bottom: 18px;
      position: relative;
      overflow: hidden;
    }

    .hero-banner .pill {
      display: inline-block;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #FCD34D;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 8px;
    }

    .hero-banner h1 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 8px;
      color: #FFFFFF;
    }

    .hero-banner p {
      font-size: 11px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.9);
      max-width: 92%;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
    }

    .spec-item {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 8px 10px;
    }

    .spec-item .label {
      font-size: 8.5px;
      color: #A7F3D0;
      text-transform: uppercase;
      font-weight: 700;
    }

    .spec-item .value {
      font-size: 11px;
      font-weight: 800;
      color: #FFF;
      margin-top: 2px;
    }

    /* Section Headings */
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: #093E30;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #E2E8F0;
    }

    .section-title span.dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #059669;
    }

    /* Day-by-Day Cards */
    .day-card {
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      margin-bottom: 12px;
      overflow: hidden;
      background: #FFF;
    }

    .day-header {
      background: #F1F5F9;
      padding: 7px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #E2E8F0;
    }

    .day-badge {
      background: #093E30;
      color: #FFF;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .day-title {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      margin-left: 8px;
      flex: 1;
    }

    .day-theme {
      font-size: 8.5px;
      font-weight: 700;
      color: #059669;
      background: #ECFDF5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .day-body {
      padding: 10px 12px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .timeline-col {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 7px 8px;
    }

    .time-slot {
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .time-slot.morning { color: #D97706; }
    .time-slot.afternoon { color: #2563EB; }
    .time-slot.evening { color: #7C3AED; }

    .timeline-col p {
      font-size: 9px;
      color: #334155;
      line-height: 1.4;
    }

    .day-outcome {
      background: #ECFDF5;
      border-top: 1px solid #A7F3D0;
      padding: 5px 12px;
      font-size: 8.5px;
      color: #065F46;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .day-outcome strong {
      color: #047857;
      text-transform: uppercase;
      font-size: 8px;
    }

    /* Highlights & Inclusions Grid */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    .info-box {
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px;
      background: #F8FAFC;
    }

    .info-box h4 {
      font-size: 10.5px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 8px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .info-box ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-box ul li {
      font-size: 9px;
      color: #334155;
      line-height: 1.45;
      margin-bottom: 4px;
      display: flex;
      align-items: flex-start;
      gap: 5px;
    }

    .info-box ul li::before {
      content: '✓';
      color: #059669;
      font-weight: 800;
      font-size: 10px;
    }

    /* Pricing Table */
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9.5px;
      border-radius: 8px;
      overflow: hidden;
    }

    .pricing-table th {
      background: #093E30;
      color: #FFF;
      text-align: left;
      padding: 7px 10px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.05em;
    }

    .pricing-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #E2E8F0;
      background: #FFF;
      color: #1E293B;
    }

    .pricing-table tr:nth-child(even) td {
      background: #F8FAFC;
    }

    .price-tag {
      font-weight: 800;
      color: #093E30;
    }

    .price-inr {
      color: #D97706;
      font-weight: 700;
      font-size: 9px;
    }

    /* Tips for Students & Schools */
    .tips-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .tip-card {
      background: #FFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 9px;
    }

    .tip-card h5 {
      font-size: 9.5px;
      font-weight: 800;
      color: #093E30;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tip-card p {
      font-size: 8.5px;
      color: #475569;
      line-height: 1.4;
    }

    /* Footer */
    .footer-bar {
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #64748B;
    }

    .footer-bar strong {
      color: #093E30;
    }

    .footer-contacts {
      display: flex;
      gap: 14px;
    }
  </style>
</head>
<body>

  <!-- ═══════════ PAGE 1: COVER & EXECUTIVE OVERVIEW ═══════════ -->
  <div class="page">
    <div>
      <!-- Header -->
      <div class="header-bar">
        <div class="logo-container">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Flying Wonders Logo" />` : ''}
          <div class="brand-text">
            <h2>FLYING WONDERS</h2>
            <p>Singapore Destination Management Company (DMC)</p>
          </div>
        </div>
        <div class="header-badge">
          <strong>Institutional Study Series • 2026</strong>
          <span>K-12 Experiential Learning Division</span>
        </div>
      </div>

      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="pill">🌟 Official School Study Circuit</div>
        <h1>4D3N Singapore STEM, Sustainability & Discovery Explorer</h1>
        <p>
          An immersive, experiential curriculum bridging world-class science laboratories, circular water engineering, national crisis resilience simulations, and ecological biodiversity across Singapore—the world’s safest live classroom.
        </p>

        <div class="specs-grid">
          <div class="spec-item">
            <div class="label">Target Cohort</div>
            <div class="value">Schools (Grades 6–12)</div>
          </div>
          <div class="spec-item">
            <div class="label">Duration</div>
            <div class="value">4 Days / 3 Nights</div>
          </div>
          <div class="spec-item">
            <div class="label">Chaperone Ratio</div>
            <div class="value">1:10 Free Teachers</div>
          </div>
          <div class="spec-item">
            <div class="label">Starting From</div>
            <div class="value">SGD ~580 / INR ₹36.8K</div>
          </div>
        </div>
      </div>

      <!-- Core Learning Pillars of This Tour -->
      <div class="section-title">
        <span class="dot"></span>
        Core Academic Focus & Syllabus Alignment
      </div>

      <div class="grid-2">
        <div class="info-box">
          <h4>🔬 Hands-On STEM & Molecular Biology</h4>
          <ul>
            <li>Live DNA extraction and molecular sequencing inside certified Science Centre laboratories.</li>
            <li>8K Digital Omni-Theatre planetarium astrophysics & climate simulation.</li>
            <li>Kinetic Garden physics mechanics: pulleys, levers, hydraulics, and acoustic resonance.</li>
          </ul>
        </div>

        <div class="info-box">
          <h4>🌱 Urban Ecology & Circular Water Tech</h4>
          <ul>
            <li>Marina Barrage 9 crest gates and tidal flood alleviation civil engineering.</li>
            <li>Gardens by the Bay Cloud Forest mist mountain vertical farming & climate controls.</li>
            <li>Study of UN Sustainable Development Goals (SDG 6, 7, 11 & 13) in action.</li>
          </ul>
        </div>
      </div>

      <div class="grid-2">
        <div class="info-box">
          <h4>🛡️ Strategic Leadership & Defence Tech</h4>
          <ul>
            <li>Singapore Discovery Centre crisis leadership command room escape simulation.</li>
            <li>Augmented reality timeline of Singapore’s journey from colonial outpost to global hub.</li>
            <li>Cross-cultural community trails exploring Singapore’s harmonious multiculturalism.</li>
          </ul>
        </div>

        <div class="info-box">
          <h4>🐅 Wildlife Conservation & Marine Biology</h4>
          <ul>
            <li>Night Safari nocturnal wildlife behavioral study & global conservation briefing.</li>
            <li>S.E.A. Aquarium coral reef preservation & ocean ecosystem biome maintenance.</li>
            <li>Interactive reflection journals for students to document key academic takeaways.</li>
          </ul>
        </div>
      </div>

      <!-- Key Trust Callout -->
      <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 10px; font-weight: 800; color: #065F46; text-transform: uppercase;">🛡️ Uncompromising Safety & Student Welfare</div>
          <div style="font-size: 8.5px; color: #047857; margin-top: 2px;">
            24/7 on-ground Flying Wonders Tour Director • SGD 50,000 Medical & Evacuation Cover • Verified 1:10 Chaperone System • Certified Halal / Pure Vegetarian / Jain Meals.
          </div>
        </div>
        <div style="font-size: 11px; font-weight: 800; color: #059669; white-space: nowrap; padding-left: 12px;">
          100% Verified DMC
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-bar">
      <div><strong>Flying Wonders Private Limited</strong> • Singapore & Bangalore DMC</div>
      <div class="footer-contacts">
        <span>📞 +91 98861 71251</span>
        <span>🌐 flyingwonders.net/education-tours</span>
        <span>📄 Page 1 of 2</span>
      </div>
    </div>
  </div>


  <!-- ═══════════ PAGE 2: DAYWISE ITINERARY, PRICING & PRACTICAL SUGGESTIONS ═══════════ -->
  <div class="page">
    <div>
      <!-- Header -->
      <div class="header-bar">
        <div class="logo-container">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Flying Wonders Logo" />` : ''}
          <div class="brand-text">
            <h2>FLYING WONDERS</h2>
            <p>4D3N STEM, Sustainability & Discovery Explorer</p>
          </div>
        </div>
        <div class="header-badge">
          <strong>Day-by-Day Field Schedule</strong>
          <span>Detailed Daily Matrix</span>
        </div>
      </div>

      <!-- Day 1 & Day 2 -->
      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 01</span>
          <span class="day-title">Arrival, Changi Canopy Tech & Science Centre Journey</span>
          <span class="day-theme">STEM Mechanics</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>Flight arrival at Singapore Changi Airport. Jewel Rain Vortex 40m indoor waterfall engineering walkthrough.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Guided immersion at Singapore Science Centre: interactive molecular lab, DNA sequencing & Kinetic Garden.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>8K Digital Omni-Theatre planetarium astrophysics screening. Welcome group dinner (Halal/Veg/Jain).</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Hands-on physics, astrophysics, and molecular biology inside accredited laboratories.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 02</span>
          <span class="day-title">Urban Ecology, Water Security & Gardens by the Bay</span>
          <span class="day-theme">Sustainability Tech</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>Marina Barrage: Study 9 crest gates, tidal pump mechanics, and Sustainable Singapore Gallery 6 eco-zones.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Gardens by the Bay (Cloud Forest & Flower Dome): mist climate engineering, vertical botany & rare biodiversity.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Spectra Light & Water Show at Marina Bay Sands waterfront promenade. Night reflection debrief.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Understand closed-loop urban water catchment and tropical bio-dome climate controls.
        </div>
      </div>

      <!-- Day 3 & Day 4 -->
      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 03</span>
          <span class="day-title">National Resilience, Defence Tech & Night Safari</span>
          <span class="day-theme">Crisis Leadership & Wildlife</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>Singapore Discovery Centre: AR history trail and Crisis Simulation leadership escape room exercises.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Chinatown & Little India cultural heritage scavenger hunt with local multi-ethnic history modules.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Guided tram tour and nocturnal habitat preservation briefing at world-famous Night Safari.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Crisis leadership under pressure, cross-cultural heritage, and nocturnal fauna conservation.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 04</span>
          <span class="day-title">Ocean Tech at S.E.A. Aquarium Sentosa & Departure</span>
          <span class="day-theme">Oceanography & Reflection</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>S.E.A. Aquarium at Resorts World Sentosa: marine ecosystem engineering & shark conservation briefing.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Souvenir stop at Bugis Street / Jewel Changi. Capstone presentation and certificate award ceremony.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Private coach transit to Changi Airport for departure flight with certified tour certificates.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Marine conservation, global trade logistics, and tour capstone portfolio consolidation.
        </div>
      </div>

      <!-- Investment & Inclusions Matrix -->
      <div class="section-title">
        <span class="dot"></span>
        Investment, Inclusions & Practical Suggestions
      </div>

      <table class="pricing-table">
        <thead>
          <tr>
            <th>Accommodation Category</th>
            <th>Room Configuration</th>
            <th>Per Student (SGD)</th>
            <th>Approx. Per Student (INR)</th>
            <th>Chaperones (1:10)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Youth Hostel / Student Hub</strong></td>
            <td>Quad-Share Ensuite</td>
            <td class="price-tag">SGD ~580</td>
            <td class="price-inr">₹36,830</td>
            <td><strong>100% FREE</strong></td>
          </tr>
          <tr>
            <td><strong>3-Star Hotel (Lavender/Bugis)</strong></td>
            <td>Twin / Triple Share</td>
            <td class="price-tag">SGD ~725</td>
            <td class="price-inr">₹46,030</td>
            <td><strong>100% FREE</strong></td>
          </tr>
          <tr>
            <td><strong>4-Star Hotel (Novotel/Orchard)</strong></td>
            <td>Executive Twin Share</td>
            <td class="price-tag">SGD ~920</td>
            <td class="price-inr">₹58,420</td>
            <td><strong>100% FREE</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Suggestions for School Students & Coordinators -->
      <div class="tips-grid">
        <div class="tip-card">
          <h5>🎒 Packing & Climate</h5>
          <p>Tropical climate (28°–32°C). Pack lightweight breathable cottons, comfortable sneakers, light sweater for AC labs, and reusable water bottle.</p>
        </div>
        <div class="tip-card">
          <h5>🔌 Electronics & Notes</h5>
          <p>UK 3-pin (Type G) plug adapter, power bank, and a dedicated STEM notebook or digital tablet for workshop worksheets.</p>
        </div>
        <div class="tip-card">
          <h5>📋 Coordinator Checklist</h5>
          <p>Passport validity 6+ months, SG Arrival Card (SGAC submitted 3 days prior), emergency contact list, and dietary dietary preference list.</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-bar">
      <div><strong>To Customize This Tour:</strong> contact@flyingwonders.net • WhatsApp: +91 98861 71251 / +65 8304 8408</div>
      <div class="footer-contacts">
        <span>Office: Singapore & Bangalore</span>
        <span>📄 Page 2 of 2</span>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  console.log("Launching Puppeteer browser...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  console.log("Generating high-resolution PDF...");
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  await browser.close();
  console.log(`✅ PDF successfully generated at: ${outputPath}`);
}

generatePDF().catch(err => {
  console.error("❌ PDF generation failed:", err);
});

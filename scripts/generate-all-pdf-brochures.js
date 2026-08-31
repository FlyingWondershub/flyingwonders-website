const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateAllPDFs() {
  const outputDir = path.join(__dirname, '..', 'public', 'brochures');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Convert logo to base64
  let logoBase64 = '';
  const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
  if (fs.existsSync(logoPath)) {
    logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  }

  console.log("Launching Puppeteer browser...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Base CSS styles shared across all brochures
  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
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
    .page:last-child { page-break-after: avoid; }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #093E30;
      margin-bottom: 16px;
    }
    .logo-container { display: flex; align-items: center; gap: 12px; }
    .logo-img { height: 42px; object-fit: contain; }
    .brand-text h2 { font-size: 16px; font-weight: 800; color: #093E30; letter-spacing: -0.02em; }
    .brand-text p { font-size: 9px; font-weight: 600; color: #059669; text-transform: uppercase; letter-spacing: 0.08em; }
    .header-badge { text-align: right; font-size: 9px; color: #475569; line-height: 1.4; }
    .header-badge strong { color: #093E30; font-size: 11px; display: block; }

    .hero-banner {
      color: #FFF;
      border-radius: 14px;
      padding: 22px 24px;
      margin-bottom: 18px;
      position: relative;
      overflow: hidden;
    }
    .hero-banner .pill {
      display: inline-block;
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
    .hero-banner p { font-size: 11px; line-height: 1.5; color: rgba(255, 255, 255, 0.9); max-width: 92%; }

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
    .spec-item .label { font-size: 8.5px; text-transform: uppercase; font-weight: 700; }
    .spec-item .value { font-size: 11px; font-weight: 800; color: #FFF; margin-top: 2px; }

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
    .section-title span.dot { width: 8px; height: 8px; border-radius: 50%; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .info-box { border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; background: #F8FAFC; }
    .info-box h4 { font-size: 10.5px; font-weight: 800; color: #0F172A; margin-bottom: 8px; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
    .info-box ul { list-style: none; padding: 0; margin: 0; }
    .info-box ul li { font-size: 9px; color: #334155; line-height: 1.45; margin-bottom: 4px; display: flex; align-items: flex-start; gap: 5px; }
    .info-box ul li::before { content: '✓'; font-weight: 800; font-size: 10px; }

    .day-card {
      border: 1px solid #CBD5E1;
      border-radius: 9px;
      margin-bottom: 9px;
      overflow: hidden;
      background: #FFF;
    }
    .day-header {
      background: #F1F5F9;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #E2E8F0;
    }
    .day-badge { color: #FFF; font-size: 8.5px; font-weight: 800; padding: 2px 7px; border-radius: 4px; }
    .day-title { font-size: 10.5px; font-weight: 800; color: #0F172A; margin-left: 8px; flex: 1; }
    .day-theme { font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }

    .day-body {
      padding: 8px 12px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }
    .timeline-col {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 6px 7px;
    }
    .time-slot { font-size: 8px; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
    .time-slot.morning { color: #D97706; }
    .time-slot.afternoon { color: #2563EB; }
    .time-slot.evening { color: #7C3AED; }
    .timeline-col p { font-size: 8.5px; color: #334155; line-height: 1.38; }

    .day-outcome {
      padding: 4px 12px;
      font-size: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .day-outcome strong { text-transform: uppercase; font-size: 7.5px; }

    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 9px;
      border-radius: 8px;
      overflow: hidden;
    }
    .pricing-table th {
      color: #FFF;
      text-align: left;
      padding: 6px 10px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8px;
      letter-spacing: 0.05em;
    }
    .pricing-table td { padding: 6px 10px; border-bottom: 1px solid #E2E8F0; background: #FFF; color: #1E293B; }
    .pricing-table tr:nth-child(even) td { background: #F8FAFC; }
    .price-tag { font-weight: 800; }
    .price-inr { color: #D97706; font-weight: 700; font-size: 8.5px; }

    .tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
    .tip-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; }
    .tip-card h5 { font-size: 9px; font-weight: 800; margin-bottom: 3px; }
    .tip-card p { font-size: 8px; color: #475569; line-height: 1.35; }

    .footer-bar {
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #64748B;
    }
    .footer-bar strong { color: #093E30; }
    .footer-contacts { display: flex; gap: 14px; }
  `;

  // ═════════════════════════════════════════════════════════════════
  // BROCHURE 2: 5D4N Future Tech, Design & Top University Immersion
  // ═════════════════════════════════════════════════════════════════
  const collegeTechHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>5D4N Future Tech, Design & Top University Immersion</title>
  <style>
    ${sharedStyles}
    .hero-banner { background: linear-gradient(135deg, #091E3A 0%, #1E3A8A 55%, #0284C7 100%); }
    .hero-banner .pill { background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.5); color: #7DD3FC; }
    .spec-item .label { color: #BAE6FD; }
    .section-title span.dot { background: #0284C7; }
    .info-box ul li::before { color: #0284C7; }
    .day-badge { background: #1E3A8A; }
    .day-theme { color: #0284C7; background: #E0F2FE; }
    .day-outcome { background: #F0F9FF; border-top: 1px solid #BAE6FD; color: #0369A1; }
    .day-outcome strong { color: #0284C7; }
    .pricing-table th { background: #1E3A8A; }
    .price-tag { color: #1E3A8A; }
    .tip-card h5 { color: #1E3A8A; }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="page">
    <div>
      <div class="header-bar">
        <div class="logo-container">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Flying Wonders Logo" />` : ''}
          <div class="brand-text">
            <h2>FLYING WONDERS</h2>
            <p>Higher Education & Tech Immersion Division</p>
          </div>
        </div>
        <div class="header-badge">
          <strong>University & College Series • 2026</strong>
          <span>Engineering, Tech & Design Cohorts</span>
        </div>
      </div>

      <div class="hero-banner">
        <div class="pill">⚡ Top University & Future Tech Circuit</div>
        <h1>5D4N Future Tech, Design & Top University Immersion</h1>
        <p>
          A premier academic circuit for Engineering, Computer Science, Architecture, and Design students. Experience world-class research at NUS (#8 World) and NTU (#15 World), hands-on MIT FabLab 3D additive manufacturing at SUTD, and Southeast Asia’s startup engine BLOCK71.
        </p>

        <div class="specs-grid">
          <div class="spec-item">
            <div class="label">Target Cohort</div>
            <div class="value">College & Engineering</div>
          </div>
          <div class="spec-item">
            <div class="label">Duration</div>
            <div class="value">5 Days / 4 Nights</div>
          </div>
          <div class="spec-item">
            <div class="label">Faculty Ratio</div>
            <div class="value">1:10 Free Faculty Slots</div>
          </div>
          <div class="spec-item">
            <div class="label">Starting From</div>
            <div class="value">SGD ~725 / INR ₹46.0K</div>
          </div>
        </div>
      </div>

      <div class="section-title">
        <span class="dot"></span>
        Core Academic Focus & Laboratory Modules
      </div>

      <div class="grid-2">
        <div class="info-box">
          <h4>🎓 Elite Campus Research & Faculty Briefings</h4>
          <ul>
            <li>NUS University Town (UTown), Faculty of Computing & Engineering research labs.</li>
            <li>NTU The Hive smart eco-campus designed by Thomas Heatherwick & ADM green architecture.</li>
            <li>Direct briefings on competitive postgraduate admissions, research grants, and GRE/GMAT pathways.</li>
          </ul>
        </div>

        <div class="info-box">
          <h4>🚀 BLOCK71 Deep-Tech Startup Incubation</h4>
          <ul>
            <li>Exclusive immersion inside BLOCK71—Southeast Asia’s Silicon Valley startup ecosystem.</li>
            <li>Interaction with founder teams in artificial intelligence, robotics, biotech, and Web3.</li>
            <li>Deconstruct the transition of university research patents into commercial tech unicorns.</li>
          </ul>
        </div>
      </div>

      <div class="grid-2">
        <div class="info-box">
          <h4>📐 MIT-SUTD FabLab 3D Prototyping Sprint</h4>
          <ul>
            <li>Hands-on SLA 3D printing, laser cutting, and rapid CAD prototyping workshop.</li>
            <li>Design Thinking case study solving real-world smart city mobility challenges.</li>
            <li>Review of multi-disciplinary engineering systems (ESD) and product development (EPD).</li>
          </ul>
        </div>

        <div class="info-box">
          <h4>🌐 Smart Nation Urban Engineering & NEWater</h4>
          <ul>
            <li>URA 3D Masterplan Gallery analyzing digital twins and autonomous vehicle testbeds.</li>
            <li>NEWater Plant: Industrial reverse osmosis and microfiltration membrane technology.</li>
            <li>CleanTech One & Energy Research Institute (ERI@N) solar telemetry analysis.</li>
          </ul>
        </div>
      </div>

      <div style="background: #F0F9FF; border: 1.5px solid #7DD3FC; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 10px; font-weight: 800; color: #0369A1; text-transform: uppercase;">🛡️ Professional Academic Ground Support</div>
          <div style="font-size: 8.5px; color: #0284C7; margin-top: 2px;">
            24/7 Dedicated Tour Director • Official Certificate of Completion for Academic Portfolios • SGD 50,000 Medical Evacuation Cover • Custom Dietary Menus.
          </div>
        </div>
        <div style="font-size: 11px; font-weight: 800; color: #0284C7; white-space: nowrap; padding-left: 12px;">
          100% Accredited DMC
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div><strong>Flying Wonders Private Limited</strong> • Singapore & Bangalore DMC</div>
      <div class="footer-contacts">
        <span>📞 +91 98861 71251</span>
        <span>🌐 flyingwonders.net/education-tours</span>
        <span>📄 Page 1 of 2</span>
      </div>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div>
      <div class="header-bar">
        <div class="logo-container">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Flying Wonders Logo" />` : ''}
          <div class="brand-text">
            <h2>FLYING WONDERS</h2>
            <p>5D4N Future Tech, Design & Top University Immersion</p>
          </div>
        </div>
        <div class="header-badge">
          <strong>Day-by-Day Field Schedule</strong>
          <span>Detailed Daily Matrix</span>
        </div>
      </div>

      <!-- 5 Days Schedule -->
      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 01</span>
          <span class="day-title">Arrival & Singapore Smart Nation Urban Planning Walk</span>
          <span class="day-theme">Smart City IoT</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>Touchdown at Singapore Changi Airport. Private AC coach transfer to student hotel check-in.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>URA Singapore City Gallery: 3D scale model, digital masterplan, and autonomous vehicle telemetry.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Marina Bay Financial District walk studying smart transit sensors and automated cooling grids.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> High-density urban architecture, IoT digital infrastructure, and smart city governance.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 02</span>
          <span class="day-title">NUS Kent Ridge Immersion & BLOCK71 Deep-Tech Ecosystem</span>
          <span class="day-theme">NUS Top-10 World & AI</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>NUS Kent Ridge: Tour UTown, Yale-NUS library, and faculty of computing/engineering AI labs.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>NUS Enterprise BLOCK71: Meet startup founders and attend venture scaling & patent briefings.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Interactive networking dinner with current international university scholars and researchers.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Direct insight into elite university admissions, commercial IP tech scaling, and venture funding.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 03</span>
          <span class="day-title">SUTD MIT-Design FabLab Prototyping & NEWater Reclamation</span>
          <span class="day-theme">Design Thinking & Water Tech</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>SUTD (Singapore University of Technology & Design): SLA 3D printing & FabLab prototyping sprint.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>NEWater Plant: Industrial microfiltration and reverse osmosis membrane purification walkthrough.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Dinner at Lau Pa Sat Satay Street followed by Helix Bridge structural engineering observation.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Apply human-centric design thinking sprint and analyze advanced circular water purification.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 04</span>
          <span class="day-title">NTU "The Hive" Green Campus & CleanTech Park</span>
          <span class="day-theme">Green Tech & Aerospace</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>NTU Campus: Thomas Heatherwick’s "The Hive" flipped classrooms, ADM green roof & satellite labs.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Jurong CleanTech Park & Singapore Science Centre Future AI robotics wing.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Clarke Quay river cruise studying historic trading quays and Singapore River cleanup ecology.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Evaluate green building standards, frontier aerospace satellite labs, and AI robotics.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 05</span>
          <span class="day-title">Academic Capstone Debrief, Certification & Departure</span>
          <span class="day-theme">Synthesis & Flight</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>Student syndicate case presentations on Singapore Smart Nation frameworks. Certificate ceremony.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Free time at Jewel Changi Canopy Park / airport check-in assistance.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Departure flight to home country with academic attendance credentials.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Consolidate comparative technical frameworks for academic credit and career portfolios.
        </div>
      </div>

      <!-- Pricing -->
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
            <th>Faculty (1:10)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Student Hub / Youth Hostel</strong></td>
            <td>Quad-Share Ensuite</td>
            <td class="price-tag">SGD ~725</td>
            <td class="price-inr">₹46,030</td>
            <td><strong>100% FREE</strong></td>
          </tr>
          <tr>
            <td><strong>3-Star Hotel (Lavender/Bugis)</strong></td>
            <td>Twin / Triple Share</td>
            <td class="price-tag">SGD ~870</td>
            <td class="price-inr">₹55,245</td>
            <td><strong>100% FREE</strong></td>
          </tr>
          <tr>
            <td><strong>4-Star Premium (Novotel/Orchard)</strong></td>
            <td>Executive Twin Share</td>
            <td class="price-tag">SGD ~1,045</td>
            <td class="price-inr">₹66,350</td>
            <td><strong>100% FREE</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Suggestions -->
      <div class="tips-grid">
        <div class="tip-card">
          <h5>💻 Laptops & CAD Tools</h5>
          <p>Bring personal laptops/tablets for the SUTD FabLab design sprint and case study workshops.</p>
        </div>
        <div class="tip-card">
          <h5>👔 Smart-Casual Dress Code</h5>
          <p>Collar shirts / trousers recommended for university faculty briefings and BLOCK71 founder meetings.</p>
        </div>
        <div class="tip-card">
          <h5>📋 Academic Portfolios</h5>
          <p>Take notes and photos for college credit reports, capstone presentations, and LinkedIn credentials.</p>
        </div>
      </div>
    </div>

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

  // ═════════════════════════════════════════════════════════════════
  // BROCHURE 3: 5D4N Global Business, FinTech & Supply Chain Immersion
  // ═════════════════════════════════════════════════════════════════
  const mbaBusinessHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>5D4N Global Business, FinTech & Supply Chain Immersion</title>
  <style>
    ${sharedStyles}
    .hero-banner { background: linear-gradient(135deg, #1C1917 0%, #78350F 55%, #D97706 100%); }
    .hero-banner .pill { background: rgba(251, 191, 36, 0.2); border: 1px solid rgba(251, 191, 36, 0.5); color: #FDE68A; }
    .spec-item .label { color: #FEF3C7; }
    .section-title span.dot { background: #D97706; }
    .info-box ul li::before { color: #D97706; }
    .day-badge { background: #78350F; }
    .day-theme { color: #92400E; background: #FEF3C7; }
    .day-outcome { background: #FFFBEB; border-top: 1px solid #FDE68A; color: #92400E; }
    .day-outcome strong { color: #D97706; }
    .pricing-table th { background: #78350F; }
    .price-tag { color: #78350F; }
    .tip-card h5 { color: #78350F; }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="page">
    <div>
      <div class="header-bar">
        <div class="logo-container">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Flying Wonders Logo" />` : ''}
          <div class="brand-text">
            <h2>FLYING WONDERS</h2>
            <p>Executive & MBA Immersion Division</p>
          </div>
        </div>
        <div class="header-badge">
          <strong>Executive Study Series • 2026</strong>
          <span>MBA, Post-Graduate & Business Cohorts</span>
        </div>
      </div>

      <div class="hero-banner">
        <div class="pill">📈 Flagship MBA & Executive Circuit</div>
        <h1>5D4N Global Business, FinTech & Supply Chain Immersion</h1>
        <p>
          An executive study tour for MBA, MIM, and PGDM cohorts. Deconstruct Singapore’s status as Asia’s capital markets and treasury HQ through Wharton-modeled pedagogy at SMU, automated megaport logistics at PSA Tuas Port, and masterclasses at NUS Business School.
        </p>

        <div class="specs-grid">
          <div class="spec-item">
            <div class="label">Target Cohort</div>
            <div class="value">MBA & Business Schools</div>
          </div>
          <div class="spec-item">
            <div class="label">Duration</div>
            <div class="value">5 Days / 4 Nights</div>
          </div>
          <div class="spec-item">
            <div class="label">Dean/Faculty Ratio</div>
            <div class="value">1:10 Complimentary Slots</div>
          </div>
          <div class="spec-item">
            <div class="label">Starting From</div>
            <div class="value">SGD ~920 / INR ₹58.4K</div>
          </div>
        </div>
      </div>

      <div class="section-title">
        <span class="dot"></span>
        Core Strategic & Executive Learning Modules
      </div>

      <div class="grid-2">
        <div class="info-box">
          <h4>📊 SMU Wharton Pedagogy & Bloomberg Trading</h4>
          <ul>
            <li>Singapore Management University (SMU) Lee Kong Chian School of Business seminar.</li>
            <li>Simulated financial trading room session analyzing foreign exchange and multi-asset risk.</li>
            <li>Monetary Authority of Singapore (MAS) FinTech sandboxes and digital banking regulatory models.</li>
          </ul>
        </div>

        <div class="info-box">
          <h4>🚢 PSA Tuas Mega Port & AI Supply Chains</h4>
          <ul>
            <li>Exclusive briefing on Tuas Mega Port—the world’s largest fully automated container terminal.</li>
            <li>Automated Guided Vehicles (AGVs), predictive AI logistics, and maritime route resilience.</li>
            <li>Analysis of global trade hub operations managing over 37 million TEUs annually.</li>
          </ul>
        </div>
      </div>

      <div class="grid-2">
        <div class="info-box">
          <h4>🌏 NUS Business School Asian Strategy Masterclass</h4>
          <ul>
            <li>Faculty lecture on ASEAN market entry strategies and cross-border M&A frameworks.</li>
            <li>Corporate ESG transformation, decarbonization mandates, and carbon credit trading.</li>
            <li>Deconstruct why 80% of Fortune 500 companies maintain regional headquarters in Singapore.</li>
          </ul>
        </div>

        <div class="info-box">
          <h4>🤝 Executive Networking & Corporate HQ Trails</h4>
          <ul>
            <li>Marina Bay Financial Centre (MBFC) and Tanjong Pagar FinTech incubator walkthrough.</li>
            <li>Executive networking reception with Singapore-based alumni, CFOs, and venture capitalists.</li>
            <li>Syndicate capstone case presentations with formal executive certification.</li>
          </ul>
        </div>
      </div>

      <div style="background: #FFFBEB; border: 1.5px solid #FCD34D; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 10px; font-weight: 800; color: #92400E; text-transform: uppercase;">🛡️ Executive Ground Handling & Concierge</div>
          <div style="font-size: 8.5px; color: #B45309; margin-top: 2px;">
            Executive 4-Star Accommodations • Dedicated Private Coach & Senior Tour Directors • High-Level Corporate Entry Passes • Fine Dining & Dietary Compliance.
          </div>
        </div>
        <div style="font-size: 11px; font-weight: 800; color: #D97706; white-space: nowrap; padding-left: 12px;">
          100% Executive DMC
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div><strong>Flying Wonders Private Limited</strong> • Singapore & Bangalore DMC</div>
      <div class="footer-contacts">
        <span>📞 +91 98861 71251</span>
        <span>🌐 flyingwonders.net/education-tours</span>
        <span>📄 Page 1 of 2</span>
      </div>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div>
      <div class="header-bar">
        <div class="logo-container">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Flying Wonders Logo" />` : ''}
          <div class="brand-text">
            <h2>FLYING WONDERS</h2>
            <p>5D4N Global Business, FinTech & Supply Chain Immersion</p>
          </div>
        </div>
        <div class="header-badge">
          <strong>Day-by-Day Executive Schedule</strong>
          <span>Detailed Daily Matrix</span>
        </div>
      </div>

      <!-- 5 Days Schedule -->
      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 01</span>
          <span class="day-title">Arrival & Singapore Economic Transformation Overview</span>
          <span class="day-theme">Economic Architecture</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>Touchdown in Singapore. Executive coach transit to downtown 4-star business hotel.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Orientation briefing on Singapore’s transition into Asia’s treasury and multinational HQ hub.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Executive welcome dinner overlooking the world's most dense financial district at Marina Bay.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Legal, tax, and governance foundations that make Singapore the #1 ease of doing business hub.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 02</span>
          <span class="day-title">SMU Case Study Pedagogy & FinTech Masterclass</span>
          <span class="day-theme">FinTech & Capital Markets</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>SMU Campus: Executive seminar on Asian Capital Markets, ASEAN digital economy, and FinTech.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Visit to a Singapore FinTech / Web3 accelerator hub in Tanjong Pagar & IIE incubation space.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Networking cocktail reception with Singapore-based alumni, CFOs, and venture capitalists.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Monetary authority sandboxes, cross-border payment rails, and venture equity financing.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 03</span>
          <span class="day-title">PSA World-Class Automated Port & Logistics Operations</span>
          <span class="day-theme">Supply Chain Automation</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>PSA Singapore: Exclusive briefing on Tuas Mega Port automation, AGVs, and AI supply chain.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Jurong Island & Petrochemical logistics overview / URA Masterplan commercial land use review.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Executive dinner and debrief on global trade route resilience and maritime energy transitions.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Mega-hub multimodal supply chain mechanics handling over 37 million TEUs annually.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 04</span>
          <span class="day-title">NUS Business School Masterclass & ESG Strategies</span>
          <span class="day-theme">Corporate ESG & Decarbonization</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>NUS Business School (Mochtar Riady Building): Lecture on sustainable models & Asian ESG frameworks.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Marina Barrage & Sentosa Carbon-Neutral tourism district corporate case inspection.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Gala farewell dinner with executive attendance certificates awarded by tour directors.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Deconstruct corporate ESG transformation and decarbonization strategies in emerging markets.
        </div>
      </div>

      <div class="day-card">
        <div class="day-header">
          <span class="day-badge">DAY 05</span>
          <span class="day-title">Executive Capstone Syndicate Presentation & Departure</span>
          <span class="day-theme">Capstone Synthesis</span>
        </div>
        <div class="day-body">
          <div class="timeline-col">
            <div class="time-slot morning">🌅 Morning</div>
            <p>Group syndicate case presentations summarizing key business learnings and strategic entry models.</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot afternoon">☀️ Afternoon</div>
            <p>Corporate shopping and transit to Changi International Airport (Jewel experience).</p>
          </div>
          <div class="timeline-col">
            <div class="time-slot evening">🌙 Evening</div>
            <p>Flight departure to home destination.</p>
          </div>
        </div>
        <div class="day-outcome">
          <strong>Learning Outcome:</strong> Synthesize actionable market entry and operational frameworks for executive management roles.
        </div>
      </div>

      <!-- Pricing -->
      <div class="section-title">
        <span class="dot"></span>
        Investment, Inclusions & Practical Suggestions
      </div>

      <table class="pricing-table">
        <thead>
          <tr>
            <th>Accommodation Category</th>
            <th>Room Configuration</th>
            <th>Per Delegate (SGD)</th>
            <th>Approx. Per Delegate (INR)</th>
            <th>Dean / Faculty (1:10)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>3-Star Business Hotel</strong></td>
            <td>Twin / Triple Share</td>
            <td class="price-tag">SGD ~920</td>
            <td class="price-inr">₹58,420</td>
            <td><strong>100% FREE</strong></td>
          </tr>
          <tr>
            <td><strong>4-Star Executive Hotel (Novotel/MBFC)</strong></td>
            <td>Executive Twin Share</td>
            <td class="price-tag">SGD ~1,120</td>
            <td class="price-inr">₹71,120</td>
            <td><strong>100% FREE</strong></td>
          </tr>
          <tr>
            <td><strong>5-Star Luxury Corporate (Marina Bay)</strong></td>
            <td>Single / Executive Twin</td>
            <td class="price-tag">SGD ~1,380</td>
            <td class="price-inr">₹87,630</td>
            <td><strong>100% FREE</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Suggestions -->
      <div class="tips-grid">
        <div class="tip-card">
          <h5>👔 Business Formal Attire</h5>
          <p>Suits / blazers required for SMU and corporate HQ visits, business casual for campus tours.</p>
        </div>
        <div class="tip-card">
          <h5>🤝 Networking Essentials</h5>
          <p>Keep digital business cards / updated LinkedIn profiles ready for evening alumni receptions.</p>
        </div>
        <div class="tip-card">
          <h5>📊 Pre-Tour Case Reading</h5>
          <p>Review MAS regulatory sandbox frameworks and PSA port automation whitepapers in advance.</p>
        </div>
      </div>
    </div>

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

  // Render Brochure 2
  const collegeTechPath = path.join(outputDir, 'Singapore-5D4N-College-Tech-Tour-Itinerary.pdf');
  const page2 = await browser.newPage();
  await page2.setContent(collegeTechHtml, { waitUntil: 'networkidle0' });
  await page2.pdf({ path: collegeTechPath, format: 'A4', printBackground: true, margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' } });
  console.log(`✅ College Tech PDF generated at: ${collegeTechPath}`);

  // Render Brochure 3
  const mbaBusinessPath = path.join(outputDir, 'Singapore-5D4N-MBA-Business-Tour-Itinerary.pdf');
  const page3 = await browser.newPage();
  await page3.setContent(mbaBusinessHtml, { waitUntil: 'networkidle0' });
  await page3.pdf({ path: mbaBusinessPath, format: 'A4', printBackground: true, margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' } });
  console.log(`✅ MBA Business PDF generated at: ${mbaBusinessPath}`);

  await browser.close();
  console.log("🎉 All 3 PDF Brochures generated successfully!");
}

generateAllPDFs().catch(err => {
  console.error("❌ PDF generation failed:", err);
});

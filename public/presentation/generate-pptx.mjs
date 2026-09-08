import pptxgen from 'pptxgenjs';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5

const C_DARK_BG = '0F172A';
const C_GOLD = 'D4AF37';
const C_CRIMSON = 'B83A4B';
const C_GREEN = '0F4C3A';
const C_LIGHT = 'E2E8F0';
const F_HEADING = 'Playfair Display';
const F_BODY = 'Inter';

const baseObjects = [
    { rect: { x: 0, y: 0, w: '100%', h: 0.04, fill: { color: C_GOLD } } },
    { text: { text: 'flyingwonders.net', options: { x: 0.5, y: 7.1, w: 3, fontSize: 10, color: '64748B', fontFace: F_BODY } } }
];

pres.defineSlideMaster({
    title: 'MASTER_DARK',
    background: { color: C_DARK_BG },
    objects: baseObjects,
    slideNumber: { x: 12.5, y: 7.1, color: '64748B', fontSize: 10, fontFace: F_BODY }
});

pres.defineSlideMaster({
    title: 'MASTER_ACCENT',
    background: { color: C_DARK_BG },
    objects: [
        { rect: { x: 0, y: 0, w: 0.2, h: '100%', fill: { color: C_GOLD } } },
        ...baseObjects
    ],
    slideNumber: { x: 12.5, y: 7.1, color: '64748B', fontSize: 10, fontFace: F_BODY }
});

pres.defineSlideMaster({
    title: 'MASTER_CTA',
    background: { color: C_GOLD },
    objects: [
        { rect: { x: 0, y: 0, w: '100%', h: 0.04, fill: { color: C_DARK_BG } } },
        { text: { text: 'flyingwonders.net', options: { x: 0.5, y: 7.1, w: 3, fontSize: 10, color: C_DARK_BG, fontFace: F_BODY } } }
    ],
    slideNumber: { x: 12.5, y: 7.1, color: C_DARK_BG, fontSize: 10, fontFace: F_BODY }
});

const addTitle = (slide, text) => {
    slide.addText(text, { x: 0.5, y: 0.5, w: 12.33, h: 0.8, fontSize: 36, color: C_GOLD, fontFace: F_HEADING, bold: true });
};

// SLIDE 1
let slide = pres.addSlide({ masterName: 'MASTER_DARK' });
slide.addText('FLYING WONDERS', { x: 0, y: 2.5, w: '100%', h: 1, align: 'center', fontSize: 64, color: C_GOLD, fontFace: F_HEADING, bold: true });
slide.addText('Premier Singapore DMC & B2B Travel Agent Partner', { x: 0, y: 3.8, w: '100%', h: 0.5, align: 'center', fontSize: 24, color: C_LIGHT, fontFace: F_BODY });
slide.addText('Your Complete Wholesale Travel Technology Platform', { x: 0, y: 4.4, w: '100%', h: 0.5, align: 'center', fontSize: 20, color: C_LIGHT, fontFace: F_BODY, italic: true });
slide.addText('🇸🇬 Singapore • 🇮🇳 Bangalore', { x: 0, y: 6.0, w: '100%', h: 0.5, align: 'center', fontSize: 16, color: C_LIGHT, fontFace: F_BODY });
slide.addText('September 2026', { x: 0, y: 6.3, w: '100%', h: 0.5, align: 'center', fontSize: 14, color: '64748B', fontFace: F_BODY });

// SLIDE 2
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "The B2B Travel Agent's Daily Struggle");
const s2Texts = [
    "❌ Waiting 24-48 hours for DMC quotations",
    "❌ OTA commissions capped at 8-12% — thin margins",
    "❌ Client sees OTA brand, not YOUR brand",
    "❌ 2-4% forex fees on every international transaction",
    "❌ No real-time attraction availability or instant tickets"
];
s2Texts.forEach((t, i) => {
    slide.addText(t, { x: 1, y: 2 + i * 0.9, w: 11, h: 0.6, fill: { color: '1E293B' }, color: C_LIGHT, fontSize: 20, fontFace: F_BODY, align: 'left', valign: 'middle', margin: [0, 0, 0, 20] });
    slide.addShape(pres.ShapeType.rect, { x: 1, y: 2 + i * 0.9, w: 0.1, h: 0.6, fill: { color: C_CRIMSON } });
});

// SLIDE 3
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Where Does Flying Wonders Fit?");
slide.addTable([
    [{ text: 'Traditional DMC', options: { fontSize: 24, color: C_LIGHT, fill: '1E293B', fontFace: F_HEADING, align: 'center' } },
     { text: 'Online OTAs', options: { fontSize: 24, color: C_LIGHT, fill: '1E293B', fontFace: F_HEADING, align: 'center' } },
     { text: 'Flying Wonders', options: { fontSize: 24, color: C_DARK_BG, fill: C_GOLD, fontFace: F_HEADING, align: 'center', bold: true } }]
], { x: 0.5, y: 1.5, w: 12.33, h: 0.8 });
slide.addTable([
    [{ text: "❌ Slow\n❌ Manual emails\n❌ No tech\n✅ Good ground ops", options: { fontSize: 18, color: C_LIGHT, fill: '1E293B' } },
     { text: "✅ Fast booking\n❌ Zero branding\n❌ Thin margins\n❌ No customization", options: { fontSize: 18, color: C_LIGHT, fill: '1E293B' } },
     { text: "✅ Instant quotes\n✅ Your brand\n✅ Unlimited markup\n✅ Full ground ops\n✅ Tech + Human", options: { fontSize: 20, color: C_LIGHT, fill: '1E293B', bold: true } }]
], { x: 0.5, y: 2.3, w: 12.33, h: 4, colW: [4.11, 4.11, 4.11], align: 'center', valign: 'middle', border: { pt: 2, color: C_GOLD } });

// SLIDE 4
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "One DMC. Two Countries. Zero Middlemen.");
slide.addText([
    { text: "• 20+ years of operational excellence\n", options: { bullet: true } },
    { text: "• Dual Headquarters in SG & IN\n", options: { bullet: true } },
    { text: "• Licensed ground operator\n", options: { bullet: true } },
    { text: "• Singapore, India, Malaysia specialist", options: { bullet: true } }
], { x: 0.5, y: 2, w: 6, h: 4, fontSize: 24, color: C_LIGHT, fontFace: F_BODY, lineSpacing: 40 });
const s4Stats = ["20+ Years", "100+ Attractions", "9+ Packages", "3 Countries"];
s4Stats.forEach((t, i) => {
    slide.addText(t, { x: 7, y: 2 + (i%2)*2, w: 2.5, h: 1.5, fill: '1E293B', color: C_GOLD, fontSize: 24, fontFace: F_HEADING, bold: true, align: 'center', valign: 'middle', ...(i>1 && {x: 10}) });
});

// SLIDE 5
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Built on Trust & Transparency");
const s5Badges = ["GST Registered", "Pvt Ltd Company", "Licensed Tour Operator", "PDPA/GDPR Compliant", "Insured Operations", "24/7 Crisis Desk"];
s5Badges.forEach((t, i) => {
    let row = Math.floor(i / 3);
    let col = i % 3;
    slide.addText(t, { x: 1 + col * 3.8, y: 2.5 + row * 2, w: 3.5, h: 1.2, fill: C_GREEN, color: C_LIGHT, fontSize: 20, fontFace: F_BODY, bold: true, align: 'center', valign: 'middle', rectRadius: 0.2 });
});

// SLIDE 6
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "Your Brand. Your Client. Our Execution.");
slide.addText("Upload your logo once — every proposal, PDF, and WhatsApp quote displays YOUR brand", { x: 0.5, y: 1.2, w: 12, fontSize: 18, color: C_LIGHT, fontFace: F_BODY, italic: true });
slide.addText("BEFORE:\nPowered by Flying Wonders", { x: 1, y: 2, w: 5, h: 2, fill: '1E293B', color: '64748B', fontSize: 24, fontFace: F_BODY, align: 'center', valign: 'middle' });
slide.addText("AFTER:\nYOUR BRAND HERE", { x: 7, y: 2, w: 5, h: 2, fill: C_GOLD, color: C_DARK_BG, fontSize: 28, fontFace: F_HEADING, bold: true, align: 'center', valign: 'middle' });
slide.addText("• White-label PDFs\n• Branded WhatsApp quotes\n• Your contact on vouchers\n• Client never sees FW", { x: 1, y: 4.5, w: 11, h: 2, fontSize: 22, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 7
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "Set Your Own Margins. No Caps. No Limits.");
slide.addText("Package Net Cost: S$600/person", { x: 1, y: 2, w: 5, h: 0.8, fill: '1E293B', color: C_LIGHT, fontSize: 20, align: 'center', valign: 'middle' });
slide.addText("Your Markup: S$150/person", { x: 1, y: 3, w: 5, h: 0.8, fill: C_GOLD, color: C_DARK_BG, fontSize: 20, bold: true, align: 'center', valign: 'middle' });
slide.addText("Client Pays: S$750/person", { x: 1, y: 4, w: 5, h: 0.8, fill: '1E293B', color: C_LIGHT, fontSize: 20, align: 'center', valign: 'middle' });
slide.addText("4 Pax × S$150 = S$600 YOUR PROFIT", { x: 1, y: 5.2, w: 11, h: 1, color: C_GOLD, fontSize: 32, fontFace: F_HEADING, bold: true, align: 'center' });
slide.addText("OTA: 8-12% (S$48-72)", { x: 7, y: 2, w: 5, h: 1.3, fill: C_CRIMSON, color: C_LIGHT, fontSize: 24, align: 'center', valign: 'middle' });
slide.addText("FW Unlimited (S$150+)", { x: 7, y: 3.5, w: 5, h: 1.3, fill: C_GREEN, color: C_LIGHT, fontSize: 24, bold: true, align: 'center', valign: 'middle' });

// SLIDE 8
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "Instant Attraction Tickets. Live Stock. Zero Wait.");
slide.addText("• Direct API • Real-time stock • 100+ attractions", { x: 0.5, y: 1.2, w: 12, fontSize: 20, color: C_LIGHT, fontFace: F_BODY, italic: true });
const s8Cards = [
    { n: "Universal Studios SG", s: "Remaining: 47" },
    { n: "Night Safari", s: "Remaining: 128" },
    { n: "Gardens by the Bay", s: "Available" },
    { n: "Cable Car", s: "Open Dated" }
];
s8Cards.forEach((c, i) => {
    slide.addText(`${c.n}\n${c.s}`, { x: 0.5 + i * 3.1, y: 2.5, w: 2.9, h: 2, fill: '1E293B', color: C_LIGHT, fontSize: 20, fontFace: F_HEADING, align: 'center', valign: 'middle', border: { type: 'solid', color: C_GOLD, pt: 1 } });
});
slide.addText("Barcoded PDF e-vouchers delivered INSTANTLY", { x: 0, y: 5.5, w: '100%', h: 1, align: 'center', fontSize: 28, color: C_GREEN, fontFace: F_HEADING, bold: true });

// SLIDE 9
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "Pay in ₹ Rupees. Zero Forex. Zero Fees.");
slide.addText("Build quote ➔ Client pays agent ➔ Agent pays FW via UPI ➔ FW issues vouchers", { x: 0.5, y: 2, w: 12.33, h: 1, fill: C_GOLD, color: C_DARK_BG, fontSize: 22, bold: true, align: 'center', valign: 'middle' });
slide.addText("Supported: ICICI UPI QR, Google Pay, PhonePe, Paytm, Bank Transfer, Cashfree", { x: 0.5, y: 4, w: 12.33, h: 1, fontSize: 20, color: C_LIGHT, align: 'center' });
slide.addText("Save ₹2,000-4,000 per booking vs credit card forex", { x: 0.5, y: 5.5, w: 12.33, h: 1, fontSize: 28, color: C_GREEN, fontFace: F_HEADING, bold: true, align: 'center' });

// SLIDE 10
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "India Convenience. Singapore Execution.");
slide.addText("🇮🇳 INDIA", { x: 1, y: 2, w: 5, h: 0.8, fill: C_CRIMSON, color: C_LIGHT, fontSize: 28, bold: true, align: 'center', valign: 'middle' });
slide.addText("IST hours\nHindi/English\nGST invoicing\nUPI", { x: 1, y: 2.8, w: 5, h: 2.2, fill: '1E293B', color: C_LIGHT, fontSize: 22, align: 'center', valign: 'middle' });
slide.addText("🇸🇬 SINGAPORE", { x: 7, y: 2, w: 5, h: 0.8, fill: C_GREEN, color: C_LIGHT, fontSize: 28, bold: true, align: 'center', valign: 'middle' });
slide.addText("24/7 Operations\nLicensed guides\nOwn fleet\nAirport meet\nCrisis desk", { x: 7, y: 2.8, w: 5, h: 2.2, fill: '1E293B', color: C_LIGHT, fontSize: 22, align: 'center', valign: 'middle' });
slide.addText('"Your clients get SG expertise. You get Indian convenience."', { x: 0, y: 5.5, w: '100%', h: 1, fontSize: 28, color: C_GOLD, fontFace: F_HEADING, italic: true, align: 'center' });

// SLIDE 11
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "6 Verticals. 6 Revenue Streams. 1 Partner.");
const s11Cards = ["Singapore Leisure", "Education Tours", "Corporate MICE", "Study in SG", "Travel Insurance", "Karnataka Heritage"];
s11Cards.forEach((c, i) => {
    let row = Math.floor(i / 3);
    let col = i % 3;
    slide.addText(c, { x: 1 + col * 3.8, y: 2.5 + row * 2, w: 3.5, h: 1.5, fill: '1E293B', color: C_GOLD, fontSize: 24, fontFace: F_HEADING, bold: true, align: 'center', valign: 'middle', border: { pt: 2, color: C_GOLD } });
});

// SLIDE 12
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "flyingwonders.net — Your Digital Storefront");
slide.addText("URL: flyingwonders.net/", { x: 0.5, y: 1.5, w: 12, fontSize: 20, color: C_GOLD, fontFace: F_BODY });
slide.addText("• Cinematic hero\n• Itinerary of Wonders bento grid\n• Package carousel with live SGD/INR\n• WhatsApp widget", { x: 0.5, y: 2.5, w: 12, h: 2.5, fontSize: 22, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });
slide.addText("Tip: Share the homepage with clients — it sells Singapore for you", { x: 0.5, y: 6, w: 12, fontSize: 24, color: C_GREEN, fontFace: F_HEADING, italic: true });

// SLIDE 13
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "9 Ready-Made Package Tiers");
const s13Table = [
    [{ text: "Package", options: { bold: true } }, { text: "Duration", options: { bold: true } }, { text: "From (SGD)", options: { bold: true } }],
    ["Exotic", "4D3N", "S$600"], ["Explorer Classic", "5D4N", "S$850"], ["Solo Private", "4D3N", "S$1000"],
    ["Marvelous", "5D4N", "S$900+"], ["Great Value", "4D3N", "S$550+"], ["SG Classics", "5D4N", "S$725"],
    ["SG Basics", "5D4N", "S$625"], ["SG Premier", "5D4N", "S$985"], ["Genting Cruise", "5N6D", "S$1200+"]
];
slide.addTable(s13Table, { x: 1, y: 1.5, w: 11.33, h: 4.5, colW: [5, 3, 3.33], fontSize: 16, color: C_LIGHT, fill: '1E293B', border: { pt: 1, color: C_GOLD } });
slide.addText("Note: All prices NET agent rates. Add your markup freely.", { x: 1, y: 6.2, w: 11, fontSize: 18, color: C_GOLD, italic: true });

// SLIDE 14
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Every Package = A Complete Selling Tool");
slide.addText("• Day-by-day itinerary\n• Hotel tiers\n• Transfer types\n• Meal plans\n• Inclusions/exclusions\n• Dual currency\n• Booking button", { x: 1, y: 2, w: 11, h: 4, fontSize: 24, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 15
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Complete Singapore & Malaysia Inventory");
const s15Cards = ["Hotels (3★-5★)", "Attractions (100+)", "Dining (Indian/Halal/Jain)", "Tours & Transport"];
s15Cards.forEach((c, i) => {
    slide.addText(c, { x: 1 + i * 2.8, y: 3, w: 2.6, h: 2, fill: '1E293B', color: C_GOLD, fontSize: 22, fontFace: F_HEADING, bold: true, align: 'center', valign: 'middle', border: { pt: 2, color: C_GOLD } });
});

// SLIDE 16
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Your B2B Command Center");
slide.addText("URL: flyingwonders.net/agent-portal", { x: 0.5, y: 1.5, w: 12, fontSize: 20, color: C_GOLD, fontFace: F_BODY });
slide.addText("• Email OTP login\n• Agency branding upload\n• KPI dashboard\n• Proposal tracker\n• Package builder launch\n• Saved bookings", { x: 1, y: 2.5, w: 11, h: 4, fontSize: 22, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 17 - STAR
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "The 9,000-Line Quotation Engine");
slide.addText("Build. Brand. Price. Deliver. In 3 Minutes.", { x: 0.5, y: 1.5, w: 12, fontSize: 24, color: C_LIGHT, fontFace: F_BODY, italic: true });
slide.addText("Day-by-day matrix | Hotel tiers | Vehicle allocation | Attraction pricing | Meal plans | Markup controls", { x: 0.5, y: 2.5, w: 12.33, h: 1, fill: '1E293B', color: C_LIGHT, fontSize: 20, align: 'center', valign: 'middle' });
slide.addText("EXPORT OPTIONS:", { x: 0.5, y: 4, w: 12, fontSize: 20, color: C_GOLD, bold: true });
slide.addText("White-Label PDF | WhatsApp Quote | Excel Export | UPI Payment Link", { x: 0.5, y: 4.5, w: 12.33, h: 1.5, fill: C_GREEN, color: C_LIGHT, fontSize: 24, bold: true, align: 'center', valign: 'middle' });

// SLIDE 18
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "⏱️ The 3-Minute Challenge");
const s18Steps = ["0:00 Open builder", "0:30 Select hotel/transfers", "1:00 Add attractions", "1:30 Add meals", "2:00 Set markup", "2:30 Review totals", "3:00 Generate PDF ✅"];
s18Steps.forEach((s, i) => {
    slide.addText(s, { x: 0.5 + i * 1.8, y: 3, w: 1.7, h: 1.5, fill: '1E293B', color: C_LIGHT, fontSize: 16, align: 'center', valign: 'middle', border: { pt: 1, color: C_GOLD } });
});
slide.addText("Your brand. Your price. Our execution.", { x: 0, y: 5.5, w: '100%', h: 1, fontSize: 32, color: C_GOLD, fontFace: F_HEADING, bold: true, align: 'center' });

// SLIDE 19 - STAR
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "Real-Time Wholesale Attraction Tickets");
slide.addText("Select attraction & date ➔ See LIVE stock ➔ Checkout = instant voucher", { x: 0.5, y: 2, w: 12.33, h: 1, fill: C_GOLD, color: C_DARK_BG, fontSize: 24, bold: true, align: 'center', valign: 'middle' });
slide.addText("• Direct supplier API\n• Multi-SKU\n• Open-dated support\n• Real-time stock", { x: 1, y: 4, w: 11, h: 2, fontSize: 22, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 20
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Build Multi-Attraction Quotes Instantly");
slide.addText("• 100+ searchable\n• Cart calculator\n• Live SGD➔INR\n• Area filtering\n• WhatsApp inquiry", { x: 1, y: 2, w: 11, h: 4, fontSize: 24, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 21
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Wholesale Rates in Seconds");
slide.addText("Hotel rates | Airport transfers | Tour pricing | Inter-city transfers", { x: 0.5, y: 2.5, w: 12.33, h: 1.5, fill: '1E293B', color: C_GOLD, fontSize: 26, fontFace: F_HEADING, align: 'center', valign: 'middle' });
slide.addText("No email required", { x: 0.5, y: 5, w: 12.33, fontSize: 28, color: C_LIGHT, italic: true, align: 'center' });

// SLIDE 22
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Find New Business — Live Agent RFQs");
slide.addText("• Real-time WhatsApp inquiries\n• AI-categorized\n• Filter by destination\n• WhatsApp alerts\n• Respond directly", { x: 1, y: 2, w: 11, h: 4, fontSize: 24, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 23
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Network with Verified DMCs Worldwide");
slide.addText("• Verified agents across 7 regions\n• Self-service profiles\n• vCard QR\n• Shortlist export", { x: 1, y: 2, w: 11, h: 4, fontSize: 24, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 24
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "12+ Free Tools for You & Your Clients");
const s24Tools = ["SGAC", "MDAC", "Air Suvidha", "Border Cameras", "Flight Radar", "Visa Checker", "Currency Converter", "Meal Estimator", "Age Calculator", "Packing List", "Travel News", "GST Calculator"];
s24Tools.forEach((t, i) => {
    let row = Math.floor(i / 4);
    let col = i % 4;
    slide.addText(t, { x: 1 + col * 2.8, y: 2 + row * 1.5, w: 2.5, h: 1, fill: '1E293B', color: C_LIGHT, fontSize: 18, align: 'center', valign: 'middle', border: { pt: 1, color: C_GOLD } });
});

// SLIDE 25
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "High-Margin Education Tour Vertical");
slide.addText("Schools (STEM) | Colleges (NTU/SUTD) | MBA (NUS/SMU)", { x: 0.5, y: 2, w: 12.33, h: 1, fill: C_GREEN, color: C_LIGHT, fontSize: 24, bold: true, align: 'center', valign: 'middle' });
slide.addText("Agent benefits:\n• 1:10 chaperone ratio\n• Dietary management\n• Insurance\n• PDF brochures", { x: 1, y: 3.5, w: 11, h: 3, fontSize: 22, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });

// SLIDE 26
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Outsourced Corporate Travel Management");
slide.addText("T1 Standard: INR 500/trip", { x: 1, y: 2, w: 11.33, h: 1, fill: '1E293B', color: C_LIGHT, fontSize: 24, align: 'center', valign: 'middle' });
slide.addText("T2 Full: $500-$1200/mo", { x: 1, y: 3.5, w: 11.33, h: 1, fill: '1E293B', color: C_LIGHT, fontSize: 24, align: 'center', valign: 'middle' });
slide.addText("T3 Strategic: $2000+/mo", { x: 1, y: 5, w: 11.33, h: 1, fill: C_GOLD, color: C_DARK_BG, fontSize: 24, bold: true, align: 'center', valign: 'middle' });

// SLIDE 27
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "India Inbound: Karnataka Heritage & Nature");
slide.addText("HOHO Bus | Mysore Palace | Hampi UNESCO | Coorg | Ooty | Tirupati VIP", { x: 0.5, y: 3, w: 12.33, h: 1.5, fill: C_CRIMSON, color: C_LIGHT, fontSize: 26, fontFace: F_HEADING, align: 'center', valign: 'middle' });

// SLIDE 28
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Add-On Revenue: Instant Travel Insurance");
slide.addText("• Dynamic calculator\n• Schengen-compliant\n• Multi-traveler\n• Instant issuance", { x: 1, y: 2, w: 11, h: 2.5, fontSize: 22, color: C_LIGHT, fontFace: F_BODY, bullet: true, lineSpacing: 35 });
slide.addText("Easy ₹500-2,000 add-on per booking", { x: 0.5, y: 5.5, w: 12.33, fontSize: 28, color: C_GOLD, bold: true, align: 'center' });

// SLIDE 29
slide = pres.addSlide({ masterName: 'MASTER_ACCENT' });
addTitle(slide, "Why Agents Choose Flying Wonders");
slide.addText("Flying Wonders vs Klook/Pelago vs MakeMyTrip vs Traditional DMC", { x: 0.5, y: 3, w: 12.33, h: 1, fontSize: 24, color: C_LIGHT, align: 'center' });
slide.addText("FW stands out across 8 core features with gold standard service.", { x: 0.5, y: 4, w: 12.33, h: 1, fontSize: 20, color: C_GOLD, italic: true, align: 'center' });

// SLIDE 30
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "What Can You Earn?");
slide.addText("Solo Agent\n5 × ₹5K = ₹27,500/mo", { x: 1, y: 2.5, w: 3.5, h: 2.5, fill: '1E293B', color: C_LIGHT, fontSize: 24, align: 'center', valign: 'middle', border: { pt: 2, color: C_GOLD } });
slide.addText("Small Agency\n20 × ₹5K = ₹1,25,000/mo", { x: 4.9, y: 2.5, w: 3.5, h: 2.5, fill: '1E293B', color: C_LIGHT, fontSize: 24, align: 'center', valign: 'middle', border: { pt: 2, color: C_GOLD } });
slide.addText("Volume Partner\n₹3-5 lakhs/mo", { x: 8.8, y: 2.5, w: 3.5, h: 2.5, fill: C_GREEN, color: C_LIGHT, fontSize: 28, bold: true, align: 'center', valign: 'middle', border: { pt: 2, color: C_GOLD } });

// SLIDE 31
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "When to Sell Singapore");
slide.addText("Peak (Dec, Jan, Jun, Jul)", { x: 1, y: 2, w: 11.33, h: 1, fill: C_CRIMSON, color: C_LIGHT, fontSize: 24, align: 'center', valign: 'middle' });
slide.addText("Shoulder (Mar, Apr, Sep, Oct)", { x: 1, y: 3.5, w: 11.33, h: 1, fill: C_GOLD, color: C_DARK_BG, fontSize: 24, align: 'center', valign: 'middle' });
slide.addText("Value (Feb, May, Aug, Nov)", { x: 1, y: 5, w: 11.33, h: 1, fill: C_GREEN, color: C_LIGHT, fontSize: 24, align: 'center', valign: 'middle' });

// SLIDE 32
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Step-by-Step: Booking a Package");
slide.addText("1. Browse ➔ 2. Select ➔ 3. Customize ➔ 4. Fill form ➔ 5. Pay UPI ➔ 6. Receive vouchers", { x: 0.5, y: 3, w: 12.33, h: 1.5, fill: '1E293B', color: C_LIGHT, fontSize: 24, fontFace: F_HEADING, align: 'center', valign: 'middle', border: { pt: 1, color: C_GOLD } });

// SLIDE 33
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Step-by-Step: Wholesale E-Ticketing");
slide.addText("Go to attractions-live ➔ Verify OTP ➔ Select attraction/date ➔ Choose qty ➔ Instant PDF voucher", { x: 0.5, y: 2.5, w: 12.33, h: 1.5, fill: '1E293B', color: C_LIGHT, fontSize: 22, align: 'center', valign: 'middle' });
slide.addText("Total time: Under 60 seconds", { x: 0.5, y: 5, w: 12.33, fontSize: 28, color: C_GREEN, bold: true, align: 'center' });

// SLIDE 34
slide = pres.addSlide({ masterName: 'MASTER_DARK' });
addTitle(slide, "Step-by-Step: Agent Onboarding");
slide.addText("Sign up ➔ Upload logo ➔ Open builder ➔ Build itinerary ➔ Generate PDF ➔ Track bookings", { x: 0.5, y: 2.5, w: 12.33, h: 1.5, fill: '1E293B', color: C_LIGHT, fontSize: 22, align: 'center', valign: 'middle' });
slide.addText("Total setup: Under 5 minutes", { x: 0.5, y: 5, w: 12.33, fontSize: 28, color: C_GOLD, bold: true, align: 'center' });

// SLIDE 35 - CTA
slide = pres.addSlide({ masterName: 'MASTER_CTA' });
slide.addText("Start Earning Today", { x: 0.5, y: 1, w: 12.33, h: 1, fontSize: 48, color: C_DARK_BG, fontFace: F_HEADING, bold: true, align: 'center' });
slide.addText("1. Sign Up ➔ 2. Upload Logo ➔ 3. Build Quote ➔ 4. Sell ➔ 5. Earn", { x: 0.5, y: 2.5, w: 12.33, h: 1, fontSize: 24, color: C_DARK_BG, fontFace: F_BODY, align: 'center' });
slide.addText("Contact: SG +65 94722830 | IN +91 9886171251 | email | WhatsApp\nAddress: #74, 4th Cross, SBM Colony, BSK, Bangalore 560050", { x: 0.5, y: 4, w: 12.33, h: 1, fontSize: 20, color: C_DARK_BG, align: 'center' });
slide.addText("Sign Up as B2B Partner | Schedule 1-on-1 Demo | Download PDF", { x: 0.5, y: 5.5, w: 12.33, h: 1, fill: C_DARK_BG, color: C_GOLD, fontSize: 24, bold: true, align: 'center', valign: 'middle' });
slide.addText("YouTube | Instagram | Facebook", { x: 0.5, y: 6.8, w: 12.33, h: 0.5, fontSize: 16, color: C_DARK_BG, align: 'center' });
slide.addText("© 2026 Flying Wonders Pvt Ltd", { x: 0.5, y: 7.1, w: 12.33, h: 0.3, fontSize: 10, color: C_DARK_BG, align: 'center' });

pres.writeFile({ fileName: 'c:\\website\\public\\presentation\\b2b-partner-deck.pptx' })
    .then(fileName => {
        console.log(`Successfully generated presentation: ${fileName}`);
    })
    .catch(err => {
        console.error(err);
    });

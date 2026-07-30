require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-07-09',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

async function getSheetAttractions() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=csv';
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const dataLines = lines.slice(1);
  const items = [];

  for (const line of dataLines) {
    let parts = [];
    let currentPart = '';
    let insideQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { insideQuote = !insideQuote; }
      else if (char === ',' && !insideQuote) { parts.push(currentPart.trim()); currentPart = ''; }
      else { currentPart += char; }
    }
    parts.push(currentPart.trim());
    if (parts.length >= 1 && parts[0]) {
      const name = parts[0].replace(/^\"|\"$/g, '').trim();
      if (name) items.push(name);
    }
  }
  return items;
}

function getCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes('universal') || lower.includes('luge') || lower.includes('flyer') || lower.includes('cable car') || lower.includes('duck')) return 'Theme Parks';
  if (lower.includes('gardens') || lower.includes('safari') || lower.includes('zoo') || lower.includes('bird') || lower.includes('river wonders') || lower.includes('flower dome')) return 'Nature';
  if (lower.includes('mbs') || lower.includes('sky park') || lower.includes('science') || lower.includes('artscience') || lower.includes('museum')) return 'Culture';
  if (lower.includes('ifly') || lower.includes('zip') || lower.includes('climb') || lower.includes('adventure')) return 'Adventure';
  if (lower.includes('kidsstop') || lower.includes('icecream') || lower.includes('snow') || lower.includes('tussauds') || lower.includes('canopy')) return 'Family';
  return 'Other';
}

function getKeyword(name) {
  const words = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ') || name.toLowerCase().slice(0, 15);
}

async function run() {
  const sheetItems = await getSheetAttractions();
  console.log(`Found ${sheetItems.length} items from Google Sheet.`);

  console.log('Fetching existing attractionMeta documents from Sanity...');
  const existing = await client.fetch('*[_type == "attractionMeta"]');
  console.log(`Found ${existing.length} existing documents. Deleting all...`);

  const deleteTx = client.transaction();
  for (const doc of existing) {
    deleteTx.delete(doc._id);
  }
  await deleteTx.commit();
  console.log('All previous documents deleted.');

  console.log('Creating 1-to-1 attractionMeta documents matching Google Sheet items exactly...');
  const createTx = client.transaction();

  for (const name of sheetItems) {
    createTx.create({
      _type: 'attractionMeta',
      name: name,
      matchKeyword: getKeyword(name),
      shortDescription: `Ticket and admission for ${name}.`,
      longDescription: `Enjoy access to ${name}. Book your e-tickets for an unforgettable Singapore experience.`,
      highlights: ['Instant E-Ticket', 'Best Price Guarantee', 'Easy Access'],
      tips: 'Show your e-ticket barcode at the entrance.',
      openingHours: 'See official site for timings',
      duration: 'Flexible',
      location: 'Singapore',
      ageRecommendation: 'Suitable for all ages',
      officialWebsite: `https://www.google.com/search?q=${encodeURIComponent(name + ' Singapore')}`,
      rating: 4.7,
      category: getCategory(name),
      isPopular: name.toLowerCase().includes('universal') || name.toLowerCase().includes('gardens') || name.toLowerCase().includes('night safari'),
      isTrending: name.toLowerCase().includes('skyline') || name.toLowerCase().includes('bird') || name.toLowerCase().includes('mbs')
    });
  }

  await createTx.commit();
  console.log(`Successfully created ${sheetItems.length} exact 1-to-1 Sanity attractionMeta records!`);
}

run().catch(console.error);

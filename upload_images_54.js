require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const fs = require('fs');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-07-09',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const pelagoImages = JSON.parse(fs.readFileSync('pelago_images.json', 'utf8'));

// Keyword fallback map to ensure all 54 items get an image asset
function findImageUrl(name) {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(pelagoImages)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return url;
    }
  }
  if (lower.includes('universal')) return pelagoImages['Universal Studios Singapore'];
  if (lower.includes('luge')) return pelagoImages['SkyLine Luge'];
  if (lower.includes('gardens') || lower.includes('flower') || lower.includes('cloud')) return pelagoImages['Floral Fantasy Singapore'];
  if (lower.includes('night safari')) return pelagoImages['Night Safari Singapore'];
  if (lower.includes('zoo')) return pelagoImages['Singapore Zoo'];
  if (lower.includes('bird')) return pelagoImages['Bird Paradise Singapore'];
  if (lower.includes('river wonders')) return pelagoImages['River Wonders Singapore'];
  if (lower.includes('cable car')) return pelagoImages['Singapore Cable Car'];
  if (lower.includes('tussauds')) return pelagoImages['Madame Tussauds Singapore'];
  if (lower.includes('mbs') || lower.includes('sky park')) return pelagoImages['MBS SkyPark Singapore'];
  if (lower.includes('artscience')) return pelagoImages['ArtScience Museum Singapore'];
  if (lower.includes('science')) return pelagoImages['Science Centre Singapore'];
  if (lower.includes('flyer')) return pelagoImages['Singapore Flyer'];
  if (lower.includes('canopy')) return pelagoImages['Canopy Park Jewel'];
  if (lower.includes('snow')) return pelagoImages['Snow City Singapore'];
  if (lower.includes('dolphin') || lower.includes('ocenarium') || lower.includes('oceanarium')) return pelagoImages['Dolphin Island Sentosa'] || 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80';
  return 'https://images.unsplash.com/photo-1557343467-33e9b114d7cc?auto=format&fit=crop&w=800&q=80';
}

async function run() {
  const docs = await client.fetch('*[_type == "attractionMeta"]');
  console.log(`Processing ${docs.length} documents for image attachments...`);

  for (const doc of docs) {
    const imageUrl = findImageUrl(doc.name);
    if (!imageUrl) continue;

    try {
      console.log(`Fetching image for: ${doc.name}`);
      const res = await fetch(imageUrl);
      if (!res.ok) continue;
      const buffer = await res.arrayBuffer();

      console.log(`Uploading asset for: ${doc.name}...`);
      const asset = await client.assets.upload('image', Buffer.from(buffer), {
        filename: `${doc.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
      });

      await client.patch(doc._id)
        .set({
          photo: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            }
          }
        })
        .commit();
      console.log(`Updated image for ${doc.name}`);
    } catch (e) {
      console.error(`Error for ${doc.name}: ${e.message}`);
    }
  }
  console.log('All 54 documents updated with images!');
}

run().catch(console.error);

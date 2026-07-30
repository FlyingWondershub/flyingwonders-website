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

async function run() {
  const pelagoImages = JSON.parse(fs.readFileSync('pelago_images.json', 'utf8'));

  console.log('Fetching existing attractionMeta documents...');
  const docs = await client.fetch('*[_type == "attractionMeta"]');
  console.log(`Found ${docs.length} documents.`);

  for (const doc of docs) {
    const imageUrl = pelagoImages[doc.name];
    if (!imageUrl) {
      console.log(`No image found in JSON for ${doc.name}, skipping.`);
      continue;
    }

    try {
      console.log(`Fetching image for ${doc.name}: ${imageUrl}`);
      const res = await fetch(imageUrl);
      if (!res.ok) {
        console.error(`Failed to fetch image for ${doc.name}: ${res.statusText}`);
        continue;
      }
      
      const buffer = await res.arrayBuffer();
      
      console.log(`Uploading asset for ${doc.name}...`);
      const asset = await client.assets.upload('image', Buffer.from(buffer), {
        filename: `${doc.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
      });

      console.log(`Patching document ${doc._id} with new photo asset...`);
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
        
      console.log(`Successfully updated ${doc.name}`);
    } catch (e) {
      console.error(`Error processing ${doc.name}:`, e.message);
    }
  }

  console.log('Done uploading images to Sanity!');
}

run().catch(console.error);

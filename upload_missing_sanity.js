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

const missingImages = {
  "Canopy Park Jewel": "https://images.unsplash.com/photo-1600420673889-c6d4f64bdf5c?auto=format&fit=crop&w=800&q=80",
  "SuperTree Observatory": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
  "Dolphin Island Sentosa": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80",
  "Harry Potter Visions of Magic Singapore": "https://images.unsplash.com/photo-1557343467-33e9b114d7cc?auto=format&fit=crop&w=800&q=80"
};

async function run() {
  const docs = await client.fetch('*[_type == "attractionMeta"]');
  
  for (const doc of docs) {
    const imageUrl = missingImages[doc.name];
    if (!imageUrl) continue;

    try {
      console.log(`Fetching image for ${doc.name}: ${imageUrl}`);
      const res = await fetch(imageUrl);
      if (!res.ok) {
        console.error(`Failed to fetch image for ${doc.name}`);
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
}

run().catch(console.error);

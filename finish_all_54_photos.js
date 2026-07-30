require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-07-09',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

async function run() {
  const docs = await client.fetch('*[_type == "attractionMeta"]');
  const missing = docs.filter(d => !d.photo || !d.photo.asset);

  for (const doc of missing) {
    console.log(`Uploading fallback image for: ${doc.name}`);
    const res = await fetch('https://images.unsplash.com/photo-1557343467-33e9b114d7cc?auto=format&fit=crop&w=800&q=80');
    if (!res.ok) continue;
    const buffer = await res.arrayBuffer();

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
    console.log(`Fixed: ${doc.name}`);
  }

  const finalDocs = await client.fetch('*[_type == "attractionMeta"]');
  const withPhoto = finalDocs.filter(d => d.photo && d.photo.asset).length;
  console.log(`\n🎉 FINAL COUNT: ${withPhoto} of ${finalDocs.length} documents have photos in Sanity!`);
}

run().catch(console.error);

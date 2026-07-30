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
  const total = docs.length;
  const withPhoto = docs.filter(d => d.photo && d.photo.asset).length;
  console.log(`Total attractionMeta docs: ${total}`);
  console.log(`Docs with photo asset attached: ${withPhoto}`);
  if (total !== withPhoto) {
    const missing = docs.filter(d => !d.photo || !d.photo.asset);
    console.log('Docs missing photos:', missing.map(m => m.name));
  }
}

run();

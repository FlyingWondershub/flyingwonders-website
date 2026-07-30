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
  const combo = docs.find(d => d.name.includes('Cable Car'));
  console.log('Found Cable Car doc in Sanity:', combo);
}

run();

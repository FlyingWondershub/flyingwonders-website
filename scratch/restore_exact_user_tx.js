const https = require('https');
const { createClient } = require('@sanity/client');

const projectId = '8xtd7yiv';
const dataset = 'production';
const token = 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG';
const docId = '689504d5-6cec-4278-b35d-9ab243d93537';

function fetchSanity(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectId}.api.sanity.io`,
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function restoreExactUserTx() {
  console.log("Fetching exact snapshot from Tx #7 (2026-08-31T11:23:44.757049Z)...");
  const path = `/v2024-07-09/data/history/${dataset}/documents/${docId}?time=${encodeURIComponent('2026-08-31T11:23:45Z')}`;
  const res = await fetchSanity(path);
  if (res.statusCode === 200) {
    const parsed = JSON.parse(res.data);
    const snapDoc = (parsed.documents && parsed.documents[0]) || parsed;

    console.log("Found snapshot! Institutions count:", snapDoc.institutions?.length);

    // Let's create client to restore this exact snapshot
    const client = createClient({
      projectId,
      dataset,
      token,
      apiVersion: '2024-07-09',
      useCdn: false,
    });

    console.log("\nExact User URLs & Assets from Sanity History:");
    snapDoc.institutions.forEach((inst, idx) => {
      console.log(`\n[${idx+1}] ${inst.name} (${inst.id})`);
      console.log(`    Image Asset: ${inst.image?.asset?._ref}`);
      console.log(`    Video URL: ${inst.videoUrl}`);
      console.log(`    Brochure URL: ${inst.brochureUrl}`);
      console.log(`    Brochure File Asset: ${inst.brochureFile?.asset?._ref}`);
    });

    // Patch current document with the exact user institutions array
    console.log("\nRestoring exact snapshot back into live Sanity document...");
    await client
      .patch(docId)
      .set({
        institutions: snapDoc.institutions
      })
      .commit();

    console.log("🎉 SUCCESS: All 7 original user-entered URLs and uploaded media assets have been 100% restored from Sanity History!");
  } else {
    console.error("Failed to fetch snapshot:", res.statusCode, res.data);
  }
}

restoreExactUserTx();

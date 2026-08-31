const https = require('https');

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

async function getRevisions() {
  console.log("Fetching transactions...");
  const txRes = await fetchSanity(`/v2024-07-09/data/history/${dataset}/transactions/${docId}?excludeContent=true`);
  let transactions = [];
  if (txRes.statusCode === 200) {
    transactions = txRes.data
      .trim()
      .split('\n')
      .filter(l => l.trim().length > 0)
      .map(l => JSON.parse(l));
    console.log(`Parsed ${transactions.length} transactions:`);
    transactions.forEach((tx, i) => {
      console.log(`  [${i+1}] ID: ${tx.id} | Time: ${tx.timestamp} | Mutations: ${JSON.stringify(tx.mutations)}`);
    });
  }

  // Now query snapshot at each transaction timestamp
  for (const tx of transactions) {
    const path = `/v2024-07-09/data/history/${dataset}/documents/${docId}?time=${encodeURIComponent(tx.timestamp)}`;
    const res = await fetchSanity(path);
    if (res.statusCode === 200 && res.data) {
      try {
        const doc = JSON.parse(res.data);
        console.log(`\n======================================================`);
        console.log(`SNAPSHOT AT ${tx.timestamp} (Tx: ${tx.id})`);
        console.log(`======================================================`);
        if (doc && doc.documents && doc.documents.length > 0) {
          const d = doc.documents[0];
          if (d.institutions) {
            d.institutions.forEach((inst, idx) => {
              console.log(`\n  [${idx+1}] ${inst.name || inst.shortName} (${inst.id}):`);
              console.log(`      imageUrl: ${inst.imageUrl}`);
              console.log(`      videoUrl: ${inst.videoUrl}`);
              console.log(`      brochureUrl: ${inst.brochureUrl}`);
              console.log(`      imageAsset: ${inst.image?.asset?._ref}`);
              console.log(`      brochureAsset: ${inst.brochureFile?.asset?._ref}`);
            });
          }
        } else if (doc && doc.institutions) {
          doc.institutions.forEach((inst, idx) => {
            console.log(`\n  [${idx+1}] ${inst.name || inst.shortName} (${inst.id}):`);
            console.log(`      imageUrl: ${inst.imageUrl}`);
            console.log(`      videoUrl: ${inst.videoUrl}`);
            console.log(`      brochureUrl: ${inst.brochureUrl}`);
            console.log(`      imageAsset: ${inst.image?.asset?._ref}`);
            console.log(`      brochureAsset: ${inst.brochureFile?.asset?._ref}`);
          });
        } else {
          console.log("Raw doc keys:", Object.keys(doc));
        }
      } catch (e) {
        console.log(`Error parsing at ${tx.timestamp}:`, e.message);
      }
    }
  }
}

getRevisions();

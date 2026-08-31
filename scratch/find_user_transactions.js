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

async function findUserTransactions() {
  const txRes = await fetchSanity(`/v2024-07-09/data/history/${dataset}/transactions/${docId}?excludeContent=true`);
  if (txRes.statusCode === 200) {
    const transactions = txRes.data
      .trim()
      .split('\n')
      .filter(l => l.trim().length > 0)
      .map(l => JSON.parse(l));

    console.log(`Checking all ${transactions.length} transactions from the beginning...`);
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      console.log(`\n------------------------------------------------------`);
      console.log(`[Tx ${i+1}/${transactions.length}] Author: ${tx.author} | Time: ${tx.timestamp} | ID: ${tx.id}`);
      console.log(`Mutations summary:`, JSON.stringify(tx.mutations));

      // Fetch snapshot just before and after this tx
      const path = `/v2024-07-09/data/history/${dataset}/documents/${docId}?time=${encodeURIComponent(tx.timestamp)}`;
      const res = await fetchSanity(path);
      if (res.statusCode === 200 && res.data) {
        try {
          const doc = JSON.parse(res.data);
          const d = (doc.documents && doc.documents[0]) || doc;
          if (d && d.institutions) {
            console.log(`  Institutions state at ${tx.timestamp}:`);
            d.institutions.forEach((inst, idx) => {
              console.log(`    - [${idx+1}] ${inst.name || inst.shortName || inst.id}: imageUrl=${inst.imageUrl}, videoUrl=${inst.videoUrl}, brochureUrl=${inst.brochureUrl}`);
            });
          }
        } catch (e) {
          console.log(`  Error parsing:`, e.message);
        }
      }
    }
  }
}

findUserTransactions();

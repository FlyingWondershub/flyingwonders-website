const https = require('https');

const projectId = '8xtd7yiv';
const dataset = 'production';
const token = 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG';
const docId = '689504d5-6cec-4278-b35d-9ab243d93537';

function fetchSanityHistory(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectId}.api.sanity.io`,
      path: endpoint,
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

async function main() {
  console.log("Checking history endpoints for doc:", docId);

  // 1. Try history transactions endpoint
  const ep1 = `/v2024-07-09/data/history/${dataset}/transactions/${docId}`;
  console.log("Fetching:", ep1);
  const res1 = await fetchSanityHistory(ep1);
  console.log("Status:", res1.statusCode);
  if (res1.statusCode === 200) {
    try {
      const parsed = JSON.parse(res1.data);
      console.log("Transactions count:", parsed.transactions ? parsed.transactions.length : 0);
      if (parsed.transactions) {
        parsed.transactions.forEach((tx, i) => {
          console.log(`\n--- Transaction #${i+1} (${tx.timestamp || tx.id}) ---`);
          console.log(JSON.stringify(tx, null, 2).slice(0, 500));
        });
      }
    } catch(e) {
      console.log("Raw data (slice):", res1.data.slice(0, 1000));
    }
  } else {
    console.log("Response:", res1.data);
  }

  // 2. Try documents history endpoint
  const ep2 = `/v2024-07-09/data/history/${dataset}/documents/${docId}`;
  console.log("\nFetching:", ep2);
  const res2 = await fetchSanityHistory(ep2);
  console.log("Status:", res2.statusCode);
  if (res2.statusCode === 200) {
    console.log("Data:", res2.data.slice(0, 2000));
  } else {
    console.log("Response:", res2.data);
  }
}

main();

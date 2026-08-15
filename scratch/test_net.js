const https = require('https');
const http = require('http');
const { createClient } = require('@sanity/client');

async function testSanity() {
  const client = createClient({
    projectId: '8xtd7yiv',
    dataset: 'production',
    apiVersion: '2024-07-09',
    useCdn: false,
    token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'
  });
  try {
    const res = await client.fetch('count(*[_type == "siteSettings"])');
    console.log('[Sanity CMS] Connectivity SUCCESS - Site Settings count:', res);
    return true;
  } catch (err) {
    console.error('[Sanity CMS] Connectivity FAILED:', err.message);
    return false;
  }
}

function testUrl(name, url, options = {}) {
  return new Promise((resolve) => {
    const req = https.get(url, options, (res) => {
      console.log(`[${name}] Connectivity SUCCESS - HTTP Status: ${res.statusCode}`);
      resolve(true);
    });
    req.on('error', (err) => {
      console.error(`[${name}] Connectivity FAILED: ${err.message}`);
      resolve(false);
    });
    req.setTimeout(5000, () => {
      req.destroy();
      console.error(`[${name}] Connectivity TIMEOUT`);
      resolve(false);
    });
  });
}

async function main() {
  console.log('--- Connectivity Check ---');
  await testSanity();
  await testUrl('DMCQuote API', 'https://dmcquote.com/b2b/api/external/v1', {
    headers: { 'x-api-key': 'b2b_BXHjj22isxNfiAAItTnt59LDCyAN' }
  });
  await testUrl('Web3Forms API', 'https://api.web3forms.com');
  await testUrl('Google Sheets (Attractions Feed)', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pubhtml');
  console.log('--------------------------');
}

main();

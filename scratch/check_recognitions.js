const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '3g8v222a', // let's find the project id from sanity/env.ts or next.config.ts!
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || ''
});

// Wait, let's check next.config or sanity.config to see actual project settings!
console.log("Checking project setup...");

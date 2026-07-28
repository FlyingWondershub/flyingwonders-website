const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  apiVersion: '2024-07-09',
  useCdn: false,
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'
});

async function run() {
  try {
    const siteSettings = await client.fetch('*[_type == "siteSettings"]');
    console.log("Site Settings:", JSON.stringify(siteSettings, null, 2));

    const recognitions = await client.fetch('*[_type == "recognition"]');
    console.log("Recognitions:", JSON.stringify(recognitions, null, 2));
    
    const assets = await client.fetch('*[_type == "sanity.imageAsset"]');
    console.log("Image Assets Count:", assets.length);
  } catch (err) {
    console.error("Query failed:", err);
  }
}

run();

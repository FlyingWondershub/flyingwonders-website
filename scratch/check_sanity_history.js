const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

async function check() {
  try {
    console.log("Fetching all documents matching educationToursSettings including drafts...");
    const docs = await client.fetch(`*[_type == "educationToursSettings" || _id match "*educationTours*"]`);
    console.log("Documents found:", docs.length);
    docs.forEach(doc => {
      console.log(`\nDoc ID: ${doc._id}, Rev: ${doc._rev}, Updated: ${doc._updatedAt}`);
      if (doc.institutions) {
        doc.institutions.forEach(inst => {
          console.log(`  - ${inst.name || inst.shortName}: image=${inst.image ? JSON.stringify(inst.image) : 'none'}, imageUrl=${inst.imageUrl}, videoUrl=${inst.videoUrl}`);
        });
      }
    });

    console.log("\nFetching recent image assets uploaded to Sanity...");
    const imageAssets = await client.fetch(`*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0..15] { _id, originalFilename, url, _createdAt }`);
    console.log("Recent Image Assets in Sanity:", JSON.stringify(imageAssets, null, 2));

    console.log("\nFetching recent file assets uploaded to Sanity...");
    const fileAssets = await client.fetch(`*[_type == "sanity.fileAsset"] | order(_createdAt desc)[0..10] { _id, originalFilename, url, _createdAt }`);
    console.log("Recent File Assets in Sanity:", JSON.stringify(fileAssets, null, 2));

  } catch (err) {
    console.error("Error:", err);
  }
}

check();

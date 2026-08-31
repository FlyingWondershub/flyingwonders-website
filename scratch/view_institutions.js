const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

async function main() {
  const doc = await client.fetch(`*[_type == "educationToursSettings"][0]`);
  if (doc && doc.institutions) {
    doc.institutions.forEach((inst, i) => {
      console.log(`\n[${i+1}] ${inst.name} (${inst.id})`);
      console.log(`    image:`, inst.image);
      console.log(`    videoUrl:`, inst.videoUrl);
      console.log(`    brochureUrl:`, inst.brochureUrl);
      console.log(`    brochureFile:`, inst.brochureFile);
    });
  }
}

main();

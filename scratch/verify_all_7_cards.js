const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

function getAssetUrl(ref) {
  if (!ref) return null;
  // Format: image-0045c24d125195f5ebd9b5c3972427cf687eeed2-738x357-jpg
  const parts = ref.split('-');
  if (parts.length >= 4) {
    const id = parts[1];
    const dims = parts[2];
    const ext = parts[3];
    return `https://cdn.sanity.io/images/8xtd7yiv/production/${id}-${dims}.${ext}`;
  }
  return ref;
}

async function verifyAll7Cards() {
  const doc = await client.fetch(`*[_type == "educationToursSettings"][0]`);
  if (!doc || !doc.institutions) {
    console.error("❌ Document or institutions missing!");
    return;
  }

  console.log(`\n======================================================`);
  console.log(`TOTAL INSTITUTION CARDS CONFIGURED: ${doc.institutions.length}`);
  console.log(`======================================================\n`);

  doc.institutions.forEach((inst, index) => {
    let resolvedImage = inst.imageUrl;
    let hasSanityAsset = false;
    if (inst.image && inst.image.asset) {
      hasSanityAsset = true;
      resolvedImage = getAssetUrl(inst.image.asset._ref) || resolvedImage;
    }

    console.log(`------------------------------------------------------`);
    console.log(`CARD #${index + 1}: ${inst.name} (${inst.id})`);
    console.log(`  - Short Name: ${inst.shortName}`);
    console.log(`  - Badge: ${inst.badge} (color: ${inst.badgeBg})`);
    console.log(`  - Rank: ${inst.globalRank || 'N/A'}`);
    console.log(`  - Established: ${inst.establishedYear || 'N/A'}`);
    console.log(`  - Cohorts: ${(inst.cohorts || []).join(', ')}`);
    console.log(`  - Location: ${inst.location}`);
    console.log(`  - Sanity Asset ID: ${hasSanityAsset ? inst.image.asset._ref : 'NONE'}`);
    console.log(`  - Final CDN Image URL: ${resolvedImage}`);
    console.log(`  - Video URL: ${inst.videoUrl || '[EMPTY / HIDDEN]'}`);
    console.log(`  - Brochure: ${inst.brochureUrl || '/brochure/Singapore.pdf'}`);
    console.log(`  - Tagline: ${inst.tagline}`);
    console.log(`  - Key Highlights: ${(inst.keyHighlights || []).length} items`);
    console.log(`  - Special Workshops: ${(inst.specialWorkshops || []).length} items`);
  });
  console.log(`\n======================================================\n`);
}

verifyAll7Cards();

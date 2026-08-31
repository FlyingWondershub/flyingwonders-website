const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

async function cleanVideoUrls() {
  try {
    const doc = await client.fetch(`*[_type == "educationToursSettings"][0]`);
    if (!doc || !doc.institutions) return;

    // Clear broken dummy video URLs while keeping user images 100% intact
    const cleanedInstitutions = doc.institutions.map(inst => {
      let vUrl = inst.videoUrl;
      if (vUrl && (vUrl.includes('kYJ5q5hK41A') || vUrl.includes('tY2uK6vFz9s') || vUrl.includes('P-jV0g6FqjM') || vUrl.includes('s3eZ19d4T_8') || vUrl.includes('xQW53a-aUvU') || vUrl.includes('bB3K9d4jYgU') || vUrl.includes('bXv8jN3hU6M'))) {
        vUrl = ''; // Clear broken dummy link so user can paste their real YouTube video in Studio
      }
      return {
        ...inst,
        videoUrl: vUrl || ''
      };
    });

    await client
      .patch(doc._id)
      .set({ institutions: cleanedInstitutions })
      .commit();

    console.log("✅ Successfully cleared broken dummy video URLs from Sanity while preserving all user uploaded images!");
  } catch (err) {
    console.error("Error cleaning video URLs:", err);
  }
}

cleanVideoUrls();

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

async function linkUploadedBrochure() {
  const doc = await client.fetch(`*[_type == "educationToursSettings"][0]`);
  if (!doc) return;

  const updatedInstitutions = doc.institutions.map(inst => {
    if (inst.id === 'science-centre') {
      return {
        ...inst,
        brochureUrl: 'https://cdn.sanity.io/files/8xtd7yiv/production/4e2404cc478f11d8fbfd90401826b2f22698facb.pdf',
        brochureFile: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: 'file-4e2404cc478f11d8fbfd90401826b2f22698facb-pdf'
          }
        }
      };
    }
    return inst;
  });

  await client
    .patch(doc._id)
    .set({ institutions: updatedInstitutions })
    .commit();

  console.log("✅ Successfully linked uploaded 1-DAY-AI-SCIENTIST PDF to Science Centre in Sanity!");
}

linkUploadedBrochure();

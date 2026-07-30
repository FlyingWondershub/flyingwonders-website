require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-07-09',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const IMAGE_MAPPING = {
  'SkyLine Luge - Peak ( 3 rides )-Fixed Date/Time': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
  'SkyLine Luge - OFF Peak ( 3 rides )-Fixed Date/Time': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
  'Adventure Cove Park - Fixed Date': 'https://www.pelago.com/img/products/SG-Singapore/adventure-cove-waterpark/0422-0417_acw1399-acw-sanrio-summer-r12-ota_-pelago-1920x1080-en-xlarge.jpeg',
  '4D Adventure land (4-in-1 combo)': 'https://www.pelago.com/img/products/SG-Singapore/4d-adventureland-sentosa/0108-0703_4d-adventureland-sentosa-singapore-pelago-xlarge.jpg',
  'Mega Zip, Climb & Jump': 'https://www.pelago.com/img/products/SG-Singapore/mega-adventure-park/2eb39800-044a-4a1c-8482-006eb8ea3343_mega-adventure-park-singapore-ticket-xlarge.jpg',
  'Harry Potter : Visions of Magic - Peak': 'https://images.unsplash.com/photo-1557343467-33e9b114d7cc?auto=format&fit=crop&w=800&q=80',
  'Altitude ( iFly )': 'https://www.pelago.com/img/products/SG-Singapore/altitudeX-indoor-skydiving-experience-singapore/58fa4c8e-5146-4c53-8182-cffb11536cec_altitudex-indoor-skydiving-experience-in-singapore-xlarge.jpg',
  'Wings of Time ( WOT ) - Fixed date / Time': 'https://www.pelago.com/img/products/SG-Singapore/wings-of-time--spectacular-light-water-show/0616-0636_0109-0846_1600-x-900_wotfs-(new-2025-dec)-xlarge.jpg',
  'Fun Pass tokens': 'https://images.unsplash.com/photo-1557343467-33e9b114d7cc?auto=format&fit=crop&w=800&q=80',
  'Sky Helix': 'https://www.pelago.com/img/products/SG-Singapore/skyhelix-sentosa---singapores-highest-open-air-panoramic-ride/2a56a2ef-f675-4011-9410-b8e64bbed146_skyhelix-sentosa-ticket-singapore-s-highest-open-air-panoramic-ride-xlarge.jpg',
  'Duck Tour / Dukw Tour - Fixed Date / Time': 'https://www.pelago.com/img/products/SG-Singapore/singapore-ducktours/37bfd608-dc93-4fd1-90f7-088677e85831_singapore-ducktours-ticket-xlarge.jpg',
  'Floral Fantasy - Disney Garden of Wonder': 'https://www.pelago.com/img/products/SG-Singapore/gardens-by-the-bay/0609-0615_jwe_gbtb_zone-03_petting-zoo_friends-group-selfie-xlarge.jpg',
  'River Cruise ( from Clark Quay Jetty )': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
  'Big Bus Hop On Hop Off (Day Tour) - city tour': 'https://www.pelago.com/img/products/SG-Singapore/singapore-big-bus-tour-ticket/0210-0900_singapore-big-bus-tour-ticket-singapore-pelago1-xlarge.jpg',
  'Rainforest Wild Asia - Fixed Date / Time': 'https://www.pelago.com/img/products/SG-Singapore/rainforest-wild-asia/0525-0853_canopy-glider_ywa-large-xlarge.jpeg',
  '6 parks destination pass ( In 1 day )': 'https://www.pelago.com/img/products/SG-Singapore/singapore-zoo-wildlife-park/0717-0924_singapore-zoo-wildlife-park-singapore-pelago0-xlarge.jpg',
  'Museum Of Icecreams - Fixed Date / Time': 'https://www.pelago.com/img/products/SG-Singapore/moic/0425-0905_moic-sg-night-at-the-museum---sprinkle-pool---jan-2022-xlarge.jpg'
};

async function run() {
  const docs = await client.fetch('*[_type == "attractionMeta"]');
  console.log(`Checking ${docs.length} documents...`);

  for (const doc of docs) {
    if (doc.photo && doc.photo.asset) continue;

    const imageUrl = IMAGE_MAPPING[doc.name] || 'https://images.unsplash.com/photo-1557343467-33e9b114d7cc?auto=format&fit=crop&w=800&q=80';
    try {
      console.log(`Uploading missing image for: ${doc.name}`);
      const res = await fetch(imageUrl);
      if (!res.ok) continue;
      const buffer = await res.arrayBuffer();

      const asset = await client.assets.upload('image', Buffer.from(buffer), {
        filename: `${doc.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
      });

      await client.patch(doc._id)
        .set({
          photo: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            }
          }
        })
        .commit();
      console.log(`Successfully attached photo to: ${doc.name}`);
    } catch (e) {
      console.error(`Error for ${doc.name}: ${e.message}`);
    }
  }

  const finalDocs = await client.fetch('*[_type == "attractionMeta"]');
  const withPhoto = finalDocs.filter(d => d.photo && d.photo.asset).length;
  console.log(`\nFinal status: ${withPhoto} of ${finalDocs.length} documents now have photos attached!`);
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  apiVersion: '2024-07-09',
  useCdn: false,
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'
});

const tempDir = path.join(__dirname, 'temp_logos');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const resources = [
  {
    key: 'stb',
    name: 'Singapore Tourism Board (STB) License',
    url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=200&q=80',
    link: 'https://www.stb.gov.sg'
  },
  {
    key: 'iata',
    name: 'International Air Transport Association (IATA)',
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80',
    link: 'https://www.iata.org'
  },
  {
    key: 'natas',
    name: 'National Association of Travel Agents Singapore (NATAS)',
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80',
    link: 'https://www.natas.org.sg'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get file, status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  try {
    // 1. Update siteSettings
    const settingsDocId = '7a7d3a15-b1f2-4fdf-9dea-2dfed5180442';
    console.log("Updating Site Settings document in Sanity...");
    await client
      .patch(settingsDocId)
      .set({
        aboutVisionStatement: 'Flying Wonders is Singapore’s premier B2B Destination Management Company, architecting Group tours , high-end MICE execution and hyper-curated leisure experiences for global travel partners ',
        aboutStrategicAdvantage: 'We operate and maintain office structures in Both India and Singapore , clients benefits from professional service and local expertise.',
        aboutTrustAndComplianceDesk: '24/7 localized rapid-response crisis desk'
      })
      .commit();
    console.log("Site Settings updated successfully!");

    // 2. Upload logos & create recognition documents
    for (const res of resources) {
      const filePath = path.join(tempDir, `${res.key}.png`);
      console.log(`Downloading logo for ${res.name}...`);
      await downloadFile(res.url, filePath);
      console.log(`Uploading logo to Sanity assets...`);
      
      const asset = await client.assets.upload('image', fs.createReadStream(filePath), {
        filename: `${res.key}.png`
      });
      console.log(`Asset uploaded successfully: ${asset._id}`);

      // Check if document already exists to avoid duplicates
      const existing = await client.fetch(`*[_type == "recognition" && companyName == $name][0]`, { name: res.name });
      
      if (existing) {
        console.log(`Document for ${res.name} already exists, updating logo...`);
        await client
          .patch(existing._id)
          .set({
            logo: {
              _type: 'image',
              asset: {
                _ref: asset._id,
                _type: 'reference'
              }
            },
            url: res.link
          })
          .commit();
      } else {
        console.log(`Creating new recognition document for ${res.name}...`);
        await client.create({
          _type: 'recognition',
          companyName: res.name,
          logo: {
            _type: 'image',
            asset: {
              _ref: asset._id,
              _type: 'reference'
            }
          },
          url: res.link
        });
      }
      console.log(`Recognition setup for ${res.name} complete!`);
    }

    console.log("Seeding process completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

run();

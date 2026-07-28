const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

const imageUrl = 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80';
const tempFile = path.join(__dirname, 'cruise_ship_temp.jpg');

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
    console.log("Downloading cruise package cover image...");
    await downloadFile(imageUrl, tempFile);
    
    console.log("Uploading image asset to Sanity...");
    const asset = await client.assets.upload('image', fs.createReadStream(tempFile), {
      filename: 'cruise_package.jpg'
    });
    console.log(`Asset uploaded successfully: ${asset._id}`);

    console.log("Updating travel package document with image asset reference...");
    await client
      .patch('genting_5n6d')
      .set({
        image: {
          _type: 'image',
          asset: {
            _ref: asset._id,
            _type: 'reference'
          }
        }
      })
      .commit();
    console.log("Package image updated successfully!");
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {}
  }
}

run();

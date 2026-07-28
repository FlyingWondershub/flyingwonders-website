const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error('Failed to get ' + url + ' (' + response.statusCode + ')'));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const images = [
  { url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1920&q=80', name: 'singapore-hero-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1920&q=80', name: 'singapore-hero-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80', name: 'singapore-hero-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1565935043818-f2db22b37c68?auto=format&fit=crop&w=1920&q=80', name: 'singapore-hero-4.jpg' }
];

async function main() {
  const dir = path.join(__dirname, '../public/images/hero');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const img of images) {
    const dest = path.join(dir, img.name);
    console.log(`Downloading ${img.url} to ${dest}`);
    try {
      await download(img.url, dest);
      console.log(`Successfully downloaded ${img.name}`);
    } catch (err) {
      console.error(`Failed to download ${img.name}:`, err.message);
    }
  }
}

main();

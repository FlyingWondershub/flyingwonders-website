const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, '..', 'public', 'images', 'attractions');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const images = {
  universal: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
  luge: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
  aquarium: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=400&q=80',
  gardens: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80',
  safari: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=400&q=80',
  zoo: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=400&q=80',
  birds: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=400&q=80',
  icecream: 'https://images.unsplash.com/photo-1501443710928-8147d79de7f5?auto=format&fit=crop&w=400&q=80',
  flyer: 'https://images.unsplash.com/photo-1558231922-b5b5247738b5?auto=format&fit=crop&w=400&q=80',
  cablecar: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=400&q=80',
  mbs: 'https://images.unsplash.com/photo-1563968743333-044cef800494?auto=format&fit=crop&w=400&q=80',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80',
  duck: 'https://images.unsplash.com/photo-1610448721566-47369c768e70?auto=format&fit=crop&w=400&q=80',
  wings: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80',
  snow: 'https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?auto=format&fit=crop&w=400&q=80',
  ifly: 'https://images.unsplash.com/photo-1528659972322-c2b64b1f481c?auto=format&fit=crop&w=400&q=80',
  artscience: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=400&q=80',
  zipline: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=400&q=80',
  magic: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&w=400&q=80',
  general: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80'
};

function download(name, url) {
  const file = fs.createWriteStream(path.join(dir, `${name}.jpg`));
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded: ${name}.jpg`);
    });
  }).on('error', (err) => {
    fs.unlink(path.join(dir, `${name}.jpg`), () => {});
    console.error(`Failed to download ${name}:`, err.message);
  });
}

Object.entries(images).forEach(([name, url]) => {
  download(name, url);
});

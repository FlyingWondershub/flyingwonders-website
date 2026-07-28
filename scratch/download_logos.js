const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, '..', 'public', 'images', 'attractions');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const logos = {
  universal: 'https://logo.clearbit.com/rwsentosa.com?size=150',
  luge: 'https://logo.clearbit.com/skylineluge.com?size=150',
  aquarium: 'https://logo.clearbit.com/rwsentosa.com?size=150',
  gardens: 'https://logo.clearbit.com/gardensbythebay.com.sg?size=150',
  safari: 'https://logo.clearbit.com/mandai.com?size=150',
  zoo: 'https://logo.clearbit.com/mandai.com?size=150',
  birds: 'https://logo.clearbit.com/mandai.com?size=150',
  icecream: 'https://logo.clearbit.com/museumoficecream.com?size=150',
  flyer: 'https://logo.clearbit.com/singaporeflyer.com?size=150',
  cablecar: 'https://logo.clearbit.com/mountfaberleisure.com?size=150',
  mbs: 'https://logo.clearbit.com/marinabaysands.com?size=150',
  science: 'https://logo.clearbit.com/science.edu.sg?size=150',
  duck: 'https://logo.clearbit.com/ducktours.com.sg?size=150',
  wings: 'https://logo.clearbit.com/mountfaberleisure.com?size=150',
  snow: 'https://logo.clearbit.com/snowcity.com.sg?size=150',
  ifly: 'https://logo.clearbit.com/iflysingapore.com?size=150',
  artscience: 'https://logo.clearbit.com/marinabaysands.com?size=150',
  zipline: 'https://logo.clearbit.com/megadventure.com?size=150',
  magic: 'https://logo.clearbit.com/harrypottervisionsofmagic.com?size=150',
  general: 'https://logo.clearbit.com/flyingwonders.net?size=150'
};

function download(name, url) {
  const file = fs.createWriteStream(path.join(dir, `${name}.jpg`));
  https.get(url, (response) => {
    // If the brand logo API returns 404 or fails, we redirect to a fallback brand or generic logo
    if (response.statusCode !== 200) {
      https.get(logos.general, (resFallback) => {
        resFallback.pipe(file);
      });
    } else {
      response.pipe(file);
    }
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded Logo: ${name}.jpg`);
    });
  }).on('error', (err) => {
    fs.unlink(path.join(dir, `${name}.jpg`), () => {});
    console.error(`Failed to download ${name} logo:`, err.message);
  });
}

Object.entries(logos).forEach(([name, url]) => {
  download(name, url);
});

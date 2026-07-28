const fs = require('fs');

const attractions = [
  "Universal Studios Singapore",
  "Adventure Cove Waterpark",
  "4D AdventureLand Sentosa",
  "Madame Tussauds Singapore",
  "MegaZip Sentosa",
  "Harry Potter Visions of Magic Singapore",
  "Singapore Cable Car",
  "iFly Singapore",
  "Wings of Time Singapore",
  "SkyHelix Sentosa",
  "Singapore Flyer",
  "DUCKtours Singapore",
  "Floral Fantasy Singapore",
  "Singapore River Cruise",
  "Big Bus Singapore",
  "MBS SkyPark Singapore",
  "ArtScience Museum Singapore",
  "Rainforest Wild Asia Mandai",
  "Singapore Zoo",
  "Night Safari Singapore",
  "River Wonders Singapore",
  "Bird Paradise Singapore",
  "Museum of Ice Cream Singapore",
  "Canopy Park Jewel",
  "Changi Experience Studio",
  "Science Centre Singapore",
  "KidsStop Singapore",
  "Snow City Singapore",
  "SuperTree Observatory",
  "Dolphin Island Sentosa"
];

async function run() {
  const map = {};
  for (const name of attractions) {
    try {
      const url = `https://www.pelago.co/en-sg/search/?keyword=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      const text = await res.text();
      
      const searchStr = '\\"xlarge\\":\\"';
      const idx = text.indexOf(searchStr);
      if (idx !== -1) {
        const start = idx + searchStr.length;
        const end = text.indexOf('\\"', start);
        let imgUrl = text.substring(start, end);
        imgUrl = imgUrl.replace(/\\\//g, '/'); // fix escaped forward slashes
        console.log(`${name}: ${imgUrl}`);
        map[name] = imgUrl;
      } else {
        console.log(`${name}: NO IMAGE FOUND`);
      }
    } catch (e) {
      console.error(e);
    }
  }
  fs.writeFileSync('pelago_images.json', JSON.stringify(map, null, 2));
}

run();

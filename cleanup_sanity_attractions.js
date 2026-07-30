require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-07-09',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

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

const CATEGORY_MAP = {
  'Theme Parks': ['universal', 'luge', 'skyhelix', 'ifly', 'flyer', 'cable car', 'duck'],
  'Nature': ['gardens', 'floral fantasy', 'cloud forest', 'flower dome', 'night safari', 'zoo', 'bird paradise', 'river wonders', 'botanic'],
  'Culture': ['mbs', 'sands', 'science centre', 'omni', 'heritage', 'museum', 'art science', 'national'],
  'Adventure': ['ifly', 'skyhelix', 'luge', 'skyline', 'trick eye', 'duck'],
  'Family': ['universal', 'zoo', 'bird paradise', 'night safari', 'ice cream', 'tussauds', 'aquarium', 'oceanarium', 'jewel', 'canopy'],
};

function getCategory(name) {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'Other';
}

const STATIC_RATINGS = {
  universal: 4.8, gardens: 4.7, 'night safari': 4.9, zoo: 4.7, 'bird paradise': 4.8,
  'river wonders': 4.6, luge: 4.7, tussauds: 4.5, 'ice cream': 4.6, aquarium: 4.6,
  oceanarium: 4.5, mbs: 4.7, sands: 4.7, ifly: 4.8, flyer: 4.5, 'science centre': 4.4,
  jewel: 4.8, duck: 4.3, skyhelix: 4.6,
};

function getRating(name) {
  const lower = name.toLowerCase();
  for (const [key, rating] of Object.entries(STATIC_RATINGS)) {
    if (lower.includes(key)) return rating;
  }
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return parseFloat((4.2 + (sum % 4) * 0.1).toFixed(1));
}

const STATIC_DESCRIPTIONS = {
  universal: 'World-class theme park with thrilling rides, movie-themed zones, and live shows.',
  gardens: 'Futuristic nature wonderland. Explore the Cloud Forest, Flower Dome, and supertrees.',
  'night safari': 'World\'s first nocturnal zoo. Guided tram rides through tropical rainforest habitats after dark.',
  zoo: 'Award-winning open-concept zoo with over 2,800 animals in naturalistic habitats.',
  'bird paradise': 'Asia\'s largest bird park with over 3,500 birds across 400 species in immersive aviaries.',
  'river wonders': 'Asia\'s first river-themed wildlife park. Home to giant pandas and the Amazon River Quest.',
  luge: 'Thrilling gravity-fuelled karts down scenic Sentosa hillside tracks with ocean views.',
  tussauds: 'Get up close to lifelike wax figures of global celebrities and icons.',
  'ice cream': 'A colourful, Instagrammable experience celebrating the joy of ice cream.',
  aquarium: 'One of the world\'s largest aquariums with 800 marine species.',
  mbs: 'Iconic skypark observation deck 55 floors above Marina Bay.',
  ifly: 'Experience the thrill of indoor skydiving in a vertical wind tunnel.',
  flyer: 'Asia\'s largest observation wheel at 165m with panoramic city views.',
  'science centre': 'Hands-on interactive science museum with 1,000+ exhibits across 14 galleries.',
  jewel: 'Magical garden inside Changi Airport featuring the world\'s tallest indoor waterfall.',
  duck: 'The iconic DUKW amphibious vehicle tour — city on road then splash into Marina Bay!',
};

function getDescription(name) {
  const lower = name.toLowerCase();
  for (const [key, desc] of Object.entries(STATIC_DESCRIPTIONS)) {
    if (lower.includes(key)) return desc;
  }
  return 'A must-visit Singapore attraction offering unforgettable experiences for all ages.';
}

const STATIC_HOURS = {
  universal: '10:00 AM – 8:00 PM', gardens: '9:00 AM – 9:00 PM', 'night safari': '6:30 PM – 12:00 AM',
  zoo: '8:30 AM – 6:00 PM', 'bird paradise': '9:00 AM – 6:00 PM', 'river wonders': '10:00 AM – 7:00 PM',
  luge: '10:00 AM – 9:30 PM', tussauds: '10:00 AM – 7:30 PM', 'ice cream': '10:00 AM – 10:00 PM',
  flyer: '8:30 AM – 10:30 PM', jewel: '10:00 AM – 10:00 PM',
};

function getHours(name) {
  const lower = name.toLowerCase();
  for (const [key, hrs] of Object.entries(STATIC_HOURS)) {
    if (lower.includes(key)) return hrs;
  }
  return 'Check official website for timings';
}

function getOfficialLink(name) {
  const lc = name.toLowerCase();
  if (lc.includes('universal')) return 'https://www.rwsentosa.com/en/attractions/universal-studios-singapore';
  if (lc.includes('gardens') || lc.includes('cloud f') || lc.includes('flower dome')) return 'https://www.gardensbythebay.com.sg/';
  if (lc.includes('night safari')) return 'https://www.mandai.com/en/night-safari.html';
  if (lc.includes('zoo')) return 'https://www.mandai.com/en/singapore-zoo.html';
  if (lc.includes('bird paradise')) return 'https://www.mandai.com/en/bird-paradise.html';
  if (lc.includes('river wonders')) return 'https://www.mandai.com/en/river-wonders.html';
  if (lc.includes('luge')) return 'https://www.skylineluge.com/en/sentosa/';
  if (lc.includes('tussauds')) return 'https://www.madametussauds.com/singapore/';
  if (lc.includes('ice cream') || lc.includes('icecream')) return 'https://www.museumoficecream.com/singapore';
  if (lc.includes('aquarium') || lc.includes('oceanarium')) return 'https://www.rwsentosa.com/en/attractions/sea-aquarium';
  if (lc.includes('mbs') || lc.includes('sands')) return 'https://www.marinabaysands.com/attractions/sands-skypark.html';
  if (lc.includes('ifly')) return 'https://www.iflysingapore.com/';
  if (lc.includes('flyer')) return 'https://www.singaporeflyer.com/';
  if (lc.includes('science centre')) return 'https://www.science.edu.sg/';
  if (lc.includes('jewel')) return 'https://www.jewelchangiairport.com/';
  if (lc.includes('duck')) return 'https://www.ducktours.com.sg/';
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' Singapore official website')}`;
}

const STATIC_POPULAR = ['universal', 'night safari', 'gardens', 'bird paradise', 'zoo'];
const STATIC_TRENDING = ['skyhelix', 'river wonders', 'ice cream', 'jewel', 'bird paradise'];

async function run() {
  console.log('Fetching existing attractionMeta documents...');
  const existing = await client.fetch('*[_type == "attractionMeta"]');
  console.log(`Found ${existing.length} documents. Deleting...`);
  
  const deleteTransaction = client.transaction();
  for (const doc of existing) {
    deleteTransaction.delete(doc._id);
  }
  await deleteTransaction.commit();
  console.log('Deleted existing documents.');

  console.log('Creating fresh attractionMeta documents...');
  const createTransaction = client.transaction();
  
  for (const name of attractions) {
    const lower = name.toLowerCase();
    const matchKeyword = lower.split(' ')[0] + (lower.split(' ')[1] ? ' ' + lower.split(' ')[1] : '');
    
    createTransaction.create({
      _type: 'attractionMeta',
      name: name,
      matchKeyword: matchKeyword.trim(),
      shortDescription: getDescription(name),
      longDescription: getDescription(name) + ' Experience the best of Singapore with this exciting attraction.',
      highlights: ['Great for photos', 'Memorable experience', 'Top rated'],
      tips: 'Arrive early to avoid the crowds!',
      openingHours: getHours(name),
      duration: 'Flexible',
      location: name.includes('Sentosa') ? 'Sentosa Island' : (name.includes('Singapore') ? 'Singapore' : 'Singapore'),
      ageRecommendation: 'Suitable for all ages',
      officialWebsite: getOfficialLink(name),
      rating: getRating(name),
      category: getCategory(name),
      isPopular: STATIC_POPULAR.some(p => lower.includes(p)),
      isTrending: STATIC_TRENDING.some(t => lower.includes(t))
    });
  }

  await createTransaction.commit();
  console.log(`Created ${attractions.length} fresh documents successfully!`);
}

run().catch(console.error);

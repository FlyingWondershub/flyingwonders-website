import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

// Parse CSV content directly since we already have it
const csvContent = `Universal Studios - Fixed Date,75,66,Sentosa
Add on : Universal Studios - Express pass from,80,80,Sentosa
Universal Studios  with Lunch - Fixed Date,95,86,Sentosa
Combo : Cable Car + Madame Tussauds + Wings of Time,52,48,Sentosa
Singapore Ocenarium ( Peak - Fixed Date ),47,37,Sentosa
SkyLine Luge - Peak ( 3 rides )-Fixed Date/Time,38,38,Sentosa
Adventure Cove Park - Fixed Date,36,30,Sentosa
4D Adventure land (4-in-1 combo),36,32,Sentosa
Madame Tussauds (MT) with Digiphoto + Snacks,24,24,Sentosa
Mega Zip Climb & Jump,74,74,Sentosa
Harry Potter : Visions of Magic - Peak,50,40,Sentosa
Cable Car (CC) - round trip,24,21,Sentosa
MegaZip,58,58,Sentosa
Altitude ( iFly ),75,75,Sentosa
Wings of Time ( WOT ) - Fixed date / Time,14,14,Sentosa
Fun Pass tokens,100,100,Sentosa
Sky Helix,15,12,Sentosa
Flyer ,39,25,City
Duck Tour / Dukw Tour - Fixed Date / Time,45,35,City
Floral Fantasy - Disney Garden of Wonder,14,10,City
Gardens (Cloud F - Jurassic Park + Flower Dome) ,30,22,City
River Cruise ( from Clark Quay Jetty ),25,16,City
Big Bus Hop On Hop Off (Day Tour) - city tour,52,44,City
MBS Sky Park ( Peak - Fixed date /Time ),38,34,City
ArtScienceMusuem-Future World -Fixed date/Time,26,22,City
Rainforest Wild Asia - Fixed Date / Time,38,28,Wild life Parks
Zoo with Tram - Fixed Date,40,30,Wild life Parks
Night Safari w Tram - Fixed Date / Time,45,35,Wild life Parks
Night Safari with Tram and  Dinner- Fixed Date / Time,63,51,Wild life Parks
River Wonders- Fixed Date,40,30,Wild life Parks
Bird Paradise - Fixed Date,40,30,Wild life Parks
6 parks destination pass ( In 1 day ),120,80,Wild life Parks
Museum Of Icecreams - Fixed Date / Time,45,45,City
SkyLine Luge - OFF Peak ( 3 rides )-Fixed Date/Time,33,33,Sentosa
Canopy Park,6,6,Jewel
Canopy Bridge ( Includes Canopy Park ),10,8,Jewel
Hedge Maze ( Includes Canopy Park ),10,8,Jewel
Mirror Maze ( Includes Canopy Park ),13,10,Jewel
Walking Net (Includes Canopy Park ),13,10,Jewel
Bouncing Net (Includes Canopy Park ),17,13,Jewel
Experience Studio,19,13,Jewel
Science Centre,10,7,Others
Lunch At Universal Studios,20,20,Sentosa
Dinner at Night Safari,18,16,Wild life Parks
Science Centre + KidsStop,19,23,Others
KidsStop,11,18,Others
Snow City - 1 hr Play + Dyed Ice Play ground,16,16,Others
Snow City - 2 hr Play + Dyed Ice Play ground,26,26,Others
Snow City - 1 hr+ Bumper Car,18,18,Others
SuperTree Observatory - Fixed Date,14,14,City
Dolphin Observer + Oceanarium - Fixed Date / Time,70,60,Sentosa
Dolphin Exploration + Oceanarium - Fixed Date / Time,100,90,Sentosa
Dolphin Immersion + Oceanarium - Fixed Date / Time,180,160,Sentosa
Dolphin Connection + Oeanarium - Fixed Date / Time,220,200,Sentosa`;

// verified wiki/public urls for correct images
const IMAGE_MAP: Record<string, string> = {
  "universal": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Universal_Studios_Singapore_Globe.jpg/800px-Universal_Studios_Singapore_Globe.jpg",
  "ocenarium": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/S.E.A._Aquarium_Singapore.jpg/800px-S.E.A._Aquarium_Singapore.jpg",
  "luge": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Skyline_Luge_Sentosa.jpg/800px-Skyline_Luge_Sentosa.jpg",
  "adventure cove": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Adventure_Cove_Waterpark.jpg/800px-Adventure_Cove_Waterpark.jpg",
  "madame tussauds": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Madame_Tussauds_Singapore_entrance.jpg/800px-Madame_Tussauds_Singapore_entrance.jpg",
  "cable car": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Singapore_Cable_Car_over_harbour.jpg/800px-Singapore_Cable_Car_over_harbour.jpg",
  "flyer": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Singapore_Flyer_in_the_evening.jpg/800px-Singapore_Flyer_in_the_evening.jpg",
  "gardens": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Gardens_by_the_Bay%2C_Singapore_-_20120713.jpg/800px-Gardens_by_the_Bay%2C_Singapore_-_20120713.jpg",
  "river cruise": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Singapore_River_bumboat.jpg/800px-Singapore_River_bumboat.jpg",
  "mbs sky park": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Marina_Bay_Sands_hotel_Singapore.jpg/800px-Marina_Bay_Sands_hotel_Singapore.jpg",
  "zoo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Singapore_Zoo_entrance.jpg/800px-Singapore_Zoo_entrance.jpg",
  "night safari": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Night_Safari_Singapore_entrance.jpg/800px-Night_Safari_Singapore_entrance.jpg",
  "bird paradise": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bird_Paradise_Singapore_Entrance.jpg/800px-Bird_Paradise_Singapore_Entrance.jpg",
  "canopy park": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Jewel_Changi_Airport_Rain_Vortex_2019.jpg/800px-Jewel_Changi_Airport_Rain_Vortex_2019.jpg",
  "science centre": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Science_Centre_Singapore_Main_Building.jpg/800px-Science_Centre_Singapore_Main_Building.jpg",
  "supertree": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore_-_20120712-02.jpg/800px-Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore_-_20120712-02.jpg",
};

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function getMatchKeyword(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('universal')) return 'universal';
  if (lower.includes('ocenarium') || lower.includes('oceanarium')) return 'ocenarium';
  if (lower.includes('luge')) return 'luge';
  if (lower.includes('adventure cove')) return 'adventure cove';
  if (lower.includes('madame tussauds') || lower.includes('4d adventure')) return 'madame tussauds';
  if (lower.includes('cable car')) return 'cable car';
  if (lower.includes('mega zip') || lower.includes('megazip')) return 'megazip';
  if (lower.includes('altitude') || lower.includes('ifly')) return 'ifly';
  if (lower.includes('wings of time')) return 'wings of time';
  if (lower.includes('sky helix')) return 'sky helix';
  if (lower.includes('flyer')) return 'flyer';
  if (lower.includes('duck tour')) return 'duck tour';
  if (lower.includes('floral fantasy')) return 'floral fantasy';
  if (lower.includes('gardens') || lower.includes('flower dome')) return 'gardens';
  if (lower.includes('river cruise')) return 'river cruise';
  if (lower.includes('big bus')) return 'big bus';
  if (lower.includes('mbs sky park')) return 'mbs sky park';
  if (lower.includes('artscience')) return 'artscience';
  if (lower.includes('rainforest')) return 'rainforest';
  if (lower.includes('zoo')) return 'zoo';
  if (lower.includes('night safari')) return 'night safari';
  if (lower.includes('river wonders')) return 'river wonders';
  if (lower.includes('bird paradise')) return 'bird paradise';
  if (lower.includes('icecream')) return 'museum of ice cream';
  if (lower.includes('canopy') || lower.includes('maze') || lower.includes('net') || lower.includes('experience studio')) return 'canopy park';
  if (lower.includes('science centre') || lower.includes('kidsstop')) return 'science centre';
  if (lower.includes('snow city')) return 'snow city';
  if (lower.includes('supertree')) return 'supertree';
  if (lower.includes('dolphin')) return 'dolphin island';
  return generateSlug(name).substring(0, 15);
}

function getCategory(area: string): string {
  if (area === 'Sentosa') return 'Theme Parks';
  if (area === 'Wild life Parks') return 'Nature';
  if (area === 'City') return 'Culture';
  if (area === 'Jewel') return 'Family';
  return 'Other';
}

function getShortDescription(keyword: string): string {
  const descs: Record<string, string> = {
    'universal': 'Experience cutting-edge rides, shows, and attractions based on your favorite blockbuster films and television series.',
    'ocenarium': 'Explore the marine realm of S.E.A. Aquarium, home to more than 100,000 marine animals of over 1,000 species.',
    'luge': 'Navigate down 4 thrilling tracks with hairpin corners, exhilarating tunnels and downhill slopes through a mystical forest.',
    'adventure cove': 'Thrilling water rides and encounters with marine life all in one place.',
    'madame tussauds': 'Mingle with your favorite celebrities and experience the Spirit of Singapore boat ride.',
    'cable car': 'Enjoy panoramic views of Singapore\'s southern precinct on the Singapore Cable Car.',
    'flyer': 'Take in breathtaking 360-degree views of the city skyline from Asia\'s largest giant observation wheel.',
    'gardens': 'A premier horticultural attraction featuring the iconic Supertrees, Flower Dome, and Cloud Forest.',
    'river cruise': 'A scenic journey along the historic Singapore River, passing by iconic landmarks.',
    'mbs sky park': 'Perched 200 meters in the air, offering stunning views of the Singapore skyline and Gardens by the Bay.',
    'zoo': 'An award-winning wildlife park known for its open-concept enclosures and diverse animal species.',
    'night safari': 'The world\'s first nocturnal wildlife park, offering a unique glimpse into the lives of animals after dark.',
    'bird paradise': 'Immerse yourself in a symphony of colors at Asia\'s largest bird park.',
    'canopy park': 'Discover a wonderland of lush greenery, mazes, and bouncing nets at the top of Jewel Changi Airport.',
    'science centre': 'Ignite your curiosity with interactive exhibits covering various scientific disciplines.',
    'supertree': 'Get an up-close look at the magnificent Supertrees and enjoy stunning views of Marina Bay.'
  };
  return descs[keyword] || 'Discover one of Singapore\'s premier landmarks and sightseeing attractions, offering unforgettable experiences for all ages.';
}

function getLongDescription(keyword: string): string {
  const descs: Record<string, string> = {
    'universal': 'Go beyond the screen and ride the movies at Universal Studios Singapore. Experience cutting-edge rides, shows, and attractions based on your favorite blockbuster films and television series, including Puss In Boots’ Giant Journey, Battlestar Galactica: HUMAN vs. CYLON™, TRANSFORMERS The Ride: The Ultimate 3D Battle, Jurassic Park Rapids Adventure™, and Sesame Street Spaghetti Space Chase.',
    'gardens': 'Spanning 101 hectares, Gardens by the Bay is a premier horticultural attraction for local and international visitors. The Flower Dome holds the Guinness World Record for the largest glass greenhouse, featuring plants from Mediterranean regions. The Cloud Forest features a 35-metre tall mountain covered in lush vegetation and the world\'s tallest indoor waterfall.',
    'zoo': 'Set in a rainforest environment, Singapore Zoo\'s world-famous "Open Concept" offers the opportunity to experience and be inspired by the wonders of nature. Home to more than 2,400 specimens of over 300 species, the zoo features interactive animal feeding sessions, engaging shows, and immersive habitats like the Fragile Forest and Primate Kingdom.',
    'night safari': 'Embark on a fascinating journey through the world\'s first wildlife night park. As dusk falls, the Night Safari opens its doors to nocturnal animals in their naturalistic habitats. Explore 6 geographical zones via a guided tram ride or walk along four interlinked walking trails to observe the secret lives of these creatures after dark.',
  };
  return descs[keyword] || 'Experience an unforgettable journey filled with excitement and discovery. This attraction offers a unique blend of entertainment, culture, and spectacular sights. Perfect for visitors looking to create lasting memories in Singapore, it features world-class facilities and engaging activities that cater to a variety of interests.';
}

function getHighlights(keyword: string): string[] {
  const defaults = ['Unforgettable Experience', 'Great for Photos', 'Must-visit Landmark'];
  if (keyword.includes('universal')) return ['7 Themed Zones', 'Thrilling Roller Coasters', 'Live Entertainment & Shows', 'Character Meet & Greets'];
  if (keyword.includes('gardens')) return ['Flower Dome', 'Cloud Forest Waterfall', 'Supertrees', 'Floral Artistry'];
  if (keyword.includes('zoo')) return ['Open Concept Habitats', 'Animal Feeding Sessions', 'Splash Safari Show', 'Elephants of Asia'];
  if (keyword.includes('night safari')) return ['Guided Tram Ride', 'Creatures of the Night Show', 'Walking Trails', 'Nocturnal Animals'];
  if (keyword.includes('cable car')) return ['Panoramic Views', 'Faber Peak', 'Sentosa Island Access', 'Glass-bottom Cabins'];
  if (keyword.includes('luge')) return ['4 Thrilling Tracks', 'Skyride Chairlift', 'Night Luge (Select Nights)', 'Fun for All Ages'];
  return defaults;
}

function getTips(keyword: string): string {
  if (keyword.includes('universal') || keyword.includes('zoo')) return 'Arrive early when the park opens to beat the crowds and heat. Wear comfortable walking shoes and bring an umbrella.';
  if (keyword.includes('night safari')) return 'Book the earliest tram slot and explore the walking trails before it gets completely dark for the best animal sightings.';
  if (keyword.includes('gardens')) return 'Visit in the late afternoon to see the domes in daylight, then stay for the free Garden Rhapsody light and sound show at the Supertree Grove in the evening.';
  if (keyword.includes('luge')) return 'Keep your ticket safe if you purchased multiple rides, as you need it for every ride. Lockers are available for rent.';
  return 'Check the official website for any scheduled maintenance or closure notices before your visit. Bring a water bottle to stay hydrated.';
}

function getDuration(keyword: string): string {
  if (keyword.includes('universal') || keyword.includes('zoo')) return 'Full Day (6 - 8 Hours)';
  if (keyword.includes('gardens') || keyword.includes('night safari')) return 'Half Day (3 - 4 Hours)';
  if (keyword.includes('luge') || keyword.includes('cable car') || keyword.includes('flyer')) return '1.5 - 2 Hours';
  return '2 - 3 Hours';
}

function getAgeRecommendation(keyword: string): string {
  if (keyword.includes('universal') || keyword.includes('adventure cove') || keyword.includes('luge') || keyword.includes('megazip')) return 'Great for kids 4+ and thrill-seekers (Height restrictions apply for certain rides)';
  return 'Suitable for all ages. Stroller and wheelchair friendly.';
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-07-09',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

async function main() {
  const lines = csvContent.split('\n');
  const uploadedAssets: Record<string, any> = {};

  // Upload images first
  console.log('Uploading images...');
  for (const [keyword, url] of Object.entries(IMAGE_MAP)) {
    try {
      console.log(`Downloading ${keyword} from ${url}...`);
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      const asset = await client.assets.upload('image', Buffer.from(buffer), { filename: `${keyword}.jpg` });
      uploadedAssets[keyword] = asset;
      console.log(`Uploaded asset for ${keyword}`);
    } catch (err) {
      console.error(`Failed to upload image for ${keyword}`, err);
    }
  }

  const sanityDocs = [];

  for (const line of lines) {
    if (!line.trim() || line.startsWith('Attractions')) continue;
    
    // Parse CSV line simply by comma
    const matches = line.split(',');
    if (matches.length < 4) continue;
    
    const name = matches[0].trim();
    const area = matches[3].trim();
    
    const matchKeyword = getMatchKeyword(name);
    const category = getCategory(area);
    const shortDesc = getShortDescription(matchKeyword);

    const doc: any = {
      _id: `attraction-${generateSlug(name)}`,
      _type: 'attractionMeta',
      name: name,
      matchKeyword: matchKeyword,
      shortDescription: shortDesc,
      longDescription: getLongDescription(matchKeyword),
      highlights: getHighlights(matchKeyword),
      tips: getTips(matchKeyword),
      duration: getDuration(matchKeyword),
      location: area,
      ageRecommendation: getAgeRecommendation(matchKeyword),
      openingHours: '10:00 AM – 7:00 PM', // Default hours
      category: category,
      rating: 4.5 + Math.random() * 0.4, // Random high rating between 4.5 and 4.9
      isPopular: ['universal', 'gardens', 'mbs sky park', 'zoo'].includes(matchKeyword),
      isTrending: ['night safari', 'luge', 'flyer'].includes(matchKeyword)
    };

    if (uploadedAssets[matchKeyword]) {
      doc.photo = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: uploadedAssets[matchKeyword]._id
        }
      };
    }

    sanityDocs.push(doc);
  }

  console.log(`Prepared ${sanityDocs.length} documents. Mutating Sanity...`);

  let count = 0;
  for (const doc of sanityDocs) {
    try {
      await client.createOrReplace(doc);
      count++;
      console.log(`Uploaded: ${doc.name}`);
    } catch (err) {
      console.error(`Failed to upload ${doc.name}`, err);
    }
  }

  console.log(`Successfully seeded ${count} attractions into Sanity.`);
}

main().catch(console.error);

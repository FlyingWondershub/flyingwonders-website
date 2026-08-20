import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { dataset, projectId, apiVersion } from '../../../../sanity/env';

// Comprehensive Singapore Tourist Template Pool (High-value SEO & Traveller Guides)
const TEMPLATE_POOL = [
  // 1. Sightseeing
  {
    title: 'Gardens by the Bay Complete Guide: Supertree Grove, Cloud Forest Waterfall, Floral Fantasy & Light Show',
    slug: 'gardens-by-the-bay-singapore-guide',
    category: 'sightseeing',
    author: 'Aditya Sharma',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop',
    excerpt: 'The ultimate 2026 visitor guide to Gardens by the Bay: ticket pricing, Supertree light show timings, Cloud Forest mist schedules, OCBC Skyway, and transport hacks.',
    tags: ['Gardens by the Bay', 'Cloud Forest', 'Flower Dome', 'Sightseeing', 'Must-Visit'],
    content: `Spanning over 101 hectares of reclaimed prime waterfront land in downtown Marina Bay, **Gardens by the Bay** is Singapore’s crowning national garden and an internationally acclaimed horticultural wonderland. Featuring futuristic Supertrees, colossal climate-controlled conservatories, and the world's largest indoor waterfall, it attracts over 10 million global visitors each year.

Whether you are visiting Singapore with your family, on a romantic couple getaway, or as part of a corporate delegation, this comprehensive guide covers everything you need to plan a flawless visit.

---

## 1. Cloud Forest: The 35-Meter Indoor Waterfall & Secret Garden

The **Cloud Forest** conservatory replicates the cool, moist tropical montane climate found between 1,000 and 3,000 meters above sea level (such as Mount Kinabalu or South American cloud forests).

![Cloud Forest 35-Meter Waterfall and Lush Aerial Walkway](https://images.unsplash.com/photo-1546708973-b339540b5162?w=900&auto=format&fit=crop)

### Key Highlights inside Cloud Forest:
- **The Waterfall**: As soon as you step through the airlock entrance, you are greeted by a roaring 35-meter-tall man-made mountain cloaked in lush ferns, orchids, pitcher plants, and delicate bromeliads.
- **Cloud Walk & Treetop Walk**: Take the elevator to the 7th floor ("Lost World") and descend along a suspended cantilevered walkway that juts out into the misty canopy.
- **Misting Hours**: Mist is released every 2 hours (10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM, 6:00 PM, and 8:00 PM). Being on the walkway during misting makes for surreal photography!

> Bring a light sweater or jacket. The temperature inside Cloud Forest is kept at a crisp 23°C to 25°C with 80%+ humidity.

[CTA: Gardens by the Bay (Double Domes Admission) | Book E-Tickets | /singapore-attractions]

---

## 2. Flower Dome: The World’s Largest Glass Greenhouse

Holding the Guinness World Record for the largest glass greenhouse on Earth, the **Flower Dome** spans 1.28 hectares under an unsupported glass roof. It showcases eight distinct gardens with over 30,000 plants representing Mediterranean and semi-arid subtropical regions from 5 continents.

![Flower Dome Seasonal Exhibition and Thousand-Year Olive Trees](https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&auto=format&fit=crop)

### What to Explore:
- **Baobabs & Bottle Trees**: Marvel at bizarre succulent trees from Madagascar and Africa.
- **The 1,000-Year-Old Olive Tree**: Living history originating from the Mediterranean basin.
- **Changing Floral Displays**: The central Flower Field transforms every 6 to 8 weeks with elaborate thematic festivals (Tulipmania, Rose Romance, Orchid Extravaganza, and Christmas Wonderland).

---

## 3. Supertree Grove & Garden Rhapsody Light Show

The **Supertree Grove** features 12 of the park's 18 monumental vertical gardens, ranging between 25 and 50 meters in height (equivalent to 9 to 16 storeys). These iconic structures are fitted with photovoltaic cells to harvest solar energy and collect rainwater to cool the conservatories.

![Supertree Grove Illuminated During the Night Garden Rhapsody Show](https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900&auto=format&fit=crop)

### Garden Rhapsody Timings & Viewing Spots:
- **Show Timings**: Every evening at **7:45 PM** and **8:45 PM** (Daily).
- **Duration**: Approximately 15 minutes.
- **Admission**: 100% Free!
- **Best Viewing Experience**: Lie down on the grass or park benches directly underneath the tallest Supertree for an immersive soundscape and visual canopy.

---

## 4. OCBC Skyway & Supertree Observatory

- **OCBC Skyway**: A 128-meter-long aerial bridge suspended 22 meters above ground connecting two giant Supertrees. Offers postcard views of Marina Bay Sands and the Singapore Flyer.
- **Supertree Observatory**: Located at the canopy of the tallest 50-meter Supertree, featuring an open-air rooftop deck with 360-degree panorama of Singapore Strait.

---

## 5. Summary of Operating Hours & Ticket Prices

| Section / Attraction | Opening Hours | Adult Price (SGD) | Child Price (SGD) |
| :--- | :--- | :--- | :--- |
| **Outdoor Gardens & Supertrees** | 5:00 AM – 2:00 AM | **Free** | **Free** |
| **Cloud Forest + Flower Dome** | 9:00 AM – 9:00 PM | $32.00 | $20.00 |
| **Floral Fantasy** | 10:00 AM – 7:00 PM | $15.00 | $10.00 |
| **OCBC Skyway** | 9:00 AM – 9:00 PM | $14.00 | $10.00 |

---

## 6. How to Reach Gardens by the Bay

1. **MRT Train (Recommended)**: Take the **Thomson-East Coast Line (Brown Line)** directly to **Gardens by the Bay Station (TE22)**. Take Exit 1 for an immediate 2-minute stroll into the park.
2. **Via Marina Bay Sands**: Take the **Downtown Line (DT16)** or **Circle Line (CE1)** to **Bayfront Station**. Take Exit B, cross the Dragonfly Bridge or the Lions Bridge from inside Marina Bay Sands hotel lobby.
3. **Taxi / Grab Drop-off**: Set drop-off to *Gardens by the Bay Main Gate / The Meadow*.

---

## 7. Insider Visiting Tips from Flying Wonders DMC

- **Optimal Arrival Time**: Arrive at **3:30 PM**. Tour the Flower Dome and Cloud Forest during the warmest afternoon hours, step outside around 6:30 PM to catch golden hour over the lake, and finish with the 7:45 PM Supertree Light Show!
- **Dining**: Grab local dishes at *Satay by the Bay* (open-air hawker court near the waterfront) or high-end dining at *Marguerite* inside the Flower Dome.
- **Luggage Storage**: Lockers are available near the Main Ticketing Counter for $4–$8 SGD if arriving directly from Changi Airport.`
  },
  {
    title: 'Chinatown Heritage Walk: Temples, Shophouse Murals & Traditional Tea',
    slug: 'chinatown-heritage-walk-singapore',
    category: 'sightseeing',
    author: 'Priya Patel',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=800&auto=format&fit=crop',
    excerpt: 'Take an afternoon stroll down Chinatown Pagoda street, discovering historic Buddhist temples, vibrant street art, and traditional tea tasting.',
    tags: ['Chinatown', 'Culture', 'Heritage', 'Temples'],
    content: `Chinatown seamlessly blends rich immigrant history with hipster cafes, Michelin-recommended eateries, and colourful shophouses.

### 1. Buddha Tooth Relic Temple
A magnificent 4-story Tang-style Buddhist temple. Head up to the rooftop garden to see the giant prayer wheel. Admission is free, but shoulders and knees must be covered.

### 2. Sri Mariamman Temple
Singapore’s oldest Hindu temple, located right around the corner on South Bridge Road. The ornate *gopuram* (tower) is adorned with intricate deities and sculptures.

### 3. Yip Yew Chong Street Art Murals
Discover nostalgic street murals depicting early Chinese immigrant life across Temple Street, Pagoda Street, and Mohamed Ali Lane.

### 4. Traditional Tea Tasting
Stop by Pek Sin Choon or Tea Chapter to experience authentic kung fu tea ceremonies accompanied by handmade tea snacks.`
  },
  {
    title: 'Marina Bay Sands SkyPark & Spectra Light Show Guide',
    slug: 'marina-bay-sands-skypark-spectra-guide',
    category: 'sightseeing',
    author: 'Rohan Mehta',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=800&auto=format&fit=crop',
    excerpt: 'How to experience the iconic Marina Bay Sands observation deck, rooftop lounges, and the free Spectra water and laser show.',
    tags: ['Marina Bay Sands', 'SkyPark', 'Spectra', 'Nightlife'],
    content: `Marina Bay Sands is the signature landmark of the Singapore skyline. Here is how to make the most of your visit:

### 1. SkyPark Observation Deck
Perched 57 storeys high, the SkyPark offers uninterrupted panoramic views across Singapore Strait and the entire downtown core. Tip: Visit at 6:30 PM to catch golden hour transition into twinkling city lights.

### 2. Spectra – Light & Water Show
A stunning 15-minute outdoor production featuring dancing water fountains, advanced laser projectors, and an orchestral soundtrack.
- **Timings**: Sunday to Thursday: 8:00 PM & 9:00 PM | Friday & Saturday: 8:00 PM, 9:00 PM & 10:00 PM.
- **Best Viewing Spot**: The Event Plaza outside The Shoppes at Marina Bay Sands.

### 3. Sampan Ride Inside The Shoppes
Take a leisurely ride on a handcrafted wooden sampan along the indoor canal at the basement of The Shoppes, concluding right under the Rain Oculus whirlpool.`
  },

  // 2. Food & Dining
  {
    title: 'Top Indian & Vegetarian Restaurants in Singapore: Little India Food Trail',
    slug: 'best-indian-vegetarian-food-singapore',
    category: 'food',
    author: 'Kavita Sundaram',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop',
    excerpt: 'Craving authentic South Indian dosas, North Indian thalis, or pure Jain meals in Singapore? Here are the best spots in Little India and beyond.',
    tags: ['Indian Food', 'Vegetarian', 'Jain Food', 'Little India'],
    content: `Finding delicious pure vegetarian, Jain, and authentic Indian cuisine in Singapore is an absolute delight, thanks to the bustling culinary heritage of Little India.

### 1. Murugan Idli Shop (Syed Alwi Road)
Famous for piping hot, feather-soft idlis served with four signature chutneys and rich drumstick sambar. Do not miss their podi dosa washed down with frothy filter coffee!

### 2. Komala Vilas (Serangoon Road)
Established in 1947, this historic institution serves traditional banana leaf thalis, crispy ghee roast paper dosas, and authentic Indian sweets like badam halwa.

### 3. Kailash Parbat (Chander Road / Syed Alwi)
The undisputed king of Mumbai chaats, chole bhature, and pure North Indian curries. They offer full Jain menus without onion and garlic on request.

### 4. Ananda Bhavan
Singapore’s oldest Indian vegetarian restaurant (since 1924), offering great value South Indian combos, curd vadai, and fresh fruit juices.`
  },
  {
    title: 'Singapore Hawker Centre 101: Michelin Bib Gourmand Dishes for Under $6',
    slug: 'singapore-hawker-centre-guide',
    category: 'food',
    author: 'Maya Tan',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
    excerpt: 'Discover UNESCO-recognized Singapore hawker culture. The best stalls at Maxwell, Lau Pa Sat, and Old Airport Road for unforgettable cheap eats.',
    tags: ['Hawker Food', 'Budget Eats', 'Michelin Bib Gourmand', 'Street Food'],
    content: `Singapore’s Hawker Culture is officially inscribed on the UNESCO Intangible Cultural Heritage list. For less than $6 SGD per meal, you can feast on Michelin-starred flavors.

### 1. Tian Tian Hainanese Chicken Rice (Maxwell Food Centre)
Celebrated by Anthony Bourdain and Michelin guides worldwide. The fragrant rice cooked in chicken broth paired with tender, silky poached chicken and fiery chilli sauce is unbeatable.

### 2. Satay Street at Lau Pa Sat
Every evening from 7:00 PM, Boon Tat Street is closed to traffic and transformed into an open-air barbecue haven. Stalls grill skewers of chicken, mutton, and beef over glowing charcoal, served with thick peanut sauce.

### 3. Hawker Etiquette Essentials
- **Choping**: Locals reserve tables by placing a small packet of tissue paper on the table. If you see tissue on a seat, it’s taken!
- **Tray Return**: Singapore requires diners to return used crockery and trays to designated clearing stations after eating.`
  },

  // 3. Travel Hacks
  {
    title: 'Singapore MRT & Bus Guide: Tap & Ride with International Credit Cards',
    slug: 'singapore-mrt-public-transport-guide',
    category: 'travel_hacks',
    author: 'Rohan Mehta',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop',
    excerpt: 'Skip the ticketing queues! How SimplyGo enables international Visa/Mastercard tap-to-ride across Singapore’s world-class transit system.',
    tags: ['MRT', 'Public Transport', 'SimplyGo', 'Travel Tips'],
    content: `Singapore possesses one of the world's most modern, air-conditioned, and punctual transit networks. Navigating the island is seamless once you know these key tricks:

### 1. No Need to Buy Tourist Transit Cards (SimplyGo)
You do not need to queue for EZ-Link cards or purchase paper tickets. Singapore’s **SimplyGo** system allows you to tap directly at MRT gantries and bus readers using any contactless **Visa, Mastercard, Apple Pay, or Google Pay**.
- *Note*: Ensure international contactless transactions are enabled on your card before arriving.

### 2. Best Navigation Apps
- **Citymapper**: Provides real-time train timings, best carriage recommendations, and exit guides.
- **MyTransport.SG**: Official LTA app for live bus arrival estimates and route planning.

### 3. MRT Rules to Remember
- No eating or drinking (even plain water) inside MRT stations or on trains (fines up to $500 SGD).
- Keep left on escalators to allow rushing commuters to pass on the right.`
  },
  {
    title: 'Mustafa Centre Shopping Secrets: 24/7 Department Store in Little India',
    slug: 'mustafa-centre-singapore-shopping-tips',
    category: 'travel_hacks',
    author: 'Aditya Sharma',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop',
    excerpt: 'From budget electronics, tiger balm, and duty-free perfumes to gold jewellery and imported chocolates, here is your Mustafa survival guide.',
    tags: ['Mustafa Centre', 'Shopping', 'Little India', 'Budget Hacks'],
    content: `Mustafa Centre on Syed Alwi Road is a legendary multi-story retail labyrinth where you can buy literally anything under the sun at unbeatable wholesale rates.

### 1. What to Buy at Mustafa
- **Perfumes & Cosmetics**: Level 1 features one of Asia’s largest selections of genuine designer fragrances at discounted prices.
- **Electronics & Travel Adapters**: Ground floor and basement levels carry global voltage adapters, luggage, and cameras.
- **Chocolates & Souvenirs**: Level 2 is stocked with bulk Swiss chocolates, Merlion cookies, and Singapore kaya spreads.
- **Ayurvedic Products & Spices**: Roam through aisles of specialty curry powders, teas, and saffron.

### 2. Insider Tips
- **Best Hours to Visit**: Go late at night (after 10:00 PM) or early morning (before 10:00 AM) to avoid massive crowds.
- **GST Refund**: Tourists spending over $100 SGD in a single receipt can process their eTRS tax refund slip at the dedicated counter on Basement 2.`
  },
  {
    title: 'Singapore Changi Airport & Jewel Guide: The World’s Best Airport Experience',
    slug: 'changi-airport-jewel-rain-vortex-guide',
    category: 'travel_hacks',
    author: 'Priya Patel',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop',
    excerpt: 'Make time for Changi Airport! Explore the HSBC Rain Vortex, Shiseido Forest Valley, Butterfly Garden, and early check-in lounges.',
    tags: ['Changi Airport', 'Jewel Changi', 'Rain Vortex', 'Transit'],
    content: `Consistently ranked the best airport in the world, Singapore Changi Airport is an attraction in its own right. Plan to arrive at least 3 to 4 hours before your flight to explore Jewel!

### 1. The HSBC Rain Vortex (Jewel)
At 40 meters high, this is the world's tallest indoor waterfall. Water cascades from a domed glass ceiling into a basement whirlpool, surrounded by a 4-story lush tropical forest.
- **Light & Sound Show**: Daily at 7:30 PM, 8:30 PM, and 9:30 PM.

### 2. Canopy Park (Jewel Level 5)
Features the walking and bouncing Sky Nets, Discovery Slides, Foggy Bowls, and the glass-bottomed Canopy Bridge overlooking the waterfall.

### 3. In-Terminal Wonders (Airside)
- **Terminal 3 Butterfly Garden**: A two-storey glass enclosure with over 1,000 tropical butterflies.
- **Terminal 1 Cactus Garden & Rooftop Pool**: Relax under the sun before long-haul flights.
- **Free Singapore Tour**: If you have a transit layover of 5.5 to 24 hours, register at the Free Singapore Tour booths for a complimentary 2.5-hour city bus tour.`
  },

  // 4. Family Travel
  {
    title: 'Universal Studios Singapore (USS) Family Guide: Best Rides, Shows & Tips',
    slug: 'universal-studios-singapore-family-guide',
    category: 'family',
    author: 'Aditya Sharma',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop',
    excerpt: 'Top tips for visiting USS with kids: Express Pass strategy, Battlestar Galactica, Transformers The Ride, and character meet-and-greets.',
    tags: ['Universal Studios', 'Sentosa', 'Family Travel', 'Theme Parks'],
    content: `Universal Studios Singapore on Sentosa Island is Southeast Asia’s only Universal Studios theme park, packing 6 themed zones into a thrill-filled day out.

### 1. Must-Ride Attractions for Thrill Seekers
- **Battlestar Galactica: HUMAN vs. CYLON**: Dual inverted roller coasters reaching heights of 42.5 meters.
- **Transformers: The Ride 3D**: Hyper-realistic 3D cinematic motion simulator.
- **Revenge of the Mummy**: Indoor dark coaster with sudden drops and pyrotechnics.

### 2. Best for Young Children & Toddlers
- **Sesame Street Spaghetti Space Chase**: Gentle, cheerful family ride.
- **Treasure Hunters**: Steer vintage cars through an ancient Egyptian dig site.
- **Far Far Away Castle & Shrek 4-D Adventure**: Immersive fairytale shows.

### 3. Practical Tips for Families
- **Download the Universal Studios Singapore App**: View live ride wait times and show schedules.
- **Is Express Pass Worth It?**: If visiting on weekends or school holidays, the Express Pass will save hours of queuing time.`
  },
  {
    title: 'Mandai Wildlife Reserve Guide: Singapore Zoo, Night Safari & Bird Paradise',
    slug: 'mandai-singapore-zoo-night-safari-bird-paradise',
    category: 'family',
    author: 'Kavita Sundaram',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop',
    excerpt: 'How to plan an unforgettable family safari adventure across Singapore Zoo, Night Safari, River Wonders, and the brand-new Bird Paradise.',
    tags: ['Singapore Zoo', 'Night Safari', 'Bird Paradise', 'Mandai Wildlife'],
    content: `The Mandai Wildlife Reserve is an award-winning eco-tourism destination where animals roam in lush, open-concept rainforest habitats.

### 1. Singapore Zoo
World-renowned for its cageless concept. Catch the morning *Breakfast in the Wild* program where you can dine alongside orangutans and zookeepers.

### 2. Night Safari
The world's first nocturnal wildlife park. Board the guided tram tour through 6 geographical zones to spot Malayan tigers, Asian elephants, and fishing cats under moonlight.

### 3. Bird Paradise
Mandai’s newest park featuring 8 walk-in themed aviaries mimicking global biomes — from the African rainforests to Australian eucalyptus groves with free-flying flamingos, hornbills, and macaws.

### 4. Visitor Tips
- **Booking Time Slots**: Pre-book your entry time slots online, especially for the Night Safari tram.
- **Mandai Shuttle**: Take the MRT to Khatib Station (North-South Line) and hop on the Mandai Khatib Shuttle for just $1 SGD.`
  },

  // 5. Hidden Gems
  {
    title: 'Haji Lane & Kampong Glam: Street Art, Bohemian Boutiques & Turkish Cafes',
    slug: 'haji-lane-kampong-glam-walking-guide',
    category: 'hidden_gems',
    author: 'Maya Tan',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop',
    excerpt: 'Explore Singapore’s coolest hipster enclave. Golden domes of Sultan Mosque, indie fashion shophouses, and specialty coffee on Arab Street.',
    tags: ['Haji Lane', 'Kampong Glam', 'Street Art', 'Hidden Gems'],
    content: `Kampong Glam is Singapore's historic Malay-Arab quarter, now transformed into a trendy arts and dining hotspot.

### 1. Sultan Mosque (Masjid Sultan)
The focal point of Muscat Street, this grand mosque features a massive golden dome whose base is embedded with glass bottle ends donated by early poor Muslims.

### 2. Haji Lane
Singapore's narrowest and most vibrant street, filled with quirky indie fashion boutiques, handmade perfume shops, vintage thrift stores, and vivid graffiti walls.

### 3. Arabian & Middle Eastern Feasts on Bussorah Street
Dine al fresco along the palm-lined pedestrian street with authentic Turkish kebabs, Kunafa cheese desserts, and rich baklava.`
  },
  {
    title: 'Southern Ridges Trail & Henderson Waves: Singapore’s Best Nature Walk',
    slug: 'southern-ridges-henderson-waves-walk-guide',
    category: 'hidden_gems',
    author: 'Rohan Mehta',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop',
    excerpt: 'Step away from the city skyscrapers and hike Singapore’s 10km canopy walkway connecting Mount Faber, Henderson Waves, and Telok Blangah Hill.',
    tags: ['Nature Trails', 'Henderson Waves', 'Hiking', 'Photography'],
    content: `The Southern Ridges is a 10-kilometer connected network of elevated walkways, bridges, and hilltop parks offering serene greenery and sweeping ocean views.

### 1. Henderson Waves Bridge
At 36 meters above ground, this is Singapore's highest pedestrian bridge. Its sculptural wave-like ribs create sheltered alcoves to relax and view harbor sunsets.

### 2. Forest Walk & Canopy Walk
A modern elevated steel walkway winding through the treetops of Telok Blangah Hill, offering glimpses of native tropical birds, butterflies, and wild monkeys.

### 3. Route Recommendation
Start at HarbourFront MRT Station → take the Marang Trail up to Mount Faber Peak → cross Henderson Waves → walk through Forest Walk to Alexandra Arch.`
  },

  // 6. Hotels & Stays
  {
    title: 'Where to Stay in Singapore: Best Neighbourhoods for First-Time Travellers',
    slug: 'where-to-stay-in-singapore-neighbourhood-guide',
    category: 'hotels',
    author: 'Aditya Sharma',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
    excerpt: 'Comparing Marina Bay, Orchard, Bugis, Chinatown, and Little India to find the perfect hotel base for your Singapore vacation budget.',
    tags: ['Hotels', 'Accommodation', 'Marina Bay', 'Orchard Road'],
    content: `Choosing the right area to stay in Singapore depends on your travel style, budget, and family needs.

### 1. Marina Bay (Luxury & Iconic Views)
- **Vibe**: Ultramodern, waterfront dining, luxury shopping.
- **Top Picks**: Marina Bay Sands, The Ritz-Carlton Millenia, Fullerton Bay Hotel.
- **Best For**: Honeymooners and travellers seeking iconic postcard views.

### 2. Bugis & Kampong Glam (Mid-Range & Central Boutique)
- **Vibe**: Trendy cafes, MRT interchange hubs, vibrant street culture.
- **Top Picks**: Andaz Singapore, Hotel G, Mercure Singapore Bugis.
- **Best For**: Couples and friends wanting central access at reasonable prices.

### 3. Little India & Farrer Park (Budget & Indian Dining Convenience)
- **Vibe**: 24/7 vegetarian dining, Mustafa Centre shopping, excellent MRT connectivity.
- **Top Picks**: One Farrer Hotel, Holiday Inn Singapore Little India, Hotel Boss.
- **Best For**: Families, pure vegetarian tourists, and budget-conscious travellers.`
  },

  // 7. Photography & Nightlife
  {
    title: 'Singapore Nightlife & Rooftop Bars: Skyline Views, Cocktails & Clarke Quay',
    slug: 'singapore-nightlife-rooftop-bars-clarke-quay',
    category: 'photo_night',
    author: 'Maya Tan',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop',
    excerpt: 'From world-class rooftop cocktail lounges like CÉ LA VI and 1-Altitude to riverside party vibes along Clarke Quay and Boat Quay.',
    tags: ['Nightlife', 'Rooftop Bars', 'Clarke Quay', 'Cocktails'],
    content: `Singapore transforms into a dazzling city of lights after sunset. Whether you are looking for world-ranked speakeasy cocktails or energetic riverside beats:

### 1. CÉ LA VI at Marina Bay Sands
Perched on the 57th-floor rooftop of Marina Bay Sands, offering front-row vistas of the downtown skyline, infinity pool, and Singapore Strait.

### 2. Clarke Quay Riverside Promenade
Historic warehouses converted into vibrant open-air pubs, live music clubs, and riverside restaurants. Grab a drink and watch brightly lit river cruise bumboats glide past.

### 3. Atlas Bar (Parkview Square)
Often hailed as the "Gotham Building of Singapore", Atlas houses an awe-inspiring 3-story gilded gin tower containing over 1,300 rare gins beneath Art Deco frescoes.`
  },
  {
    title: 'Top 10 Most Instagrammable Spots in Singapore for Stunning Travel Photos',
    slug: 'most-instagrammable-photography-spots-singapore',
    category: 'photo_night',
    author: 'Priya Patel',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop',
    excerpt: 'Level up your Instagram feed! Fort Canning Tree Tunnel, Tan Teng Niah colourful house, Old Hill Street Police Station, and Joo Chiat shophouses.',
    tags: ['Instagram Spots', 'Photography', 'Travel Photos', 'Shophouses'],
    content: `Singapore is packed with stunning architectural contrasts, vivid heritage shophouses, and lush nature photo opportunities.

### 1. Fort Canning Tree Tunnel
A spiral underground staircase where looking up reveals a dramatic canopy of lush green rain tree branches against the sky.
- *Tip*: Arrive before 8:30 AM to skip the photo queue.

### 2. House of Tan Teng Niah (Little India)
The last surviving Chinese villa in Little India, painted in an eye-catching rainbow of pastel colors.

### 3. Peranakan Houses on Koon Seng Road (Joo Chiat)
Pastel-hued heritage terrace houses adorned with intricate ceramic tiles and European plaster motifs.

### 4. Old Hill Street Police Station
Features 927 rainbow-coloured louvered window shutters near Clarke Quay, stunning both by day and under nighttime illumination.`
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')
    const countParam = parseInt(searchParams.get('count') || '1', 10)

    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    })

    // Filter by category if requested, otherwise choose from full pool
    let pool = TEMPLATE_POOL
    if (categoryParam) {
      const filtered = TEMPLATE_POOL.filter(t => t.category.toLowerCase() === categoryParam.toLowerCase())
      if (filtered.length > 0) pool = filtered
    }

    const createdPosts = []
    const count = Math.min(Math.max(1, countParam), 5) // max 5 per call

    for (let i = 0; i < count; i++) {
      const tmpl = pool[Math.floor(Math.random() * pool.length)]
      const uniqueSuffix = Math.random().toString(36).substring(2, 6).toLowerCase()
      const today = new Date().toISOString().split('T')[0]

      const newDoc = {
        _type: 'blogPost',
        title: tmpl.title, // Clean editorial title without codes
        slug: { _type: 'slug', current: `${tmpl.slug}-${uniqueSuffix}` },
        category: tmpl.category,
        author: tmpl.author,
        date: today,
        readTime: tmpl.readTime,
        imageUrl: tmpl.imageUrl,
        excerpt: tmpl.excerpt,
        content: tmpl.content,
        isFeatured: false,
        isPublished: true,
        viewCount: 0,
        tags: tmpl.tags || [],
        seoDescription: tmpl.excerpt,
      }

      const created = await client.create(newDoc)
      createdPosts.push(created.title)
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${createdPosts.length} blog post(s)`,
      generated: createdPosts,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Auto‑publish failed' }, { status: 500 })
  }
}


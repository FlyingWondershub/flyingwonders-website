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
  },
  // 8. Klook-Inspired Deep Travel Guides (Last 3 Months Trending Guides)
  {
    title: 'First Look at the New Singapore Oceanarium Sentosa: Exhibits, Zones & Visiting Guide',
    slug: 'singapore-oceanarium-sentosa-visitor-guide',
    category: 'sightseeing',
    author: 'Maya Tan',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop',
    excerpt: 'The brand-new Singapore Oceanarium at Resorts World Sentosa: 22 immersive zones, massive viewing habitats, and interactive marine conservation exhibits.',
    tags: ['Singapore Oceanarium', 'Sentosa', 'Marine Life', 'Family Attractions', 'Tickets'],
    content: `Formerly known as the S.E.A. Aquarium, the newly transformed and vastly expanded **Singapore Oceanarium** at Resorts World Sentosa is one of the world's most cutting-edge marine institutions. Spanning 22 distinct immersive zones, it brings visitors face-to-face with over 100,000 marine animals from more than 1,000 species.

Whether traveling with curious young explorers or marine biology enthusiasts, this guide covers key exhibits, feeding timings, and ticketing details.

---

## 1. The 22 Immersive Oceanic Zones

The new Oceanarium is designed to take visitors on a continuous voyage from shallow coastal mangroves and coral reefs down to the mysterious depths of the abyssal ocean trench.

![Underwater Tunnel with Manta Rays and Giant Sharks](https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=900&auto=format&fit=crop)

### Must-See Habitats:
- **The Open Ocean Habitat**: The iconic centerpiece featuring a panoramic viewing panel over 36 meters wide. Watch majestic manta rays, giant groupers, and zebra sharks glide past in millions of gallons of crystal-clear seawater.
- **Apex Predators Zone**: Walk through an underwater acrylic tunnel surrounded by over 12 species of apex sharks, including hammerheads and sand tiger sharks.
- **Deep Sea & Bioluminescence Gallery**: Interactive darkened chambers displaying ethereal moon jellies, glowing deep-sea invertebrates, and hydrothermal vent creatures.

> **Insider Tip**: The best photo lighting at the Open Ocean panel is between 11:30 AM and 1:00 PM when the sunlight filtering through the overhead skylights illuminates the school of golden trevally.

[CTA: Singapore Oceanarium & Sentosa Passes | Instant Barcoded E-Tickets | /singapore-attractions]

---

## 2. Daily Feeding Sessions & Animal Encounters

| Experience / Habitat | Timing | Location |
| :--- | :--- | :--- |
| **Open Ocean Manta Feeding** | 11:00 AM & 3:30 PM | Open Ocean Habitat Viewing Gallery |
| **Shark Feeding Frenzy** | 2:00 PM (Tue & Thu) | Apex Predators Tunnel |
| **Coral Reef Diversity Talk** | 1:30 PM & 4:30 PM | Coral Garden Rotunda |

---

## 3. Ticket Pricing & Opening Hours

- **Opening Hours**: Daily from **10:00 AM – 7:00 PM** (Last admission 6:00 PM).
- **Adult Ticket (13+ yrs)**: Approx. SGD $44.00
- **Child Ticket (4–12 yrs)**: Approx. SGD $33.00
- **Infants (<4 yrs)**: Free admission.

---

## 4. How to Get There

1. **Sentosa Express Monorail**: Take the North East Line (NEL) or Circle Line (CCL) to **HarbourFront MRT Station (NE1/CC29)**. Enter VivoCity Mall (Level 3) and take the Sentosa Express to **Resorts World Station**.
2. **Sentosa Boardwalk (Scenic Walk)**: A covered pedestrian walkway with travelators connecting VivoCity to Sentosa. Takes about 10–12 minutes and entry into the island is free!`
  },
  {
    title: 'Universal Studios Singapore: Halloween Horror Nights Guide & Fast Pass Hacks',
    slug: 'halloween-horror-nights-universal-studios-singapore-guide',
    category: 'family',
    author: 'Aditya Sharma',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop',
    excerpt: 'Everything you need to conquer Halloween Horror Nights at Universal Studios Singapore: haunted house rankings, scare zones, ticket types, and express passes.',
    tags: ['Universal Studios Singapore', 'Halloween Horror Nights', 'Sentosa', 'Theme Parks'],
    content: `Universal Studios Singapore's **Halloween Horror Nights (HHN)** is Southeast Asia's premier Halloween blockbuster event. Every autumn, the park undergoes a spine-chilling transformation with elaborate haunted houses, atmospheric scare zones, immersive live shows, and night-time roller coaster thrills.

---

## 1. What to Expect: Haunted Houses & Scare Zones

Each edition features 4 to 5 masterfully crafted haunted houses themed around Asian folklore, psychological thrillers, and global pop culture collaborations.

![Universal Studios Singapore Illuminated for Night Entertainment](https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=900&auto=format&fit=crop)

### Key Event Elements:
- **Haunted Houses**: Walk through terrifying mazes featuring live scare actors, animatronics, and Hollywood-grade special effects.
- **Scare Zones**: Open-air themed street environments throughout New York, Hollywood, and Ancient Egypt where sinister creatures roam freely.
- **Rides Operating at Night**: Popular adrenaline coasters including *Battlestar Galactica: HUMAN vs. CYLON*, *TRANSFORMERS The Ride: The Ultimate 3D Battle*, and *Revenge of the Mummy* remain open throughout the night.

> **Express Pass Warning**: Regular queue times for top haunted houses can easily exceed 90–120 minutes on peak weekend nights. We strongly advise securing an **HHN Express Pass** for priority turnstile access.

[CTA: Universal Studios Singapore Tickets & Express Passes | Book with Flying Wonders | /singapore-attractions]

---

## 2. Practical Tips for First-Timers

- **Event Timings**: Peak nights run from 7:30 PM to 1:30 AM; non-peak nights run from 7:30 PM to 12:30 AM.
- **Dress Comfortably**: Singapore's evening humidity remains high. Wear light, breathable clothing and sturdy walking shoes as you will be on your feet for several hours.
- **Age Advisory**: The event is not recommended for children under the age of 13 due to intense scare effects and mature horror themes.`
  },
  {
    title: 'Science Centre Singapore & Omni-Theatre: Interactive Science, Mirror Maze & Snow City',
    slug: 'science-centre-singapore-omni-theatre-guide',
    category: 'family',
    author: 'Priya Patel',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1200&auto=format&fit=crop',
    excerpt: 'A complete family guide to Science Centre Singapore in Jurong: Professor Crackitt’s Mirror Maze, Fire Tornado Show, Omni-Theatre 8K dome, and Snow City.',
    tags: ['Science Centre', 'Family Travel', 'Kids Activities', 'Omni-Theatre', 'Snow City'],
    content: `Located in Jurong East, **Science Centre Singapore** is one of the world's most acclaimed experiential science museums. Boasting more than 1,000 interactive exhibits across 14 galleries, it makes science, technology, and engineering captivating for kids and adults alike.

---

## 1. Top Attractions Inside Science Centre

![Science Discovery Dome and Interactive Exhibitions](https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=900&auto=format&fit=crop)

### Top Highlights:
- **Professor Crackitt’s Light & Mirror Maze**: Asia’s largest mirror maze featuring 105 mirror chambers, endless corridors, and optical illusions that test your sense of direction.
- **The Fire Tornado Show**: Witness an awe-inspiring 6-meter-high vortex of flame created inside a specialized wind chamber daily at 2:30 PM.
- **Omni-Theatre (8K Digital Dome Cinema)**: Southeast Asia’s first 8K 3D digital dome theatre with a 23-meter seamless screen transporting you into deep space and ocean depths.
- **Snow City Singapore**: Adjacent to the main building, Snow City offers an indoor sub-zero snow chamber with three-story snow slides and drift-on-ice bumper cars.

    [CTA: Science Centre & Kids Attraction Tickets | Instant Quotation | /singapore-attractions]

---

## 2. Ticket Prices & Nearest MRT Access

- **Location**: 15 Science Centre Road, Singapore 609081.
- **Nearest MRT**: **Jurong East MRT Station (NS1/EW24)**. From Exit A, walk 8 minutes via the sheltered walkway along Jurong Town Hall Road.
- **Opening Hours**: Tuesday – Sunday: 10:00 AM to 5:00 PM (Closed on non-holiday Mondays).`
  },
  // 9. Additional Top Klook Singapore Articles (Last 3 Months Trending)
  {
    title: 'Singapore Cable Car Sky Network Guide: Mount Faber, Sentosa Line & Sunset Views',
    slug: 'singapore-cable-car-sky-network-guide',
    category: 'sightseeing',
    author: 'Aditya Sharma',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop',
    excerpt: 'Ride above the jungle canopy and harbor! Complete guide to Singapore Cable Car Mount Faber Line, Sentosa Line, and glass-bottom cabins.',
    tags: ['Singapore Cable Car', 'Sentosa', 'Mount Faber', 'Sightseeing', 'Scenic Views'],
    content: `Connecting mainland Singapore to Sentosa Island, the **Singapore Cable Car Sky Network** offers 360-degree aerial views of the city skyline, lush rainforest canopies, and the busy Singapore Cruise Harbour.

---

## 1. The Two Cable Car Lines

![Singapore Cable Car Cabin Gliding Over Tropical Sentosa Island](https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=900&auto=format&fit=crop)

- **Mount Faber Line**: Mount Faber Peak ↔ HarbourFront ↔ Sentosa (Flies high across the harbor channel into the island).
- **Sentosa Line**: Merlion Station ↔ Imbiah Lookout ↔ Siloso Point (Internal aerial line across Sentosa beaches and attractions).

> **Golden Hour Hack**: Board the Mount Faber line at 6:45 PM from HarbourFront to Mount Faber to watch the sunset transition into sparkling harbor lights.

[CTA: Singapore Cable Car Sky Pass | Direct Turnstile E-Tickets | /singapore-attractions]`
  },
  {
    title: 'Night Safari Singapore Tram Ride & Creatures of the Night Show Guide',
    slug: 'night-safari-singapore-tram-ride-guide',
    category: 'family',
    author: 'Maya Tan',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=1200&auto=format&fit=crop',
    excerpt: 'The world’s first nocturnal wildlife park: tram ride routes, walking trail secret paths, booking time slots, and animal show timings.',
    tags: ['Night Safari', 'Mandai Wildlife Reserve', 'Wildlife', 'Family Travel'],
    content: `Nestled in the Mandai rainforest, **Night Safari Singapore** is the world’s first nocturnal animal sanctuary, housing over 900 animals from nearly 100 nocturnal species in naturalistic open-air habitats.

---

## 1. Guided Tram Experience vs. Walking Trails

![Asian Elephants and Nocturnal Wildlife in Naturalistic Habitats](https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=900&auto=format&fit=crop)

- **The 40-Minute Guided Tram**: Included in admission. Journeys through 6 geographical zones from the Himalayan Foothills to the Asian Riverine Forest.
- **The 4 Interconnected Walking Trails**: Leopard Trail, Fishing Cat Trail, East Lodge Trail, and Tasmanian Devil Trail allow close-up encounters with free-ranging bats, flying squirrels, and clouded leopards.

> **Crucial Tip**: Admission requires booking a specific entry time slot (7:15 PM, 8:15 PM, 9:15 PM, or 10:15 PM). Arrive 20 minutes prior to your allocated slot.

[CTA: Night Safari Tickets with Tram Ride | Instant Confirmation | /singapore-attractions]`
  },
  {
    title: 'Bird Paradise Singapore at Mandai: 8 Walk-In Aviaries & Penguin Cove Guide',
    slug: 'bird-paradise-mandai-singapore-guide',
    category: 'family',
    author: 'Priya Patel',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&auto=format&fit=crop',
    excerpt: 'Explore Asia’s largest bird park at Mandai: 8 walk-in aviaries, Ocean Network Express Penguin Cove, and spectacular free-flight bird presentations.',
    tags: ['Bird Paradise', 'Mandai Wildlife', 'Penguin Cove', 'Eco Tourism'],
    content: `Replacing the historic Jurong Bird Park, **Bird Paradise** at Mandai Wildlife Reserve is home to 3,500 birds across 400 species in state-of-the-art immersive walk-in aviaries.

---

## 1. Highlights of the 8 Thematic Aviaries

![Vibrant Macaws and Flamingos in Open Canopy Aviaries](https://images.unsplash.com/photo-1549608276-5786777e6587?w=900&auto=format&fit=crop)

- **Hong Leong Foundation Crimson Wetlands**: Roaring 20-meter waterfall surrounded by hundreds of scarlet ibises and roseate spoonbills.
- **Kuok Group Wings of Asia**: Tranquil bamboo forests housing threatened hornbills and pied imperial pigeons.
- **Ocean Network Express Penguin Cove**: A climate-controlled indoor habitat with underwater acrylic tunnels to view gentoo, king, and Humboldt penguins swimming at high speeds.

[CTA: Bird Paradise Mandai Tickets | Instant Barcoded E-Tickets | /singapore-attractions]`
  },
  {
    title: 'Skyline Luge Singapore & Skyride Sentosa: Tracks, Night Luge & Ticket Hacks',
    slug: 'skyline-luge-sentosa-singapore-guide',
    category: 'family',
    author: 'Rohan Mehta',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop',
    excerpt: 'Part go-kart, part toboggan! Master all 4 purpose-built downhill tracks at Skyline Luge Sentosa, including the magical Night Luge with neon lighting.',
    tags: ['Skyline Luge', 'Sentosa', 'Adventure', 'Family Fun'],
    content: `Invented in New Zealand and perfected in Singapore, the **Skyline Luge Sentosa** gives riders full gravity-fueled steering control down 2.6 kilometers of twisting downhill purpose-built tracks.

---

## 1. The 4 Downhill Tracks

- **Kupu Kupu Track (638m)**: Gentle sweeping curves through the forest canopy.
- **Expedition Track (658m)**: Hairpin turns and long straightaways with harbor views.
- **Jungle Track (700m)**: High-speed drops through illuminated tunnel arches.
- **Dragon Track (688m)**: The longest, most challenging track with tight switchbacks.

> **Night Luge Experience**: Every Friday and Saturday evening from 7:00 PM, the tracks are illuminated in dynamic LED neon colors with pulsing music.

[CTA: Skyline Luge & Skyride 3-Ride / 4-Ride Combos | Book E-Tickets | /singapore-attractions]`
  },
  {
    title: 'Singapore River Cruise by WaterB & Singapore River Experience: Clarke Quay to Marina Bay',
    slug: 'singapore-river-cruise-bumboat-guide',
    category: 'sightseeing',
    author: 'Aditya Sharma',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=1200&auto=format&fit=crop',
    excerpt: 'Cruise Singapore’s historic waterways on an eco-friendly electric bumboat. See Clarke Quay, Boat Quay, Fullerton Hotel, and the Merlion.',
    tags: ['River Cruise', 'Clarke Quay', 'Marina Bay', 'Sightseeing'],
    content: `Tracing Singapore’s transformation from a sleepy fishing village to a global metropolis, the **40-minute Singapore River Cruise** provides the best waterfront perspective of historic colonial architecture juxtaposed against gleaming modern skyscrapers.

---

## 1. Key Landmarks along the Cruise Route

- **Clarke Quay**: Restored 19th-century godowns and vibrant riverside promenades.
- **The Historical Bridges**: Pass beneath Anderson Bridge, Cavenagh Bridge (Singapore’s oldest surviving suspension bridge), and Elgin Bridge.
- **The Merlion Park & Marina Bay**: Emerge into the open bay for postcard shots of the water-spouting Merlion statue and Marina Bay Sands.

[CTA: Singapore River Cruise Tickets | Instant Confirmation | /singapore-attractions]`
  },
  {
    title: 'Museum of Ice Cream Singapore (Dempsey): Unlimited Ice Cream & Giant Sprinkle Pool',
    slug: 'museum-of-ice-cream-singapore-guide',
    category: 'photo_night',
    author: 'Priya Patel',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=1200&auto=format&fit=crop',
    excerpt: 'The ultimate whimsical pastel playground in Dempsey Hill: 14 multi-sensory installations, unlimited ice cream treats, and the world-famous sprinkle pool.',
    tags: ['Museum of Ice Cream', 'Instagram Spots', 'Dempsey Hill', 'Family Travel'],
    content: `Spanning 60,000 square feet across historic colonial barracks in Dempsey Hill, the **Museum of Ice Cream (MOIC) Singapore** is a vibrant, pastel-pink immersive wonderland dedicated to the joy of ice cream and playful photography.

---

## 1. Top Installations & Unlimited Treats

- **The World-Famous Sprinkle Pool**: Dive into thousands of antimicrobial rainbow sprinkles for iconic photos.
- **Dragon Playground**: A nostalgic pastel tribute to Singapore’s iconic Toa Payoh dragon playground.
- **Unlimited Ice Cream Stations**: Savor rotating handcrafted ice cream flavors including local favorites like Pulut Hitam, Lychee Bandung, and Salted Caramel.

[CTA: Museum of Ice Cream Tickets | Best Price Guarantee | /singapore-attractions]`
  },
  {
    title: 'Wild Wild Wet Waterpark Singapore (Downtown East): Rides, Slides & Family Passes',
    slug: 'wild-wild-wet-waterpark-singapore-guide',
    category: 'family',
    author: 'Maya Tan',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-8cf4f44b2a0a?w=1200&auto=format&fit=crop',
    excerpt: 'Beat the tropical heat at Wild Wild Wet! Free fall speed slides, Torpedo 360 loops, Shiok River lazy float, and Kidz Zone water playgrounds.',
    tags: ['Wild Wild Wet', 'Waterpark', 'Downtown East', 'Family Travel'],
    content: `Consistently ranked among the top 10 water parks in Asia by TripAdvisor Travellers’ Choice, **Wild Wild Wet** in Pasir Ris offers 16 adrenaline-pumping water slides and relaxing lazy river attractions.

---

## 1. High-Thrills vs. Family Chill

- **Adrenaline Slides**: *Free Fall* (near-vertical drop at 50 km/h), *Torpedo* (free-fall capsule into a 360-degree loop), and *Ular-Lah* (raft slide down mega flumes).
- **Relaxation**: *Shiok River* (gentle lazy river floating around the perimeter) and *Tsunami* (massive wave pool with gentle swells).
- **Toddlers & Kids**: *Kidz Zone* and *Splash Play* with mini slides and tipping water buckets.

[CTA: Wild Wild Wet Waterpark Passes | Book E-Tickets | /singapore-attractions]`
  },
  {
    title: 'Singapore Flyer & Time Capsule: Giant Ferris Wheel & Immersive Heritage Journey',
    slug: 'singapore-flyer-time-capsule-guide',
    category: 'sightseeing',
    author: 'Aditya Sharma',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop',
    excerpt: 'Standing 165 meters tall in Marina Bay: giant observation wheel rotation guides, Time Capsule multisensory interactive exhibits, and champagne flights.',
    tags: ['Singapore Flyer', 'Marina Bay', 'Sightseeing', 'Observation Wheel'],
    content: `Towering 165 meters (equivalent to 42 storeys) over Marina Bay, the **Singapore Flyer** is one of the world's largest giant observation wheels, offering vistas reaching as far as Malaysia and Indonesia on clear days.

---

## 1. The Experience: Time Capsule & Giant Flight

- **Time Capsule Exhibition**: A 2-story interactive projection exhibition guided by a time-traveling robot companion (*R65*) showcasing 700 years of Singapore's heritage.
- **The 30-Minute Flight**: Step inside a spacious, air-conditioned UV-protected glass capsule for a rotation with 360-degree vistas over Gardens by the Bay, Marina Bay Sands, and the Singapore Strait.

[CTA: Singapore Flyer & Time Capsule Tickets | Instant Booking | /singapore-attractions]`
  },
  {
    title: 'Wings of Time Sentosa: Fireworks, Laser & Water Symphony Evening Spectacular',
    slug: 'wings-of-time-sentosa-show-guide',
    category: 'sightseeing',
    author: 'Maya Tan',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&auto=format&fit=crop',
    excerpt: 'The multi-sensory night show on Siloso Beach: water fountains, 3D projection mapping, laser pyrotechnics, and show timings.',
    tags: ['Wings of Time', 'Sentosa', 'Night Show', 'Fireworks'],
    content: `Set against the open sea at Siloso Beach in Sentosa, **Wings of Time** is an outdoor night show featuring giant water screens, 3D video mapping, state-of-the-art lasers, and fireworks.

---

## 1. Story & Visual Effects

Follow the heroic journey of *Shahbaz*, a prehistoric bird, as he travels through the British Industrial Revolution, Silk Road, and Mayan Pyramids alongside human friends Rachel and Felix.

- **Show Timings**: Daily shows at **7:40 PM** and **8:40 PM**.
- **Location**: Siloso Beach (Right outside Sentosa Express Beach Station).

[CTA: Wings of Time Standard & Premium Seating | Instant E-Tickets | /singapore-attractions]`
  },
  {
    title: 'Madame Tussauds Singapore & Images of Singapore: Marvel 4D, VR Racing & Boat Ride',
    slug: 'madame-tussauds-singapore-sentosa-guide',
    category: 'family',
    author: 'Rohan Mehta',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1200&auto=format&fit=crop',
    excerpt: 'Step onto the red carpet at Imbiah Lookout Sentosa: Hollywood stars, Marvel 4D Universe cinema, Spirit of Singapore indoor boat ride, and F1 VR racing.',
    tags: ['Madame Tussauds', 'Sentosa', 'Marvel 4D', 'Family Fun'],
    content: `Located at Imbiah Lookout on Sentosa Island, **Madame Tussauds Singapore** brings pop icons, Bollywood legends, global sports champions, and Marvel superheroes to life in hyper-realistic wax figures.

---

## 1. Key 5-in-1 Experiences Included

- **Spirit of Singapore Boat Ride**: A botanical boat ride gliding through tropical Singapore gardens and roaring F1 night race simulations.
- **Marvel Universe 4D Cinema**: Feel wind, water spray, and tremors as Iron Man, Spider-Man, and Captain Marvel battle villains in Singapore.
- **Ultimate Film Star Experience**: Step onto Bollywood dance sets with real-time green-screen interactive dance-offs!

[CTA: Madame Tussauds 5-in-1 Sentosa Combo Pass | Wholesale Rates | /singapore-attractions]`
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


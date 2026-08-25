import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from 'next-sanity'
import { dataset, projectId, apiVersion } from '../sanity/env.ts'

/**
 * Seed 10 new blog articles (inspired by Klook Singapore travel guides)
 * into Sanity as `blogPost` documents.
 *
 * Run: npx tsx scripts/seed-klook-blogs.ts
 */

const KLOOK_INSPIRED_ARTICLES = [
  {
    slug: 'singapore-oceanarium-resorts-world-sentosa-guide',
    title: 'Singapore Oceanarium at Resorts World Sentosa: Complete Visitor Guide to All 22 Zones',
    category: 'sightseeing',
    author: 'Aditya Sharma',
    readTime: '9 min read',
    imageUrl: 'https://res.klook.com/image/upload/v1751733526/nqtgjunblsqxemcj4zsy.jpg',
    excerpt: 'The former S.E.A. Aquarium has been reborn as the spectacular Singapore Oceanarium — three times larger, with 22 immersive zones spanning coastal mangroves to deep abyssal habitats. Here is your complete 2026 visitor guide.',
    tags: ['Singapore Oceanarium', 'Sentosa', 'Marine Life', 'Family Attractions', 'Resorts World Sentosa'],
    content: `The iconic S.E.A. Aquarium at Resorts World Sentosa has undergone a massive transformation and reopened as the vastly expanded **Singapore Oceanarium** — now three times its original footprint, making it one of the premier oceanic conservation and exhibition centres in all of Southeast Asia.

Whether you are visiting Singapore with your family, as a couple, or on a school excursion, this guide covers everything you need to know before stepping inside.

---

## 1. The 22 Immersive Oceanic Zones

The new Oceanarium is designed as a continuous underwater voyage — starting from shallow coastal mangroves and coral reefs, descending into the mysterious depths of the abyssal ocean trench.

![Underwater Tunnel with Manta Rays and Giant Sharks at Singapore Oceanarium](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1751733600/oceanarium_tunnel.jpg)

### Must-See Habitats:
- **The Open Ocean Habitat**: The iconic centerpiece featuring a panoramic viewing panel over 36 meters wide. Watch majestic manta rays, giant groupers, and zebra sharks glide past in millions of gallons of crystal-clear seawater.
- **Apex Predators Zone**: Walk through an underwater acrylic tunnel surrounded by over 12 species of apex sharks, including hammerheads and sand tiger sharks.
- **Deep Sea & Bioluminescence Gallery**: Interactive darkened chambers displaying ethereal moon jellies, glowing deep-sea invertebrates, and hydrothermal vent creatures.
- **Prehistoric Marine Evolution Wing**: Trace the evolutionary journey of marine life from the Cambrian explosion through the age of giant marine reptiles to modern ocean ecosystems.

> The best photo lighting at the Open Ocean panel is between 11:30 AM and 1:00 PM when the sunlight filtering through the overhead skylights illuminates the school of golden trevally.

[CTA: Singapore Oceanarium & Sentosa Passes | Book E-Tickets with Flying Wonders | /singapore-attractions]

---

## 2. Research, Education & Interactive Touch Pools

![Glowing Jellyfish Gallery Inside Singapore Oceanarium](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1751733650/oceanarium_jellyfish.jpg)

The Oceanarium is not just a spectacle — it is also a world-class marine research institution:
- **Oceanographic Research Wing**: Real-time marine biologist labs visible through glass walls where scientists study coral regeneration and carbon sequestration.
- **Children's Interactive Touch Pools**: Let young explorers gently touch sea stars, horseshoe crabs, and sea cucumbers under trained staff supervision.
- **Plastic Pollution Awareness Exhibit**: Sobering displays showing the impact of microplastics on ocean life, paired with actionable sustainability pledges.

---

## 3. Daily Feeding Sessions & Animal Encounters

| Experience / Habitat | Timing | Location |
| :--- | :--- | :--- |
| **Open Ocean Manta Feeding** | 11:00 AM & 3:30 PM | Open Ocean Habitat Viewing Gallery |
| **Shark Feeding Frenzy** | 2:00 PM (Tue & Thu) | Apex Predators Tunnel |
| **Coral Reef Diversity Talk** | 1:30 PM & 4:30 PM | Coral Garden Rotunda |

---

## 4. Ticket Prices & Opening Hours

- **Opening Hours**: Daily from **10:00 AM – 7:00 PM** (Last admission 6:00 PM).
- **Adult Ticket (13+ yrs)**: Approx. SGD $43–48
- **Child Ticket (4–12 yrs)**: Approx. SGD $33
- **Infants (<4 yrs)**: Free admission.

---

## 5. How to Get There

- **Address**: Resorts World Sentosa, 8 Sentosa Gateway, Sentosa Island, Singapore 098269.
- **Sentosa Express Monorail**: Take the North East Line (NEL) or Circle Line (CCL) to **HarbourFront MRT Station (NE1/CC29)**. Enter VivoCity Mall (Level 3) and take the Sentosa Express to **Resorts World Station**.
- **Sentosa Boardwalk (Free Entry)**: A covered pedestrian walkway from VivoCity to Sentosa. Takes about 10–12 minutes.

> Recommended visiting duration is 2.5 to 3 hours. Best visited on weekday mornings to beat peak crowds. An ideal indoor attraction on Singapore's rainy afternoons!

[CTA: Singapore Attraction Tickets & Tour Packages | Instant Booking | /singapore-attractions]`
  },
  {
    slug: 'halloween-horror-nights-2026-universal-studios-singapore',
    title: 'Halloween Horror Nights 2026 at Universal Studios Singapore: Complete Haunted House & Ticket Guide',
    category: 'family',
    author: 'Rohan Mehta',
    readTime: '7 min read',
    imageUrl: 'https://res.klook.com/image/upload/v1783331899/odomatu8ifjzabpmbwy1.jpg',
    excerpt: 'Universal Studios Singapore\'s Halloween Horror Nights 14 returns across 18 terrifying select nights. Here is your survival guide to haunted houses, scare zones, live shows, and Express Pass strategy.',
    tags: ['Universal Studios Singapore', 'Halloween Horror Nights', 'Sentosa', 'Theme Parks', 'Nightlife'],
    content: `Every autumn, Universal Studios Singapore transforms into Southeast Asia's premier Halloween blockbuster event — **Halloween Horror Nights (HHN)**. The park undergoes a spine-chilling metamorphosis with elaborate haunted houses, atmospheric scare zones, immersive live shows, and night-time roller coaster thrills.

HHN 14 runs across **18 select peak nights between September 25 and November 1, 2026**. If you are visiting Singapore during this window, this event is an absolute must-experience.

---

## 1. Haunted Houses & Walkthrough Themes

![HHN 2026 Haunted House Entrance at Universal Studios Singapore](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1783332100/hhn2026_haunted_house.jpg)

Each edition features 4 to 5 masterfully crafted haunted houses themed around Asian folklore, psychological thrillers, and global pop culture collaborations:

- **Singapore's Most Haunted: The Broadcast Studio**: Explores supernatural urban legends set inside an abandoned 1980s television broadcasting studio. Expect jump scares, strobe lighting, and live scare actors in terrifyingly realistic costumes.
- **Cursed Ancestral Village**: Navigate through a traditional kampong overrun by restless spirits from ancient Southeast Asian folklore.
- **Cyber-Dystopian Nightmare**: A futuristic haunted maze set in a collapsed AI research facility where rogue experiments have gone horribly wrong.

> Regular queue times for top haunted houses can easily exceed 90–120 minutes on peak weekend nights. The HHN Express Pass is strongly recommended for priority turnstile access.

---

## 2. Live Shows & Scare Zones

![HHN 2026 Live Show featuring HamiKuma and Ponti-Ana](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1783332250/hhn2026_show_hamikuma.jpg)

### Must-Watch Live Performances:
- **The Scaremony**: Grand opening show at the park entrance — sets the mood for the entire night with pyrotechnics and theatrical performances.
- **Nail the Beat**: Fan-favorite Japanese horror character **HamiKuma** alongside the debut character **"Ponti-Ana"** — a sinister fusion of Pontianaks and modern pop culture.
- **Club PanDEMONium**: High-energy dance and visual spectacle themed after the Seven Deadly Sins.

### Open-Air Scare Zones:
Throughout New York, Hollywood, and Ancient Egypt zones, sinister creatures roam freely among the crowds. Stay alert — they appear when you least expect it!

---

## 3. Rides Operating at Night

Popular adrenaline coasters remain open throughout HHN nights:
- **Battlestar Galactica: HUMAN vs. CYLON** — Dual inverted roller coasters reaching heights of 42.5 meters, even more thrilling in the dark.
- **TRANSFORMERS: The Ride — The Ultimate 3D Battle** — Hyper-realistic cinematic motion simulator.
- **Revenge of the Mummy** — Indoor dark coaster with sudden drops and pyrotechnics.

---

## 4. Ticket Prices & Practical Tips

| Ticket Type | Price (SGD) |
| :--- | :--- |
| **Super Early Bird Admission** | ~SGD 78 |
| **Peak Night Regular Admission** | ~SGD 88–98 |
| **Express Pass Add-On** | ~SGD 50–90 |

- **Event Timings**: Peak nights run from **7:00 PM to 1:30 AM**; non-peak nights run from **7:30 PM to 12:30 AM**.
- **Age Advisory**: Not recommended for children under 13 due to intense scare effects and mature horror themes.
- **Dress Code**: No costumes or masks allowed for guests.
- **Late-Night Transport**: Take the Sentosa Express or RWS8 bus for late departures; Grab/taxi queues can be long after midnight.

[CTA: Universal Studios Singapore Tickets & Express Passes | Book with Flying Wonders | /singapore-attractions]`
  },
  {
    slug: '80-best-things-to-do-in-singapore-attractions-guide',
    title: '80 Best Things To Do in Singapore: The Ultimate Attraction, Food & Culture Bucket List',
    category: 'sightseeing',
    author: 'Priya Patel',
    readTime: '12 min read',
    imageUrl: 'https://res.klook.com/image/upload/v1691379347/eoahvbzyyunpnuei0olz.jpg',
    excerpt: 'From Marina Bay Sands and Gardens by the Bay to hidden Peranakan shophouses and Michelin hawker stalls — here are 80 unmissable things to do in Singapore, curated for first-time and returning Indian travellers.',
    tags: ['Singapore Attractions', 'Things To Do', 'Bucket List', 'Marina Bay', 'Sentosa', 'Culture'],
    content: `Singapore packs an extraordinary amount of world-class experiences into a tiny island nation. Whether you have 3 days or 10, there is always something incredible waiting around the corner. This comprehensive bucket list covers **80 of the best things to do in Singapore** — from iconic landmarks to hidden neighbourhood gems.

---

## 1. Marina Bay & Civic District

![Singapore Marina Bay Skyline with Flyer and ArtScience Museum](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1691379400/singapore_flyer_marinabay.jpg)

- **Gardens by the Bay**: Explore the Cloud Forest's 35-meter indoor waterfall, the Flower Dome's Mediterranean gardens, and catch the free Supertree Grove light show every evening at 7:45 PM and 8:45 PM.
- **Marina Bay Sands SkyPark**: The iconic rooftop observation deck on the 57th floor with uninterrupted panoramic city and ocean views.
- **Singapore Flyer**: Asia's second-tallest observation wheel offering 30-minute capsule rides overlooking Marina Bay, Sentosa, and even parts of Malaysia and Indonesia on clear days.
- **ArtScience Museum**: The lotus-shaped building hosting rotating immersive digital art exhibitions (teamLab, Van Gogh Alive).
- **Merlion Park**: The iconic half-lion, half-fish statue and Singapore's most photographed landmark — best visited at sunrise or sunset.

---

## 2. Sentosa Island Attractions

![Sentosa Island Skyline Luge and Beach Attractions](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1691379550/sentosa_skyline_luge.jpg)

- **Universal Studios Singapore**: Southeast Asia's only Universal Studios with 6 themed zones and blockbuster rides.
- **Singapore Oceanarium**: The newly expanded marine wonderland with 22 immersive zones.
- **Skyline Luge Sentosa**: Gravity-fuelled go-kart rides down a scenic hillside track — perfect for families.
- **Adventure Cove Waterpark**: Wave pools, lazy rivers, and high-speed water slides.
- **Madame Tussauds Singapore**: Wax figures of Bollywood, Hollywood, and world leaders with interactive Marvel and Star Wars zones.
- **Wings of Time**: Spectacular outdoor night show featuring water projections, lasers, and fireworks over the sea.

[CTA: Sentosa Attraction Combo Passes | Save Up to 45% | /singapore-attractions]

---

## 3. Nature, Wildlife & Outdoor Adventures

- **Mandai Wildlife Reserve**: World-renowned Singapore Zoo, Night Safari tram tours, River Wonders' Amazon Quest boat ride, and the brand-new Bird Paradise with 8 walk-in aviaries.
- **MacRitchie Treetop Walk**: A 250-meter suspension bridge soaring 25 meters above the rainforest canopy.
- **Southern Ridges & Henderson Waves**: A 10-km elevated nature trail connecting Mount Faber, Henderson Waves bridge, and Alexandra Arch.
- **Pulau Ubin**: Take a traditional bumboat to this rustic offshore island for cycling, Chek Jawa wetlands, and authentic kampong life.
- **Singapore Botanic Gardens (UNESCO)**: 160-year-old tropical garden featuring the National Orchid Garden with over 1,000 species.

---

## 4. Cultural Heritage Enclaves

![Chinatown Heritage Centre and Shophouses](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1691379500/chinatown_heritage_centre.jpg)

- **Chinatown**: Buddha Tooth Relic Temple, Sri Mariamman Hindu Temple, Chinatown Complex Hawker Centre, and Yip Yew Chong heritage murals.
- **Little India**: Sri Veeramakaliamman Temple, Mustafa Centre 24/7 shopping, Tekka Centre hawker food, and fragrant garland shops along Serangoon Road.
- **Kampong Glam**: Sultan Mosque's golden dome, Haji Lane indie boutiques, and Arabian-style al fresco dining on Bussorah Street.
- **Joo Chiat & Katong**: Pastel-hued Peranakan shophouses, traditional Nonya cuisine, and artisanal coffee roasters.

---

## 5. Lifestyle, Shopping & Indoor Fun

![Jewel Changi Airport HSBC Rain Vortex](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1691379450/jewel_changi_rain_vortex.jpg)

- **Jewel Changi Airport**: The world's tallest indoor waterfall (HSBC Rain Vortex), Canopy Park with Sky Nets and Discovery Slides, and over 280 retail and dining outlets.
- **Orchard Road**: Singapore's premier 2.2-km shopping boulevard lined with ION Orchard, Paragon, and Takashimaya.
- **Museum of Ice Cream**: A playful, multi-sensory experiential museum with 14 whimsical installations.
- **Clarke Quay Night Cruises**: Heritage bumboat rides along Singapore River past illuminated colonial godowns and modern skyscrapers.

> Bundling 3 to 5 attractions with a Singapore Attraction Pass saves up to 45% compared to buying individual door tickets. Ask our destination desk for customised bundle quotes!

[CTA: Singapore Attraction Tickets & Package Quotes | Instant Booking | /singapore-attractions]`
  },
  {
    slug: 'science-centre-singapore-hidden-exhibitions-mirror-maze-guide',
    title: 'Science Centre Singapore: Mirror Maze, Laser Challenge, Fire Tornado & Lesser-Known Exhibitions',
    category: 'family',
    author: 'Kavita Sundaram',
    readTime: '7 min read',
    imageUrl: 'https://res.klook.com/image/upload/v1632122544/blog/urt5hregvcgm3ly9zz8l.jpg',
    excerpt: 'Beyond the well-known galleries lies a treasure trove of hidden exhibits — from Asia\'s largest mirror maze and Mission Impossible-style laser challenges to an 8-meter fire tornado. Here is your complete family guide.',
    tags: ['Science Centre', 'Family Travel', 'Kids Activities', 'Mirror Maze', 'Omni-Theatre'],
    content: `Located in Jurong East, **Science Centre Singapore** is one of the world's most acclaimed experiential science museums. Boasting more than 1,000 interactive exhibits across 14 galleries, it makes science, technology, and engineering captivating for kids and adults alike.

But beyond the well-known galleries, there are several hidden gems that most tourists miss entirely. This guide spotlights the lesser-known exhibitions that make Science Centre Singapore truly special.

---

## 1. Professor Crackitt's Light & Mirror Maze

![Asia's Largest Mirror Maze at Science Centre Singapore](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1632122600/mirror_maze_science_centre.jpg)

**Asia's largest mirror maze** features 105 identical mirror chambers, endless corridors, and kaleidoscopic light effects that test your sense of direction. Just when you think you have found the exit, you walk straight into your own reflection!

- **Duration**: 10–15 minutes per attempt (most visitors get delightfully lost for longer!)
- **Best For**: Kids aged 6+ and adults who love optical illusions and spatial puzzles.
- **Tip**: Follow the right-hand rule — keep your right hand touching the wall and you will eventually reach the exit.

---

## 2. Laser Maze Challenge

![Mission Impossible Style Laser Maze Challenge](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1632122650/laser_maze_challenge.jpg)

Channel your inner spy in this **Mission Impossible-style laser challenge**! Dodge, duck, and weave through a grid of green laser beams in a timed challenge. Break a beam and it is game over.

- **Difficulty Levels**: Easy (for kids), Medium, and Hard (adult competitive mode).
- **Tip**: Wear dark, tight-fitting clothing for maximum agility. Avoid loose scarves and bags.

---

## 3. Fire Tornado & Dialogue with Time

### The Fire Tornado Show
Witness an awe-inspiring **8-meter-high vortex of flame** created inside a specialized wind chamber. A trained demonstrator explains the physics of rotational air currents, thermodynamics, and how natural fire whirls form during bushfires.
- **Show Timings**: Daily at **2:30 PM** (approximately 10 minutes).

### Dialogue with Time (Ageing Booth)
An empathy-building exhibit where visitors simulate sensory loss associated with ageing — including blurred vision goggles, weighted limb braces, and sound-muffling headsets. The AI ageing photo booth projects what you might look like 30–50 years from now!

---

## 4. KidsSTOP & Omni-Theatre 8K Dome

![Omni-Theatre 8K Digital Dome at Science Centre](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1632122700/omni_theatre_dome.jpg)

- **KidsSTOP**: Dedicated science-play edutainment area for toddlers and children under 8, featuring water play tables, construction zones, and miniature supermarket role-play stations.
- **Omni-Theatre**: Southeast Asia's first **8K 3D digital dome theatre** with a 23-meter seamless screen transporting you into deep space documentaries and ocean depth explorations.

---

## 5. Ticket Prices & Getting There

| Ticket Type | Adult (SGD) | Child (SGD) |
| :--- | :--- | :--- |
| **General Admission** | ~$12 | ~$8 |
| **Omni-Theatre + Admission Combo** | ~$19.90 | ~$14.90 |
| **Mirror Maze Add-On** | ~$5 | ~$5 |

- **Address**: 15 Science Centre Road, Jurong East, Singapore 609081.
- **Nearest MRT**: **Jurong East MRT Station (NS1/EW24)** — 8-minute sheltered walk from Exit A.
- **Opening Hours**: Tuesday – Sunday: 10:00 AM to 5:00 PM. **Closed on Mondays** (except public holidays and school holidays).

> Allocate 3 to 4 hours for a full visit. Bring socks for children at KidsSTOP (mandatory requirement).

[CTA: Science Centre & Family Attraction Tickets | Instant Quotation | /singapore-attractions]`
  },
  {
    slug: 'pulau-ubin-singapore-island-cycling-chek-jawa-guide',
    title: 'Pulau Ubin Singapore: Bumboat, Bicycle Trails, Chek Jawa Wetlands & Kampong Life Guide',
    category: 'hidden_gems',
    author: 'Maya Tan',
    readTime: '8 min read',
    imageUrl: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_1000/v1602660707/blog/pulau-ubin.jpg',
    excerpt: 'Escape Singapore\'s urban skyline and step back in time on Pulau Ubin — a rustic offshore island where wooden kampong houses, wild boars, and pristine mangrove wetlands await just a 10-minute bumboat ride from Changi.',
    tags: ['Pulau Ubin', 'Hidden Gems', 'Nature', 'Cycling', 'Chek Jawa', 'Island Escape'],
    content: `Just a **10-minute traditional wooden bumboat ride** from Changi Point Ferry Terminal lies **Pulau Ubin** — Singapore's last remaining rural island and a living time capsule of what the entire nation looked like in the 1960s. While the mainland boasts glass-and-steel skyscrapers, Ubin preserves zinc-roofed wooden houses, wild boars roaming freely, and pristine mangrove coastlines.

For Indian tourists visiting Singapore, Pulau Ubin offers a refreshing contrast to the usual city attractions — and it costs almost nothing to explore.

---

## 1. Getting to Pulau Ubin

![Changi Point Bumboat Terminal to Pulau Ubin](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1602660800/ubin_bicycle_rental.jpg)

- **Departure Point**: Changi Point Ferry Terminal (51 Lorong Bekukong, Singapore 499172).
- **How to Get There**: Take the MRT to **Tanah Merah Station (EW4)**, then Bus 2 to Changi Village Bus Terminal. Walk 3 minutes to the jetty.
- **Bumboat Schedule**: Boats depart when 12 passengers are gathered (roughly every 10–20 minutes between 7:00 AM and 5:00 PM).
- **Fare**: **SGD 4.00 per person per way** (cash only, paid directly to the boatman). Additional SGD 2.00 if bringing your own bicycle.

> There are **no ATMs on Pulau Ubin** — bring sufficient cash for bumboat fare, bicycle rental, and food.

---

## 2. Exploring the Island: Bicycle, Van or On Foot

The moment you step off the bumboat at Ubin Jetty, you will find a row of bicycle rental shops:
- **Mountain Bikes**: SGD 8–12 / full day
- **Tandem Bikes**: SGD 15–20 / full day
- **Electric Bicycles**: SGD 20–25 / full day

Alternatively, retro **bencoolen passenger vans** can be chartered for group tours (negotiate directly with drivers at the jetty).

---

## 3. Chek Jawa Wetlands: Six Ecosystems in One Place

![Chek Jawa Boardwalk and Jejawi Observation Tower](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1602660750/chek_jawa_boardwalk.jpg)

The crown jewel of Pulau Ubin is **Chek Jawa Wetlands** — a remarkably biodiverse 100-hectare nature reserve at the eastern tip of the island that was famously saved from land reclamation by public outcry in 2001.

### Six Distinct Ecosystems:
1. **Coastal Beach & Rocky Shore**: Tide pools teeming with hermit crabs, sea urchins, and starfish.
2. **Seagrass Lagoon**: Underwater meadows that serve as nurseries for juvenile fish.
3. **Mangrove Forest**: Towering Rhizophora trees with exposed aerial roots.
4. **Coral Rubble**: Fragments of ancient coral reefs.
5. **Sandy Shore**: Home to fiddler crabs and mudskippers.
6. **Mature Coastal Forest**: Centuries-old coastal trees.

Climb the **Jejawi Observation Tower** (20 meters tall) for panoramic views overlooking the Johor Strait and mainland Malaysia.

---

## 4. More Highlights: Quarries, Trails & Kampong Life

![Bukit Puaka Hilltop Viewpoint at Pulau Ubin](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1602660850/bukit_puaka_viewpoint.jpg)

- **Bukit Puaka**: The island's highest vantage point overlooking stunning granite quarries filled with emerald-green water and dense jungle canopy.
- **Ketam Mountain Bike Park**: International-standard cycling trails ranging from beginner green routes to double-black diamond expert descents.
- **Traditional Kampong Houses**: Authentic zinc-roofed wooden dwellings, old provision shops, and rubber plantations that feel frozen in time.
- **Smith Marine Floating Kelong**: Enjoy fresh seafood lunch on a floating restaurant anchored offshore — a unique dining experience!

---

## 5. Essential Visitor Tips

- **Bring**: Mosquito repellent, sunblock (SPF 50+), rain poncho, reusable water bottle, and cash.
- **Download**: Offline NParks trail maps — mobile data signal drops significantly near Chek Jawa.
- **Avoid**: Feeding or approaching wild boars (they are generally harmless but can be startled).
- **Duration**: Allocate 4–6 hours for a comfortable cycling tour covering the main trails and Chek Jawa.
- **Last Bumboat Back**: Approximately **5:00 PM** — do not miss it or you will be stranded!

[CTA: Singapore Nature & Island Tours | Book with Flying Wonders | /singapore-attractions]`
  },
  {
    slug: 'southern-islands-singapore-lazarus-beach-kusu-island-guide',
    title: 'Southern Islands Singapore: Lazarus Beach, St. John\'s Island & Kusu Island Hopping Guide',
    category: 'hidden_gems',
    author: 'Rohan Mehta',
    readTime: '7 min read',
    imageUrl: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_1000/v1604567890/blog/southern-islands.jpg',
    excerpt: 'Most tourists never discover Singapore\'s secret beach paradise. Just 30 minutes by ferry from Marina South Pier, the Southern Islands offer pristine white sand, turquoise lagoons, sacred temples, and eco-glamping under the stars.',
    tags: ['Southern Islands', 'Lazarus Island', 'Kusu Island', 'Beach', 'Hidden Gems', 'Island Hopping'],
    content: `Hidden in plain sight — just 30 minutes south of Singapore's glittering Marina Bay skyline — lies an archipelago of tranquil islands that most tourists never discover. The **Southern Islands** of St. John's, Lazarus, Seringat, and Kusu offer pristine beaches, sacred temples, and a profound sense of escape from the city.

---

## 1. Island-by-Island Guide

### St. John's Island
![St. John's Island Bridge and Nature Trails](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1604568000/st_johns_bridge.jpg)

Originally a quarantine station for immigrants in the 1800s, St. John's has been transformed into a lush nature park:
- **Marine Park Outreach & Research Facility**: Educational exhibits on Singapore's marine biodiversity.
- **Rustic Walking Trails**: Shaded coastal paths lined with mature tropical trees and wild peacocks.
- **Swimming Lagoons**: Calm, sheltered natural swimming areas perfect for families.

### Lazarus Island & Seringat
Connected to St. John's by a paved causeway (10-minute walk), Lazarus Island is Singapore's best-kept beach secret:
- **C-Shaped White Sand Beach Lagoon**: Pristine, uncrowded beach with crystal-clear turquoise water — feel like you have been transported to the Maldives.
- **Eco-Glamping Tiny Houses**: Overnight stays in sustainably designed tiny cabins right on the beach (book in advance).
- **Water Sports**: Kayaking, paddleboarding, and snorkelling rentals available on weekends.

### Kusu Island (Tortoise Island)
![Kusu Island Tortoise Sanctuary and Tua Pek Kong Temple](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1604568050/kusu_island_tortoise_sanctuary.jpg)

A revered pilgrimage site for both Chinese and Malay communities:
- **Da Bo Gong (Tua Pek Kong) Chinese Temple**: A colourful waterfront temple dedicated to the God of Prosperity.
- **Three Hilltop Malay Keramats**: Sacred shrines accessible via 152 stone steps through the jungle canopy.
- **Tortoise Sanctuary**: Hundreds of live tortoises roaming freely in a dedicated conservation enclosure — considered sacred and auspicious.

> During the annual Kusu Pilgrimage Season (9th lunar month, typically October/November), devotees flock to the island by the thousands. Plan accordingly!

---

## 2. Ferry Routes & Schedules

- **Departure Terminal**: Marina South Pier (31 Marina Coastal Drive). Directly connected to **Marina South Pier MRT Station (NS28)**, Exit B.
- **Ferry Schedule**: Public ferries operate **Monday to Sunday**, with departures roughly every 1–2 hours. The hop-on hop-off route connects Marina South Pier → St. John's Island → Kusu Island.
- **Round-Trip Fare**: ~SGD 15–18 per adult.

---

## 3. Essential Visitor Tips

- **Pack Your Own Food & Water**: There are **no shops, restaurants, or F&B outlets** on St. John's or Lazarus Island. Bring a packed lunch and plenty of water.
- **Leave No Trace**: Bring garbage bags and carry all rubbish back with you. These islands are protected nature reserves.
- **Beach Essentials**: Towels, swimwear, sunblock, and waterproof phone pouches.
- **Last Ferry**: Pay close attention to the return ferry schedule — missing the last boat means you are stranded until the next day!

[CTA: Singapore Island Tours & Nature Experiences | Book with Flying Wonders | /singapore-attractions]`
  },
  {
    slug: 'singapore-itinerary-2-3-5-days-first-time-visitor-guide',
    title: 'Ultimate Singapore Itinerary for First-Time Visitors: 2-Day, 3-Day & 5-Day Guides',
    category: 'travel_hacks',
    author: 'Aditya Sharma',
    readTime: '10 min read',
    imageUrl: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_1000/v1612345678/blog/singapore-skyline.jpg',
    excerpt: 'Whether you have a quick 2-day stopover or a leisurely 5-day holiday, this day-by-day Singapore itinerary covers the best attractions, food, culture, and transport tips for Indian travellers visiting for the first time.',
    tags: ['Singapore Itinerary', 'First Time', 'Day by Day', 'Travel Planning', 'Budget Tips'],
    content: `Planning your first trip to Singapore? Whether you are on a quick transit stopover or a full week-long family holiday, this comprehensive day-by-day itinerary will help you experience the best of the Lion City without wasting a single moment.

---

## 1. The 2-Day Highlights Itinerary (Perfect for Stopovers)

![Gardens by the Bay Supertrees Illuminated at Night](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1612345700/gardens_by_the_bay_supertrees.jpg)

### Day 1: Marina Bay & Gardens by the Bay
| Time | Activity |
| :--- | :--- |
| **09:00 AM** | Arrive at Jewel Changi Airport — witness the HSBC Rain Vortex |
| **11:00 AM** | Check into hotel, drop luggage |
| **12:30 PM** | Lunch at Maxwell Food Centre (Tian Tian Chicken Rice) |
| **02:00 PM** | Walk through Chinatown, visit Buddha Tooth Relic Temple |
| **04:00 PM** | Head to Gardens by the Bay — Cloud Forest & Flower Dome |
| **06:30 PM** | Catch golden hour from Supertree Grove |
| **07:45 PM** | Free Garden Rhapsody Light Show |
| **08:30 PM** | Dinner at Satay by the Bay |

### Day 2: Sentosa Island & Clarke Quay
| Time | Activity |
| :--- | :--- |
| **09:00 AM** | Breakfast at hotel |
| **10:30 AM** | Full day at Universal Studios Singapore |
| **06:00 PM** | Skyline Luge Sentosa (sunset ride) |
| **07:30 PM** | Dinner at VivoCity food court |
| **09:00 PM** | Evening drinks at Clarke Quay riverside |

---

## 2. The 3-Day Comprehensive Itinerary

Adds a full cultural and nature day to the 2-day plan:

### Day 3: Little India, Kampong Glam & Singapore Botanic Gardens
| Time | Activity |
| :--- | :--- |
| **08:00 AM** | Authentic South Indian breakfast at Komala Vilas, Little India |
| **09:30 AM** | Explore Mustafa Centre — perfumes, chocolates, electronics |
| **11:30 AM** | Walk to Kampong Glam — Sultan Mosque & Haji Lane boutiques |
| **01:00 PM** | Turkish lunch on Bussorah Street |
| **03:00 PM** | Singapore Botanic Gardens — National Orchid Garden |
| **05:00 PM** | Orchard Road shopping (ION Orchard, Paragon) |
| **07:00 PM** | Farewell dinner at Lau Pa Sat satay street |

---

## 3. The 5-Day In-Depth Exploration

![Night Safari Tram Ride Through Mandai Wildlife Reserve](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1612345800/night_safari_tram.jpg)

### Day 4: Mandai Wildlife Reserve Safari Day
| Time | Activity |
| :--- | :--- |
| **09:00 AM** | Singapore Zoo — open-concept rainforest habitats |
| **12:30 PM** | Lunch at Ah Meng Restaurant inside the zoo |
| **02:00 PM** | Bird Paradise — 8 immersive walk-in aviaries |
| **05:00 PM** | Rest break at hotel |
| **07:00 PM** | Night Safari — guided tram tour through 6 nocturnal zones |
| **09:30 PM** | Supper at nearby Indian restaurant |

### Day 5: Joo Chiat, East Coast & Departure
| Time | Activity |
| :--- | :--- |
| **08:00 AM** | Peranakan shophouse photography walk at Koon Seng Road |
| **10:00 AM** | Katong Laksa breakfast at 328 Katong Laksa |
| **12:00 PM** | East Coast Park — cycling or beachside relaxation |
| **02:00 PM** | Head to Jewel Changi Airport — Canopy Park & shopping |
| **06:00 PM** | Departure with unforgettable Singapore memories |

---

## 4. Essential Singapore Travel Tips for Indian Travellers

![Maxwell Food Centre Hainanese Chicken Rice](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1612345750/maxwell_food_centre_chicken_rice.jpg)

- **Budget Estimate**: SGD 60–120 per person/day (budget hawker meals + public transit) up to SGD 250+/day (fine dining and major theme parks).
- **MRT Transit**: Use contactless Visa/Mastercard via SimplyGo — no need to buy tourist transit cards.
- **Weather**: Tropical humidity year-round. Expect brief afternoon rain showers — carry a compact umbrella.
- **Must-Download Apps**: Grab (taxi), Google Maps (MRT navigation), WhatsApp (for communication).
- **Vegetarian Food**: Komala Vilas, Murugan Idli Shop, Ananda Bhavan, and Kailash Parbat in Little India serve pure vegetarian and Jain meals.

> Our Flying Wonders DMC team can customise any itinerary to match your family's interests, budget, and dietary preferences. Just reach out on WhatsApp!

[CTA: Custom Singapore Tour Packages | Get a Free Quote | /packages]`
  },
  {
    slug: 'singapore-cultural-experiences-workshops-heritage-tours',
    title: 'Singapore Cultural Experiences: Heritage Walking Tours, Artisan Workshops & Museum Masterclasses',
    category: 'hidden_gems',
    author: 'Priya Patel',
    readTime: '7 min read',
    imageUrl: 'https://res.klook.com/image/upload/v1760212110/aldkopphvmsgfobyq5rb.jpg',
    excerpt: 'Go beyond sightseeing with immersive cultural experiences — from Chinatown trishaw tours and Peranakan cooking classes to batik painting workshops and traditional Chinese tea ceremonies.',
    tags: ['Cultural Experiences', 'Heritage Tours', 'Workshops', 'Art Classes', 'Museums'],
    content: `Singapore is much more than gleaming skyscrapers and theme parks. Beneath the modern surface lies a rich tapestry of Malay, Chinese, Indian, and Peranakan heritage — and the best way to experience it is through **immersive hands-on cultural experiences**.

---

## 1. Heritage & Neighbourhood Walking Tours

![National Gallery Singapore and Civic District Heritage Walk](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1760212300/national_gallery_singapore.jpg)

### Must-Book Walking Experiences:
- **Chinatown Trishaw Uncle Tour**: Ride through the narrow heritage lanes of Chinatown on a motorised trishaw while your guide narrates the district's transformation from coolie quarters to cultural treasure.
- **Kampong Glam Secret Graffiti Trail**: Discover hidden murals, indie boutiques, and the stories behind Haji Lane's vibrant street art with a local artist-guide.
- **Peranakan Food Walking Tour**: Taste your way through Joo Chiat and Katong sampling Nonya kueh, laksa, and ondeh-ondeh while learning about Straits Chinese culture.
- **Little India Spice Trail**: Follow the fragrance of jasmine garlands, cardamom, and turmeric through the back lanes of Tekka and Campbell Lane.

---

## 2. Artisan Craft Workshops

![Traditional Ceramic Pottery Workshop in Chinatown](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1760212400/pottery_workshop_chinatown.jpg)

### Hands-On Creative Experiences:
- **Traditional Ceramic Pottery Throwing**: Learn to centre clay on a spinning wheel and create your own bowl or cup at heritage studios in Jalan Besar.
- **Batik Painting Masterclass**: Paint intricate wax-resist patterns on fabric using traditional Malay and Peranakan motifs.
- **Miniature Clay Art**: Sculpt tiny food replicas of hawker dishes (chicken rice, satay, laksa) — Singapore's version of Japanese food sample art.
- **Perfume & Fragrance Blending**: Create your own signature scent at boutique perfumeries in the Civic District.
- **Chinese Tea Ceremony**: Experience the meditative art of gongfu tea brewing with premium oolong and pu-erh teas at historic tea houses like Tea Chapter (Neil Road).

> These workshops make for wonderful rainy-day activities and unique souvenirs that you cannot buy in any shopping mall.

---

## 3. Museum & Theatre Experiences

### Singapore's Top Cultural Institutions:
- **National Gallery Singapore**: Housed in the former Supreme Court and City Hall buildings, featuring Southeast Asia's largest public art collection with over 8,000 works.
- **Asian Civilisations Museum**: Trace the historical connections between Asia and the world through exquisite artefacts, including the Tang Dynasty Shipwreck Collection.
- **Peranakan Museum**: Deep dive into Straits Chinese culture through wedding ceremonies, beadwork, and Nonya porcelain.
- **Wild Rice Theatre**: Singapore's most acclaimed theatre company performing contemporary local plays and musicals.

---

## 4. Practical Booking Tips

- **Duration**: Most workshops run 1.5 to 3 hours. Book morning sessions to beat afternoon heat.
- **Family Friendly**: Pottery, batik, and clay workshops welcome children aged 6+.
- **What to Wear**: Comfortable clothes that can get messy (aprons are provided but accidents happen!).
- **Language**: All workshops are conducted in English.

[CTA: Singapore Cultural Tours & Attraction Passes | Book with Flying Wonders | /singapore-attractions]`
  },
  {
    slug: 'singapore-national-day-celebrations-fireworks-parades-tourist-guide',
    title: 'Singapore National Day Celebrations: Fireworks, Parades & What Tourists Can Experience',
    category: 'sightseeing',
    author: 'Maya Tan',
    readTime: '6 min read',
    imageUrl: 'https://res.klook.com/image/upload/v1785315362/ozcuceiy4zmvrtegqdsd.jpg',
    excerpt: 'Visiting Singapore around August 9? Experience one of Asia\'s most spectacular National Day celebrations — from the Marina Bay fireworks extravaganza and fighter jet flyovers to rooftop dining and heritage bus tours.',
    tags: ['National Day', 'Fireworks', 'Singapore Events', 'Marina Bay', 'Celebrations'],
    content: `Every year on **August 9**, Singapore erupts in a magnificent celebration of national pride — and tourists visiting during this period are treated to one of Asia's most spectacular public events. From roaring fighter jet flyovers and massive military parades to the legendary **Marina Bay fireworks extravaganza**, Singapore's National Day is an unforgettable experience.

---

## 1. The National Day Parade (NDP)

![Singapore National Day Fireworks over Marina Bay](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1785315450/sg61_national_day_fireworks.jpg)

The main event takes place at the **Padang / Marina Bay floating platform**, featuring:
- **Military Parade & March-Past**: Singapore Armed Forces display with precision marching contingents.
- **Fighter Jet Flyovers**: F-15SG Eagles and RSAF helicopter formations screaming across the Marina Bay skyline.
- **Civilian Performances**: Thousands of performers in choreographed dance and acrobatic sequences celebrating Singapore's multicultural identity.
- **Grand Finale Fireworks**: A breathtaking 8-minute fireworks display synchronized to patriotic music — visible from multiple vantage points around Marina Bay.

> National Day Parade tickets are distributed free to Singapore residents via ballot, but tourists can watch the **rehearsal parades** held on the 2–3 weekends before August 9 (same full fireworks display!).

---

## 2. Best Public Viewing Spots for Tourists

You do not need a ticket to enjoy the fireworks. Here are the best free vantage points:
- **Marina Bay Sands Event Plaza**: Ground-level views directly across the bay from the floating platform.
- **The Esplanade Rooftop Terrace**: Elevated, unobstructed views of the fireworks reflecting off the water.
- **Marina Barrage Green Roof**: Bring a picnic mat and watch from the grass rooftop of Marina Barrage.
- **Gardens by the Bay Supertree Grove**: The Supertrees frame the distant fireworks beautifully.
- **Merlion Park Waterfront**: Classic Merlion + fireworks photo opportunity.

---

## 3. Tourist Activities Around National Day

### Special Experiences Available:
- **Marina Bay Fireworks Viewing Cruises**: Private and group boat cruises offering champagne, dinner, and front-row seats to the fireworks from the water.
- **Rooftop Dining Packages**: Restaurants at Marina Bay Sands, Swissôtel The Stamford, and The Fullerton offer special National Day set menus with terrace seating overlooking the parade.
- **Red-and-White Heritage Bus Tours**: Special themed open-top bus tours tracing Singapore's independence history through key landmarks.

---

## 4. Practical Tips for Tourists

- **Arrive Early**: Prime viewing spots fill up 2–3 hours before the parade. Bring a foldable chair or picnic mat.
- **Dress Light**: August in Singapore is hot and humid. Wear breathable, light-coloured clothing.
- **MRT Crowds**: Stations around Marina Bay, Esplanade, and Promenade will be extremely congested from 5:00 PM onwards. Arrive early or walk from Raffles Place.
- **Photography**: Bring a tripod for long-exposure fireworks shots. The best angles are from Marina Bay Sands or the Esplanade waterfront.

[CTA: Singapore Event & Festival Tours | Book with Flying Wonders | /singapore-attractions]`
  },
  {
    slug: 'stranger-things-halloween-horror-nights-universal-studios-singapore',
    title: 'Stranger Things at Halloween Horror Nights Singapore: Netflix Upside Down Walkthrough & Survival Guide',
    category: 'family',
    author: 'Kavita Sundaram',
    readTime: '6 min read',
    imageUrl: 'https://res.klook.com/image/upload/v1783332637/ylvtbfwjvv4iypndnogj.jpg',
    excerpt: 'Netflix\'s Stranger Things has arrived at Universal Studios Singapore\'s Halloween Horror Nights — walk through Hawkins Lab, face Vecna in the Creel House, and survive the Upside Down. Here is your complete fan guide.',
    tags: ['Stranger Things', 'Halloween Horror Nights', 'Universal Studios', 'Netflix', 'Sentosa'],
    content: `Netflix fans, rejoice! Universal Studios Singapore's **Halloween Horror Nights** has partnered with Netflix to bring the terrifying world of **Stranger Things** to life in Southeast Asia's most elaborate walkthrough haunted house experience.

---

## 1. The Stranger Things Haunted House Experience

![Stranger Things Haunted House at Universal Studios Singapore](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1783332700/stranger_things_house.jpg)

Step into the world of Hawkins, Indiana — recreated with meticulous Hollywood-grade production design:
- **Hawkins National Laboratory**: Navigate through flickering fluorescent corridors as Demogorgon creatures burst through crumbling walls.
- **The Starcourt Mall Ruins**: Walk through the destroyed mall from Season 3, complete with melting flesh monsters and biological growth covering the ceiling.
- **The Creel House**: Face **Vecna** himself in the Season 4 centerpiece — the grandfather clock ticks as you enter, and scare actors in terrifyingly realistic prosthetics lunge from shadowed corners.
- **The Upside Down**: The finale plunges you into the parallel dimension with spore-filled air, vine-covered architecture, and Demobat creatures swooping overhead.

> Queue times for the Stranger Things house frequently exceed 2 hours on weekend nights. Book an Express Pass to reduce your wait to 15–20 minutes.

---

## 2. Themed Scare Zones & Atmosphere

![Vecna Scare Zone at Universal Studios Singapore HHN](https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_800/v1783332800/vecna_scarezone.jpg)

Beyond the haunted house, Stranger Things characters roam the park's open-air scare zones:
- **Cursed Pasar Malam (Night Market)**: A Southeast Asian twist on the Stranger Things universe — a traditional night market overrun by creatures from the Upside Down.
- **Wandering Demogorgons**: Scare actors in full creature suits patrol Hollywood and New York zones, appearing from fog machines and strobe-lit alleys.

---

## 3. Themed Food & Exclusive Merchandise

### Must-Try Themed F&B:
- **Surfer Boy Pizza**: Try the pizza from the show — available at themed kiosks throughout the park.
- **Eggo-Themed Desserts**: Eleven's favourite waffles reimagined as ice cream sandwiches and topped waffle stacks.
- **Glowing Neon Mocktails**: Served in collectible souvenir cups shaped like the Upside Down portal.

### Exclusive Merch:
- Limited-edition Stranger Things x HHN Singapore collaborative t-shirts, enamel pins, and Demogorgon plushies available only at the park.

---

## 4. Ticket Prices & Tips

| Ticket Type | Price (SGD) |
| :--- | :--- |
| **Single Night Admission** | ~SGD 80 |
| **RIP Tour VIP Package** | ~SGD 290 |

The **RIP Tour** includes guided priority access to every haunted house, food credits, and exclusive photo opportunities with scare actors — well worth it for die-hard fans.

### Survival Tips:
- **Arrive by 6:30 PM** for early staging and first entry.
- **Download the RWS App** for live maze queue timings.
- **Age Advisory**: Recommended 13+ due to intense scare effects.
- **Photography**: Flash photography is prohibited inside haunted houses but allowed in scare zones.

[CTA: Universal Studios Singapore Tickets & HHN Passes | Book with Flying Wonders | /singapore-attractions]`
  }
]

async function main() {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) {
    console.error('❌ SANITY_WRITE_TOKEN not set. Please export it before running.')
    process.exit(1)
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  })

  console.log(`🚀 Seeding ${KLOOK_INSPIRED_ARTICLES.length} Klook-inspired blog articles into Sanity...\n`)

  for (const article of KLOOK_INSPIRED_ARTICLES) {
    const slugObj = { _type: 'slug', current: article.slug }
    const doc = {
      _type: 'blogPost',
      title: article.title,
      slug: slugObj,
      category: article.category,
      author: article.author,
      date: new Date().toISOString().split('T')[0],
      readTime: article.readTime,
      imageUrl: article.imageUrl,
      excerpt: article.excerpt,
      content: article.content,
      isFeatured: false,
      isPublished: true,
      viewCount: 0,
      tags: article.tags,
      seoDescription: article.excerpt,
    }

    try {
      const id = `blog-${article.slug}`
      await client.createOrReplace({ _id: id, ...doc })
      console.log(`✅ Imported: ${article.title}`)
    } catch (err) {
      console.error(`❌ Failed to import ${article.title}:`, err)
    }
  }

  console.log('\n🎉 All 10 Klook-inspired blog articles have been seeded successfully!')
}

main().catch(e => {
  console.error('Unexpected error:', e)
  process.exit(1)
})

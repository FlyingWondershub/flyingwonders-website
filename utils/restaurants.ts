import { client } from '../sanity/lib/client'
import type { TravelShort } from './packages'

export interface MustTryDish {
  name: string
  description?: string
  category?: string
  isVegetarian?: boolean
  isJainFriendly?: boolean
  isChefSpecial?: boolean
}

export interface RestaurantData {
  _id: string
  slug: string
  name: string
  subtitle?: string
  destination: string
  cuisineType: string
  categories: string[] // 'video' | 'veg' | 'indian' | 'vegan' | 'chinese' | 'buffet' | 'biryani' | 'halal' | 'fine_dining' | 'hawker'
  dietaryBadges: string[]
  priceRange: string
  starRating: string
  reviewCount?: string
  shortDescription: string
  longDescription: string
  coverImageUrl: string
  galleryImageUrls?: string[]
  videoUrl?: string
  shorts?: TravelShort[]
  mustTryDishes: (string | MustTryDish)[]
  features?: string[]
  hasBuffet?: boolean
  buffetHighlight?: string
  buffetDetails?: string
  address: string
  nearestMrt?: string
  timings?: string
  phone?: string
  officialWebsite?: string
  menuUrl?: string
  reservationUrl?: string
  googleMapsUrl?: string
  tips?: string[]
  isPopular?: boolean
  isTrending?: boolean
  isDisplayed?: boolean
  whatsappNumber?: string
  whatsappMessage?: string
}

export function cleanRestaurantName(rawName: string): string {
  if (!rawName) return 'Singapore Restaurant'
  return rawName
    .replace(/^Singapore\s*-\s*/i, '')
    .trim()
}

export function slugifyRestaurantName(name: string): string {
  if (!name) return 'singapore-restaurant'
  const cleaned = cleanRestaurantName(name)
  return cleaned
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeRestaurantSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  let s = rawSlug.toLowerCase().trim()
  if (s === 'shahi' || s === 'shahi-maharani') return 'shahi-maharani-singapore'
  if (s === 'spice' || s === 'spice-mahal') return 'spice-mahal-beach-road'
  if (s === 'gupshup') return 'gupshup-serangoon-house'
  if (s === 'tekka' || s === 'tekka-centre') return 'tekka-centre-hawker-hub'
  if (s === 'zamzam' || s === 'zam-zam') return 'singapore-zam-zam'
  if (s === 'madras' || s === 'madras-woodlands') return 'madras-new-woodlands'
  if (s === 'lingzhi' || s === 'ling-zhi') return 'lingzhi-vegetarian-orchard'
  if (s === 'bismillah') return 'bismillah-biryani-little-india'
  return s
}

export const DEFAULT_RESTAURANTS: RestaurantData[] = [
  {
    _id: 'rest-shahi-maharani',
    slug: 'shahi-maharani-singapore',
    name: 'Shahi Maharani North Indian Restaurant',
    subtitle: 'Royal Mughlai Splendour & Iconic 1-For-1 Lunch Buffet at Raffles City',
    destination: 'Singapore',
    cuisineType: 'North Indian Mughlai & Royal Awadhi',
    categories: ['video', 'buffet', 'indian', 'fine_dining'],
    dietaryBadges: ['Halal Sourced', 'Pure Vegetarian Spread Available', 'Jain Options on Request', 'Buffet Available'],
    priceRange: '$$$ (SGD 35 – 70)',
    starRating: '4.9',
    reviewCount: '1,680+ Google Reviews',
    shortDescription: 'Palatial North Indian dining in Raffles City featuring royal Mughlai specialties, live gazal music, and a famous 1-for-1 weekday lunch buffet.',
    longDescription: 'Celebrated as one of Singapore’s most regal culinary landmarks since 1997, Shahi Maharani North Indian Restaurant transports guests into the opulent era of the Maharajas. Adorned with carved wooden doors, plush upholstery, and live classical music performers, this upscale haven serves authentic Awadhi and Mughlai delicacies slow-cooked according to centuries-old royal recipes. Their weekday lunch buffet is legendary across Singapore for offering top-tier North Indian culinary finesse with a popular 1-for-1 dining offer.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop'
    ],
    shorts: [
      {
        id: 'shahi-s1',
        title: 'Shahi Maharani Sizzler Platter Feast',
        creator: 'Singapore Foodie',
        views: '240K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop',
        youtubeVideoId: 'kYJzX9Qz8oM'
      },
      {
        id: 'shahi-s2',
        title: '1-for-1 Indian Buffet Spread at Raffles City',
        creator: 'SethLui Eats',
        views: '180K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop',
        youtubeVideoId: 't5A5L_e1Q9k'
      }
    ],
    mustTryDishes: [
      {
        name: 'Raan Sikandra',
        description: 'Deboned baby leg of lamb slow-roasted for over 6 hours in royal spiced pot masala until fork-tender.',
        category: 'Signature Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Shahi Signature Chicken Makhanwala',
        description: 'Tender tandoori chicken simmered in a velvet tomato, fenugreek and butter velouté.',
        category: 'Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Tandoori Milawat Sizzler Platter',
        description: 'Sizzling cast-iron platter of chicken tikka, fish tikka, garlic jumbo prawns, and seekh kebab.',
        category: 'Tandoori / Grill',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Shahi Subzi Sizzler (Vegetarian)',
        description: 'Crispy garden vegetable croquettes served bubbling on a hot iron plate with rich savory gravy.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Kesar Rasmalai & Kulfi Sampler',
        description: 'Handmade cottage cheese dumplings soaked in chilled saffron cardamom milk alongside pistachio kulfi.',
        category: 'Dessert / Sweet',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Live Classical Indian Music & Gazals', 'Private VIP Dining Rooms', 'Full Bar & Wine Cellar', 'Direct MRT Linked', 'Free Wi-Fi', 'High Chairs for Toddlers'],
    hasBuffet: true,
    buffetHighlight: 'Weekday Lunch 1-For-1 Special: $68++ for Two Diners (or $38++ Single Diner)',
    buffetDetails: 'Weekday Lunch Buffet runs Mon–Fri from 12:00 PM to 2:30 PM featuring revolving weekly menus of live tandoor breads, multiple non-veg and vegetarian gravies, chaat counters, and desserts. Advance table reservations are strongly recommended.',
    address: '252 North Bridge Road, #03-21B Raffles City Shopping Centre, Singapore 179103',
    nearestMrt: 'City Hall MRT (EW13/NS25) — Direct escalator access from Raffles City shopping concourse Level 3',
    timings: 'Lunch: 12:00 PM – 3:00 PM | Dinner: 6:30 PM – 11:00 PM Daily',
    phone: '+65 6235 8840',
    officialWebsite: 'https://www.shahimaharani.com',
    menuUrl: 'https://www.shahimaharani.com/menu/',
    reservationUrl: 'https://www.shahimaharani.com/reservations/',
    googleMapsUrl: 'https://maps.google.com/?q=Shahi+Maharani+Singapore',
    tips: [
      'Book at least 3-4 days in advance to secure the 1-for-1 weekday lunch promotion.',
      'Evening dining after 7:30 PM features mesmerizing live Indian classical instrumental and gazal performances.',
      'Vegetarian and Jain menus are prepared with dedicated utensils upon request.'
    ],
    isPopular: true,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group table reservations and the 1-for-1 buffet at Shahi Maharani.'
  },
  {
    _id: 'rest-spice-mahal',
    slug: 'spice-mahal-beach-road',
    name: 'Spice Mahal',
    subtitle: 'Signature North Indian Feasts & Unlimited Lunch & Dinner Thali Buffet at The Plaza',
    destination: 'Singapore',
    cuisineType: 'North & South Indian Regional Specialties',
    categories: ['video', 'buffet', 'indian', 'veg'],
    dietaryBadges: ['Unlimited Thali Buffet', 'Vegetarian Thali Spread', 'Non-Veg Thali Spread', 'Jain Friendly on Request'],
    priceRange: '$$ (SGD 20 – 40)',
    starRating: '4.8',
    reviewCount: '850+ Google Reviews',
    shortDescription: 'Spacious dining at The Plaza Beach Road boasting unlimited Lunch & Dinner Thali Buffets with freshly baked naans, Rampur Lamb Biryani, and coastal curries.',
    longDescription: 'Situated along bustling Beach Road at The Plaza, Spice Mahal delivers a vibrant, hearty dining experience honoring timeless North Indian recipes with coastal accents. Renowned for its generous Unlimited Lunch and Dinner Thali Buffets, guests enjoy an endless parade of piping hot tandoori naans served straight to the table alongside rich dals, aromatic basmati rice, tender meats, and decadent desserts. With private banquet space and a family-first ambiance, it is a favorite for both business luncheons and leisure tour groups.',
    coverImageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Executive Lunch & Dinner Thali Buffet',
        description: 'Unlimited refills of daily chef-crafted curries, dal makhani, fragrant basmati rice, hot butter naan, and dessert.',
        category: 'Signature Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Rampur Lamb Biryani',
        description: 'Royal court dum biryani with long-grain basmati, brown onions, and tender Australian lamb pieces.',
        category: 'Biryani / Rice',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Smoky Tandoor Lamb Chops',
        description: 'Juicy rib chops steeped in hung curd, malt vinegar, and roasted garam masala charred in clay oven.',
        category: 'Tandoori / Grill',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Malabar Prawn Thokku',
        description: 'Tiger prawns braised in coastal shallots, tomato paste, curry leaves, and crushed black pepper.',
        category: 'Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Gajar Halwa Cheesecake',
        description: 'Modern dessert pairing slow-caramelized winter carrot pudding with velvety baked cream cheese.',
        category: 'Dessert / Sweet',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Unlimited Thali Refills', 'Sunday Grand Buffet Feast', 'Corporate Event Bookings', 'Wheelchair Accessible', 'Free Parking Available nearby'],
    hasBuffet: true,
    buffetHighlight: 'Daily Lunch & Dinner Thali Buffet | Sunday Grand Buffet Experience',
    buffetDetails: 'Features both Pure Vegetarian and Non-Vegetarian Thali spreads with unlimited refills of curries, bread baskets, and rice. Special group rates available for tour circuits.',
    address: '7500E Beach Road, #01-201 The Plaza, Singapore 199595',
    nearestMrt: 'Nicoll Highway MRT (CC5) — 5 mins walk / Bugis MRT (EW12/DT14) — 8 mins walk',
    timings: 'Lunch: 12:00 PM – 3:00 PM | Dinner: 6:00 PM – 10:00 PM Daily',
    phone: '+65 6883 5275 / +65 8983 2317',
    officialWebsite: 'https://www.spicemahal.com.sg',
    menuUrl: 'https://www.spicemahal.com.sg/lunch-and-dinner-thali-buffet',
    reservationUrl: 'https://www.spicemahal.com.sg/reservations',
    googleMapsUrl: 'https://maps.google.com/?q=Spice+Mahal+Singapore',
    tips: [
      'The Sunday Grand Buffet is the most extensive spread—arrive by 12:30 PM for fresh hot batches.',
      'Ask for garlic naan refills freshly brought to your table during the Thali meal.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6589832317',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group thali buffets and pricing at Spice Mahal.'
  },
  {
    _id: 'rest-gupshup',
    slug: 'gupshup-serangoon-house',
    name: 'GupShup',
    subtitle: 'Gourmet Regional Street Food Tapas & Cocktails by Celebrity Chef Jolly',
    destination: 'Singapore',
    cuisineType: 'Contemporary Regional Indian Street Food & Tapas',
    categories: ['video', 'indian', 'veg', 'vegan', 'fine_dining'],
    dietaryBadges: ['Vegetarian Friendly', 'Vegan Friendly Options', 'Jain Chaat Options', 'Artisanal Cocktails'],
    priceRange: '$$$ (SGD 35 – 65)',
    starRating: '4.9',
    reviewCount: '720+ Google Reviews',
    shortDescription: 'Chic basement restaurant in The Serangoon House by Chef Jolly delivering pan-Indian street food tapas, Pani Poori carousels, and Amritsari chole.',
    longDescription: 'Perched in the basement of The Serangoon House (A Tribute Portfolio Hotel by Marriott) in the historic quarter of Little India, GupShup redefines Indian social dining through the lens of celebrity chef Surjan Singh (Chef Jolly). "GupShup", meaning friendly banter and storytelling, celebrates street food from Old Delhi, Amritsar, Mumbai, and Kolkata elevated into sophisticated small plates. Its colonial-glamour interiors, custom brass fixtures, and handcrafted spiced cocktail program make it one of Singapore\'s hottest culinary destinations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Pani Poori Carousel Experience',
        description: 'Crisp semolina spheres with spiced potatoes & black chickpeas, served with tangy sweet tamarind and chilled mint-jaljeera shooters.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Dahi Lotus Papdi Chaat',
        description: 'Crunchy lotus root crisps layered with whipped sweetened yoghurt, pomegranate arils, and mint-coriander emulsion.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Amritsari Chole & Tandoori Kulcha',
        description: 'Pindi spiced black chickpea stew paired with stuffed potato-onion kulcha baked golden in the clay oven.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'The Classic Delhi Butter Chicken',
        description: 'Boneless chargrilled tandoori chicken simmered in smoked San Marzano tomato butter gravy.',
        category: 'Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Crispy Bhindi Amchur Fries',
        description: 'Finely julienned okra tossed with chickpea flour and tart sun-dried green mango powder.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Marriott Bonvoy Partner', 'Craft Indian Botanical Cocktails', 'Basement Luxury Atmosphere', 'DJ & Social Vibe', 'Celebrity Chef Guided'],
    hasBuffet: false,
    buffetHighlight: 'The Great Indian Feast (Multi-Course Shared Degustation Available on Selected Dates)',
    buffetDetails: 'A la carte sharing plates designed for 2–6 guests, with optional curated tasting feast packages.',
    address: '301 Serangoon Road, Basement 1, The Serangoon House, Singapore 218224',
    nearestMrt: 'Farrer Park MRT (NE8) — Exit B (3 mins walk)',
    timings: 'Lunch: 12:00 PM – 3:00 PM | Dinner: 5:00 PM – 10:00 PM Daily',
    phone: '+65 6797 2850',
    officialWebsite: 'https://gupshup.sg',
    menuUrl: 'https://gupshup.sg/menu',
    reservationUrl: 'https://gupshup.sg/reservations',
    googleMapsUrl: 'https://maps.google.com/?q=GupShup+Singapore',
    tips: [
      'Take the hotel elevator straight down to Basement 1 for direct entrance.',
      'Order the Pani Poori shooters carousel for an unforgettable interactive table starter.'
    ],
    isPopular: true,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about dinner reservations and tasting menus at GupShup.'
  },
  {
    _id: 'rest-madras-woodlands',
    slug: 'madras-new-woodlands',
    name: 'Madras New Woodlands Restaurant',
    subtitle: 'Singapore’s Legendary South Indian Pure Vegetarian Institution Since 1983',
    destination: 'Singapore',
    cuisineType: 'Authentic South Indian Pure Vegetarian',
    categories: ['video', 'veg', 'indian', 'vegan', 'buffet'],
    dietaryBadges: ['100% Pure Vegetarian', 'Strict Jain Friendly', 'Vegan Options', 'Unlimited VIP Thali Refills'],
    priceRange: '$ (SGD 8 – 20)',
    starRating: '4.7',
    reviewCount: '2,400+ Google Reviews',
    shortDescription: 'Beloved Little India vegetarian sanctuary famous for paper-thin dosas, unlimited VIP Thali spreads, and frothy hand-pulled filter coffee.',
    longDescription: 'For over four decades along Upper Dickson Road, Madras New Woodlands Restaurant has stood as the quintessential gold standard of South Indian vegetarian dining in Singapore. Frequented by generations of local Indian families, international vegetarian tourists, and monks, this no-frills institution is celebrated for its warm hospitality, strict adherence to vegetarian purity, and lightning-fast service. From gigantic Ghee Paper Masala Dosas to lavish stainless steel VIP Thali sets with endless refills of sambar and kootu, every meal here is nourishing comfort.',
    coverImageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'VIP Special Vegetarian Thali',
        description: 'Unlimited refills of white basmati rice, spiced rasam, drumstick sambar, 4 vegetable kootus, appalam, curd, and sweet payasam.',
        category: 'Signature Main Course',
        isVegetarian: true,
        isJainFriendly: true,
        isChefSpecial: true
      },
      {
        name: 'Ghee Paper Masala Dosa',
        description: 'Meter-long paper-thin crispy fermented rice crepe roasted with golden cow ghee and rolled around seasoned potato masala.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Medu Vada with 3 Chutneys',
        description: 'Crispy fried lentil donuts with fluffy interior, served with coconut, tomato, and mint chutneys.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Chole Bhature Balloon',
        description: 'Giant puffed golden deep-fried bread paired with zesty chickpea masala and pickled onion relish.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'South Indian Filter Coffee',
        description: 'Rich dark chicory-blended coffee pulled by hand into a frothy head and served in a traditional brass davarah.',
        category: 'Beverage',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['100% Pure Vegetarian Kitchen', 'No Meat or Seafood Allowed', 'Jain No Onion No Garlic Special Menu', 'Authentic Banana Leaf Table Service', 'Quick Turnaround'],
    hasBuffet: true,
    buffetHighlight: 'Unlimited VIP Vegetarian Thali (Endless Refills of Rice, Sambar, Dhal, Rasam & Curries)',
    buffetDetails: 'Priced around SGD 11–13 per person, including infinite refills of rice, bread, sambar, rasam, and traditional vegetables.',
    address: '14 Upper Dickson Road, Little India, Singapore 207474',
    nearestMrt: 'Jalan Besar MRT (DT22) — 4 mins walk / Little India MRT (DT12/NE7) — 5 mins walk',
    timings: '7:30 AM – 10:30 PM Daily',
    phone: '+65 6297 1594',
    officialWebsite: 'https://madrasnewwoodlands.com',
    googleMapsUrl: 'https://maps.google.com/?q=Madras+New+Woodlands+Restaurant',
    tips: [
      'Ask for the Jain menu if you do not consume root vegetables, onions, or garlic.',
      'Finish your meal with their signature hot brass tumbler filter coffee.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group breakfast/lunch bookings at Madras New Woodlands.'
  },
  {
    _id: 'rest-zam-zam',
    slug: 'singapore-zam-zam',
    name: 'Singapore Zam Zam Restaurant',
    subtitle: 'Century-Old Heritage Institution (Est. 1908) — Legendary King of Murtabak & Biryani',
    destination: 'Singapore',
    cuisineType: 'Muslim-Indian & Malay Heritage Fare',
    categories: ['video', 'indian', 'biryani', 'halal', 'hawker'],
    dietaryBadges: ['100% Halal Certified', 'Muslim Owned Since 1908', 'Late Night Dining Spot'],
    priceRange: '$ (SGD 8 – 18)',
    starRating: '4.6',
    reviewCount: '12,500+ Google Reviews',
    shortDescription: 'World-famous 118-year-old landmark opposite Sultan Mosque serving legendary crispy mutton murtabak and fragrant dum biryani.',
    longDescription: 'Operating continuously since 1908 at the gateway of the historic Kampong Glam quarter right across from the Sultan Mosque, Singapore Zam Zam is a cultural and culinary icon of the nation. Renowned as the historic creator of the Singapore-style Murtabak, master dough twirlers flip dough paper-thin right in the open shopfront window before stuffing it with generous minced mutton, beef, chicken, or deer meat. A bustling two-storey multi-generational hub, it is a mandatory pilgrimage for foodies worldwide.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Signature Mutton / Deer Murtabak',
        description: 'Multi-layered pan-fried pancake stuffed with marinated minced mutton, beaten eggs, and diced onions, served with savory mutton curry dip.',
        category: 'Signature Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Zam Zam Chicken Dum Biryani',
        description: 'Aromatic saffron and whole spice-steeped basmati rice served with a gigantic spiced chicken leg and pickled cucumber acar.',
        category: 'Biryani / Rice',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Crispy Beef Murtabak (Large)',
        description: 'Massive plate-sized crispy stuffed bread packed with spiced ground beef and scallions.',
        category: 'Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Mee Goreng Mamak Special',
        description: 'Wok-charred spicy yellow noodles tossed with lamb bits, fried bean curd, shredded cabbage, and calamansi lime.',
        category: 'Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Frothy Teh Tarik',
        description: 'Hand-pulled sweetened black tea with evaporated milk poured back and forth from height.',
        category: 'Beverage',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['100% Halal Certified', 'Historic 1908 Heritage Building', 'Air-Conditioned 2nd Floor Dining', 'Facing Sultan Mosque', 'Open Till Late Night (11:00 PM)'],
    hasBuffet: false,
    address: '697-699 North Bridge Road (Opposite Sultan Mosque), Kampong Glam, Singapore 198675',
    nearestMrt: 'Bugis MRT (EW12/DT14) — 5 mins walk via Arab Street / Haji Lane',
    timings: '7:00 AM – 11:00 PM Daily',
    phone: '+65 6298 6620',
    officialWebsite: 'https://zamzamsingapore.com',
    googleMapsUrl: 'https://maps.google.com/?q=Singapore+Zam+Zam',
    tips: [
      'Head up to the second floor for full air conditioning and a view of the gold Sultan Mosque domes.',
      'A medium murtabak is very generous and easily shared between two people.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group tour meal vouchers at Singapore Zam Zam.'
  },
  {
    _id: 'rest-lingzhi',
    slug: 'lingzhi-vegetarian-orchard',
    name: 'LingZhi Vegetarian Restaurant',
    subtitle: 'Gourmet Chinese Vegetarian Cuisine, Plant-Based Dim Sum & Hotpot Buffets at Liat Towers',
    destination: 'Singapore',
    cuisineType: 'Chinese Gourmet Vegetarian & Plant-Based Dim Sum',
    categories: ['video', 'chinese', 'veg', 'vegan', 'buffet'],
    dietaryBadges: ['100% Vegetarian', 'Allium-Free Options', 'Vegan Friendly', 'Dim Sum High Tea Buffet'],
    priceRange: '$$$ (SGD 30 – 60)',
    starRating: '4.7',
    reviewCount: '1,150+ Google Reviews',
    shortDescription: 'Upscale Orchard Road Chinese vegetarian haven by TungLok Group featuring plant-based dim sum, wild mushroom firepots, and high tea buffets.',
    longDescription: 'Under the renowned TungLok Group banner, LingZhi Vegetarian Restaurant has pioneered modern Chinese vegetarian fine dining in Singapore since 1991. Moving far beyond traditional gluten-heavy mock meats, LingZhi focuses on fresh organic vegetables, prized wild fungi, and artisanal plant-based creations crafted with classical Cantonese and Sichuan techniques. Situated at Liat Towers along Orchard Road, its weekend High Tea Dim Sum Buffet is celebrated for its crystal dumplings, truffle fried rice, and delicate soups.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Wild Morel & Cordyceps Firepot Soup',
        description: 'Double-boiled aromatic herbal broth brewed with morel mushrooms, bamboo pith, and fresh winter melon.',
        category: 'Signature Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Vegetarian Dim Sum Platter',
        description: 'Steamed crystal dumplings, vegetarian char siew bao, and golden fried taro puffs with mushroom gravy.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Braised Monkey Head Mushroom with Broccoli',
        description: 'Tender lion\'s mane mushroom braised in savory vegetarian oyster sauce over steamed florets.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Black Truffle Vegetarian Fried Rice',
        description: 'Wok-charred fragrant jasmine rice with beech mushrooms, sweet corn, and shaved black truffle.',
        category: 'Biryani / Rice',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Sweet & Sour Crisp Enoki Rolls',
        description: 'Crispy bean curd sheets wrapped around enoki mushrooms glazed in zesty hawthorn sauce.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Weekend Dim Sum High Tea Buffet', 'Private VIP Dining Rooms', 'TungLok Culinary Heritage', 'Orchard Road Shopping Belt Access', 'Wheelchair Accessible'],
    hasBuffet: true,
    buffetHighlight: 'Weekend Vegetarian Dim Sum High Tea Buffet & Weekday All-You-Can-Eat Steamboat',
    buffetDetails: 'Weekend high tea buffet runs Sat–Sun 3:00 PM – 5:00 PM offering unlimited orders of over 25 handmade steamed and fried dim sum baskets and desserts.',
    address: '541 Orchard Road, #05-01 Liat Towers, Singapore 238881',
    nearestMrt: 'Orchard MRT (NS22/TE14) — 3 mins walk via Orchard Underpass',
    timings: 'Lunch: 11:30 AM – 3:00 PM | Dinner: 6:00 PM – 10:00 PM Daily',
    phone: '+65 6734 3788',
    officialWebsite: 'https://www.lingzhivegetarian.com',
    menuUrl: 'https://www.lingzhivegetarian.com/en/menus',
    reservationUrl: 'https://www.lingzhivegetarian.com/en/reservations',
    googleMapsUrl: 'https://maps.google.com/?q=LingZhi+Vegetarian+Liat+Towers',
    tips: [
      'Reserve the weekend high tea dim sum buffet at least 1 week in advance.',
      'Inform the staff if you require allium-free (no garlic/onion) preparations.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group table bookings at LingZhi Vegetarian.'
  },
  {
    _id: 'rest-whole-earth',
    slug: 'whole-earth-peranakan-thai',
    name: 'Whole Earth',
    subtitle: 'Singapore’s First & Only Michelin Bib Gourmand Plant-Based Thai-Peranakan Restaurant',
    destination: 'Singapore',
    cuisineType: 'Peranakan & Thai Plant-Based Gastronomy',
    categories: ['video', 'veg', 'vegan', 'chinese', 'fine_dining'],
    dietaryBadges: ['100% Plant-Based', 'Michelin Bib Gourmand', 'Vegan Friendly', 'No MSG Added'],
    priceRange: '$$$ (SGD 30 – 55)',
    starRating: '4.8',
    reviewCount: '1,400+ Google Reviews',
    shortDescription: 'Michelin Bib Gourmand plant-based restaurant in Tanjong Pagar crafting sensational Penang rendang, oatmeal tofu, and Thai basil mushroom stews.',
    longDescription: 'As the very first plant-based restaurant in Singapore to receive the prestigious Michelin Bib Gourmand accolade (an honor it has held for multiple consecutive years), Whole Earth on Peck Seah Street is a culinary revelation. Specializing in Peranakan and Thai culinary traditions, the kitchen uses slow braising, heritage rempah spice pastes, and premium mushrooms to create complex, punchy dishes that delight both plant-based diners and passionate meat eaters alike.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Signature Penang Rendang',
        description: 'Tender shiitake mushroom stems slow-cooked for over 8 hours in fragrant coconut milk, lemongrass, kaffir lime, and roasted rempah paste.',
        category: 'Signature Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Nutty Mushroom with Oatmeal Tofu',
        description: 'Silken housemade tofu cubes battered in golden crunchy sweet cereal oats and bird\'s eye chilies.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Enchanted Forest with Asparagus',
        description: 'Monkey head mushrooms wok-fried with crunchy young asparagus in rich savory Thai basil reduction.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Nyonya Curry with Fresh Potatoes',
        description: 'Rich spiced coconut curry with potatoes and bean curd skin steeped in blue ginger broth.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Michelin Bib Gourmand Awardee', 'Air-Conditioned Shophouse Dining', 'Tanjong Pagar Dining District', 'No Artificial Flavorings'],
    hasBuffet: false,
    address: '76 Peck Seah Street, Tanjong Pagar, Singapore 079331',
    nearestMrt: 'Tanjong Pagar MRT (EW15) — Exit A (2 mins walk)',
    timings: 'Lunch: 11:30 AM – 3:00 PM | Dinner: 5:30 PM – 10:00 PM (Closed Mon)',
    phone: '+65 6221 6583',
    officialWebsite: 'https://www.wholeearth.com.sg',
    menuUrl: 'https://www.wholeearth.com.sg/menu',
    reservationUrl: 'https://www.wholeearth.com.sg/reservations',
    googleMapsUrl: 'https://maps.google.com/?q=Whole+Earth+Singapore',
    tips: [
      'The Penang Rendang is their #1 bestselling dish worldwide—be sure to pair it with brown or jasmine rice.',
      'Strictly book ahead for weekend dinners as tables fill up fast.'
    ],
    isPopular: true,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to reserve a table at Whole Earth Tanjong Pagar.'
  },
  {
    _id: 'rest-tekka-centre',
    slug: 'tekka-centre-hawker-hub',
    name: 'Tekka Centre Hawker Food Hub (Allauddin’s & Temasek Rojak)',
    subtitle: 'Singapore’s Ultimate Little India Hawker Institution — World-Famous Dum Biryani & Indian Rojak',
    destination: 'Singapore',
    cuisineType: 'Hawker Street Food, Indian Rojak & Dum Biryani',
    categories: ['video', 'hawker', 'biryani', 'indian', 'halal'],
    dietaryBadges: ['100% Halal Stalls', 'Vegetarian Stalls Available', 'Cheap Eats & Street Food', 'Michelin Plate'],
    priceRange: '$ (Under SGD 10)',
    starRating: '4.7',
    reviewCount: '8,900+ Google Reviews',
    shortDescription: 'Legendary covered hawker centre in Little India home to Allauddin\'s Dum Biryani, Temasek crispy Indian Rojak, and fresh tandoor naans.',
    longDescription: 'Tekka Centre is Singapore’s undisputed heartbeat of authentic Indian hawker gastronomy. Located right above Little India MRT, this massive bustling wet market and food complex houses over 100 stalls serving mouthwatering culinary heritage. World-famous stops include Allauddin’s Briyani (#01-232, featured on Michelin recommendations), Temasek Indian Rojak with its mountain of golden fried fritters, and Delhi Lahori serving piping-hot cheese naans straight from clay tandoor barrels at unbeatable prices.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Allauddin\'s Mutton Briyani (#01-232)',
        description: 'Michelin-recommended fragrant basmati rice cooked with spiced Australian mutton chunks, boiled egg, and tangy cucumber acar.',
        category: 'Biryani / Rice',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Temasek Indian Rojak (#01-254)',
        description: 'Pick your own crispy prawn fritters, coconut flour patties, potato wedges, and cuttlefish tossed with hot thick peanut sauce.',
        category: 'Signature Starter',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Delhi Lahori Garlic Butter Naan (#01-266)',
        description: 'Fluffy clay-oven baked naan brushed with melted butter and roasted minced garlic, paired with spiced chicken tikka.',
        category: 'Tandoori / Grill',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Old Amoy Chendol (#01-218)',
        description: 'Artisanal shaved ice with rich charcoal-boiled gula melaka syrup, fresh coconut milk, and slippery pandan jelly.',
        category: 'Dessert / Sweet',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Direct MRT Underground Link', '100+ Food Stalls', 'Fresh Fruit Juices & Lassi Counters', 'Authentic Hawker Vibe', 'Budget Friendly'],
    hasBuffet: false,
    address: '665 Buffalo Road, Tekka Centre Level 1, Little India, Singapore 210665',
    nearestMrt: 'Little India MRT (NE7/DT12) — Exit C (Directly opens inside Tekka Centre)',
    timings: '6:30 AM – 9:00 PM Daily (Individual stall hours vary)',
    googleMapsUrl: 'https://maps.google.com/?q=Tekka+Centre+Singapore',
    tips: [
      'Bring cash or Singapore PayNow/NETS FlashPay as individual hawker stalls do not accept international credit cards.',
      'Allauddin’s Biryani queue moves quickly but arrive before 1:00 PM to ensure mutton ribs are available.'
    ],
    isPopular: true,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to arrange a guided Little India Hawker Food Tour at Tekka Centre.'
  },
  {
    _id: 'rest-bismillah',
    slug: 'bismillah-biryani-little-india',
    name: 'Bismillah Biryani Restaurant',
    subtitle: 'Michelin Bib Gourmand Awardee — Dry Pakistani-Style Dum Biryani on Dunlop Street',
    destination: 'Singapore',
    cuisineType: 'Authentic Dum Biryani & Charcoal Kebabs',
    categories: ['video', 'biryani', 'indian', 'halal'],
    dietaryBadges: ['Michelin Bib Gourmand', 'Halal Certified', 'No Gravy / Naturally Spiced', 'Vegetarian Dum Biryani'],
    priceRange: '$$ (SGD 12 – 24)',
    starRating: '4.6',
    reviewCount: '2,100+ Google Reviews',
    shortDescription: 'Multi-year Michelin Bib Gourmand honoree serving light, non-greasy Pakistani dum biryani without cloying curries, alongside tender seekh kebabs.',
    longDescription: 'Bismillah Biryani on Dunlop Street is renowned across Southeast Asia for its revolutionary approach to dum biryani. Unlike typical Singapore biryanis drenched in thick, oily curries, Bismillah adheres to pure Pakistani Mughlai tradition: high-grade long-grain basmati rice and marinated fresh meat are sealed together in a pot with whole spices and slow-steamed without a single drop of added cooking oil. The result is an extraordinarily fragrant, light, digestible masterpiece honored by the Michelin Guide for consecutive years.',
    coverImageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Michelin Bib Gourmand Mutton Dum Biryani',
        description: 'Tender lamb meat cooked on the bone inside aromatic spiced basmati rice, served with chilled raita.',
        category: 'Biryani / Rice',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Young Mutton Seekh Kebab',
        description: 'Finely ground fresh mutton blended with crushed ginger, coriander seeds and grilled over charcoal.',
        category: 'Tandoori / Grill',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Chicken Dum Biryani Special',
        description: 'Tender chicken piece steam-infused with saffron, black cardamom, and cloves.',
        category: 'Biryani / Rice',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Vegetarian Dum Biryani with Paneer',
        description: 'Spiced aromatic rice cooked with garden peas, carrots, and grilled spiced cottage cheese.',
        category: 'Biryani / Rice',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Michelin Bib Gourmand Awardee', '100% Halal Certified', 'Zero Added Cooking Oil in Biryani', 'Air-Conditioned Seating'],
    hasBuffet: false,
    address: '50 Dunlop Street, Little India, Singapore 209379',
    nearestMrt: 'Rochor MRT (DT13) / Jalan Besar MRT (DT22) — 2 mins walk',
    timings: '11:30 AM – 9:00 PM Daily',
    phone: '+65 6935 1326',
    officialWebsite: 'https://bismillahbiryani.com',
    googleMapsUrl: 'https://maps.google.com/?q=Bismillah+Biryani+Dunlop+Street',
    tips: [
      'Eat the biryani as intended: take a spoonful of rice and meat together with a dab of cool raita; no curry sauce is needed.',
      'Order the Young Mutton Seekh Kebab as a side to complement your biryani.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group meals at Bismillah Biryani.'
  },
  {
    _id: 'rest-eight-treasures',
    slug: 'eight-treasures-vegetarian-chinatown',
    name: 'Eight Treasures Vegetarian Restaurant',
    subtitle: 'Chinatown’s Beloved Vegetarian Heritage Gem Facing Buddha Tooth Relic Temple',
    destination: 'Singapore',
    cuisineType: 'Traditional Chinese Vegetarian & Cantonese Mock Roasts',
    categories: ['chinese', 'veg', 'vegan'],
    dietaryBadges: ['100% Vegetarian', 'Buddhist Vegetarian (Allium-Free Available)', 'Vegan Friendly', 'No Meat Allowed'],
    priceRange: '$$ (SGD 18 – 35)',
    starRating: '4.7',
    reviewCount: '980+ Google Reviews',
    shortDescription: 'Charming Chinatown shophouse eatery facing the Buddha Tooth Relic Temple renowned for crispy vegetarian suckling pig and eight treasures herbal soup.',
    longDescription: 'Situated directly opposite the grand Buddha Tooth Relic Temple in Chinatown, Eight Treasures Vegetarian Restaurant has delighted locals and international travelers with authentic Cantonese plant-based creations for years. Its traditional Chinese shophouse dining room offers views of temple pagodas while serving an extensive menu of double-boiled herbal tonics, crispy beancurd crackling roasts, and wok-hei vegetables prepared strictly without animal products.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Vegetarian Suckling Pig',
        description: 'Crispy crackling bean curd skin seasoned with five-spice powder and served with sweet hoisin dip.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Eight Treasures Herbal Double-Boiled Soup',
        description: 'Nourishing traditional broth simmered with wolfberries, red dates, angelica root, and wild mushrooms.',
        category: 'Signature Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Sweet & Sour Plant-Based Crisp',
        description: 'Battered crispy textured soy protein tossed with pineapples, capsicums, and tangy plum sauce.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Yam Ring with Kung Pao Cashews',
        description: 'Fluffy golden mashed taro ring filled with stir-fried chestnuts, baby corn, and cashews.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Opposite Buddha Tooth Relic Temple', 'Chinatown Cultural Enclave', 'Air-Conditioned 2-Story Shophouse', 'Family Banquets Available'],
    hasBuffet: false,
    address: '282A South Bridge Road, Chinatown, Singapore 058831',
    nearestMrt: 'Chinatown MRT (NE4/DT19) / Maxwell MRT (TE18) — 3 mins walk',
    timings: '11:00 AM – 3:00 PM, 5:00 PM – 9:30 PM Daily',
    phone: '+65 6534 7727',
    officialWebsite: 'https://www.8treasures.sg',
    googleMapsUrl: 'https://maps.google.com/?q=Eight+Treasures+Vegetarian+Singapore',
    tips: [
      'Request a second-floor window table for views directly facing the temple pagoda.',
      'The Vegetarian Suckling Pig is a crowd favorite; order it upon seating as daily portions are limited.'
    ],
    isPopular: false,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about table reservations at Eight Treasures Chinatown.'
  },
  {
    _id: 'rest-tiffin-room',
    slug: 'tiffin-room-raffles',
    name: 'Tiffin Room at Raffles Hotel Singapore',
    subtitle: 'Historic Culinary Heritage Since 1892 in Singapore’s Legendary Grand Hotel',
    destination: 'Singapore',
    cuisineType: 'North Indian Royal Feasts Served in Tiered Tiffins',
    categories: ['video', 'indian', 'buffet', 'fine_dining'],
    dietaryBadges: ['Grand Luxury Dining', 'Vegetarian Feast Available', 'Non-Vegetarian Feast', 'Historic Heritage'],
    priceRange: '$$$$ (SGD 75+)',
    starRating: '4.8',
    reviewCount: '920+ Google Reviews',
    shortDescription: 'Regal dining in Raffles Singapore since 1892 presenting custom copper tiffin boxes filled with Lucknowi curries, tandoori prawns, and fragrant pulao.',
    longDescription: 'A crown jewel of Raffles Hotel Singapore since 1892, Tiffin Room has been a part of Singapore\'s history for over 130 years. Serving majestic North Indian specialties in elegant custom-made copper tiffin boxes, guests dine under soaring colonial arches with polished timber floorboards and white tablecloth service. Master Indian chefs showcase traditional clay tandoors and Awadhi slow cooking, offering both luxurious tasting menus and weekend royal lunches.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Mera Dabba (Signature 4-Tier Copper Tiffin)',
        description: 'Tiered copper tiffin box filled with Rogan Josh, signature Dal Makhani, saffron pulao, and tandoori paratha.',
        category: 'Signature Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Jhinga Dum Nisha',
        description: 'Wild tiger prawns marinated in roasted ajwain seeds, yellow chilli powder, and hung yoghurt charred in clay oven.',
        category: 'Tandoori / Grill',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Lucknowi Murgh Dum Biryani',
        description: 'Fragrant saffron basmati rice sealed with pastry crust and slow-baked with tender chicken drumsticks.',
        category: 'Biryani / Rice',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Paneer Rawalpindi (Vegetarian)',
        description: 'Charred artisan cottage cheese infused with black pepper, pomegranate seeds, and fresh mint.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Raffles Singapore Grand Hotel', '130+ Year Culinary Heritage', 'Sommelier Wine Pairings', 'Smart Casual Dress Code', 'Private Dining Salons'],
    hasBuffet: true,
    buffetHighlight: 'Mera Dabba Multi-Course Feast & Weekend Royal Lunch Sets',
    buffetDetails: 'Multi-course set menus served in signature tiffin boxes starting from SGD 88++ per person.',
    address: 'Raffles Hotel Singapore, 1 Beach Road, Singapore 189673',
    nearestMrt: 'City Hall MRT (EW13/NS25) / Esplanade MRT (CC3) — 3 mins walk',
    timings: 'Lunch: 12:00 PM – 2:30 PM | Dinner: 6:30 PM – 10:00 PM Daily',
    phone: '+65 6412 1816',
    officialWebsite: 'https://www.raffles.com/singapore/dining/tiffin-room/',
    reservationUrl: 'https://www.raffles.com/singapore/dining/tiffin-room/',
    googleMapsUrl: 'https://maps.google.com/?q=Tiffin+Room+Raffles+Hotel',
    tips: [
      'Smart casual attire is required (no flip-flops, athletic shorts or singlets).',
      'Combine your dining with a stroll around the historic courtyard gardens of Raffles Hotel.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to book a VIP dining experience at Tiffin Room at Raffles Hotel.'
  },
  {
    _id: 'rest-mustard',
    slug: 'mustard-bengali-punjabi',
    name: 'Mustard Restaurant',
    subtitle: 'Singapore’s First & Only Authentic Bengali & Punjabi Restaurant on Race Course Road',
    destination: 'Singapore',
    cuisineType: 'Bengali & Punjabi Regional Classics',
    categories: ['video', 'indian', 'veg'],
    dietaryBadges: ['Authentic River Seafood', 'Vegetarian Specialties', 'Pure Bengali Heritage'],
    priceRange: '$$$ (SGD 25 – 45)',
    starRating: '4.8',
    reviewCount: '1,250+ Google Reviews',
    shortDescription: 'Celebrated Race Course Road eatery introducing diners to Bengali mustard-infused prawns, Kosha Mangsho, and Punjabi tandoori grills.',
    longDescription: 'Mustard on Race Course Road holds a unique distinction as the only dining establishment in Singapore dedicated to the culinary heritage of Bengal and Punjab. Highlighting the subtle, fragrant mustard pastes (shorshe) and rich spices of Eastern and Northern India, Mustard offers signature seafood dishes cooked in fresh green coconuts, melt-in-the-mouth goat curries, and heavenly mishti doi desserts that transport diners straight to Kolkata.',
    coverImageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Chingri Maacher Malai Curry',
        description: 'Jumbo freshwater tiger prawns simmered inside a whole tender coconut with mild spiced coconut cream.',
        category: 'Signature Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Kosha Mangsho with Fluffy Luchi',
        description: 'Slow-braised mutton in deeply caramelized onion and ginger gravy, served with puffed Bengali wheat luchis.',
        category: 'Signature Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Maacher Paturi',
        description: 'Fish fillets coated in stone-ground mustard paste and wrapped in banana leaves before gentle steaming.',
        category: 'Main Course',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Authentic Mishti Doi',
        description: 'Chilled traditional baked Bengali sweetened fermented milk served in an earthen clay pot.',
        category: 'Dessert / Sweet',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Authentic Bengali Menu', 'Coconut Served Dishes', 'Cozy Heritage Dining', 'Craft Beers Available'],
    hasBuffet: false,
    address: '32 Race Course Road, Little India, Singapore 218552',
    nearestMrt: 'Little India MRT (NE7/DT12) — Exit E (2 mins walk)',
    timings: 'Lunch: 11:30 AM – 3:00 PM | Dinner: 6:00 PM – 10:30 PM Daily',
    phone: '+65 6297 6822',
    officialWebsite: 'https://mustardsingapore.com',
    googleMapsUrl: 'https://maps.google.com/?q=Mustard+Restaurant+Race+Course+Road',
    tips: [
      'The Chingri Malai Curry served in a tender green coconut is the definitive centerpiece dish.',
      'Save room for the Mishti Doi (sweet curd) which is housemade daily in traditional clay pots.'
    ],
    isPopular: false,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about dinner reservations at Mustard.'
  },
  {
    _id: 'rest-thevar',
    slug: 'thevar-michelin-singapore',
    name: 'Thevar',
    subtitle: 'Two Michelin-Starred Contemporary Indian Gastronomy on Keong Saik Road',
    destination: 'Singapore',
    cuisineType: 'Progressive Modern Indian Fine Dining',
    categories: ['video', 'indian', 'fine_dining'],
    dietaryBadges: ['2 Michelin Stars', 'Multi-Course Tasting Menu', 'Vegetarian Tasting on Advance Request'],
    priceRange: '$$$$ (SGD 75+)',
    starRating: '4.9',
    reviewCount: '650+ Google Reviews',
    shortDescription: 'World-acclaimed two-Michelin-starred modern Indian restaurant by Chef Mano Thevar serving innovative tasting menus, Chettinad roti, and spiced oysters.',
    longDescription: 'Earning two Michelin Stars, Thevar on Keong Saik Road is widely regarded as one of the most innovative modern Indian fine dining destinations in Asia. Helmed by Chef Mano Thevar, the culinary program takes classic spice profiles from Penang, Tamil Nadu, and coastal India, deconstructing them into breathtaking multi-course sensory masterpieces. From crispy Chettinad chicken roti to grilled oysters in rasam broth, dining here is an unforgettable artistic encounter.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Chettinad Spiced Chicken Roti Canai',
        description: 'Paper-thin buttery roti folded around shredded chicken cooked in 18-spice Chettinad masala with whipped yogurt.',
        category: 'Signature Starter',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Irish Oyster with Rasam Granita',
        description: 'Fresh plump oyster topped with frozen spicy-sour tomato and tamarind rasam granita pearls.',
        category: 'Signature Starter',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Crispy Pork Belly with Spiced Sambal',
        description: 'Twelve-hour slow-cooked pork belly with crackling crust, tempered curry leaf sambal, and coconut velouté.',
        category: 'Signature Main Course',
        isVegetarian: false,
        isChefSpecial: true
      }
    ],
    features: ['2 Michelin Stars', 'Open Kitchen Chef Counter', 'Curated Wine & Cocktail Pairings', 'Keong Saik Heritage Shophouse'],
    hasBuffet: false,
    address: '9 Keong Saik Road, Chinatown, Singapore 089117',
    nearestMrt: 'Outram Park MRT (EW16/NE3/TE17) — 4 mins walk',
    timings: 'Dinner: 5:30 PM – 11:00 PM (Tue–Sat, Closed Sun & Mon)',
    phone: '+65 9750 8275',
    officialWebsite: 'https://thevar.sg',
    reservationUrl: 'https://thevar.sg',
    googleMapsUrl: 'https://maps.google.com/?q=Thevar+Singapore',
    tips: [
      'Reservations open 30 days in advance and usually book out within minutes.',
      'Sit at the Chef\'s Counter for front-row views of live open-flame plating.'
    ],
    isPopular: true,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about booking concierge service for Thevar.'
  },
  {
    _id: 'rest-komala-vilas',
    slug: 'komala-vilas-serangoon',
    name: 'Komala Vilas',
    subtitle: 'Established in 1947 — Historic South Indian Vegetarian Trademark on Serangoon Road',
    destination: 'Singapore',
    cuisineType: 'Traditional South & North Indian Pure Vegetarian',
    categories: ['veg', 'indian', 'vegan', 'hawker'],
    dietaryBadges: ['100% Pure Vegetarian', 'Strict Jain Friendly Options', 'Vegan Friendly', 'Founded 1947'],
    priceRange: '$ (SGD 6 – 16)',
    starRating: '4.7',
    reviewCount: '6,500+ Google Reviews',
    shortDescription: 'Historic Little India institution since 1947 famous for authentic banana leaf meals, Ravai Masala Dosa, and warm saffron badam milk.',
    longDescription: 'Founded in 1947 by Mr. O. Rajagopal, Komala Vilas on Serangoon Road is one of Singapore\'s oldest and most revered vegetarian dining houses. Famous worldwide (even hosting Indian Prime Minister Narendra Modi and Singapore Prime Minister Lee Hsien Loong for tea), Komala Vilas delivers pristine vegetarian dishes served with unpretentious charm on fresh green banana leaves. Every dish from its crispy Ravai Dosa to rich badam milk is prepared using traditional recipes passed down through three generations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'South Indian Meal on Fresh Banana Leaf',
        description: 'Steaming ponni rice served on a banana leaf with unlimited sambar, rasam, kootu, poriyal, buttermilk, and papad.',
        category: 'Signature Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Ravai Masala Dosa',
        description: 'Lacy, crispy semolina crepe spiced with black pepper, cashews, and stuffed with potato masala.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Idli & Medu Vada Combo',
        description: 'Pillow-soft steamed rice cakes and golden lentil donuts served with trio of fresh coconut and coriander chutneys.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Warm Saffron Badam Milk',
        description: 'Thickened milk brewed with crushed California almonds, cardamom pods, and Kashmiri saffron strands.',
        category: 'Beverage',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Hosted World Leaders & Prime Ministers', 'Traditional Banana Leaf Dining', '100% Pure Vegetarian', 'Sweet Shop Counter Next Door'],
    hasBuffet: true,
    buffetHighlight: 'Unlimited Rice & Gravy Refills on Banana Leaf Meals',
    address: '76-78 Serangoon Road, Little India, Singapore 217981',
    nearestMrt: 'Little India MRT (NE7/DT12) — 4 mins walk',
    timings: '7:00 AM – 10:30 PM Daily',
    phone: '+65 6293 6980',
    officialWebsite: 'https://komalavilas.com.sg',
    googleMapsUrl: 'https://maps.google.com/?q=Komala+Vilas+Serangoon+Road',
    tips: [
      'Visit their dedicated traditional Indian sweet shop next door to pick up gift boxes of fresh Mysore Pak, Kaju Katli, and Gulab Jamun.',
      'The morning breakfast idli and filter coffee from 7:30 AM to 10:00 AM is unbeatable.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group meal arrangements at Komala Vilas.'
  },
  {
    _id: 'rest-ananda-bhavan',
    slug: 'ananda-bhavan-since-1924',
    name: 'Ananda Bhavan Restaurant',
    subtitle: 'Singapore’s Oldest Indian Vegetarian Restaurant — Serving Pure Flavours Since 1924',
    destination: 'Singapore',
    cuisineType: 'Heritage South Indian & North Indian Pure Vegetarian',
    categories: ['video', 'veg', 'indian', 'vegan', 'buffet'],
    dietaryBadges: ['Singapore Oldest (Est. 1924)', '100% Pure Vegetarian', 'Jain Options Available', 'Round-the-Clock Dining'],
    priceRange: '$ (SGD 7 – 18)',
    starRating: '4.6',
    reviewCount: '3,400+ Google Reviews',
    shortDescription: 'Singapore\'s oldest vegetarian institution since 1924 opposite Sri Veeramakaliamman Temple offering mini tiffins, ghee roast dosas, and Punjabi thalis.',
    longDescription: 'Celebrating over a century of culinary distinction, Ananda Bhavan Restaurant opened in 1924 and remains the oldest vegetarian restaurant in Singapore. Positioned prominently across from Sri Veeramakaliamman Temple in Little India, it has introduced generations of travelers to pure South and North Indian home-style cooking. Famous for its quick service, round-the-clock convenience, and comforting Mini Tiffin sets, it is a living pillar of Singapore’s multicultural heritage.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Mini Tiffin Sampler Platter',
        description: 'Tasting tray featuring 1 mini masala dosa, 1 steamed idli, 1 medu vada, sweet kesari, sambar and trio of chutneys.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Ghee Roast Paper Cone Dosa',
        description: 'Golden crispy cone dosa roasted with pure cow ghee and served with spiced potato masala.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Poori Kizhangu',
        description: 'Two hot fluffy fried flatbreads served with turmeric-spiced mashed potato and onion gravy.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Oldest Indian Restaurant in Singapore', 'Open 24 Hours / Late Night', 'Opposite Historic Temple', 'Fast Self-Ordering Kiosks'],
    hasBuffet: true,
    buffetHighlight: 'Grand Thali Platter with Unlimited Gravy & Rice Refills',
    address: '95 Syed Alwi Road, Little India, Singapore 207671',
    nearestMrt: 'Farrer Park MRT (NE8) — Exit H (4 mins walk)',
    timings: 'Open 24 Hours (Daily)',
    phone: '+65 6398 0837',
    officialWebsite: 'https://anandabhavan.com',
    googleMapsUrl: 'https://maps.google.com/?q=Ananda+Bhavan+Syed+Alwi',
    tips: [
      'Located just 3 minutes walk from 24-hour Mustafa Centre—perfect for late-night shopping refuels.',
      'Order the Mini Tiffin for the best sampling of their breakfast specialties in one tray.'
    ],
    isPopular: true,
    isTrending: false,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about breakfast and group dining at Ananda Bhavan.'
  },
  {
    _id: 'rest-mr-biryani',
    slug: 'mr-biryani-norris-road',
    name: 'Mr Biryani',
    subtitle: 'Authentic Hyderabadi Dum Biryani Slow Cooked in Sealed Earthen Handis',
    destination: 'Singapore',
    cuisineType: 'Hyderabadi & Andhra Regional Delicacies',
    categories: ['video', 'biryani', 'indian', 'halal'],
    dietaryBadges: ['Halal Sourced', 'Authentic Hyderabadi Dum', 'Vegetarian Dum Biryani Available'],
    priceRange: '$$ (SGD 14 – 28)',
    starRating: '4.7',
    reviewCount: '1,850+ Google Reviews',
    shortDescription: 'Renowned Little India spot on Norris Road famous for clay-handi slow-cooked Hyderabadi Dum Biryani, Andhra Chilli Chicken, and Mirchi Ka Salan.',
    longDescription: 'Founded by passionate Chef Govinda Rajan, Mr Biryani brings the true royal Nizam flavors of Hyderabad to Norris Road in Little India. Specializing in "Kacchi Dum Biryani", raw marinated meat and long-grain basmati rice are layered with 30 spices, fried onions, and fresh mint in traditional clay handis sealed with dough and slow-steamed over charcoal. Served alongside authentic Mirchi Ka Salan (tangy peanut-chili gravy) and cooling dahi chutney, it is a culinary masterpiece.',
    coverImageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Hyderabadi Mutton Dum Biryani',
        description: 'Tender Australian mutton marinated in 30 spices and slow-cooked with basmati rice in sealed earthen pot.',
        category: 'Biryani / Rice',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Andhra Chilli Chicken',
        description: 'Crispy fried boneless chicken tossed with green chilies, curry leaves, ginger, and garlic.',
        category: 'Signature Starter',
        isVegetarian: false,
        isChefSpecial: true
      },
      {
        name: 'Paneer 65 & Gobi 65',
        description: 'Golden battered cauliflower and paneer cubes tossed in fiery tempered spices and curry leaves.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['Sealed Clay Handi Cooking', 'Authentic Mirchi Ka Salan', 'Air Conditioned Dining', 'Family Portions Available'],
    hasBuffet: false,
    address: '11 Norris Road, Little India, Singapore 208253',
    nearestMrt: 'Jalan Besar MRT (DT22) — 3 mins walk',
    timings: 'Lunch: 11:30 AM – 3:30 PM | Dinner: 6:00 PM – 10:30 PM Daily',
    phone: '+65 8661 4673',
    officialWebsite: 'https://mrbiryani.com',
    googleMapsUrl: 'https://maps.google.com/?q=Mr+Biryani+Norris+Road',
    tips: [
      'Their family bucket dum biryani serves 4–5 people with generous portions of tender meat and boiled eggs.',
      'Be sure to pair your biryani with their fiery Andhra Chilli Chicken.'
    ],
    isPopular: false,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about group bookings at Mr Biryani.'
  },
  {
    _id: 'rest-herbivore',
    slug: 'herbivore-japanese-vegetarian',
    name: 'Herbivore Japanese Vegetarian Restaurant',
    subtitle: 'Singapore’s Premier 100% Pure Vegetarian & Vegan Japanese Sushi & Bento Experience',
    destination: 'Singapore',
    cuisineType: 'Artisanal Japanese Vegetarian & Vegan Cuisine',
    categories: ['video', 'veg', 'vegan', 'chinese'],
    dietaryBadges: ['100% Vegetarian', 'Vegan Friendly', 'Allium-Free Options Available', 'Egg-Free Available'],
    priceRange: '$$ (SGD 18 – 38)',
    starRating: '4.8',
    reviewCount: '2,800+ Google Reviews',
    shortDescription: 'Pioneering Japanese vegetarian sanctuary in Fortune Centre renowned for plant-based unagi rolls, konjac salmon sashimi, and crispy tonkatsu bentos.',
    longDescription: 'Tucked inside Fortune Centre along Middle Road, Herbivore is Singapore’s very first Japanese pure vegetarian restaurant. Designed with tranquil wood-lined Zen interiors, Herbivore elevates plant-based dining to fine culinary art. Skilfully transforming natural soy, mushrooms, seaweed, and konjac, their chefs recreate Japanese favorites from unagi sushi and salmon sashimi to piping hot ramen and sizzling teppanyaki without compromising on authentic Japanese umami.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop'
    ],
    mustTryDishes: [
      {
        name: 'Vegetarian Unagi Maki (Grilled Eel Sushi Roll)',
        description: 'Glazed roasted soy and nori roll replicating rich grilled unagi, topped with ripe avocado slices.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Plant-Based Salmon Sashimi',
        description: 'Delicately sliced konjac-root sashimi mimicking the silky texture and appearance of fresh salmon, served with fresh wasabi.',
        category: 'Signature Starter',
        isVegetarian: true,
        isChefSpecial: true
      },
      {
        name: 'Crispy Tonkatsu Bento Set',
        description: 'Golden panko-crusted plant-based cutlet with Japanese barbecue sauce, miso soup, salad, and Japanese short-grain rice.',
        category: 'Main Course',
        isVegetarian: true,
        isChefSpecial: true
      }
    ],
    features: ['100% Pure Vegetarian Japanese', 'Zen Wood Interiors', 'Fortune Centre Vegetarian Hub', 'Comprehensive Vegan Menu'],
    hasBuffet: false,
    address: '190 Middle Road, #01-13/14 Fortune Centre, Singapore 188979',
    nearestMrt: 'Bencoolen MRT (DT21) / Bugis MRT (EW12/DT14) — 5 mins walk',
    timings: '11:30 AM – 2:30 PM, 5:00 PM – 9:00 PM Daily',
    phone: '+65 6333 1612',
    officialWebsite: 'https://herbivore.com.sg',
    googleMapsUrl: 'https://maps.google.com/?q=Herbivore+Fortune+Centre',
    tips: [
      'Fortune Centre is Singapore\'s legendary vegetarian dining building with over 15 vegetarian eateries on multiple floors.',
      'Order the Unagi Maki roll—it is widely considered the best vegetarian sushi in Singapore.'
    ],
    isPopular: false,
    isTrending: true,
    isDisplayed: true,
    whatsappNumber: '6594722830',
    whatsappMessage: 'Hi Flying Wonders! I would like to inquire about dining at Herbivore Fortune Centre.'
  }
]

export async function getAllRestaurants(): Promise<RestaurantData[]> {
  try {
    // 1. Fetch from Sanity restaurantMeta
    const sanityRestaurants = await client.fetch(`*[_type == "restaurantMeta" && isDisplayed != false] | order(isPopular desc, starRating desc){
      _id,
      name,
      "slug": slug.current,
      subtitle,
      destination,
      cuisineType,
      categories,
      dietaryBadges,
      priceRange,
      starRating,
      reviewCount,
      shortDescription,
      longDescription,
      "coverImageFile": coverImage.asset->url,
      coverImageUrl,
      videoUrl,
      shorts,
      mustTryDishes,
      features,
      hasBuffet,
      buffetHighlight,
      buffetDetails,
      address,
      nearestMrt,
      timings,
      phone,
      officialWebsite,
      menuUrl,
      reservationUrl,
      googleMapsUrl,
      tips,
      isPopular,
      isTrending,
      isDisplayed,
      whatsappNumber,
      whatsappMessage
    }`)

    // 2. Fetch from Sanity b2bServiceMedia (category == "restaurant")
    const mediaRestaurants = await client.fetch(`*[_type == "b2bServiceMedia" && category == "restaurant" && isDisplayed != false]{
      _id,
      title,
      "slug": slug.current,
      subtitle,
      destination,
      cuisineType,
      starRating,
      hotelAddress,
      description,
      "coverImageFile": coverImage.asset->url,
      coverImageUrl,
      "videoFileUrl": videoFile.asset->url,
      videoUrl,
      "galleryUploaded": galleryImages[].asset->url,
      galleryImageUrls,
      features,
      mustDoThings,
      timings,
      tipsAndTricks,
      shorts,
      isDisplayed
    }`)

    const normalizedSanity: RestaurantData[] = (sanityRestaurants || []).map((r: any) => ({
      _id: r._id,
      slug: r.slug || slugifyRestaurantName(r.name),
      name: cleanRestaurantName(r.name),
      subtitle: r.subtitle,
      destination: r.destination || 'Singapore',
      cuisineType: r.cuisineType || 'Dining',
      categories: Array.isArray(r.categories) ? r.categories : ['indian'],
      dietaryBadges: Array.isArray(r.dietaryBadges) ? r.dietaryBadges : [],
      priceRange: r.priceRange || '$$ (SGD 20 – 40)',
      starRating: String(r.starRating || '4.8'),
      reviewCount: r.reviewCount,
      shortDescription: r.shortDescription || r.longDescription?.slice(0, 160) || '',
      longDescription: r.longDescription || r.shortDescription || '',
      coverImageUrl: r.coverImageFile || r.coverImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      galleryImageUrls: r.galleryImageUrls || [],
      videoUrl: r.videoUrl,
      shorts: r.shorts || [],
      mustTryDishes: r.mustTryDishes || [],
      features: r.features || [],
      hasBuffet: Boolean(r.hasBuffet),
      buffetHighlight: r.buffetHighlight,
      buffetDetails: r.buffetDetails,
      address: r.address || '',
      nearestMrt: r.nearestMrt,
      timings: r.timings,
      phone: r.phone,
      officialWebsite: r.officialWebsite,
      menuUrl: r.menuUrl,
      reservationUrl: r.reservationUrl,
      googleMapsUrl: r.googleMapsUrl,
      tips: r.tips || [],
      isPopular: Boolean(r.isPopular),
      isTrending: Boolean(r.isTrending),
      isDisplayed: r.isDisplayed !== false,
      whatsappNumber: r.whatsappNumber,
      whatsappMessage: r.whatsappMessage
    }))

    const normalizedMedia: RestaurantData[] = (mediaRestaurants || []).map((m: any) => ({
      _id: m._id,
      slug: m.slug || slugifyRestaurantName(m.title),
      name: cleanRestaurantName(m.title),
      subtitle: m.subtitle,
      destination: m.destination || 'Singapore',
      cuisineType: m.cuisineType || 'Dining Experience',
      categories: ['video', 'buffet'],
      dietaryBadges: ['DMC Recommended Partner'],
      priceRange: '$$ (SGD 20 – 40)',
      starRating: String(m.starRating || '4.8'),
      shortDescription: m.description?.slice(0, 160) || '',
      longDescription: m.description || '',
      coverImageUrl: m.coverImageFile || m.coverImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      galleryImageUrls: m.galleryUploaded || m.galleryImageUrls || [],
      videoUrl: m.videoFileUrl || m.videoUrl,
      shorts: m.shorts || [],
      mustTryDishes: m.mustDoThings || [],
      features: m.features || [],
      hasBuffet: true,
      address: m.hotelAddress || 'Singapore',
      timings: m.timings,
      tips: m.tipsAndTricks || [],
      isPopular: true,
      isDisplayed: m.isDisplayed !== false
    }))

    const existingSlugs = new Set([...normalizedSanity, ...normalizedMedia].map(r => normalizeRestaurantSlug(r.slug)))
    const missingDefaults = DEFAULT_RESTAURANTS.filter(d => !existingSlugs.has(normalizeRestaurantSlug(d.slug)))

    return [...normalizedSanity, ...normalizedMedia, ...missingDefaults]
  } catch (err) {
    console.warn('Using DEFAULT_RESTAURANTS fallback due to fetch error:', err)
    return DEFAULT_RESTAURANTS
  }
}

export async function getRestaurantBySlug(rawSlug: string): Promise<RestaurantData | null> {
  const all = await getAllRestaurants()
  const targetSlug = normalizeRestaurantSlug(rawSlug)

  const directMatch = all.find(r =>
    normalizeRestaurantSlug(r.slug) === targetSlug ||
    slugifyRestaurantName(r.name) === targetSlug
  )
  if (directMatch) return directMatch

  const fuzzyMatch = all.find(r => {
    const s = normalizeRestaurantSlug(r.slug)
    return s.includes(targetSlug) || targetSlug.includes(s)
  })
  if (fuzzyMatch) return fuzzyMatch

  const cleanName = cleanRestaurantName(rawSlug.replace(/-/g, ' '))
  return {
    _id: `dynamic-${rawSlug}`,
    slug: rawSlug,
    name: cleanName,
    subtitle: 'Verified Destination Dining · Singapore',
    destination: 'Singapore',
    cuisineType: 'Curated Dining Experience',
    categories: ['indian', 'buffet'],
    dietaryBadges: ['Verified Partner Restaurant'],
    priceRange: '$$ (SGD 20 – 40)',
    starRating: '4.8',
    shortDescription: `${cleanName} is a top recommended dining and culinary destination in Singapore.`,
    longDescription: `Experience rich flavours and memorable dining at ${cleanName}. Known for exceptional food quality, authentic recipe preparations, and prime location connectivity.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop',
    mustTryDishes: ['Signature House Specialty', 'Seasonal Chef Tasting Spread', 'Traditional Fresh Breads & Rice'],
    features: ['Instant Confirmation', 'Private Group Dining Available', 'Verified B2B DMC Partner'],
    address: 'Singapore Destination Dining Network',
    timings: 'Lunch & Dinner Daily',
    isDisplayed: true
  }
}

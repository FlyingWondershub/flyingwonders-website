import { client } from '../sanity/lib/client'
import type { AppDetails } from '../components/AppDownloadCard'
import type { TravelShort } from './packages'

export interface MallStoreCategory {
  categoryName: string
  discountBadge?: string
  brands: string[]
  description?: string
}

export interface MallHighlight {
  title: string
  description: string
  badge?: string
}

export interface MallDining {
  description: string
  topPicks: string[]
}

export interface MallTransit {
  station: string
  line: string
  exit: string
  walkingTime: string
  sheltered?: boolean
}

export interface MallNearbyAttraction {
  name: string
  distance: string
  travelTip: string
}

export interface MallFAQ {
  question: string
  answer: string
}

export interface ShoppingMallData {
  _id: string
  slug: string
  name: string
  alternateName?: string
  subtitle?: string
  tagline: string
  category: string
  budgetTier: '$' | '$$' | '$$$' | '$$$$'
  starRating: string
  reviewCount?: string
  coverImageUrl: string
  galleryImageUrls: string[]
  locationAddress: string
  district: string
  nearestMrt: MallTransit
  busLines?: string
  mapEmbedUrl: string
  timings: string
  bestTimeToVisit: string
  peakCrowdTimes?: string
  recommendedDuration: string
  overview: string
  mustDoThings: string[]
  keyHighlights: MallHighlight[]
  topStoresAndBrands: MallStoreCategory[]
  tipsAndTricks: string[]
  appDetails: AppDetails
  videoUrl?: string
  shorts?: TravelShort[]
  diningHighlights: MallDining
  facilities: string[]
  nearbyAttractions: MallNearbyAttraction[]
  faqs: MallFAQ[]
  whatsappNumber?: string
  whatsappMessage?: string
  isDisplayed?: boolean
}

export function cleanMallName(rawName: string): string {
  if (!rawName) return 'Singapore Shopping Mall'
  return rawName.replace(/^Singapore\s*-\s*/i, '').trim()
}

export function slugifyMallName(name: string): string {
  if (!name) return 'shopping-mall'
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeMallSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  const s = rawSlug.toLowerCase().trim()
  if (s === 'imm-mall' || s === 'imm-outlet' || s === 'imm-outlet-mall') return 'imm'
  if (s === 'mustafa' || s === 'mustafa-center') return 'mustafa-centre'
  if (s === 'bugis' || s === 'bugis-street') return 'bugis-street-market'
  if (s === 'mbs' || s === 'marina-bay-sands' || s === 'the-shoppes' || s === 'the-shoppes-at-marina-bay-sands') return 'the-shoppes-marina-bay-sands'
  if (s === 'orchard' || s === 'orchard-road' || s === 'orchard-malls') return 'orchard-road-malls'
  if (s === 'chinatown' || s === 'chinatown-market' || s === 'chinatown-street') return 'chinatown-street-market'
  return s
}

export const DEFAULT_SHOPPING_MALLS: ShoppingMallData[] = [
  // ── 1. IMM OUTLET MALL ──
  {
    _id: 'mall-imm',
    slug: 'imm',
    name: 'IMM Outlet Mall',
    alternateName: 'IMM 裕廊奥特莱斯',
    subtitle: 'Singapore’s Largest Outlet Mall · Jurong East',
    tagline: 'Singapore\'s Premier Factory Outlet Destination with Over 90 Designer & Athleisure Outlet Stores',
    category: 'Outlet & Discount Mall',
    budgetTier: '$$',
    starRating: '4.8',
    reviewCount: '15,200+ Reviews',
    coverImageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1600&auto=format&fit=crop&q=80',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80'
    ],
    locationAddress: '2 Jurong East Street 21, Singapore 609601',
    district: 'Jurong East (West Region)',
    nearestMrt: {
      station: 'Jurong East MRT Station',
      line: 'NS1 / EW24 (North-South & East-West Lines)',
      exit: 'Exit A (via J-Walk elevated sheltered pedestrian bridge via Westgate)',
      walkingTime: '5–8 Minutes Sheltered Walk',
      sheltered: true
    },
    busLines: '52, 105, 188, 333, 502, 990 (Direct alight at IMM building)',
    mapEmbedUrl: 'https://maps.google.com/maps?q=IMM+Building+Singapore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    timings: '10:00 AM – 10:00 PM Daily',
    bestTimeToVisit: 'Weekday mornings (10:30 AM – 1:30 PM) for unobstructed browsing and zero fitting room queues',
    peakCrowdTimes: 'Saturdays, Sundays & Public Holidays from 2:00 PM to 8:00 PM',
    recommendedDuration: '3 to 5 Hours',
    overview: 'IMM (International Merchandise Mart) is Singapore’s undisputed heavyweight outlet shopping mall. Managed by CapitaLand, this retail powerhouse houses over 90 official branded outlet stores providing year-round discounts between 30% and 80% off standard retail prices. From international luxury leather goods like Coach, Michael Kors, Furla, and Kate Spade to world-class sportswear hubs like Nike Unite, Adidas Outlet, Puma, and New Balance, IMM offers authentic past-season collections and factory surplus at fraction-of-retail prices under one fully air-conditioned roof. Connected seamlessly to Jurong East MRT via the elevated J-Walk network, IMM is an essential pilgrimage for savvy international travelers seeking genuine luxury bargains in Singapore.',
    mustDoThings: [
      'Hunt for designer leather bags & wallets at Coach Outlet (Level 1) and Kate Spade Outlet with discounts up to 60%–70% plus bundle promotions.',
      'Raid the massive Nike Unite Outlet & Adidas Factory Outlet for discounted sneakers, compression apparel, and athletic streetwear.',
      'Explore Outlet by Club 21 (Level 2) for European designer labels including Marc Jacobs, DKNY, and Paul Smith at up to 80% off.',
      'Collect your official Tourist Privilege Booklet at the Customer Service Counter (Level 1) with your foreign passport for extra vouchers.',
      'Check out Charles & Keith and Pedro outlets for fashionable Singaporean footwear and handbags starting from under SGD $30.'
    ],
    keyHighlights: [
      {
        title: '90+ Dedicated Factory Outlets',
        description: 'Singapore\'s largest concentration of official brand outlet stores under one roof.',
        badge: 'Up to 80% Off'
      },
      {
        title: 'Sheltered J-Walk Link Bridge',
        description: '100% weather-proof elevated bridge connecting Jurong East MRT, Westgate, and IMM.',
        badge: 'Rain or Shine'
      },
      {
        title: 'Tourist Passport Privileges',
        description: 'Exclusive coupon booklets and eCapitaVoucher spending rebates for foreign passport holders.',
        badge: 'Free Voucher'
      },
      {
        title: 'Full eTRS Tax Refund Support',
        description: 'Participating outlets issue digital eTRS receipts eligible for 9% GST refund at Changi Airport.',
        badge: '9% Tax Free'
      }
    ],
    topStoresAndBrands: [
      {
        categoryName: 'Designer Handbags & Luxury Leather',
        discountBadge: '40% – 70% Off',
        brands: ['Coach Outlet (#01-104)', 'Kate Spade New York (#01-106)', 'Michael Kors (#01-125)', 'Furla Outlet (#01-121)', 'TUMI (#02-40)', 'Outlet by Club 21 (#02-01)'],
        description: 'Look for buy-1-get-1 or extra 15% bundle tags when purchasing multiple handbags or accessories.'
      },
      {
        categoryName: 'Athletic, Sportswear & Sneakers',
        discountBadge: '30% – 70% Off',
        brands: ['Nike Unite (#02-50)', 'Adidas Factory Outlet (#01-16)', 'Puma Outlet (#01-22)', 'New Balance Factory Store (#01-02)', 'Under Armour (#02-03)', 'Asics Factory Outlet (#02-12)', 'FILA Outlet (#01-01)'],
        description: 'Nike and Adidas refresh their back-wall clearance racks weekly with discontinued colorways and sample sizes.'
      },
      {
        categoryName: 'High Street Fashion & Footwear',
        discountBadge: '30% – 80% Off',
        brands: ['Charles & Keith Outlet (#02-13)', 'Pedro Outlet (#02-48)', 'Calvin Klein (#01-120)', 'Tommy Hilfiger (#01-20)', 'Levi\'s Outlet (#01-08)', 'Timberland (#01-122)', 'Clarks (#01-124)', 'Cotton On Mega (#01-40)'],
        description: 'Singapore homegrown icons Charles & Keith and Pedro offer extreme markdowns on seasonal collections.'
      },
      {
        categoryName: 'Luggage, Travel Gear & Winter Apparel',
        discountBadge: '40% – 60% Off',
        brands: ['Samsonite Outlet (#02-27)', 'American Tourister (#02-28)', 'The Travel Store (#02-31)', 'Winter Time (#02-45)', 'Universal Traveller (#02-38)'],
        description: 'Ideal spot to pick up affordable expandable check-in spinners if you have exceeded your baggage allowance.'
      }
    ],
    tipsAndTricks: [
      'Visit the Customer Service Counter on Level 1 upon arrival. Present your foreign passport to claim your Tourist Privilege Booklet containing supplementary 5%–10% discount vouchers.',
      'Plan your trip on a Tuesday, Wednesday, or Thursday morning. Outlet fitting rooms and shoe sizing assistance are unhurried, unlike the weekend rush.',
      'For footwear, always inspect both shoes in the box for condition and fit before heading to the register, as outlet policies generally specify no refunds or returns.',
      'IMM is part of CapitaLand’s CapitaStar reward ecosystem. Download the CapitaStar app to scan your receipts for digital points and occasional cashback e-vouchers.',
      'Combine IMM with Westgate and JCube (JEM) right next to Jurong East MRT for a comprehensive full-day West Singapore retail safari.'
    ],
    appDetails: {
      appName: 'CapitaStar: Rewards & Mall Guide',
      appDescription: 'Official CapitaLand shopping app for IMM, Westgate, and Bugis Junction. Earn STAR$ rewards, view indoor floor directories, and redeem parking or merchant vouchers.',
      appStoreUrl: 'https://apps.apple.com/sg/app/capitastar/id544719262',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.capitamalls.capitastar',
      appFeatures: [
        'Interactive IMM Store & Outlet Directory Map',
        'Direct Receipt Scanning for Tourist Reward Points',
        'Exclusive In-App Merchant Discount E-Vouchers',
        'Real-time Parking & Traffic Status'
      ]
    },
    videoUrl: 'https://www.youtube.com/watch?v=kR2tI79vXpE',
    shorts: [
      { id: 'imm-short-1', title: 'IMM Nike & Coach Outlet Tour 2026', creator: 'Singapore Explorer', thumbnailUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80', youtubeVideoId: 'kR2tI79vXpE' },
      { id: 'imm-short-2', title: 'How to Get to IMM via J-Walk Bridge', creator: 'SG Retail Guide', thumbnailUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80', youtubeVideoId: 'kR2tI79vXpE' }
    ],
    diningHighlights: {
      description: 'IMM features over 50 F&B options spanning casual food courts, Halal-certified favorites, and full-service family dining on Level 1 and Level 2.',
      topPicks: [
        'Kopitiam Food Court (Level 3) – Authentic Singapore street eats like Ban Mian, Hainanese Chicken Rice, and Laksa.',
        'HaiDiLao Hot Pot (#03-01) – Renowned Sichuan hot pot with world-famous attentive hospitality and complimentary manicures.',
        'Swensen\'s (#01-111) – Halal-certified Western comfort steaks, baked rice, and sundae ice creams.',
        'Bali Thai (#01-21) – Thai-Indonesian fusion delights including Tom Yum soup and crispy whole fish.'
      ]
    },
    facilities: [
      'eTRS GST Tourist Refund Self-Help Enrolment',
      'Foreign Currency Exchange Counter (Level 1)',
      'Free High-Speed Mall WiFi',
      'Nursing & Baby Care Rooms (Every Level)',
      'Wheelchair Loan Services (Customer Service L1)',
      'Multi-storey Sheltered Car Parking'
    ],
    nearbyAttractions: [
      {
        name: 'Science Centre Singapore',
        distance: '10 Mins via Bus 66/335',
        travelTip: 'A world-class STEM discovery center with Omni-Theatre and Snow City. Pair morning science exhibits with afternoon IMM outlet shopping.'
      },
      {
        name: 'Jurong Lake Gardens',
        distance: '1 MRT stop to Lakeside (EW26)',
        travelTip: 'Singapore’s scenic 90-hectare national garden with boardwalks and picturesque lalang fields for evening golden hour photos.'
      }
    ],
    faqs: [
      {
        question: 'Are all stores at IMM genuine outlet discount stores?',
        answer: 'Yes! IMM is designated as an official outlet mall by CapitaLand. Over 90 dedicated outlet tenants maintain year-round discount policies offering authentic branded goods at 30% to 80% off.'
      },
      {
        question: 'How do I claim my 9% GST refund at IMM?',
        answer: 'Spend a minimum of SGD $100 across up to 3 same-day receipts at participating tax-free stores. Present your physical foreign passport at checkout to have your digital eTRS transaction registered. You will validate and receive your refund at Changi Airport kiosks before departure.'
      },
      {
        question: 'Is there a free shuttle bus from Jurong East MRT to IMM?',
        answer: 'The elevated, air-conditioned J-Walk pedestrian walkway directly links Jurong East MRT station (Exit A through Westgate Level 2) straight into IMM Level 2 in 5 to 7 comfortable walking minutes, eliminating the need for a shuttle bus.'
      }
    ],
    whatsappMessage: 'Hi Flying Wonders DMC! I would like to inquire about Singapore private minivan transfers to IMM Outlet Mall and custom shopping tour packages.',
    isDisplayed: true
  },

  // ── 2. MUSTAFA CENTRE ──
  {
    _id: 'mall-mustafa',
    slug: 'mustafa-centre',
    name: 'Mustafa Centre',
    alternateName: 'முஸ்தபா சென்டர் · 慕达发中心',
    subtitle: 'Little India’s Legendary 24/7 Retail Wonderland',
    tagline: 'Singapore\'s Most Iconic Round-The-Clock Department Store with Over 300,000 Everyday Essentials & Souvenirs',
    category: '24/7 Mega Superstore & Bazaar',
    budgetTier: '$',
    starRating: '4.7',
    reviewCount: '28,400+ Reviews',
    coverImageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1600&auto=format&fit=crop&q=80',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80'
    ],
    locationAddress: '145 Syed Alwi Road, Little India, Singapore 207704',
    district: 'Little India (Central Region)',
    nearestMrt: {
      station: 'Farrer Park MRT Station',
      line: 'NE8 (North East Line)',
      exit: 'Exit G or Exit I (via City Square Mall pathway)',
      walkingTime: '4–5 Minutes Walk',
      sheltered: false
    },
    busLines: '21, 23, 64, 65, 66, 67, 125, 130, 139, 141, 147 (Serangoon Rd / Kitchener Rd stops)',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mustafa+Centre+Singapore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    timings: '24 Hours Open (365 Days A Year)',
    bestTimeToVisit: 'Late evening to midnight (10:00 PM – 2:00 AM) or early mornings (7:00 AM – 10:00 AM) when aisle congestion is low',
    peakCrowdTimes: 'Friday, Saturday & Sunday evenings between 5:00 PM and 10:30 PM',
    recommendedDuration: '2 to 4 Hours',
    overview: 'Mustafa Centre is an iconic Singapore retail institution like no other on Earth. Located in the bustling cultural heart of Little India, this colossal 6-level maze occupies two interconnected buildings on Syed Alwi Road and stocks over 300,000 distinct items at rock-bottom wholesale prices. Operating 24 hours a day, 7 days a week, Mustafa sells virtually everything imaginable: designer French perfumes, 22K/24K gold jewelry, consumer electronics, international travel adapters, luxury watches, branded luggage, traditional Indian ethnic apparel, Himalayan spices, and entire supermarket floors packed with European chocolates, nuts, and Singapore souvenirs. With fixed transparent pricing and an electric, high-energy atmosphere, late-night shopping at Mustafa is a quintessential Singapore experience.',
    mustDoThings: [
      'Browse the world-famous Level 1 Perfume & Cosmetics Gallery featuring genuine designer fragrances (Dior, Chanel, Versace, Calvin Klein) at duty-free discount prices.',
      'Raid Level 2 Supermarket for Singapore culinary souvenirs: Merlion chocolates, Ya Kun Kaya coconut jam, Prima Taste Laksa noodle kits, Tiger Balm, and Turkish delight.',
      'Stock up on healthcare classics on Level 1: Tiger Balm ointments, Axe Brand medicated universal oils, and herbal balms at unbeatable wholesale rates.',
      'Check out the massive gold and diamond jewelry section on Level 1 (Mustafa Jewellery) renowned for transparent gold rate weight boards and certified purity.',
      'Head to Basements 1 & 2 for competitively priced Samsonite, American Tourister luggage, universal travel adapters, power banks, and electronics.'
    ],
    keyHighlights: [
      {
        title: 'Open 24/7 All Year Round',
        description: 'Singapore\'s premier round-the-clock shopping wonderland with no closing time.',
        badge: '24/7 Non-Stop'
      },
      {
        title: '300,000+ Items Across 6 Levels',
        description: 'Everything from consumer electronics, apparel, and gold to groceries and pharmaceuticals.',
        badge: 'Massive Inventory'
      },
      {
        title: 'Competitive 24-Hour Money Changer',
        description: 'Renowned street-level foreign exchange counters offering top SGD/INR/USD/EUR rates.',
        badge: 'Best FX Rates'
      },
      {
        title: 'Fixed Transparent Pricing',
        description: 'No haggling or tourist price inflation; barcode-scanned wholesale pricing.',
        badge: 'Fixed Low Prices'
      }
    ],
    topStoresAndBrands: [
      {
        categoryName: 'Perfumes, Cosmetics & Watches (Level 1)',
        discountBadge: '25% – 50% Below Retail',
        brands: ['Hugo Boss', 'Calvin Klein', 'Versace', 'Bvlgari', 'Davidoff', 'Seiko', 'Casio G-Shock', 'Citizen', 'Tissot'],
        description: 'One of Southeast Asia\'s largest physical perfume counters. Authentic tester bottles and sealed gift sets.'
      },
      {
        categoryName: 'Singapore Food Souvenirs & Supermarket (Level 2)',
        discountBadge: 'Wholesale Bulk Rates',
        brands: ['Prima Taste Laksa', 'Ya Kun Kaya', 'Tiger Balm Merlion Gift Packs', 'Cadbury / Lindt / Ferrero Bulk Packs', 'Bateel Dates', 'Axe Brand Medicated Oil'],
        description: 'The ultimate spot for tourist souvenir shopping. Entire aisles dedicated to Singapore culinary treasures.'
      },
      {
        categoryName: 'Electronics, Gadgets & Luggage (Basements 1 & 2)',
        discountBadge: 'Direct Factory Pricing',
        brands: ['Samsonite', 'American Tourister', 'Delsey', 'Sony', 'Panasonic', 'Philips', 'Anker Power Banks', 'Universal Travel Adapters'],
        description: 'Huge variety of hard-case and soft-case travel luggage alongside shavers, hair dryers, and memory cards.'
      },
      {
        categoryName: 'Textiles, Sarees & Ethnic Fashion (Basement 1)',
        discountBadge: 'Direct Import Rates',
        brands: ['Pure Kanchipuram Silks', 'Designer Kurtis', 'Men\'s Kurta Sets', 'Pashmina Shawls', 'Tailoring Fabrics'],
        description: 'A vibrant collection of traditional Indian clothing, readymade suits, and unstitched textile rolls.'
      }
    ],
    tipsAndTricks: [
      'Security Bag Rules: All large personal backpacks and shopping bags must be sealed with plastic zip-ties by security guards at the entrance. Keep your phone, credit card, and passport out before entry.',
      'No Bargaining: Unlike street flea markets, prices at Mustafa Centre are computer-barcoded and non-negotiable. What you see on the tag is already wholesale value.',
      'Best Hours: Visit after 10:00 PM or between 7:00 AM and 10:00 AM. Daytime afternoons get extremely crowded with narrow aisles making trolley navigation challenging.',
      'Money Exchange: The Mustafa Foreign Exchange booth located near the Syed Alwi entrance is famous among travelers for offering some of the most competitive currency exchange rates in Singapore.',
      'eTRS GST Refund: Mustafa Centre participates in the Electronic Tourist Refund Scheme. Request your eTRS slip at the designated tax refund counter inside with your passport.'
    ],
    appDetails: {
      appName: 'Mustafa Singapore Online Portal',
      appDescription: 'Online catalog and home delivery portal for Mustafa Centre merchandise, groceries, electronics, and daily essentials across Singapore.',
      appStoreUrl: 'https://apps.apple.com/sg/app/mustafa/id111222333',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mustafa.app',
      appFeatures: [
        'Browse 100,000+ Supermarket & Healthcare Items',
        'Check Live Gold Rates & Jewelry Catalog',
        'Same-Day Singapore Islandwide Delivery',
        'Direct GST Invoice Retrieval'
      ]
    },
    videoUrl: 'https://www.youtube.com/watch?v=qX1W0H1V9fE',
    shorts: [
      { id: 'mustafa-short-1', title: 'Mustafa Centre 24/7 Tour Singapore', creator: 'Singapore Explorer', thumbnailUrl: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80', youtubeVideoId: 'qX1W0H1V9fE' },
      { id: 'mustafa-short-2', title: 'Top 5 Souvenirs to Buy at Mustafa Centre', creator: 'SG Shopping Insider', thumbnailUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80', youtubeVideoId: 'qX1W0H1V9fE' }
    ],
    diningHighlights: {
      description: 'Mustafa Centre features a rooftop restaurant alongside Little India’s world-famous South and North Indian culinary institutions within 2 minutes walk.',
      topPicks: [
        'Kebabs & Curries (Mustafa Rooftop, Level 7) – Rooftop dining with views over Little India serving tandoori specialties and biryanis.',
        'Ananda Bhavan Vegetarian (Opposite Mustafa) – Singapore’s oldest Indian vegetarian restaurant serving crispy dosas and filter coffee.',
        'Komala Vilas (Serangoon Road) – Historic dining spot favored by visiting dignitaries for authentic South Indian thali meals.',
        'Syed Restaurant (Syed Alwi Road) – 24-hour casual eatery famous for prata, murtabak, and Teh Tarik.'
      ]
    },
    facilities: [
      '24-Hour Licensed Foreign Exchange Counter',
      'Electronic Tourist GST Refund Counter (eTRS)',
      '24-Hour Pharmacy & Prescription Dispensary',
      'Overseas Courier & Cargo Shipping Desks',
      'Luggage Storage & Security Bag Check',
      'Basement Customer Car Park'
    ],
    nearbyAttractions: [
      {
        name: 'Sri Veeramakaliamman Temple',
        distance: '5 Mins Walk along Serangoon Rd',
        travelTip: 'One of Singapore\'s oldest and most intricate Hindu temples dedicated to the goddess Kali, boasting stunning colorful gopurams.'
      },
      {
        name: 'Tan Teng Niah Colorful Villa',
        distance: '7 Mins Walk towards Little India MRT',
        travelTip: 'The last surviving Chinese villa in Little India, renowned for its vibrant rainbow-colored exterior and top Instagram photo backdrop.'
      }
    ],
    faqs: [
      {
        question: 'Is Mustafa Centre truly open 24 hours every day?',
        answer: 'Yes! Mustafa Centre operates 24 hours a day, 365 days a year without closing on weekends or public holidays, making it ideal for late-night shopping after evening sightseeing.'
      },
      {
        question: 'Can I pay with foreign credit cards or cash?',
        answer: 'Mustafa accepts all major international credit cards (Visa, Mastercard, AMEX), NETS, GrabPay, and cash (Singapore Dollars). You can also exchange foreign currency at their on-site 24h currency booth.'
      },
      {
        question: 'How do I claim GST tax refund for purchases made at Mustafa?',
        answer: 'Spend a minimum of SGD $100 in combined same-day purchases at Mustafa. Bring your physical passport to the GST Refund Counter inside Mustafa Centre before paying to generate your digital eTRS claim.'
      }
    ],
    whatsappMessage: 'Hi Flying Wonders DMC! I would like to book a private Little India & Mustafa Centre night shopping transfer with luggage storage.',
    isDisplayed: true
  },

  // ── 3. BUGIS STREET MARKET ──
  {
    _id: 'mall-bugis-street',
    slug: 'bugis-street-market',
    name: 'Bugis Street Market',
    alternateName: '白沙浮市场 · Pasar Bugis',
    subtitle: 'Singapore’s Largest & Most Vibrant Bargain Bazaar',
    tagline: 'Over 600 Stalls of Trendy Streetwear, Affordable Souvenirs, Korean Fashion & Street Food Grazing',
    category: 'Bargain Street Market',
    budgetTier: '$',
    starRating: '4.7',
    reviewCount: '18,900+ Reviews',
    coverImageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1600&auto=format&fit=crop&q=80',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1000&auto=format&fit=crop&q=80'
    ],
    locationAddress: '3 New Bugis Street, Singapore 188867',
    district: 'Bugis / Rochor (Central Region)',
    nearestMrt: {
      station: 'Bugis MRT Station',
      line: 'EW12 / DT14 (East-West & Downtown Lines)',
      exit: 'Exit C (Cross Victoria Street towards Bugis Junction)',
      walkingTime: '2 Minutes Walk',
      sheltered: true
    },
    busLines: '2, 12, 33, 130, 133, 960 (Victoria Street / Bugis Stn bus stop)',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Bugis+Street+Singapore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    timings: '10:00 AM – 10:00 PM Daily',
    bestTimeToVisit: 'Weekday late mornings to early afternoons (11:30 AM – 2:00 PM) for comfortable room to browse without dense crowds',
    peakCrowdTimes: 'Friday, Saturday & Sunday evenings from 5:00 PM to 9:30 PM',
    recommendedDuration: '2 to 3 Hours',
    overview: 'Bugis Street Market is Singapore’s undisputed capital of bargain hunting and youth street fashion. With a storied history transitioning from a legendary 1960s night bazaar into a modern covered three-level labyrinth of over 600 compact stalls, Bugis Street offers the most competitive prices on the island. Here, savvy travelers and local fashionistas snap up trendy Korean & Japanese streetwear, graphic T-shirts, dresses, chic bags, novelty phone cases, K-pop accessories, and iconic Singapore souvenirs (3 for $10 Merlion keychains, magnets, and tote bags). Connected via Level 3 air-conditioned link bridges to the contemporary Bugis+ shopping mall and situated across from Bugis Junction, it is a bustling, sensory-rich marketplace paired with an irresistible street-food snacking alley.',
    mustDoThings: [
      'Snag bundle souvenir deals: Merlion printed T-shirts, embroidered tote bags, magnets, and metal keychains starting as low as SGD $2 to $5.',
      'Browse trendy East Asian streetwear on Levels 1 and 2: Korean oversize tees, sundresses, casual denim, and footwear from $10 to $20.',
      'Sip fresh avocado shakes, sweet dragonfruit smoothies, or Thai milk tea ($2–$3) at the ground level drink kiosks while browsing.',
      'Cross the Level 3 elevated air-conditioned bridge directly into Bugis+ mall for high-street brands (Uniqlo, Sephora) and claw machine arcades.',
      'Try trending street delicacies: candied sugar fruit skewers (tanghulu), cheese pancakes, crispy Taiwanese fried chicken, and fresh local cut fruits.'
    ],
    keyHighlights: [
      {
        title: '600+ Bargain Stalls Across 3 Levels',
        description: 'Singapore\'s largest covered street bazaar packed with fashion, electronics, and gifts.',
        badge: 'Lowest Prices'
      },
      {
        title: 'Street Food & Grazing Alley',
        description: 'Famous ground-floor food strip featuring fruit juices, snacks, and local delights.',
        badge: 'Snack Paradise'
      },
      {
        title: 'Weather-Protected Covered Walkways',
        description: 'Fully sheltered alleys and glass-canopied lanes shield visitors from tropical rains.',
        badge: 'All-Weather'
      },
      {
        title: 'Air-Conditioned Link to Bugis+',
        description: 'Level 3 indoor bridge provides effortless transit into modern air-conditioned retail.',
        badge: 'Bridge Connected'
      }
    ],
    topStoresAndBrands: [
      {
        categoryName: 'Singapore Tourist Souvenirs & Gifts',
        discountBadge: '3 for $10 / 5 for $10',
        brands: ['Merlion Embroidered T-Shirts', 'Enamel Metal Fridge Magnets', 'Singapore Orchid Keychains', 'Batik Silk Scarves', 'Canvas Tote Bags'],
        description: 'Level 1 ground entrances have the heaviest concentration of budget souvenir vendors.'
      },
      {
        categoryName: 'Youth Streetwear, Shoes & Dresses',
        discountBadge: 'SGD $10 – $25 Average',
        brands: ['Korean Style Graphic Tees', 'Casual Summer Sundresses', 'Trendy Sneakers & Slides', 'Denim Jackets', 'Oversize Street Hoodies'],
        description: 'Level 2 features air-conditioned fashion boutiques with fitting rooms and trending apparel.'
      },
      {
        categoryName: 'Mobile Accessories & Tech Gadgets',
        discountBadge: 'Under SGD $15',
        brands: ['Silicone iPhone / Samsung Cases', 'Fast-Charge Braided Cables', 'Power Banks', 'Tempered Glass Screen Protectors', 'Bluetooth Earbuds'],
        description: 'Stalls will apply screen protectors on the spot with purchase for free.'
      },
      {
        categoryName: 'Beauty, Nails, Hair & Piercings',
        discountBadge: 'Express Walk-In Rates',
        brands: ['Express Gel Manicures', 'Eyebrow Threading & Tinting', 'Ear Piercing Studios', 'Korean Sheet Mask Packs'],
        description: 'Level 2 and 3 house dozens of express beauty salons catering to quick walk-in appointments.'
      }
    ],
    tipsAndTricks: [
      'Cash & PayNow Preferred: While many stalls now accept PayNow and contactless cards, smaller souvenir and snack vendors still appreciate cash in small SGD notes ($2, $5, $10).',
      'Polite Bundle Bargaining: While street prices are already heavily discounted and marked on signage, you can politely ask for a round-figure discount or free extra piece if buying 5 or more items.',
      'Sizing Awareness: Asian sizing at street market stalls generally runs 1 to 2 sizes smaller than US/UK sizing. Check garments thoroughly against your measurements before paying as stalls typically do not offer fitting rooms on Level 1.',
      'Comfortable Footwear & Hydration: The alleys are narrow and high-energy. Wear breathable clothing and stay hydrated with fresh watermelon or sugarcane juice from the front kiosks.',
      'Nearby Exploration: Pair your Bugis Street Market trip with a 5-minute stroll into Kampong Gelam (Haji Lane & Arab Street) for indie boutiques and colorful street art murals.'
    ],
    appDetails: {
      appName: 'CapitaStar (Bugis Junction & Bugis+)',
      appDescription: 'Explore directory listings, parking, and dining promotions for the integrated Bugis shopping precinct connecting Bugis Street, Bugis+, and Bugis Junction.',
      appStoreUrl: 'https://apps.apple.com/sg/app/capitastar/id544719262',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.capitamalls.capitastar',
      appFeatures: [
        'Bugis District Interactive Map & Wayfinding',
        'Store Directory for Bugis Junction & Bugis+',
        'Exclusive Merchant Discount Vouchers',
        'Restaurant Reservation & Queue Numbers'
      ]
    },
    videoUrl: 'https://www.youtube.com/watch?v=3JzV2C3Z_vA',
    shorts: [
      { id: 'bugis-short-1', title: 'Bugis Street Market $10 Shopping Challenge', creator: 'Singapore Explorer', thumbnailUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80', youtubeVideoId: '3JzV2C3Z_vA' },
      { id: 'bugis-short-2', title: 'Must Try Street Food at Bugis Street', creator: 'SG Street Foodies', thumbnailUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80', youtubeVideoId: '3JzV2C3Z_vA' }
    ],
    diningHighlights: {
      description: 'Bugis Street Market has an iconic ground-floor grazing lane complemented by Albert Centre Hawker Centre right behind the market.',
      topPicks: [
        'Bugis Fresh Fruit Juice Kiosks (Ground Level) – Freshly blended soursop, avocado, watermelon, and sugarcane juice from $2.50.',
        'Albert Centre Hawker Centre (Next Door) – Renowned Michelin Bib Gourmand hawker stalls: Bedok Chwee Kueh, Bai Nian Niang Dou Fu, and ginger-infused dessert soup.',
        'Bugis Junction Basement Food Hall – Japanese ramen, bubble tea (Koi, LiHO), Pepper Lunch, and Ya Kun Kaya Toast in air-conditioned comfort.',
        'Swee Choon Tim Sum (5 Mins Walk on Jalan Besar) – Legendary late-night dim sum restaurant serving salted egg yolk custard buns and siew mai.'
      ]
    },
    facilities: [
      'Money Changers (Level 1 Entrances)',
      'Public Restrooms (Levels 1, 2 and 3)',
      'Direct Sheltered MRT Underground Underpass',
      'Air-Conditioned Elevated Link Bridge to Bugis+',
      'Nail & Express Beauty Salon Services'
    ],
    nearbyAttractions: [
      {
        name: 'Haji Lane & Arab Street',
        distance: '7 Mins Walk',
        travelTip: 'Singapore’s hip bohemian quarter filled with independent fashion boutiques, vibrant street art murals, and shisha cafes beneath the Sultan Mosque dome.'
      },
      {
        name: 'National Museum of Singapore',
        distance: '1 MRT stop or 12 Mins Walk',
        travelTip: 'Singapore\'s oldest museum exploring the island\'s transformation from 14th-century fishing settlement to futuristic metropolis.'
      }
    ],
    faqs: [
      {
        question: 'Is Bugis Street Market air-conditioned?',
        answer: 'The ground level (Level 1) is a sheltered, fan-cooled covered street alley. Levels 2 and 3 feature fully air-conditioned indoor corridors with fashion boutiques and beauty salons.'
      },
      {
        question: 'Can I bargain at Bugis Street Market?',
        answer: 'Prices are already very cheap and usually displayed on signs (e.g. $10 each, 3 for $25). However, if you are purchasing 4 or more items from the same stall, polite bargaining for a bundle discount is acceptable.'
      },
      {
        question: 'What is the closest MRT station to Bugis Street?',
        answer: 'Bugis MRT Station (EW12/DT14) is directly across Victoria Street. Take Exit C through Bugis Junction to cross directly into the front entrance of Bugis Street Market.'
      }
    ],
    whatsappMessage: 'Hi Flying Wonders DMC! Please arrange private group transport and itinerary inclusion for Bugis Street Market and Haji Lane.',
    isDisplayed: true
  },

  // ── 4. THE SHOPPES AT MARINA BAY SANDS ──
  {
    _id: 'mall-mbs',
    slug: 'the-shoppes-marina-bay-sands',
    name: 'The Shoppes at Marina Bay Sands',
    alternateName: '滨海湾金沙购物商城',
    subtitle: 'Singapore’s Crown Jewel of Luxury & Waterfront Splendor',
    tagline: 'World-Famous Luxury Flagships, Floating Crystal Pavilions, Indoor Canal Sampan Rides & Michelin-Starred Dining',
    category: 'Ultra-Luxury Flagships & Lifestyle',
    budgetTier: '$$$$',
    starRating: '4.9',
    reviewCount: '42,000+ Reviews',
    coverImageUrl: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1600&auto=format&fit=crop&q=80',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1000&auto=format&fit=crop&q=80'
    ],
    locationAddress: '10 Bayfront Avenue, Marina Bay, Singapore 018956',
    district: 'Marina Bay Waterfront (Downtown Core)',
    nearestMrt: {
      station: 'Bayfront MRT Station',
      line: 'CE1 / DT16 (Circle & Downtown Lines)',
      exit: 'Exits C & D (Direct basement turnstile connection into The Shoppes)',
      walkingTime: '1 Minute Direct Walk',
      sheltered: true
    },
    busLines: '97, 106, 133, 502, 518 (Marina Bay Sands Hotel / The Shoppes stops)',
    mapEmbedUrl: 'https://maps.google.com/maps?q=The+Shoppes+at+Marina+Bay+Sands&t=&z=15&ie=UTF8&iwloc=&output=embed',
    timings: '10:00 AM – 10:00 PM (Sun–Thu) | 10:00 AM – 11:00 PM (Fri, Sat & Eve of PH)',
    bestTimeToVisit: 'Afternoon to evening (3:30 PM – 8:30 PM) to pair luxury shopping with the 8:00 PM Spectra outdoor water & light show',
    peakCrowdTimes: 'Friday, Saturday & Sunday evenings from 6:30 PM to 10:00 PM',
    recommendedDuration: '3 to 6 Hours',
    overview: 'The Shoppes at Marina Bay Sands is Singapore’s premier ultra-luxury shopping haven and an architectural masterpiece designed by Moshe Safdie. Spanning over 800,000 square feet along the iconic Marina Bay waterfront, The Shoppes features the world’s most prestigious luxury fashion houses, fine jewelry ateliers, and haute horlogerie flagships. Visitors marvel at the floating Louis Vuitton Island Maison crystal pavilion perched on the bay, the futuristic floating Apple Marina Bay Sands orb, and the indoor canal where traditional wooden Sampan boats glide beneath Ned Kahn’s dramatic Rain Oculus whirlpool waterfall. Integrated seamlessly with celebrity chef restaurants, the ArtScience Museum, the Sands SkyPark, and the teamLab Digital Light Canvas, it is a world-class lifestyle destination.',
    mustDoThings: [
      'Embark on an indoor Sampan Boat Ride along the Canal Level (B2) and glide directly beneath the swirling Rain Oculus waterfall.',
      'Visit the world\'s only floating Louis Vuitton Island Maison crystal pavilion accessed via an underwater illuminated art tunnel.',
      'Check out Apple Marina Bay Sands—the world\'s first floating spherical Apple store offering 360-degree panoramic bay views.',
      'Experience the interactive Digital Light Canvas by teamLab (B2 near food court) featuring responsive LED light flora and fauna.',
      'Sip artisan teas and savor French pastries on the elevated bridge at TWG Tea Garden or indulge at Bacha Coffee\'s opulent Moroccan boutique.',
      'Step outside onto the Event Plaza at 8:00 PM or 9:00 PM for the complimentary Spectra light, water, and orchestral laser fountain symphony.'
    ],
    keyHighlights: [
      {
        title: 'World’s Only Floating LV Island Maison',
        description: 'Spectacular standalone glass crystal pavilion perched on the waters of Marina Bay.',
        badge: 'Iconic Architecture'
      },
      {
        title: 'Indoor Canal & Sampan Boat Rides',
        description: 'Scenic wooden boat cruise gliding along the Canal Level beneath the Rain Oculus.',
        badge: 'Canal Cruise'
      },
      {
        title: 'teamLab Digital Light Canvas',
        description: 'Immersive permanent digital installation with 14m light cylinder and interactive floor.',
        badge: 'Digital Art'
      },
      {
        title: 'Sands LifeStyle Rewards',
        description: 'Instant 10% tourist resort dollar cashback and VIP shopping privileges.',
        badge: '10% Cashback'
      }
    ],
    topStoresAndBrands: [
      {
        categoryName: 'Haute Couture & Luxury Fashion Houses',
        discountBadge: 'VIP Flagship Exclusives',
        brands: ['Louis Vuitton Island Maison', 'Chanel Flagship', 'Dior', 'Gucci', 'Prada', 'Hermès', 'Saint Laurent', 'Bottega Veneta', 'Balenciaga', 'Fendi', 'Burberry', 'Moncler'],
        description: 'Features duplex flagship layouts with private client VIP viewing salons and limited-edition collections.'
      },
      {
        categoryName: 'High Jewelry & Master Watchmakers',
        discountBadge: 'World Masterpieces',
        brands: ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'Tiffany & Co.', 'Van Cleef & Arpels', 'Bvlgari', 'Chopard', 'Hublot', 'IWC Schaffhausen', 'Jaeger-LeCoultre'],
        description: 'The highest concentration of master Swiss watch boutiques and certified diamond jewelers in Southeast Asia.'
      },
      {
        categoryName: 'Iconic Tech & Architectural Wonders',
        discountBadge: 'Global Flagship',
        brands: ['Apple Marina Bay Sands (Floating Sphere)', 'Devialet Acoustics', 'Bang & Olufsen', 'Leica Store'],
        description: 'The floating glass orb Apple store features 114 pieces of glass with underwater boardrooms.'
      },
      {
        categoryName: 'Luxury Gourmet Gifts, Tea & Coffee',
        discountBadge: 'Singapore Heritage Icons',
        brands: ['TWG Tea Garden & Salon', 'Bacha Coffee 1910 Boutique', 'Venchi Cioccolato', 'Godiva Chocolatier', 'Pierre Hermé Paris'],
        description: 'Opulent gold-gilded packaging and bespoke gift hampers ideal for prestigious international gifts.'
      }
    ],
    tipsAndTricks: [
      'Sign Up for Sands LifeStyle: Foreign tourists can register for a complimentary Sands LifeStyle membership at concierge counters to earn instant 3%–10% Resort Dollars reward cashback on shopping, dining, and attractions.',
      'Rain Oculus Timings: Witness the giant 22-meter acrylic bowl release a dramatic 2-story waterfall into the indoor canal at scheduled times: 1:00 PM, 3:00 PM, 5:00 PM, 7:00 PM, 8:30 PM, and 9:30 PM.',
      'Spectra Laser Show: Combine your shopping with the free outdoor 15-minute Spectra Light & Water show staged daily at 8:00 PM and 9:00 PM (plus 10:00 PM on Fridays & Saturdays).',
      'eTRS GST Tax Free: Luxury stores at MBS feature dedicated eTRS tax-free specialists. Keep your physical passport handy so purchases can be instantly coded for digital customs clearance at Changi Airport.',
      'Weather-Free Bayfront Connection: Bayfront MRT (Exits C & D) delivers you directly into the Canal Level of the mall without stepping outdoors into tropical heat or rain.'
    ],
    appDetails: {
      appName: 'Marina Bay Sands: Mobile Guide',
      appDescription: 'Official resort companion app. Check digital membership rewards, discover store directories, book celebrity chef restaurants, and view exhibition showtimes.',
      appStoreUrl: 'https://apps.apple.com/sg/app/marina-bay-sands/id929944641',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.marinabaysands',
      appFeatures: [
        'Interactive 3D Mall & Store Wayfinding GPS',
        'Sands LifeStyle Digital Membership & Resort Dollar Tracking',
        'Direct Celebrity Chef Restaurant Reservations',
        'Ticket Booking for SkyPark & ArtScience Museum'
      ]
    },
    videoUrl: 'https://www.youtube.com/watch?v=0kH8pY7W7H8',
    shorts: [
      { id: 'mbs-short-1', title: 'Floating Louis Vuitton & Apple Store MBS', creator: 'Luxury Travels SG', thumbnailUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80', youtubeVideoId: '0kH8pY7W7H8' },
      { id: 'mbs-short-2', title: 'Sampan Boat Ride & Rain Oculus Waterfall', creator: 'Singapore Explorer', thumbnailUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80', youtubeVideoId: '0kH8pY7W7H8' }
    ],
    diningHighlights: {
      description: 'Home to Singapore\'s most star-studded collection of Michelin-starred celebrity chef restaurants and casual waterfront bistros.',
      topPicks: [
        'CUT by Wolfgang Puck (B1) – Michelin-starred American steakhouse renowned for Australian and Japanese Wagyu cuts.',
        'Spago Dining Room (Level 57 Tower 2) – Californian culinary artistry by Wolfgang Puck overlooking the world-famous Infinity Pool.',
        'Mott 32 (#B2-48) – Acclaimed modern Cantonese dining famous for 42-day applewood roasted Peking duck and dim sum.',
        'Rasapura Masters Food Hall (#B2-50) – High-end air-conditioned Asian hawker hall with Hainanese chicken rice, bak kut teh, and satay.'
      ]
    },
    facilities: [
      'Dedicated eTRS Tourist GST Refund Assistance',
      'VIP Valet Parking & Private Chauffeur Driveways',
      'Complimentary Ultra-High-Speed Resort WiFi',
      'Luxury Concierge & Luggage Storage Desks',
      'Indoor Canal Sampan Pier Ticket Kiosk',
      'Direct Underpass to Gardens by the Bay'
    ],
    nearbyAttractions: [
      {
        name: 'Gardens by the Bay',
        distance: 'Direct Underpass or Lions Bridge (5 Mins Walk)',
        travelTip: 'Walk through the underground connector to visit the Supertree Grove, Flower Dome, and Cloud Forest mist mountain.'
      },
      {
        name: 'ArtScience Museum',
        distance: 'Right on the Marina Bay Waterfront Promontory',
        travelTip: 'The iconic lotus-inspired museum hosting teamLab’s world-renowned Future World digital interactive exhibition.'
      }
    ],
    faqs: [
      {
        question: 'Do I need tickets for the Sampan Boat Ride at MBS?',
        answer: 'Yes, tickets for the Sampan Ride can be purchased at the B2 Canal Level counter or online. Rides cost SGD $15 per person and run along the indoor canal under the Rain Oculus.'
      },
      {
        question: 'Can foreign tourists claim GST tax refunds on luxury shopping here?',
        answer: 'Yes! All luxury boutiques at The Shoppes participate in the Electronic Tourist Refund Scheme (eTRS). Minimum spend is SGD $100. Simply present your physical passport at checkout.'
      },
      {
        question: 'How do I access Gardens by the Bay from The Shoppes?',
        answer: 'Take the elevators to Level 1 or use the basement pedestrian underpass connected directly from Bayfront MRT Exit B/The Shoppes into the Gardens by the Bay grounds.'
      }
    ],
    whatsappMessage: 'Hi Flying Wonders DMC! I would like to book a luxury Singapore shopping package including Marina Bay Sands and private luxury transfers.',
    isDisplayed: true
  },

  // ── 5. ORCHARD ROAD MALLS ──
  {
    _id: 'mall-orchard-road',
    slug: 'orchard-road-malls',
    name: 'Orchard Road Malls',
    alternateName: '乌节路购物商圈',
    subtitle: 'Asia’s Most Famous 2.2-Kilometer Shopping Boulevard',
    tagline: 'A Global Retail Epicenter Spanning ION Orchard, Takashimaya, Paragon, 313@somerset & Homegrown Designer Hubs',
    category: 'Premier Shopping Belt & Department Stores',
    budgetTier: '$$$',
    starRating: '4.8',
    reviewCount: '52,000+ Reviews',
    coverImageUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=1600&auto=format&fit=crop&q=80',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1000&auto=format&fit=crop&q=80'
    ],
    locationAddress: 'Orchard Road (Tanglin to Dhoby Ghaut), Singapore 238801',
    district: 'Orchard Road Shopping District',
    nearestMrt: {
      station: 'Orchard & Somerset MRT Stations',
      line: 'NS22 / TE14 (North-South & Thomson-East Coast) & NS23',
      exit: 'Orchard MRT Exit 4 (Directly inside ION Orchard basement)',
      walkingTime: '0 Mins Direct Basement Access',
      sheltered: true
    },
    busLines: '7, 14, 16, 65, 106, 111, 123, 175, 502 (Orchard Stn / Lucky Plaza / Somerset stops)',
    mapEmbedUrl: 'https://maps.google.com/maps?q=ION+Orchard+Singapore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    timings: '10:00 AM – 10:00 PM Daily (Individual store hours may vary)',
    bestTimeToVisit: 'Afternoon to evening (1:00 PM – 9:00 PM) to explore both luxury malls and the illuminated tree-lined boulevard at night',
    peakCrowdTimes: 'Saturday & Sunday afternoons from 2:00 PM to 8:30 PM',
    recommendedDuration: '4 to 8 Hours (Full Day Itinerary)',
    overview: 'Orchard Road is Asia’s most celebrated shopping avenue, stretching 2.2 kilometers from Tanglin Road down to Dhoby Ghaut. Packed with nearly 30 interconnected shopping centers, mega department stores, and flagship duplex boutiques, Orchard Road caters to every tier of shopper. The boulevard is anchored by the "Big Three" architectural marvels: the futuristic glass jewel ION Orchard (housing luxury flagships and the panoramic ION Sky observatory), Ngee Ann City (home to the colossal Japanese Takashimaya Department Store and gourmet food hall), and Paragon (renowned for high-end designer labels, family luxury, and health suites). Connected through an extensive, weather-proof underground tunnel network, Orchard Road also showcases Singapore’s creative pulse with Design Orchard (featuring 100+ local homegrown brands) and the historic, pastel-colored Peranakan conservation shophouses of Emerald Hill.',
    mustDoThings: [
      'Explore ION Orchard’s futuristic flagship duplexes (Louis Vuitton, Dior, Tiffany) and ride the high-speed elevator to ION Sky on Level 56 for 360-degree city views.',
      'Get lost in Ngee Ann City’s Takashimaya Department Store across 6 levels of Japanese cosmetics, ceramics, luxury fashion, and the legendary B2 Gourmet Food Hall.',
      'Discover Singapore\'s homegrown creative talents at Design Orchard, stocking curated fashion, bags, scents, and souvenirs by over 100 local Singapore designers.',
      'Step off the modern retail boulevard into Emerald Hill Road (next to Orchardgateway) to photograph pristine 1920s Peranakan shophouse architecture and enjoy relaxed open-air cafes.',
      'Shop affordable youth high-street fashion, streetwear, and Japanese lifestyle concepts at 313@somerset and Orchard Central.'
    ],
    keyHighlights: [
      {
        title: 'Asia’s Premier 2.2km Retail Boulevard',
        description: 'Over 25 major shopping malls lining a tree-canopied pedestrian avenue.',
        badge: 'Iconic Boulevard'
      },
      {
        title: 'The "Big Three" Anchor Flagships',
        description: 'ION Orchard, Takashimaya Ngee Ann City, and Paragon luxury center.',
        badge: 'Flagship Malls'
      },
      {
        title: 'Weather-Proof Underground Network',
        description: 'Interconnected subterranean tunnels allow you to traverse malls without braving tropical heat or rain.',
        badge: 'Sheltered Tunnels'
      },
      {
        title: 'Design Orchard Local Artisans',
        description: 'Curated showcase of over 100 Singaporean fashion, lifestyle, and beauty brands.',
        badge: 'Local Designers'
      }
    ],
    topStoresAndBrands: [
      {
        categoryName: 'ION Orchard Luxury Flagships (Ground & Level 1)',
        discountBadge: 'Duplex Flagships',
        brands: ['Louis Vuitton', 'Cartier', 'Dior', 'Saint Laurent', 'Fendi', 'Prada', 'Tiffany & Co.', 'Moncler', 'Balenciaga'],
        description: 'Spectacular multi-level flagship stores with bespoke architecture on the Orchard/Paterson intersection.'
      },
      {
        categoryName: 'Takashimaya Department Store & Ngee Ann City',
        discountBadge: 'Japanese Department Store',
        brands: ['Chanel', 'Celine', 'Bao Bao Issey Miyake', 'Comme des Garçons', 'Goyard', 'Kinokuniya Books', 'Hermès'],
        description: 'A Japanese retail legend. Level B2 features seasonal Japanese food fairs and gourmet sweet halls.'
      },
      {
        categoryName: 'Paragon Luxury & Premium Family Boutiques',
        discountBadge: 'Refined Designer Hub',
        brands: ['Gucci', 'Givenchy', 'Miu Miu', 'Salvatore Ferragamo', 'Tod\'s', 'Armani Junior', 'Bonpoint Paris'],
        description: 'Upscale designer haven known for high-end international children\'s fashion and peaceful ambiance.'
      },
      {
        categoryName: 'Youth Fashion, Athleisure & Streetwear (Somerset)',
        discountBadge: 'Affordable High Street',
        brands: ['Uniqlo Global Flagship (Orchard Central)', 'Zara', 'Cotton On', 'Charles & Keith', 'Pedro', 'MLB Korea', 'JD Sports'],
        description: 'Centered around 313@somerset, Orchard Gateway, and Orchard Central.'
      }
    ],
    tipsAndTricks: [
      'Master the Underground Tunnels: Beat the midday tropical humidity by utilizing the extensive underground mall connectors. You can walk indoors from ION Orchard all the way to Ngee Ann City and Wisma Atria via basement underpasses.',
      'Plan by Metro Zone: Start at Orchard MRT (NS22/TE14) for luxury shopping at ION, Paragon, and Takashimaya, then stroll down to Somerset MRT (NS23) for youth street fashion, Design Orchard, and Emerald Hill.',
      'Tourist Privileges at ION & Takashimaya: Foreign travelers can visit the Concierge Counter at ION Orchard (Level 4) or Takashimaya Customer Service (Level 3) to collect exclusive tourist discount passports and gift vouchers.',
      'Savour Orchard\'s Street Ice Cream: Don\'t miss the famous traditional Orchard Road ice cream carts along the sidewalks selling $1.50 ice cream blocks wrapped in rainbow bread or crispy wafers.',
      'eTRS GST Tax Free: Every major mall on Orchard Road features electronic tourist GST refund kiosks (eTRS) for paperless airport claim vouchers.'
    ],
    appDetails: {
      appName: 'ION Orchard Mobile App',
      appDescription: 'Interactive digital map, store directory, parking guidance, and exclusive member privilege vouchers for ION Orchard.',
      appStoreUrl: 'https://apps.apple.com/sg/app/ion-orchard/id388295627',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ionorchard.ionorchard',
      appFeatures: [
        'Turn-by-Turn Indoor 3D GPS Mall Navigation',
        'Direct Flash Sale & Tourist Reward Notifications',
        'ION Sky Observation Deck Ticket Bookings',
        'Smart Car Parking Locator & Bay Check'
      ]
    },
    videoUrl: 'https://www.youtube.com/watch?v=k_jQyZ8O7vU',
    shorts: [
      { id: 'orchard-short-1', title: 'Top 5 Malls on Orchard Road Singapore', creator: 'Singapore Explorer', thumbnailUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=600&q=80', youtubeVideoId: 'k_jQyZ8O7vU' },
      { id: 'orchard-short-2', title: 'Hidden Emerald Hill Heritage Street Orchard', creator: 'SG Heritage Walk', thumbnailUrl: 'https://images.unsplash.com/photo-1582650625119-3a31f841839d?auto=format&fit=crop&w=600&q=80', youtubeVideoId: 'k_jQyZ8O7vU' }
    ],
    diningHighlights: {
      description: 'Orchard Road hosts hundreds of eateries from basement food halls with Michelin bib gourmand hawkers to fine dining rooftops.',
      topPicks: [
        'Takashimaya Food Hall (B2 Ngee Ann City) – Japanese sashimi, ramen, cream puffs, matcha desserts, and imported seasonal Japanese fruits.',
        'Food Republic at Wisma Atria (Level 4) – Nostalgic retro-themed hawker hall with Hainanese chicken rice, laksa, and fried carrot cake.',
        'Din Tai Fung (Paragon & 313@somerset) – Renowned steamed soup dumplings (xiao long bao) and egg fried rice.',
        'Emerald Hill Heritage Bars (Emerald Hill Road) – Restored 1920s shophouse bars offering craft cocktails and alfresco draft beers.'
      ]
    },
    facilities: [
      'Global Blue & Planet eTRS GST Refund Self-Help Terminals',
      'Licensed Money Changers (Lucky Plaza & Wisma Atria)',
      'Luggage Lockers & Left Baggage Facilities (Lucky Plaza / ION)',
      'Free High-Speed Wireless@SGx Across the Entire Boulevard',
      'Dedicated Taxi Stands & Ride-Hailing Drop-Off Portals',
      'Nursing, Stroller Rental & Baby Care Suites (Paragon & ION)'
    ],
    nearbyAttractions: [
      {
        name: 'Emerald Hill Conservation Area',
        distance: 'Directly next to Orchardgateway',
        travelTip: 'A serene historic neighborhood showcasing early 20th-century Chinese Baroque and Peranakan architecture. Perfect for photography.'
      },
      {
        name: 'Singapore Botanic Gardens',
        distance: '1 MRT stop from Orchard on Thomson-East Coast Line',
        travelTip: 'Singapore\'s first UNESCO World Heritage Site featuring lush tropical rainforests and the National Orchid Garden.'
      }
    ],
    faqs: [
      {
        question: 'Which mall on Orchard Road is best for luxury shopping?',
        answer: 'ION Orchard and Paragon are the premier destinations for luxury fashion, fine jewelry, and haute couture, alongside Ngee Ann City (Takashimaya).'
      },
      {
        question: 'Where can I buy local Singaporean designer products on Orchard Road?',
        answer: 'Design Orchard (at the intersection of Orchard and Cairnhill Roads) is a dedicated multi-story creative hub showcasing over 100 Singapore homegrown fashion, fragrance, and lifestyle brands.'
      },
      {
        question: 'How do I get between Orchard Road malls without walking in the rain?',
        answer: 'Orchard features an extensive subterranean pedestrian network. You can walk fully sheltered underground between ION Orchard, Wisma Atria, Ngee Ann City, Wheelock Place, and Tangs.'
      }
    ],
    whatsappMessage: 'Hi Flying Wonders DMC! Please arrange private full-day Orchard Road VIP shopping tour and transfer services for our family.',
    isDisplayed: true
  },

  // ── 6. CHINATOWN STREET MARKET ──
  {
    _id: 'mall-chinatown',
    slug: 'chinatown-street-market',
    name: 'Chinatown Street Market',
    alternateName: '牛车水传统街市',
    subtitle: 'Singapore’s Heritage Cultural Bazaar & Souvenir Heart',
    tagline: 'Traditional Shophouses, Silk Robes, Artisan Teas, Barbecued Bak Kwa & Vibrant Night Market Lanterns',
    category: 'Heritage & Cultural Souvenir Bazaar',
    budgetTier: '$',
    starRating: '4.7',
    reviewCount: '24,600+ Reviews',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&auto=format&fit=crop&q=80',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1000&auto=format&fit=crop&q=80'
    ],
    locationAddress: 'Pagoda Street, Trengganu Street & Sago Street, Singapore 050005',
    district: 'Chinatown Historic District (Outram)',
    nearestMrt: {
      station: 'Chinatown MRT Station',
      line: 'NE4 / DT19 (North East & Downtown Lines)',
      exit: 'Exit A (Steps right onto Pagoda Street pedestrian market)',
      walkingTime: '0 Minutes Direct Walk',
      sheltered: false
    },
    busLines: '2, 12, 33, 54, 143, 147, 190 (Chinatown Stn / New Bridge Rd stops)',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Chinatown+Street+Market+Singapore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    timings: '10:00 AM – 10:00 PM Daily (Night stalls peak from 6:30 PM to 10:30 PM)',
    bestTimeToVisit: 'Late afternoon into evening (5:00 PM – 9:00 PM) when red festive lanterns glow overhead and outdoor stalls are fully buzzing',
    peakCrowdTimes: 'Friday, Saturday & Sunday evenings from 6:00 PM to 9:30 PM',
    recommendedDuration: '2 to 4 Hours',
    overview: 'Chinatown Street Market is a sensory tapestry of heritage, trade, and cultural vibrancy. Centered around pedestrian-only Pagoda Street, Trengganu Street, Temple Street, and Sago Street, this atmospheric bazaar is framed by exquisitely preserved 19th-century pastel shophouses and overhead red lanterns. Visitors explore hundreds of festive stalls and historic storefronts selling traditional Chinese silks, hand-painted calligraphy scrolls, jade jewelry, porcelain tea sets, paper fans, and classic Singapore souvenirs. Beyond retail, Chinatown is Singapore’s undisputed capital of traditional artisan tea merchants, world-famous barbecued sweet meat (Bak Kwa), and celebrated hawker feasts at Maxwell Food Centre and Chinatown Complex—all within sight of the majestic Buddha Tooth Relic Temple.',
    mustDoThings: [
      'Stroll down Pagoda Street directly from Chinatown MRT Exit A beneath glowing red Chinese lanterns and browse hundreds of souvenir stalls.',
      'Taste free samples of freshly charcoal-grilled barbecued meat (Bak Kwa) at Lim Chee Guan (New Bridge Rd) or Bee Cheng Hiang.',
      'Experience a traditional gongfu tea appreciation tasting at Singapore’s historic tea merchants like Pek Sin Choon or Yixing Xuan Teahouse.',
      'Shop for authentic oriental souvenirs: embroidered cheongsams (qipaos), silk fans, jade lucky charms, and handcrafted chopstick gift sets.',
      'Walk to the end of Sago Street to gaze upon the magnificent Tang-dynasty architecture of the Buddha Tooth Relic Temple and Museum.'
    ],
    keyHighlights: [
      {
        title: 'Historic Shophouse Pedestrian Belts',
        description: 'Atmospheric cobblestone lanes free of road traffic: Pagoda, Trengganu & Sago Streets.',
        badge: 'Heritage Heart'
      },
      {
        title: 'Authentic Traditional Chinese Crafts',
        description: 'Silks, calligraphy, artisan porcelain, jade, and handcrafted traditional wares.',
        badge: 'Cultural Souvenirs'
      },
      {
        title: 'Centuries-Old Artisan Tea Houses',
        description: 'Taste premium Chinese oolong and pu-erh teas roasted using heritage recipes.',
        badge: 'Artisan Tea'
      },
      {
        title: 'Culinary Hawker Epicenter',
        description: 'Surrounded by Chinatown Complex (Singapore\'s largest hawker) and Maxwell Food Centre.',
        badge: 'Michelin Hawkers'
      }
    ],
    topStoresAndBrands: [
      {
        categoryName: 'Traditional Heritage Tea Merchants',
        discountBadge: 'Heritage Masters',
        brands: ['Pek Sin Choon (Est. 1925)', 'Yixing Xuan Teahouse', 'Tea Chapter', 'Ten Ren Tea'],
        description: 'Pek Sin Choon is Singapore’s oldest tea merchant, renowned for custom tea blends supplied to top Bak Kut Teh restaurants.'
      },
      {
        categoryName: 'Barbecued Sweet Meat (Bak Kwa) Artisans',
        discountBadge: 'Singapore Famous Delicacy',
        brands: ['Lim Chee Guan (Since 1938)', 'Bee Cheng Hiang Flagship', 'Fragrance Foodstuff', 'Kim Hock Guan'],
        description: 'Freshly grilled caramelized pork, chicken, and beef jerky wrapped in festive red paper boxes.'
      },
      {
        categoryName: 'Traditional Cultural Souvenirs & Attire',
        discountBadge: 'Bargain Souvenir Rates',
        brands: ['Silk Cheongsams & Tang Suits', 'Hand-Painted Calligraphy & Paper Fans', 'Carved Jade Amulets', 'Porcelain Tea Sets', 'Merlion Keychains & Magnets'],
        description: 'Dozens of open-air stalls along Pagoda and Trengganu Streets offering bulk souvenir pricing.'
      },
      {
        categoryName: 'Traditional Chinese Medicine & Herbs',
        discountBadge: 'Certified Herbalists',
        brands: ['Eu Yan Sang Traditional Medicine (#269 South Bridge Rd)', 'Thye Shan Medical Hall', 'Tiger Balm Official Apothecary'],
        description: 'Authentic bird\'s nest, ginseng, medicinal oils, and customized herbal teas prescribed by certified TCM practitioners.'
      }
    ],
    tipsAndTricks: [
      'Direct MRT Access: Take Chinatown MRT (NE4/DT19) Exit A. The escalators open directly onto Pagoda Street with the street market greeting you immediately.',
      'Evening Golden Hour: Plan your arrival around 5:30 PM. You can photograph the Buddha Tooth Relic Temple in late afternoon light, browse stalls as night falls and lanterns illuminate, then enjoy dinner at Maxwell Food Centre.',
      'Polite Souvenir Haggling: Unlike air-conditioned department stores, polite bargaining is welcomed at open-air street stalls, especially when purchasing multiple shirts, fans, or souvenir packs.',
      'Free Bak Kwa Tasting: Never buy Bak Kwa without sampling! Reputable shops like Bee Cheng Hiang and Lim Chee Guan always offer warm, freshly clipped sample pieces.',
      'Temple Dress Code: If you plan to step inside the Buddha Tooth Relic Temple or Sri Mariamman Temple, wear attire that covers your shoulders and knees (free wrap-around shawls are provided at the entrance).'
    ],
    appDetails: {
      appName: 'Visit Singapore Travel Guide',
      appDescription: 'Official Singapore Tourism Board app featuring self-guided Chinatown heritage walking trails, historical audio stories, and neighborhood food guides.',
      appStoreUrl: 'https://apps.apple.com/sg/app/visit-singapore-travel-guide/id111222444',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.stb.visitsingapore',
      appFeatures: [
        'Curated Chinatown Heritage Walking Trail Audio Tour',
        'Interactive Historical Shophouse Identifier',
        'Michelin Hawker Recommendations & Opening Times',
        'Offline GPS Neighborhood Map'
      ]
    },
    videoUrl: 'https://www.youtube.com/watch?v=0kH8pY7W7H8',
    shorts: [
      { id: 'chinatown-short-1', title: 'Chinatown Singapore Street Market Tour', creator: 'Singapore Explorer', thumbnailUrl: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=600&q=80', youtubeVideoId: '0kH8pY7W7H8' },
      { id: 'chinatown-short-2', title: 'Best Bak Kwa & Souvenirs in Chinatown', creator: 'SG Taste & Shop', thumbnailUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', youtubeVideoId: '0kH8pY7W7H8' }
    ],
    diningHighlights: {
      description: 'Chinatown is a culinary Mecca boasting hundreds of Michelin-recommended hawker stalls and atmospheric heritage shophouse bistros.',
      topPicks: [
        'Maxwell Food Centre (Kadayanallur St) – World-famous Tian Tian Hainanese Chicken Rice, Zhen Zhen Porridge, and Old Roi Fuzhou Oyster Cakes.',
        'Chinatown Complex Food Centre (Smith St) – Singapore’s largest hawker centre (over 260 stalls) featuring Michelin Liao Fan Soya Sauce Chicken and Lian He Ben Ji Claypot Rice.',
        'Tong Heng Traditional Pastries (South Bridge Rd) – Historic bakery famous for warm, diamond-shaped egg tarts with silky custard.',
        'Mei Heong Yuen Dessert (Temple St) – Traditional Cantonese sweet desserts: shaved snow ice, mango pomelo sago, and almond sesame paste.'
      ]
    },
    facilities: [
      'Chinatown Visitor Centre (Kreta Ayer Square)',
      'Currency Exchange Counters (People’s Park Complex & Pagoda St)',
      'Public Air-Conditioned Restrooms (Chinatown Complex)',
      'Direct Sheltered MRT Exit A into Pedestrian Mall',
      'Luggage Storage Facility (Chinatown Heritage Centre)'
    ],
    nearbyAttractions: [
      {
        name: 'Buddha Tooth Relic Temple & Museum',
        distance: 'Directly at the end of Sago Street',
        travelTip: 'Magnificent 4-story Tang dynasty Buddhist temple housing a sacred relic of the Buddha and a rooftop orchid prayer wheel garden.'
      },
      {
        name: 'Sri Mariamman Temple',
        distance: 'Corner of Pagoda St and South Bridge Rd',
        travelTip: 'Singapore’s oldest Hindu temple (built in 1827), famous for its elaborate six-tier gopuram adorned with colorful sculptures of Hindu deities.'
      }
    ],
    faqs: [
      {
        question: 'What are the main shopping streets in Chinatown?',
        answer: 'The primary pedestrian street market is focused along Pagoda Street, Trengganu Street, and Sago Street, with additional traditional shops along Temple Street and Smith Street.'
      },
      {
        question: 'What is Bak Kwa and where should I buy it in Chinatown?',
        answer: 'Bak Kwa is sweet-savory barbecued Chinese meat jerky (traditionally pork). The most celebrated heritage shops in Chinatown are Lim Chee Guan (203 New Bridge Rd) and Bee Cheng Hiang.'
      },
      {
        question: 'Are Chinatown street stalls open during rainy weather?',
        answer: 'Yes! Major sections of Pagoda and Trengganu Streets feature high overhead translucent rain canopies allowing visitors to browse comfortably in all weather conditions.'
      }
    ],
    whatsappMessage: 'Hi Flying Wonders DMC! Please arrange private walking tours and cultural shopping transfers in Singapore Chinatown.',
    isDisplayed: true
  }
]

export async function getAllShoppingMalls(): Promise<ShoppingMallData[]> {
  try {
    const sanityQuery = `*[_type == "shoppingMall" && isDisplayed != false] {
      _id,
      "slug": slug.current,
      name,
      alternateName,
      tagline,
      category,
      budgetTier,
      starRating,
      reviewCount,
      coverImageUrl,
      galleryImages,
      locationAddress,
      district,
      nearestMrt,
      busLines,
      mapEmbedUrl,
      timings,
      bestTimeToVisit,
      peakCrowdTimes,
      recommendedDuration,
      overview,
      mustDoThings,
      keyHighlights,
      topStoresAndBrands,
      tipsAndTricks,
      appDetails,
      videoUrl,
      shorts,
      diningHighlights,
      facilities,
      nearbyAttractions,
      faqs,
      whatsappNumber,
      whatsappMessage,
      isDisplayed
    }`

    const sanityMalls = await client.fetch(sanityQuery, {}, { next: { revalidate: 60 } })

    if (Array.isArray(sanityMalls) && sanityMalls.length > 0) {
      const normalizedSanity: ShoppingMallData[] = sanityMalls.map(m => ({
        ...m,
        slug: normalizeMallSlug(m.slug || slugifyMallName(m.name)),
        galleryImageUrls: m.galleryImages || [],
        budgetTier: m.budgetTier || '$$',
        starRating: m.starRating || '4.8',
        facilities: m.facilities || [],
        mustDoThings: m.mustDoThings || [],
        tipsAndTricks: m.tipsAndTricks || [],
        keyHighlights: m.keyHighlights || [],
        topStoresAndBrands: m.topStoresAndBrands || [],
        faqs: m.faqs || [],
        nearbyAttractions: m.nearbyAttractions || [],
        isDisplayed: m.isDisplayed !== false
      }))

      const sanitySlugs = new Set(normalizedSanity.map(m => normalizeMallSlug(m.slug)))
      const missingDefaults = DEFAULT_SHOPPING_MALLS.filter(d => !sanitySlugs.has(normalizeMallSlug(d.slug)))
      return [...normalizedSanity, ...missingDefaults]
    }

    return DEFAULT_SHOPPING_MALLS
  } catch (err) {
    return DEFAULT_SHOPPING_MALLS
  }
}

export async function getShoppingMallBySlug(rawSlug: string): Promise<ShoppingMallData | null> {
  const allMalls = await getAllShoppingMalls()
  const targetSlug = normalizeMallSlug(rawSlug)

  const directMatch = allMalls.find(m =>
    normalizeMallSlug(m.slug) === targetSlug ||
    slugifyMallName(m.name) === targetSlug
  )
  if (directMatch) return directMatch

  const fuzzyMatch = allMalls.find(m => {
    const s = normalizeMallSlug(m.slug)
    return s.includes(targetSlug) || targetSlug.includes(s)
  })
  if (fuzzyMatch) return fuzzyMatch

  return null
}

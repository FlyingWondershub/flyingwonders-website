'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { urlForImage } from '../../sanity/lib/image'
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  ShieldCheck,
  Star,
  ArrowRight,
  Users,
  Building2,
  Lightbulb,
  Compass,
  Cpu,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MapPin,
  MessageCircle,
  Send,
  Loader2,
  Check,
  DollarSign,
  TrendingUp,
  FileCheck2,
  BookOpen,
  Download,
  Video,
  FileText,
  Layers,
  Calendar,
  X,
  ExternalLink,
  HelpCircle
} from 'lucide-react'

// Primary Colour Palette
const EMERALD = '#093E30'
const EMERALD_LIGHT = '#0F4C3A'
const AMBER = '#D97706'
const AMBER_LIGHT = '#F59E0B'
const SLATE = '#475569'
const LIGHT_BG = '#F8FAFC'

interface Workshop {
  title: string
  duration?: string
  focus?: string
}

interface Institution {
  id: string
  name: string
  shortName: string
  globalRank?: string
  establishedYear?: string
  badge: string
  badgeBg: string
  category: string
  cohorts: ('School' | 'College' | 'MBA')[]
  location: string
  image?: any
  imageUrl: string
  galleryPhotos?: { photo?: any; photoUrl?: string; caption?: string }[]
  videoUrl?: string
  brochureFile?: any
  brochureUrl?: string
  visitDuration?: string
  tagline: string
  description: string
  targetDepartments?: string[]
  keyHighlights: string[]
  learningOutcomes: string[]
  specialWorkshops?: Workshop[]
}

const INSTITUTIONS: Institution[] = [
  {
    id: 'science-centre',
    name: 'Singapore Science Centre & Omni-Theatre',
    shortName: 'Science Centre',
    globalRank: '#1 Interactive STEM Hub in SE Asia',
    establishedYear: 'Est. 1977',
    badge: 'Interactive STEM Labs',
    badgeBg: '#2563EB',
    category: 'Science & STEM',
    cohorts: ['School', 'College'],
    location: 'Jurong East, Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    brochureUrl: '/brochure/Singapore.pdf',
    visitDuration: 'Full-Day Immersion (6 Hours)',
    tagline: 'World-class interactive science labs, 8K Omni-Theatre planetarium & future AI robotics exhibits.',
    description: 'Home to over 1,000 interactive exhibits across 14 galleries. Students engage in experiential physics, molecular gastronomy, space astronomy at Southeast Asia’s premiere 8K Digital Omni-Theatre, and accredited DNA biology workshops.',
    targetDepartments: ['Physics & Space Science', 'Molecular Biology & Genetics', 'Artificial Intelligence & Robotics', 'Environmental Ecology'],
    keyHighlights: [
      'Omni-Theatre 8K fulldome space & climate immersion show',
      'DNA Learning Lab & Molecular Biology gene sequencing',
      'Kinetic Garden & Waterworks interactive physics playground',
      'Climate Change & AI Future Technology Gallery'
    ],
    learningOutcomes: [
      'Deepen conceptual physics and molecular biochemistry principles',
      'Understand practical industrial automation and artificial intelligence workflows',
      'Active STEM problem-solving inside certified research laboratories'
    ],
    specialWorkshops: [
      { title: 'DNA Molecular Extraction Lab', duration: '90 Mins', focus: 'Gel electrophoresis and DNA isolation under expert biologists.' },
      { title: 'AI & Robotics Hands-on Arena', duration: '75 Mins', focus: 'Sensor calibration, pathfinding algorithms, and logic programming.' },
      { title: '8K Fulldome Astrophysics Session', duration: '60 Mins', focus: 'Deep space exploration and atmospheric dynamics.' }
    ]
  },
  {
    id: 'discovery-centre',
    name: 'Singapore Discovery Centre',
    shortName: 'Discovery Centre',
    globalRank: 'National Defence & Crisis Resilience Hub',
    establishedYear: 'Est. 1996',
    badge: 'Crisis & Leadership Labs',
    badgeBg: '#D97706',
    category: 'National Defense & Media',
    cohorts: ['School', 'College', 'MBA'],
    location: 'Upper Jurong Road, Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    brochureUrl: '/brochure/Singapore.pdf',
    visitDuration: 'Half-Day Immersion (4 Hours)',
    tagline: 'Crisis management simulations, digital media broadcasting, and national resilience story.',
    description: 'An interactive experiential center celebrating Singapore’s transition into a global leader. Features dynamic augmented reality timeline trails, crisis leadership escape rooms, and digital broadcast media studios.',
    targetDepartments: ['Strategic Leadership', 'Crisis Communication', 'Digital Media & Broadcasting', 'Public Governance'],
    keyHighlights: [
      'Through the Lens of Time: Immersive Singapore History AR',
      'Crisis Simulation & Leadership Strategy Escape Labs',
      'Digital Broadcasting & Media Production studios',
      'National military defense & economic resilience insights'
    ],
    learningOutcomes: [
      'Analyze public governance, strategic leadership, and crisis management',
      'Understand national security policy and strategic resource planning',
      'Develop media production literacy and team coordination under time constraints'
    ],
    specialWorkshops: [
      { title: 'Crisis Room Command Simulation', duration: '90 Mins', focus: 'Collaborative scenario simulation managing resource allocation during city emergencies.' },
      { title: 'Digital Media Studio Anchoring', duration: '60 Mins', focus: 'Green-screen broadcast production, teleprompter delivery, and camera directing.' }
    ]
  },
  {
    id: 'marina-barrage',
    name: 'Marina Barrage & Sustainable Singapore Gallery',
    shortName: 'Marina Barrage',
    globalRank: 'Global Benchmark in Urban Water Engineering',
    establishedYear: 'Est. 2008',
    badge: 'Sustainability & Water Tech',
    badgeBg: '#0D9488',
    category: 'Sustainability & Water Tech',
    cohorts: ['School', 'College', 'MBA'],
    location: 'Marina South, Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    brochureUrl: '/brochure/Singapore.pdf',
    visitDuration: 'Half-Day Field Immersion (3.5 Hours)',
    tagline: 'Civil engineering marvel managing water security, flood alleviation & solar green energy.',
    description: 'Built across the mouth of the 350-metre wide Marina Channel, this project embodies Singapore’s world-leading water security vision. Students examine the 9 crest gates, massive drainage pump houses, and the Sustainable Singapore Gallery.',
    targetDepartments: ['Civil & Environmental Engineering', 'Water Resource Management', 'Urban Architecture & Planning', 'ESG & Sustainability'],
    keyHighlights: [
      'Sustainable Singapore Gallery: 6 interactive eco-zones',
      'Live crest gates & flood alleviation pump mechanics',
      'Solar Park generating clean energy for civic operations',
      'Closed-loop urban water catchment engineering models'
    ],
    learningOutcomes: [
      'Examine circular water economy models and flood mitigation civil engineering',
      'Study urban sustainability planning and UN SDG integration',
      'Understand climate resilience strategies for coastal megacities'
    ],
    specialWorkshops: [
      { title: 'Hydraulic Gate Mechanics Briefing', duration: '60 Mins', focus: 'Engineering analysis of crest gate activation during tidal surges.' },
      { title: 'Eco-Singapore Carbon Neutrality Tour', duration: '75 Mins', focus: 'Zero-waste urban ecosystems and solar infrastructure review.' }
    ]
  },
  {
    id: 'sutd',
    name: 'Singapore University of Technology and Design (SUTD)',
    shortName: 'SUTD',
    globalRank: 'Established in Collaboration with MIT (USA)',
    establishedYear: 'Est. 2009',
    badge: 'Design & MIT Innovation',
    badgeBg: '#7C3AED',
    category: 'Tech & Design',
    cohorts: ['College', 'MBA'],
    location: 'Upper Changi, Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    brochureUrl: '/brochure/Singapore.pdf',
    visitDuration: 'Full-Day Tech Immersion (5 Hours)',
    tagline: 'MIT-partnered campus driving human-centric design, FabLab 3D prototyping & IoT robotics.',
    description: 'Established in collaboration with MIT, SUTD pioneers multidisciplinary curriculum combining architecture, engineering systems, and artificial intelligence. Students experience the sprawling FabLab and autonomous robotics testbeds.',
    targetDepartments: ['Architecture (ASD)', 'Engineering Systems (ESD)', 'Information Systems & AI (ISTD)', 'Product Design (EPD)'],
    keyHighlights: [
      'FabLab: High-precision laser cutting & 3D additive manufacturing',
      'Architecture & Sustainable Design (ASD) design showcases',
      'Engineering Product Development (EPD) robotic workshops',
      'MIT-SUTD Dual Degree and international admission criteria'
    ],
    learningOutcomes: [
      'Master Design Thinking methodologies for real-world engineering',
      'Explore cutting-edge additive manufacturing and smart prototyping',
      'Gain direct exposure to world-class university admissions criteria'
    ],
    specialWorkshops: [
      { title: 'FabLab 3D Additive Prototyping', duration: '90 Mins', focus: 'Hands-on SLA 3D printing and CAD translation workshops.' },
      { title: 'MIT Design Thinking Case Sprint', duration: '90 Mins', focus: 'Rapid prototyping sprint solving smart city mobility challenges.' }
    ]
  },
  {
    id: 'smu',
    name: 'Singapore Management University (SMU)',
    shortName: 'SMU',
    globalRank: 'Modeled on The Wharton School (UPenn)',
    establishedYear: 'Est. 2000',
    badge: 'Downtown FinTech & Business',
    badgeBg: '#DC2626',
    category: 'Business & FinTech',
    cohorts: ['College', 'MBA'],
    location: 'Bras Basah, Downtown Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    brochureUrl: '/brochure/Singapore.pdf',
    visitDuration: 'Half-Day Business Masterclass (4 Hours)',
    tagline: 'Downtown interactive seminar pedagogy, FinTech trading rooms & Asian business leadership.',
    description: 'Strategically located in Singapore’s arts and financial district, SMU models its seminar-style interactive learning on the Wharton School (UPenn). Tour state-of-the-art trading rooms, incubation labs, and join masterclasses on Asian business dynamics.',
    targetDepartments: ['Lee Kong Chian School of Business', 'School of Accountancy', 'FinTech & Analytics', 'Venture Capital & IIE'],
    keyHighlights: [
      'Simulated Financial Trading & Bloomberg Terminal room',
      'SMU Connexion net-zero energy smart building',
      'Institute of Innovation & Entrepreneurship (IIE) incubators',
      'Wharton-modeled interactive seminar case study methodology'
    ],
    learningOutcomes: [
      'Understand Asian capital markets, global FinTech, and venture capital',
      'Experience dynamic case-study pedagogical discussions',
      'Network with faculty and international business student cohorts'
    ],
    specialWorkshops: [
      { title: 'Financial Trading Simulation', duration: '90 Mins', focus: 'Live trading floor simulations with multi-currency risk management.' },
      { title: 'Asian FinTech & Venture Landscape', duration: '75 Mins', focus: 'Monetary Authority of Singapore (MAS) sandboxes & ASEAN market entry.' }
    ]
  },
  {
    id: 'ntu',
    name: 'Nanyang Technological University (NTU)',
    shortName: 'NTU',
    globalRank: '#15 Globally (QS 2026) & Top Smart Eco-Campus',
    establishedYear: 'Est. 1991',
    badge: 'Global Top-15 Tech Campus',
    badgeBg: '#0284C7',
    category: 'Tech & Design',
    cohorts: ['College', 'MBA', 'School'],
    location: 'Jurong West, Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    brochureUrl: '/brochure/Singapore.pdf',
    visitDuration: 'Full-Day Campus Circuit (6 Hours)',
    tagline: 'World-renowned eco-campus, "The Hive" learning hub & frontier aerospace research.',
    description: 'Consistently ranked among the world’s top 15 universities, NTU’s 200-hectare smart campus is a living testbed for green building tech, autonomous vehicles, and satellite aerospace development. Walk the iconic "Hive" designed by Thomas Heatherwick.',
    targetDepartments: ['Computer Science & AI', 'Aerospace Engineering', 'Materials Science', 'Energy Research Institute (ERI@N)'],
    keyHighlights: [
      'The Hive (Learning Hub South) iconic flipped-classroom design',
      'CleanTech One & Energy Research Institute (ERI@N)',
      'Satellite Research Centre (SaRC) & Autonomous Bus test tracks',
      'School of Art, Design and Media (ADM) sloping green roof'
    ],
    learningOutcomes: [
      'Observe frontier AI, nanotechnology, and aerospace research projects',
      'Experience smart campus IoT living laboratories',
      'Learn international postgraduate and undergraduate admission pathways'
    ],
    specialWorkshops: [
      { title: 'The Hive Flipped Classroom Experience', duration: '60 Mins', focus: 'Collaborative case breakdown inside Thomas Heatherwick-designed pods.' },
      { title: 'CleanTech Autonomous Mobility Telemetry', duration: '90 Mins', focus: 'Sensor arrays, lidar maps, and EV battery testing.' }
    ]
  },
  {
    id: 'nus',
    name: 'National University of Singapore (NUS)',
    shortName: 'NUS',
    globalRank: '#8 Globally (QS 2026) & #1 in Asia',
    establishedYear: 'Est. 1905',
    badge: 'Global Top-10 University',
    badgeBg: '#EA580C',
    category: 'Global Top University',
    cohorts: ['School', 'College', 'MBA'],
    location: 'Kent Ridge, Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    brochureUrl: '/brochure/Singapore.pdf',
    visitDuration: 'Full-Day Flagship Immersion (6.5 Hours)',
    tagline: 'Asia’s premier university campus, BLOCK71 startup ecosystem & world-class research.',
    description: 'Ranked #8 globally (QS World Rankings), NUS is Singapore’s flagship institution. Students tour University Town (UTown), visit the NUS Enterprise startup hub BLOCK71, explore biomedical science clusters, and participate in academic faculty briefings.',
    targetDepartments: ['School of Computing', 'Faculty of Engineering', 'NUS Business School', 'Yong Loo Lin School of Medicine'],
    keyHighlights: [
      'University Town (UTown) sustainable residential & study colleges',
      'BLOCK71 / NUS Enterprise high-tech startup incubator ecosystem',
      'Yong Loo Lin School of Medicine & Precision Medicine clusters',
      'Faculty briefings on global scholarship & study abroad pathways'
    ],
    learningOutcomes: [
      'Immerse in an elite global academic research culture',
      'Understand the journey from university IP to commercial tech ventures',
      'Obtain insider advice on competitive international university admissions'
    ],
    specialWorkshops: [
      { title: 'BLOCK71 Deep-Tech Startup Incubation', duration: '90 Mins', focus: 'Venture scaling, founder pitch evaluation, and patent commercialization.' },
      { title: 'NUS International Admissions Masterclass', duration: '60 Mins', focus: 'Portfolio requirements, scholarship avenues, and faculty interviews.' }
    ]
  }
]

interface Itinerary {
  id: string
  title: string
  targetCohort: string
  duration: string
  badge: string
  circuitPdfUrl?: string
  estimatedPriceSgd?: number
  highlights: string[]
  days: {
    day: number
    title: string
    morning: string
    afternoon: string
    evening: string
    learningOutcome: string
  }[]
}

const ITINERARIES: Itinerary[] = [
  {
    id: 'school-stem',
    title: '4D3N Singapore STEM, Sustainability & Discovery Explorer',
    targetCohort: 'School (Grades 6–12)',
    duration: '4 Days / 3 Nights',
    badge: 'Best for K-12 Schools',
    circuitPdfUrl: '/brochures/Singapore-4D3N-STEM-School-Tour-Itinerary.pdf',
    estimatedPriceSgd: 580,
    highlights: [
      'Singapore Science Centre & 8K Omni-Theatre Show',
      'Marina Barrage & Sustainable Singapore Gallery',
      'Singapore Discovery Centre & AR Crisis Simulations',
      'Gardens by the Bay Cloud Forest Biodiversity Lab',
      'Mandai Wildlife Reserve & Night Safari Tram'
    ],
    days: [
      {
        day: 1,
        title: 'Arrival, Changi Canopy Tech & Science Centre Journey',
        morning: 'Touchdown at Singapore Changi Airport. Visit the Jewel Rain Vortex & Canopy Park engineering marvel.',
        afternoon: 'Guided visit to Singapore Science Centre. Interactive molecular labs, Kinetic Garden & DNA workshop.',
        evening: 'Immersive planetarium screening at the 8K Digital Omni-Theatre. Welcome dinner.',
        learningOutcome: 'Hands-on physics and astronomy concepts in Southeast Asia’s premier science pavilion.'
      },
      {
        day: 2,
        title: 'Urban Ecology, Water Security & Gardens by the Bay',
        morning: 'Marina Barrage: Discover how the 9 crest gates and pump house control flooding and create an urban reservoir.',
        afternoon: 'Explore Gardens by the Bay (Flower Dome & Cloud Forest) focusing on vertical farming and mist climate systems.',
        evening: 'Spectacular Spectra Light & Water Show at Marina Bay Sands waterfront promenade.',
        learningOutcome: 'Understand water catchment engineering, tropical biodiversity, and sustainable architectural design.'
      },
      {
        day: 3,
        title: 'National Resilience, Defence Tech & Night Safari',
        morning: 'Singapore Discovery Centre: AR historical timeline and crisis simulation leadership workshops.',
        afternoon: 'Cross-cultural heritage trail through Chinatown & Little India with interactive cultural scavenger hunt.',
        evening: 'Guided tram tour and nocturnal animal conservation briefing at the world-famous Night Safari.',
        learningOutcome: 'Develop team problem-solving under crisis conditions and examine global wildlife conservation.'
      },
      {
        day: 4,
        title: 'Ocean Tech at S.E.A. Aquarium & Departure',
        morning: 'S.E.A. Aquarium at Resorts World Sentosa: Marine ecosystem management & coral reef preservation briefing.',
        afternoon: 'Last-minute souvenir shopping at Bugis Street / Jewel Changi. Chaperone debrief and airport transfer.',
        evening: 'Departure flight back to home country with certificates of tour completion.',
        learningOutcome: 'Appreciate ocean conservation, Singapore’s port history, and global ecological responsibilities.'
      }
    ]
  },
  {
    id: 'college-tech',
    title: '5D4N Future Tech, Design & Top University Immersion',
    targetCohort: 'College & Engineering',
    duration: '5 Days / 4 Nights',
    badge: 'Popular with Tech & Science Colleges',
    circuitPdfUrl: '/brochures/Singapore-5D4N-College-Tech-Tour-Itinerary.pdf',
    estimatedPriceSgd: 725,
    highlights: [
      'NUS University Town & Enterprise BLOCK71 Startup Incubator',
      'NTU The Hive Campus Tour & CleanTech One Sustainable Park',
      'SUTD MIT-Design FabLab 3D Prototyping Workshop',
      'NEWater High-Tech Water Reclamation Plant',
      'URA Singapore City Planning Gallery'
    ],
    days: [
      {
        day: 1,
        title: 'Arrival & Singapore Smart Nation Urban Planning Walk',
        morning: 'Arrival at Changi Airport. Check-in at student hotel accommodation.',
        afternoon: 'Urban Redevelopment Authority (URA) Singapore City Gallery: 3D scale model & Smart Nation digital masterplan.',
        evening: 'Marina Bay Financial District walk examining smart urban infrastructure and autonomous sensor systems.',
        learningOutcome: 'Comprehend high-density urban planning, IoT infrastructure, and smart city governance.'
      },
      {
        day: 2,
        title: 'NUS Campus Immersion & BLOCK71 Deep-Tech Ecosystem',
        morning: 'NUS Kent Ridge Campus: Tour University Town, Yale-NUS library, and faculty of computing/engineering.',
        afternoon: 'NUS Enterprise BLOCK71: Meet startup founders and attend a briefing on Singapore venture incubation.',
        evening: 'Interactive networking dinner with current international university scholars.',
        learningOutcome: 'Gain direct insights into university admissions, entrepreneurship, and commercial tech research.'
      },
      {
        day: 3,
        title: 'SUTD Design Innovation FabLab & NEWater Reclamation',
        morning: 'SUTD (Singapore University of Technology and Design): Hands-on 3D printing & FabLab prototyping seminar.',
        afternoon: 'NEWater Plant: Advanced microfiltration and reverse osmosis industrial purification walkthrough.',
        evening: 'Dinner at Lau Pa Sat Satay Street followed by Helix Bridge structural engineering observation.',
        learningOutcome: 'Apply human-centric design thinking and analyze advanced industrial membrane water purification.'
      },
      {
        day: 4,
        title: 'NTU "The Hive" Green Campus & CleanTech Park',
        morning: 'NTU Campus Tour: Explore Thomas Heatherwick’s "The Hive", ADM building, and satellite labs.',
        afternoon: 'Jurong CleanTech Park & Singapore Science Centre AI Future Technology Wing.',
        evening: 'Clarke Quay river cruise studying the Singapore River cleanup and historic trading quays.',
        learningOutcome: 'Evaluate green building design certifications and state-of-the-art AI robotics automation.'
      },
      {
        day: 5,
        title: 'Academic Debrief, Certification & Departure',
        morning: 'Group presentations on Singapore Smart Nation case studies. Presentation of attendance certificates.',
        afternoon: 'Free time at Changi Jewel experience / airport check-in.',
        evening: 'Flight departure to home destination.',
        learningOutcome: 'Consolidate comparative technical knowledge for academic credits and career portfolios.'
      }
    ]
  },
  {
    id: 'mba-business',
    title: '5D4N Global Business, FinTech & Supply Chain Immersion',
    targetCohort: 'MBA & Business Schools',
    duration: '5 Days / 4 Nights',
    badge: 'Designed for MBA & Executive Cohorts',
    circuitPdfUrl: '/brochures/Singapore-5D4N-MBA-Business-Tour-Itinerary.pdf',
    estimatedPriceSgd: 920,
    highlights: [
      'Singapore Management University (SMU) FinTech Seminar',
      'PSA Singapore Smart Port & Maritime Logistics Briefing',
      'Marina Bay Financial Centre Global Banking Overview',
      'NUS Business School Asian Business Strategy Masterclass',
      'Singapore Economic Development Board (EDB) Case Studies'
    ],
    days: [
      {
        day: 1,
        title: 'Arrival & Singapore Economic Transformation Overview',
        morning: 'Arrival in Singapore. Private coach transfer to downtown 4-star business hotel.',
        afternoon: 'Orientation briefing on Singapore’s transition into Asia’s treasury and multinational HQ capital.',
        evening: 'Executive dinner at Marina Bay overlooking the world’s most dense financial district.',
        learningOutcome: 'Analyze the legal, tax, and governance foundations that make Singapore the #1 ease of doing business hub.'
      },
      {
        day: 2,
        title: 'SMU Case Study Pedagogy & FinTech Masterclass',
        morning: 'SMU Campus: Executive seminar on Asian Capital Markets, ASEAN digital economy, and FinTech regulation.',
        afternoon: 'Visit to a Singapore FinTech / Web3 accelerator hub in Tanjong Pagar.',
        evening: 'Networking session with Singapore-based alumni, CFOs, and business leaders.',
        learningOutcome: 'Examine monetary authority sandboxes, cross-border payment rails, and venture financing.'
      },
      {
        day: 3,
        title: 'PSA World-Class Automated Port & Logistics Operations',
        morning: 'PSA Singapore: Exclusive briefing on Tuas Mega Port automation, automated guided vehicles (AGVs), and AI supply chain.',
        afternoon: 'Jurong Island & Petrochemical logistics overview / URA Masterplan review.',
        evening: 'Dinner and debrief on global trade route resilience and maritime security.',
        learningOutcome: 'Understand mega-hub supply chain operations handling over 37 million TEUs annually.'
      },
      {
        day: 4,
        title: 'NUS Business School Masterclass & ESG Strategies',
        morning: 'NUS Business School (Mochtar Riady Building): Lecture on sustainable business models & Asian ESG frameworks.',
        afternoon: 'Marina Barrage & Sentosa Carbon-Neutral tourism district corporate site study.',
        evening: 'Gala farewell dinner with certificates of completion awarded by tour directors.',
        learningOutcome: 'Deconstruct corporate ESG transformation and decarbonization strategies in high-growth markets.'
      },
      {
        day: 5,
        title: 'Executive Capstone Presentation & Departure',
        morning: 'Group syndicate case presentations summarizing key business learnings and strategic recommendations.',
        afternoon: 'Corporate shopping and transit to Changi International Airport.',
        evening: 'Flight departure.',
        learningOutcome: 'Synthesize actionable market entry and operational frameworks for international business roles.'
      }
    ]
  }
]

const LEARNING_PILLARS = [
  {
    icon: <Cpu size={26} color="#2563EB" />,
    title: 'STEM, Robotics & AI',
    description: 'Hands-on coding, molecular labs at Science Centre, and drone/robotics automation testbeds.',
    bg: '#EFF6FF',
    border: '#BFDBFE'
  },
  {
    icon: <Globe size={26} color="#0D9488" />,
    title: 'Sustainability & Circular Economy',
    description: 'Closed-loop water reclamation (NEWater), Marina Barrage flood engineering, and zero-carbon buildings.',
    bg: '#F0FDFA',
    border: '#99F6E4'
  },
  {
    icon: <Building2 size={26} color="#D97706" />,
    title: 'Smart Nation Urban Engineering',
    description: 'Autonomous vehicle testbeds, URA 3D spatial planning, green infrastructure, and transit systems.',
    bg: '#FFFBEB',
    border: '#FDE68A'
  },
  {
    icon: <TrendingUp size={26} color="#7C3AED" />,
    title: 'Global Trade & Logistics Hubs',
    description: 'Tuas Mega Port automation, automated logistics warehousing, and Changi multimodal supply chains.',
    bg: '#FAF5FF',
    border: '#E9D5FF'
  },
  {
    icon: <GraduationCap size={26} color="#E11D48" />,
    title: 'Top University & Design Immersions',
    description: 'Campus masterclasses at NUS (#8 World), NTU (#15 World), SUTD (MIT-partnered) and SMU.',
    bg: '#FFF1F2',
    border: '#FECDD3'
  }
]

const FAQS = [
  {
    q: 'How many complimentary slots do teachers or chaperones receive?',
    a: 'For all our educational tour cohorts, Flying Wonders provides 1 complimentary chaperone package (twin-sharing accommodation, all meals, admissions, and coach travel) for every 10 paying students (1:10 ratio).',
    category: 'Logistics & Chaperones'
  },
  {
    q: 'Can itineraries be customized to match specific school curriculums (IB, CBSE, IGCSE, B.Tech)?',
    a: 'Yes, absolutely. We tailor daily workshops, laboratory sessions, and guided walkthroughs to align precisely with specific syllabus learning outcomes (e.g. IB Environmental Systems, CBSE Physics, B.Tech IoT/Robotics, or MBA FinTech).',
    category: 'Curriculum & Labs'
  },
  {
    q: 'What safety and emergency protocols are in place in Singapore?',
    a: 'Singapore is universally recognized as the world’s safest country for student travel. Flying Wonders provides 24/7 dedicated on-ground tour managers, comprehensive student travel medical & emergency evacuation insurance, certified English/Hindi/regional guides, and direct hospital network partnerships.',
    category: 'Safety & Medical'
  },
  {
    q: 'Do you cater to dietary requirements like Halal, Pure Vegetarian, and Jain meals?',
    a: 'Yes. All student group meal itineraries are fully customized with certified Halal, Pure Vegetarian, Vegan, or Jain meal options prepared by licensed food partners throughout Singapore.',
    category: 'Logistics & Chaperones'
  },
  {
    q: 'What is the booking lead time and payment schedule for school delegations?',
    a: 'We recommend initiating planning 6 to 12 weeks prior to departure to secure university lab slots, flight blocks, and hotel room allotments. Payment terms typically include a booking deposit with balance structured in milestones prior to departure.',
    category: 'Booking & Payment'
  }
]

function getEmbedVideoUrl(url?: string): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  return url
}

export default function EducationToursPage() {
  const [sanitySettings, setSanitySettings] = useState<any>(null)
  const [globalSettings, setGlobalSettings] = useState<any>(null)
  const [selectedCohort, setSelectedCohort] = useState<'All' | 'School' | 'College' | 'MBA'>('All')
  const [activeItineraryId, setActiveItineraryId] = useState<string>('school-stem')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  // Institution Modal (for full details / media / syllabus download)
  const [selectedInstitutionDetail, setSelectedInstitutionDetail] = useState<Institution | null>(null)

  // Estimator States
  const [studentCount, setStudentCount] = useState<number>(30)
  const [durationDays, setDurationDays] = useState<number>(5)
  const [hotelTier, setHotelTier] = useState<'budget' | 'standard' | 'premium'>('standard')

  // Inquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalCohort, setModalCohort] = useState('School (Grades 6-12)')
  const [modalName, setModalName] = useState('')
  const [modalEmail, setModalEmail] = useState('')
  const [modalPhone, setModalPhone] = useState('')
  const [modalInstitution, setModalInstitution] = useState('')
  const [modalStudents, setModalStudents] = useState('30')
  const [modalDate, setModalDate] = useState('')
  const [modalNotes, setModalNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      client.fetch(`*[_type == "educationToursSettings"][0]`),
      client.fetch(`*[_type == "siteSettings"][0]{ whatsappNumber, contactEmail, notificationEmails }`)
    ])
      .then(([eduRes, siteRes]) => {
        if (eduRes) setSanitySettings(eduRes)
        if (siteRes) setGlobalSettings(siteRes)
      })
      .catch(() => {})
  }, [])

  // Dynamic WhatsApp consultation number (Education Tours override -> Global Site Settings -> Default)
  const resolvedWhatsappNumber = useMemo(() => {
    const raw = sanitySettings?.whatsappNumber || globalSettings?.whatsappNumber || '+919886171251'
    return raw.replace(/[^0-9]/g, '') || '919886171251'
  }, [sanitySettings, globalSettings])

  // Dynamic Institutions List
  const institutionsList: Institution[] = useMemo(() => {
    if (sanitySettings?.institutions && Array.isArray(sanitySettings.institutions) && sanitySettings.institutions.length > 0) {
      return sanitySettings.institutions.map((inst: any, idx: number) => {
        const fallback = INSTITUTIONS[idx % INSTITUTIONS.length]
        let resolvedImage = inst.imageUrl || fallback.imageUrl
        if (inst.image?.asset) {
          try {
            resolvedImage = urlForImage(inst.image)?.url() || resolvedImage
          } catch (e) {}
        }
        return {
          id: inst.id || fallback.id || `inst-${idx}`,
          name: inst.name || fallback.name,
          shortName: inst.shortName || fallback.shortName,
          globalRank: inst.globalRank || fallback.globalRank,
          establishedYear: inst.establishedYear || fallback.establishedYear,
          badge: inst.badge || fallback.badge,
          badgeBg: inst.badgeBg || fallback.badgeBg,
          category: inst.category || fallback.category,
          cohorts: inst.cohorts || fallback.cohorts,
          location: inst.location || fallback.location,
          imageUrl: resolvedImage,
          galleryPhotos: inst.galleryPhotos || fallback.galleryPhotos,
          videoUrl: inst.videoUrl !== undefined ? inst.videoUrl : fallback.videoUrl,
          brochureUrl: inst.brochureUrl || (inst.brochureFile?.asset?._ref ? `https://cdn.sanity.io/files/8xtd7yiv/production/${inst.brochureFile.asset._ref.replace('file-', '').replace('-pdf', '.pdf')}` : fallback.brochureUrl),
          visitDuration: inst.visitDuration || fallback.visitDuration,
          tagline: inst.tagline || fallback.tagline,
          description: inst.description || fallback.description,
          targetDepartments: inst.targetDepartments || fallback.targetDepartments,
          keyHighlights: inst.keyHighlights || fallback.keyHighlights,
          learningOutcomes: inst.learningOutcomes || fallback.learningOutcomes,
          specialWorkshops: inst.specialWorkshops || fallback.specialWorkshops
        }
      })
    }
    return INSTITUTIONS
  }, [sanitySettings])

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    if (selectedCohort === 'All') return institutionsList
    return institutionsList.filter((inst: any) => inst.cohorts?.includes(selectedCohort as any))
  }, [selectedCohort, institutionsList])

  // Dynamic Itineraries List
  const itinerariesList: Itinerary[] = useMemo(() => {
    if (sanitySettings?.itineraries && Array.isArray(sanitySettings.itineraries) && sanitySettings.itineraries.length > 0) {
      return sanitySettings.itineraries
    }
    return ITINERARIES
  }, [sanitySettings])

  // Active Itinerary
  const activeItinerary = useMemo(() => {
    return itinerariesList.find((it: any) => it.id === activeItineraryId) || itinerariesList[0] || ITINERARIES[0]
  }, [activeItineraryId, itinerariesList])

  // Dynamic FAQs List
  const faqsList = useMemo(() => {
    if (sanitySettings?.faqs && Array.isArray(sanitySettings.faqs) && sanitySettings.faqs.length > 0) {
      return sanitySettings.faqs
    }
    return FAQS
  }, [sanitySettings])

  // Estimator Calculations
  const chaperoneCount = Math.floor(studentCount / 10)
  const budgetRate = sanitySettings?.estimatorBudgetRatePerDay || 115
  const standardRate = sanitySettings?.estimatorStandardRatePerDay || 145
  const premiumRate = sanitySettings?.estimatorPremiumRatePerDay || 185
  const baseRatePerDay = hotelTier === 'budget' ? budgetRate : hotelTier === 'standard' ? standardRate : premiumRate
  const estimatedSgdPerStudent = Math.round(baseRatePerDay * durationDays)
  const estimatedInrPerStudent = Math.round(estimatedSgdPerStudent * 63.5)

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/education-tours/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modalName,
          institution: modalInstitution,
          email: modalEmail,
          phone: modalPhone,
          cohort: modalCohort,
          students: parseInt(modalStudents) || 30,
          travelDate: modalDate,
          notes: modalNotes,
          totalPrice: estimatedSgdPerStudent * (parseInt(modalStudents) || 30)
        })
      })

      // Client-side Web3Forms fallback
      const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      if (web3formsKey) {
        try {
          const targetRecipient = sanitySettings?.notificationEmails || 'info.flyingwonders@gmail.com'
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: web3formsKey,
              subject: `🎓 [Education Tour Proposal] ${modalInstitution} - ${modalName}`,
              from_name: 'Flying Wonders Education Portal',
              to_email: targetRecipient,
              coordinator_name: modalName,
              institution: modalInstitution,
              official_email: modalEmail,
              phone_whatsapp: modalPhone,
              target_cohort: modalCohort,
              students_count: modalStudents,
              target_date: modalDate,
              requirements: modalNotes
            })
          })
        } catch (w3Err) {
          console.error('Client Web3Forms send error:', w3Err)
        }
      }

      if (response.ok) {
        setSubmitSuccess(true)
      } else {
        window.open(
          `https://wa.me/${resolvedWhatsappNumber}?text=${encodeURIComponent(
            `Hi Flying Wonders, I want to inquire about a Singapore Education Tour for ${modalInstitution} (${modalCohort}, ~${modalStudents} students, ${modalDate}).`
          )}`,
          '_blank'
        )
        setSubmitSuccess(true)
      }
    } catch (err) {
      window.open(
        `https://wa.me/${resolvedWhatsappNumber}?text=${encodeURIComponent(
          `Hi Flying Wonders, I want to inquire about a Singapore Education Tour for ${modalInstitution} (${modalCohort}, ~${modalStudents} students, ${modalDate}).`
        )}`,
        '_blank'
      )
      setSubmitSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}>
      
      {/* ─── Breadcrumb ─── */}
      <div style={{ background: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0.45rem 1.2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: SLATE }}>
          <Link href="/" style={{ color: SLATE, textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/services-catalog" style={{ color: SLATE, textDecoration: 'none' }}>Services</Link>
          <ChevronRight size={12} />
          <span style={{ color: EMERALD, fontWeight: 700 }}>Education Tours Singapore</span>
        </div>
      </div>

      {/* ─── Compact Hero Section ─── */}
      <section style={{
        background: 'linear-gradient(140deg, #05241B 0%, #093E30 45%, #0B2545 100%)',
        color: '#FFF',
        padding: 'clamp(1.4rem, 2.5vw, 2.2rem) 1rem clamp(2.2rem, 3.8vw, 3rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1020px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Top Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.2rem 0.75rem', borderRadius: '30px', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.65rem', backdropFilter: 'blur(8px)' }}>
            <Sparkles size={12} color="#F59E0B" />
            <span>{sanitySettings?.heroBadge || 'Singapore: The World’s Safest Live Classroom • K-12, College & MBA'}</span>
          </div>

          {/* Hero Main Heading (Single Line) */}
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(1.45rem, 2.8vw, 2.35rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.45rem',
            letterSpacing: '-0.01em',
            color: '#FFF'
          }}>
            {sanitySettings?.heroTitle ? (
              sanitySettings.heroTitle
            ) : (
              'Singapore Educational Tours & Academic Immersions'
            )}
          </h1>

          {/* Hero Subtitle (2 Lines) */}
          <p style={{
            fontSize: 'clamp(0.8rem, 1.25vw, 0.88rem)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.45,
            maxWidth: '860px',
            margin: '0 auto 1.1rem'
          }}>
            {sanitySettings?.heroSubtitle || (
              'Curated study circuits for Schools (K–12), Engineering Colleges, and MBA Business Schools. Explore world-class innovation labs, sustainable engineering marvels, and top global university campuses.'
            )}
          </p>

          {/* All 4 Links in 1 Single Line */}
          <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', maxWidth: '980px', margin: '0 auto' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: AMBER_LIGHT,
                color: '#1E293B',
                border: 'none',
                padding: '0.48rem 0.95rem',
                borderRadius: '20px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(245,158,11,0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span>Request Custom Proposal</span>
              <ArrowRight size={13} />
            </button>

            {/* In-Between Link to Curated Circuits */}
            <a
              href="#circuits"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.35)',
                padding: '0.48rem 0.95rem',
                borderRadius: '20px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Layers size={13} color="#FBBF24" />
              <span>Curated Study Circuits</span>
            </a>

            <a
              href="#institutions"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.22)',
                padding: '0.48rem 0.95rem',
                borderRadius: '20px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Compass size={13} color="#6EE7B7" />
              <span>Explore 7 Partner Institutions</span>
            </a>

            <a
              href="#estimator"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.16)',
                padding: '0.48rem 0.95rem',
                borderRadius: '20px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)'
              }}
            >
              <DollarSign size={13} color="#FBBF24" />
              <span>Cost Estimator</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Compact Floating Trust Stats Bar ─── */}
      <section style={{ maxWidth: '1100px', margin: '-1.8rem auto 3.2rem', padding: '0 1.2rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>75+ Cohorts</div>
              <div style={{ fontSize: '0.7rem', color: SLATE }}>Facilitated since 2018</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>1:10 Free Chaperone</div>
              <div style={{ fontSize: '0.7rem', color: SLATE }}>100% Free teacher slots</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>100% Verified Safety</div>
              <div style={{ fontSize: '0.7rem', color: SLATE }}>Medical & evacuation cover</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>7 Top Institutions</div>
              <div style={{ fontSize: '0.7rem', color: SLATE }}>Science, Tech & Universities</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5 Learning Pillars ─── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 4.5rem', padding: '0 1.2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Academic Excellence</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
            Core Educational Learning Pillars
          </h2>
          <p style={{ color: SLATE, fontSize: '0.88rem', maxWidth: '640px', margin: '0 auto' }}>
            Every circuit is structured around Singapore’s national strengths—integrating hands-on STEM discovery, urban ecology, smart port logistics, and world-class higher education.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {LEARNING_PILLARS.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div>{p.icon}</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{p.title}</h3>
              <p style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Enhanced Featured 7 Institutions ─── */}
      <section id="institutions" style={{ background: '#FFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '4.5rem 1.2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.2rem', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Direct Faculty & Lab Access</span>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
                Featured 7 Institutions & Innovation Hubs
              </h2>
              <p style={{ color: SLATE, fontSize: '0.88rem', maxWidth: '640px', margin: 0 }}>
                Direct access, laboratory masterclasses, and faculty briefings across Singapore’s iconic centers of science, sustainability, and higher education.
              </p>
            </div>

            {/* Cohort Tabs */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.3rem', borderRadius: '10px', gap: '4px' }}>
              {(['All', 'School', 'College', 'MBA'] as const).map((cohort) => (
                <button
                  key={cohort}
                  onClick={() => setSelectedCohort(cohort)}
                  style={{
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedCohort === cohort ? EMERALD : 'transparent',
                    color: selectedCohort === cohort ? '#FFF' : SLATE,
                    transition: 'all 0.15s'
                  }}
                >
                  {cohort === 'All' ? 'All 7 Hubs' : `${cohort} Tours`}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredInstitutions.map((inst: any) => (
              <div
                key={inst.id}
                style={{
                  background: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Photo & Overlay (Clickable to open Full Details & Labs) */}
                <div
                  onClick={() => setSelectedInstitutionDetail(inst)}
                  title={`Click to view full details & video tour for ${inst.name}`}
                  style={{
                    position: 'relative',
                    height: '190px',
                    width: '100%',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={inst.imageUrl}
                    alt={inst.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
                  }} />
                  
                  {/* Top Badges */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: inst.badgeBg,
                      color: '#FFF',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '14px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                    }}>
                      {inst.badge}
                    </span>
                    {inst.globalRank && (
                      <span style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: '#FCD34D',
                        border: '1px solid rgba(252,211,77,0.4)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '14px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        ⭐ {inst.globalRank}
                      </span>
                    )}
                  </div>

                  <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px', color: '#FFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#FCD34D', marginBottom: '2px' }}>
                      <MapPin size={11} />
                      <span>{inst.location}</span>
                      {inst.establishedYear && <span style={{ opacity: 0.8 }}>• {inst.establishedYear}</span>}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, lineHeight: 1.25 }}>{inst.name}</h3>
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Cohort tags & duration */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: SLATE }}>Cohorts:</span>
                        {inst.cohorts?.map((c: any) => (
                          <span key={c} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.12rem 0.45rem', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 700, color: '#334155' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                      {inst.visitDuration && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                          ⏱️ {inst.visitDuration}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: SLATE, lineHeight: 1.55, marginBottom: '0.85rem' }}>
                      {inst.description}
                    </p>

                    {/* Target Faculties / Departments */}
                    {inst.targetDepartments && inst.targetDepartments.length > 0 && (
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Target Faculties:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {inst.targetDepartments.map((dept: string, i: number) => (
                            <span key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.12rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', color: '#475569' }}>
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Highlights list */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} color="#059669" />
                        <span>Key Facilities & Highlights:</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                        {inst.keyHighlights?.slice(0, 3).map((kh: any, i: number) => (
                          <li key={i}>{kh}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setSelectedInstitutionDetail(inst)}
                      style={{
                        background: '#FFF',
                        color: '#0F172A',
                        border: '1px solid #CBD5E1',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <BookOpen size={13} color="#2563EB" />
                      <span>Full Details & Labs</span>
                    </button>

                    <button
                      onClick={() => {
                        setModalNotes(`Inquiring specifically for: ${inst.name}`)
                        setIsModalOpen(true)
                      }}
                      style={{
                        background: '#ECFDF5',
                        color: EMERALD,
                        border: '1px solid #A7F3D0',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Inquire</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Curated Itinerary Matrix ─── */}
      <section id="circuits" style={{ maxWidth: '1200px', margin: '4.5rem auto', padding: '0 1.2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fully Customizable Curriculums</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
            Curated Day-by-Day Study Itineraries
          </h2>
          <p style={{ color: SLATE, fontSize: '0.88rem', maxWidth: '640px', margin: '0 auto' }}>
            Choose your student cohort to preview comprehensive schedules, laboratory masterclasses, syllabus documents, and verified learning outcomes.
          </p>
        </div>

        {/* Itinerary Selectors */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {itinerariesList.map((it) => (
            <button
              key={it.id}
              onClick={() => {
                setActiveItineraryId(it.id)
                setExpandedDay(1)
              }}
              style={{
                background: activeItineraryId === it.id ? EMERALD : '#FFF',
                color: activeItineraryId === it.id ? '#FFF' : '#334155',
                border: `1px solid ${activeItineraryId === it.id ? EMERALD : '#CBD5E1'}`,
                padding: '0.65rem 1.2rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeItineraryId === it.id ? '0 4px 12px rgba(9,62,48,0.2)' : 'none'
              }}
            >
              <GraduationCap size={15} />
              <span>{it.targetCohort}</span>
              <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>({it.duration})</span>
            </button>
          ))}
        </div>

        {/* Active Itinerary Box */}
        <div style={{
          background: '#FFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: 'clamp(1.25rem, 3.5vw, 2.2rem)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.65rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-block', marginBottom: '0.4rem' }}>
                {activeItinerary.badge}
              </span>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {activeItinerary.title}
              </h3>
              <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.78rem', color: SLATE, marginTop: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {activeItinerary.duration}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={13} /> {activeItinerary.targetCohort}</span>
                {activeItinerary.estimatedPriceSgd && (
                  <>
                    <span>•</span>
                    <span style={{ color: EMERALD, fontWeight: 700 }}>SGD ~{activeItinerary.estimatedPriceSgd} / student</span>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activeItinerary.circuitPdfUrl && (
                <a
                  href={activeItinerary.circuitPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#F1F5F9',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    padding: '0.65rem 1.2rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>Download Syllabus</span>
                </a>
              )}
              <button
                onClick={() => {
                  setModalCohort(activeItinerary.targetCohort)
                  setModalNotes(`Inquiring about circuit: ${activeItinerary.title}`)
                  setIsModalOpen(true)
                }}
                style={{
                  background: EMERALD,
                  color: '#FFF',
                  border: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 10px rgba(9,62,48,0.2)'
                }}
              >
                <Send size={14} />
                <span>Book This Circuit</span>
              </button>
            </div>
          </div>

          {/* Highlights */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Circuit Inclusions:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {activeItinerary.highlights?.map((h: any, i: number) => (
                <span key={i} style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.3rem 0.75rem', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={12} color="#059669" />
                  <span>{h}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Day By Day Accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeItinerary.days?.map((d: any) => {
              const isExpanded = expandedDay === d.day
              return (
                <div
                  key={d.day}
                  style={{
                    border: `1px solid ${isExpanded ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: isExpanded ? '#F0FDF4' : '#FFF',
                    transition: 'all 0.15s'
                  }}
                >
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : d.day)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.1rem',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: EMERALD, color: '#FFF', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        D{d.day}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Day 0{d.day}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{d.title}</div>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp size={16} color={SLATE} /> : <ChevronDown size={16} color={SLATE} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 1.1rem 1.1rem', borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.85rem', marginBottom: '0.85rem' }}>
                        <div style={{ background: '#FFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#D97706', display: 'block', marginBottom: '0.2rem' }}>🌅 Morning Schedule</span>
                          <p style={{ fontSize: '0.74rem', color: SLATE, margin: 0, lineHeight: 1.5 }}>{d.morning}</p>
                        </div>
                        <div style={{ background: '#FFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', display: 'block', marginBottom: '0.2rem' }}>☀️ Afternoon Immersion</span>
                          <p style={{ fontSize: '0.74rem', color: SLATE, margin: 0, lineHeight: 1.5 }}>{d.afternoon}</p>
                        </div>
                        <div style={{ background: '#FFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7C3AED', display: 'block', marginBottom: '0.2rem' }}>🌙 Evening Debrief & Dinner</span>
                          <p style={{ fontSize: '0.74rem', color: SLATE, margin: 0, lineHeight: 1.5 }}>{d.evening}</p>
                        </div>
                      </div>

                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.74rem' }}>
                        <Lightbulb size={14} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <strong style={{ color: '#065F46' }}>Core Learning Outcome: </strong>
                          <span style={{ color: '#047857' }}>{d.learningOutcome}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Interactive Estimator ─── */}
      <section id="estimator" style={{ background: '#FFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '4.5rem 1.2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Budgeting & Transparency</span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
              Interactive Group Cost Estimator
            </h2>
            <p style={{ color: SLATE, fontSize: '0.88rem', maxWidth: '640px', margin: '0 auto' }}>
              Estimate complete per-student tour packages—including laboratory admissions, private coach transfers, 3 meals daily, travel medical insurance, and complimentary chaperone slots.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
            
            {/* Estimator Controls */}
            <div style={{ background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
              {/* Slider 1: Students */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={15} color="#059669" />
                    <span>Number of Students:</span>
                  </label>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: EMERALD, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.15rem 0.65rem', borderRadius: '6px' }}>
                    {studentCount} Students
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="150"
                  step="5"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: EMERALD, cursor: 'pointer', height: '6px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: SLATE, marginTop: '3px' }}>
                  <span>15 Min Cohort</span>
                  <span>75 Mid-Size</span>
                  <span>150 Mega Group</span>
                </div>
              </div>

              {/* Slider 2: Duration */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={15} color="#D97706" />
                    <span>Tour Duration (Days):</span>
                  </label>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.15rem 0.65rem', borderRadius: '6px' }}>
                    {durationDays} Days / {durationDays - 1} Nights
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#D97706', cursor: 'pointer', height: '6px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: SLATE, marginTop: '3px' }}>
                  <span>3 Days Express</span>
                  <span>5 Days Standard</span>
                  <span>7 Days Comprehensive</span>
                </div>
              </div>

              {/* Accommodation Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                  Accommodation Category:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                  {[
                    { id: 'budget', name: 'Youth Hostel', desc: 'Quad-share' },
                    { id: 'standard', name: '3-Star Hotel', desc: 'Twin/Triple' },
                    { id: 'premium', name: '4-Star Hotel', desc: 'Executive' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setHotelTier(tier.id as any)}
                      style={{
                        border: `1px solid ${hotelTier === tier.id ? EMERALD : '#CBD5E1'}`,
                        background: hotelTier === tier.id ? '#ECFDF5' : '#FFF',
                        borderRadius: '8px',
                        padding: '0.55rem 0.4rem',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: hotelTier === tier.id ? EMERALD : '#0F172A' }}>{tier.name}</div>
                      <div style={{ fontSize: '0.65rem', color: SLATE, marginTop: '2px' }}>{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chaperone Callout */}
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.75rem 0.9rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.74rem' }}>
                <Users size={16} color="#059669" style={{ flexShrink: 0 }} />
                <span style={{ color: '#065F46' }}>
                  For <strong>{studentCount} students</strong>, you receive <strong>{chaperoneCount} complimentary teacher slots</strong> (100% free flight & tour assistance).
                </span>
              </div>
            </div>

            {/* Estimator Summary Card */}
            <div style={{
              background: 'linear-gradient(145deg, #062B21 0%, #093E30 60%, #0A1C30 100%)',
              color: '#FFF',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 16px 36px rgba(0,0,0,0.12)'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6EE7B7' }}>
                Estimated Total Investment
              </span>
              <div style={{ marginTop: '0.65rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>SGD ~{estimatedSgdPerStudent}</span>
                  <span style={{ color: '#A7F3D0', fontSize: '0.82rem' }}>/ student</span>
                </div>
                <div style={{ fontSize: '0.92rem', color: '#FCD34D', marginTop: '0.35rem', fontWeight: 700 }}>
                  Approx. INR ₹{estimatedInrPerStudent.toLocaleString('en-IN')} per student
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.74rem', color: 'rgba(255,255,255,0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Check size={13} color="#6EE7B7" /> Accommodation ({hotelTier.toUpperCase()})</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>{durationDays - 1} Nights</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Check size={13} color="#6EE7B7" /> Dedicated Private AC Coach</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Full-Day Transfers</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Check size={13} color="#6EE7B7" /> All 7 Institution Admissions</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Lab Passes Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Check size={13} color="#6EE7B7" /> 3 Daily Meals (Halal/Veg/Jain)</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Breakfast, Lunch, Dinner</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Check size={13} color="#6EE7B7" /> Student Medical Travel Insurance</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Included (SGD 50K Cover)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Check size={13} color="#FCD34D" /> Free Teacher Chaperones</span>
                  <span style={{ fontWeight: 800, color: '#FCD34D' }}>{chaperoneCount} Free Slots</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setModalStudents(String(studentCount))
                  setModalNotes(`Estimated Cost: SGD ${estimatedSgdPerStudent} (~INR ₹${estimatedInrPerStudent}) for ${durationDays} Days in ${hotelTier} category.`)
                  setIsModalOpen(true)
                }}
                style={{
                  width: '100%',
                  marginTop: '1.75rem',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: AMBER_LIGHT,
                  color: '#1E293B',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 5px 15px rgba(245,158,11,0.4)'
                }}
              >
                <span>Lock In This Estimated Quote</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQs ─── */}
      <section style={{ maxWidth: '850px', margin: '4.5rem auto', padding: '0 1.2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coordinator Help Center</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqsList.map((faq: any, idx: number) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                style={{
                  background: '#FFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.2rem',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  <span>{faq.q}</span>
                  <span>{isOpen ? <ChevronUp size={16} color={SLATE} /> : <ChevronDown size={16} color={SLATE} />}</span>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 1.2rem 1.1rem', fontSize: '0.78rem', color: SLATE, lineHeight: 1.55, borderTop: '1px solid #F1F5F9' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Bottom Banner ─── */}
      <section style={{
        background: 'linear-gradient(140deg, #05241B 0%, #093E30 50%, #05192D 100%)',
        color: '#FFF',
        padding: '4.5rem 1.2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ready To Plan?</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.7rem, 3.8vw, 2.4rem)', fontWeight: 800, marginTop: '0.4rem', marginBottom: '0.85rem' }}>
            Empower Your Students with an Unforgettable Singapore Educational Tour
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, marginBottom: '1.75rem' }}>
            Let our educational specialists build a tailored curriculum circuit for your school, college, or MBA institution with verified safety protocols and competitive group rates.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: AMBER_LIGHT,
                color: '#1E293B',
                border: 'none',
                padding: '0.75rem 1.8rem',
                borderRadius: '25px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 5px 18px rgba(245,158,11,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.88rem'
              }}
            >
              <span>Request Institutional Proposal</span>
              <ArrowRight size={16} />
            </button>

            <a
              href={`https://wa.me/${resolvedWhatsappNumber}?text=${encodeURIComponent('Hi Flying Wonders, I am interested in organizing a Singapore Educational Tour for our institution.')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '0.75rem 1.6rem',
                borderRadius: '25px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.88rem',
                backdropFilter: 'blur(8px)'
              }}
            >
              <MessageCircle size={16} color="#6EE7B7" />
              <span>Instant WhatsApp Consultation</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Full Institution Detail Modal (Expanded with Embedded Playable Video Tour) ─── */}
      {selectedInstitutionDetail && (() => {
        const embedVideoUrl = getEmbedVideoUrl(selectedInstitutionDetail.videoUrl)
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 9999
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '24px',
              maxWidth: '860px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
            }}>
              {/* Modal Header Image */}
              <div style={{ position: 'relative', height: '230px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={selectedInstitutionDetail.imageUrl}
                  alt={selectedInstitutionDetail.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)'
                }} />

                <button
                  onClick={() => setSelectedInstitutionDetail(null)}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  ✕
                </button>

                <div style={{ position: 'absolute', bottom: '14px', left: '20px', right: '20px', color: '#FFF' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ background: selectedInstitutionDetail.badgeBg, color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.6rem', borderRadius: '12px' }}>
                      {selectedInstitutionDetail.badge}
                    </span>
                    {selectedInstitutionDetail.globalRank && (
                      <span style={{ background: 'rgba(0,0,0,0.7)', color: '#FCD34D', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(252,211,77,0.4)' }}>
                        ⭐ {selectedInstitutionDetail.globalRank}
                      </span>
                    )}
                    {selectedInstitutionDetail.visitDuration && (
                      <span style={{ background: 'rgba(5,150,105,0.85)', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '12px' }}>
                        ⏱️ {selectedInstitutionDetail.visitDuration}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.25 }}>{selectedInstitutionDetail.name}</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#E2E8F0' }}>
                    {selectedInstitutionDetail.location} {selectedInstitutionDetail.establishedYear && `• ${selectedInstitutionDetail.establishedYear}`}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.75rem' }}>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {selectedInstitutionDetail.description}
                </p>

                {/* ─── Embedded Video Tour Player ─── */}
                {embedVideoUrl && (
                  <div style={{ marginBottom: '1.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Video size={16} color="#DC2626" />
                        <span>Interactive Campus & Laboratory Video Tour</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '0.15rem 0.55rem', borderRadius: '6px' }}>
                        Play Directly Below
                      </span>
                    </div>

                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#000',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                    }}>
                      <iframe
                        src={embedVideoUrl}
                        title={`${selectedInstitutionDetail.name} Campus Tour`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Target Faculties */}
                {selectedInstitutionDetail.targetDepartments && selectedInstitutionDetail.targetDepartments.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                      Target Academic Faculties:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedInstitutionDetail.targetDepartments.map((dept, idx) => (
                        <span key={idx} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', color: '#334155', fontWeight: 600 }}>
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accredited Workshops */}
                {selectedInstitutionDetail.specialWorkshops && selectedInstitutionDetail.specialWorkshops.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={15} color="#2563EB" />
                      <span>Accredited Labs & Masterclasses:</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                      {selectedInstitutionDetail.specialWorkshops.map((w, idx) => (
                        <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>{w.title}</span>
                            {w.duration && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '0.15rem 0.5rem', borderRadius: '5px' }}>{w.duration}</span>}
                          </div>
                          {w.focus && <p style={{ fontSize: '0.74rem', color: SLATE, margin: 0, lineHeight: 1.45 }}>{w.focus}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Learning Outcomes */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Curriculum Learning Outcomes:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                    {selectedInstitutionDetail.learningOutcomes?.map((lo, idx) => (
                      <li key={idx}>{lo}</li>
                    ))}
                  </ul>
                </div>

                {/* Document & Video Action Row */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedInstitutionDetail.brochureUrl && (
                      <a
                        href={selectedInstitutionDetail.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#F1F5F9',
                          color: '#0F172A',
                          border: '1px solid #CBD5E1',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Download size={14} />
                        <span>Download Syllabus PDF</span>
                      </a>
                    )}
                    {selectedInstitutionDetail.videoUrl && (
                      <a
                        href={selectedInstitutionDetail.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>Open Video in YouTube</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const instName = selectedInstitutionDetail.name
                      setSelectedInstitutionDetail(null)
                      setModalNotes(`Inquiring specifically for: ${instName}`)
                      setIsModalOpen(true)
                    }}
                    style={{
                      background: EMERALD,
                      color: '#FFF',
                      border: 'none',
                      padding: '0.7rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(9,62,48,0.25)'
                    }}
                  >
                    <Send size={14} />
                    <span>Inquire for Delegation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}


      {/* ─── Inquiry Modal ─── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setIsModalOpen(false)
                setSubmitSuccess(false)
              }}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ✕
            </button>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.1rem' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Proposal Request Received!
                </h3>
                <p style={{ fontSize: '0.82rem', color: SLATE, lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  Thank you. Our educational tour specialist will get in touch within 24 hours with a customized itinerary, day-by-day plan, and official budget quotation.
                </p>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setSubmitSuccess(false)
                  }}
                  style={{
                    background: EMERALD,
                    color: '#FFF',
                    border: 'none',
                    padding: '0.65rem 1.8rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase' }}>Institutional Quote</span>
                  <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0' }}>
                    Request Education Tour Proposal
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: SLATE, margin: 0 }}>
                    Fill in your institution details for a customized curriculum itinerary and group quotation.
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Target Cohort</label>
                    <select
                      value={modalCohort}
                      onChange={(e) => setModalCohort(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', background: '#F8FAFC' }}
                    >
                      <option value="School (Grades 6-12)">School (Grades 6–12 / CBSE / ICSE / IB)</option>
                      <option value="College & Engineering">College & Undergraduates (B.Tech / Science)</option>
                      <option value="MBA & Business Schools">MBA & Postgraduates (Management / FinTech)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Coordinator Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={modalName}
                        onChange={(e) => setModalName(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Institution Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DPS / IIT / B-School"
                        value={modalInstitution}
                        onChange={(e) => setModalInstitution(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Official Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@school.edu"
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={modalPhone}
                        onChange={(e) => setModalPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Estimated Students</label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={modalStudents}
                        onChange={(e) => setModalStudents(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Target Month / Year</label>
                      <input
                        type="text"
                        placeholder="e.g. October 2026"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '3px' }}>Special Requirements</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Science Centre STEM labs, SUTD design workshop, pure veg meals..."
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box', resize: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginTop: '0.35rem',
                      background: EMERALD,
                      color: '#FFF',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Proposal Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

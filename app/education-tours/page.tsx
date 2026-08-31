'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'
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
  BookOpen
} from 'lucide-react'

// Primary Colour Palette
const EMERALD = '#093E30'
const EMERALD_LIGHT = '#0F4C3A'
const AMBER = '#D97706'
const AMBER_LIGHT = '#F59E0B'
const SLATE = '#475569'
const LIGHT_BG = '#F8FAFC'

interface Institution {
  id: string
  name: string
  shortName: string
  badge: string
  badgeBg: string
  category: string
  cohorts: ('School' | 'College' | 'MBA')[]
  location: string
  image: string
  tagline: string
  description: string
  keyHighlights: string[]
  learningOutcomes: string[]
}

const INSTITUTIONS: Institution[] = [
  {
    id: 'science-centre',
    name: 'Singapore Science Centre & Omni-Theatre',
    shortName: 'Science Centre',
    badge: 'Interactive STEM',
    badgeBg: '#2563EB',
    category: 'Science & STEM',
    cohorts: ['School', 'College'],
    location: 'Jurong East, Singapore',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    tagline: 'World-class interactive science labs, Omni-Theatre planetarium & future AI exhibits.',
    description: 'Home to over 1,000 interactive exhibits across 14 galleries. Students engage in experiential physics, molecular gastronomy, space astronomy at the Southeast Asia premiere 8K Digital Omni-Theatre, and hands-on robotics workshops.',
    keyHighlights: [
      'Omni-Theatre 8K fulldome space & climate immersion',
      'DNA Learning Lab & Molecular Biology experiments',
      'Kinetic Garden & Waterworks physics playground',
      'Climate Change & AI Future Technology Gallery'
    ],
    learningOutcomes: [
      'Deepen conceptual physics and environmental chemistry principles',
      'Understand practical automation and artificial intelligence workflows',
      'Active STEM problem-solving in accredited educational laboratories'
    ]
  },
  {
    id: 'discovery-centre',
    name: 'Singapore Discovery Centre',
    shortName: 'Discovery Centre',
    badge: 'National Resilience',
    badgeBg: '#D97706',
    category: 'National Defense & Media',
    cohorts: ['School', 'College', 'MBA'],
    location: 'Upper Jurong Road, Singapore',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    tagline: 'Crisis management simulations, digital media broadcasting, and nation-building story.',
    description: 'An interactive center celebrating Singapore’s transition from a third-world colony to a first-world metropolis. Features dynamic AR simulations, state-of-the-art crisis communication studios, and cross-cultural leadership labs.',
    keyHighlights: [
      'Through the Lens of Time: Immersive Singapore History AR',
      'Crisis Simulation & Leadership Escape Room labs',
      'Digital Broadcasting & Media Production studios',
      'Cross-cultural military defense & resilience insights'
    ],
    learningOutcomes: [
      'Analyze public governance, strategic leadership, and crisis management',
      'Understand national security policy and strategic resource planning',
      'Develop media literacy and team problem-solving under pressure'
    ]
  },
  {
    id: 'marina-barrage',
    name: 'Marina Barrage & Sustainable Singapore Gallery',
    shortName: 'Marina Barrage',
    badge: 'Sustainability & Water Tech',
    badgeBg: '#0D9488',
    category: 'Sustainability & Water Tech',
    cohorts: ['School', 'College', 'MBA'],
    location: 'Marina South, Singapore',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    tagline: 'Civil engineering marvel managing water supply, flood control & solar green energy.',
    description: 'Built across the mouth of the 350-metre wide Marina Channel, this multi-award-winning reservoir project embodies Singapore’s world-leading water security vision. Students tour the 9 crest gates, pump house, and the Sustainable Singapore Gallery.',
    keyHighlights: [
      'Sustainable Singapore Gallery: 6 interactive eco-zones',
      'Live crest gates & flood alleviation pump mechanics',
      'Solar Park generating clean energy for the barrage',
      'Closed-loop urban water catchment engineering'
    ],
    learningOutcomes: [
      'Examine circular water economy models and flood mitigation engineering',
      'Study urban sustainability planning and UN SDG integration',
      'Understand climate resilience strategies for coastal megacities'
    ]
  },
  {
    id: 'sutd',
    name: 'Singapore University of Technology and Design (SUTD)',
    shortName: 'SUTD',
    badge: 'Design & MIT Collaboration',
    badgeBg: '#7C3AED',
    category: 'Tech & Design',
    cohorts: ['College', 'MBA'],
    location: 'Upper Changi, Singapore',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    tagline: 'MIT-partnered campus driving human-centric design, FabLab 3D prototyping & IoT robotics.',
    description: 'Established in collaboration with the Massachusetts Institute of Technology (MIT), SUTD pioneers multidisciplinary curriculum combining architecture, engineering systems, and artificial intelligence. Students experience the sprawling FabLab and autonomous robotics testbeds.',
    keyHighlights: [
      'FabLab: High-precision laser cutting & 3D additive manufacturing',
      'Architecture & Sustainable Design (ASD) showcases',
      'Engineering Product Development (EPD) robotic workshops',
      'MIT-SUTD Dual Degree and research collaboration insights'
    ],
    learningOutcomes: [
      'Master Design Thinking methodologies for real-world engineering',
      'Explore cutting-edge additive manufacturing and smart prototyping',
      'Gain direct exposure to world-class university admissions criteria'
    ]
  },
  {
    id: 'smu',
    name: 'Singapore Management University (SMU)',
    shortName: 'SMU',
    badge: 'City-Campus Business Hub',
    badgeBg: '#DC2626',
    category: 'Business & FinTech',
    cohorts: ['College', 'MBA'],
    location: 'Bras Basah, Downtown Singapore',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    tagline: 'Downtown interactive seminar pedagogy, FinTech hubs & Asian business leadership.',
    description: 'Strategically located in Singapore’s arts and financial district, SMU models its seminar-style interactive learning on the Wharton School (UPenn). Tour state-of-the-art trading rooms, incubation labs, and join masterclasses on Asian business dynamics.',
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
    ]
  },
  {
    id: 'ntu',
    name: 'Nanyang Technological University (NTU)',
    shortName: 'NTU',
    badge: 'Global Top-15 Tech University',
    badgeBg: '#0284C7',
    category: 'Tech & Design',
    cohorts: ['College', 'MBA', 'School'],
    location: 'Jurong West, Singapore',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    tagline: 'World-renowned eco-campus, "The Hive" learning hub & frontier aerospace research.',
    description: 'Consistently ranked among the world’s top 15 universities, NTU’s 200-hectare smart campus is a living testbed for green building tech, autonomous vehicles, and satellite aerospace development. Walk the iconic "Hive" designed by Thomas Heatherwick.',
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
    ]
  },
  {
    id: 'nus',
    name: 'National University of Singapore (NUS)',
    shortName: 'NUS',
    badge: 'Global Top-10 World University',
    badgeBg: '#EA580C',
    category: 'Global Top University',
    cohorts: ['School', 'College', 'MBA'],
    location: 'Kent Ridge, Singapore',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    tagline: 'Asia’s premier university campus, BLOCK71 startup ecosystem & world-class research.',
    description: 'Ranked #8 globally (QS World Rankings), NUS is Singapore’s flagship institution. Students tour University Town (UTown), visit the NUS Enterprise startup hub BLOCK71, explore biomedical science clusters, and participate in academic briefings.',
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
    ]
  }
]

interface Itinerary {
  id: string
  title: string
  targetCohort: 'School (Grades 6–12)' | 'College & Engineering' | 'MBA & Business Schools'
  duration: string
  badge: string
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
    icon: <Cpu size={28} color="#2563EB" />,
    title: 'STEM, Robotics & AI',
    description: 'Hands-on programming, molecular biology labs at Singapore Science Centre, and drone/robotics automation testbeds.',
    bg: '#EFF6FF',
    border: '#BFDBFE'
  },
  {
    icon: <Globe size={28} color="#0D9488" />,
    title: 'Sustainability & Circular Economy',
    description: 'Closed-loop water reclamation (NEWater), Marina Barrage flood control engineering, and zero-carbon building designs.',
    bg: '#F0FDFA',
    border: '#99F6E4'
  },
  {
    icon: <Building2 size={28} color="#D97706" />,
    title: 'Smart Nation Urban Engineering',
    description: 'Autonomous vehicle testbeds, URA 3D spatial planning, green infrastructure, and high-density transit integration.',
    bg: '#FFFBEB',
    border: '#FDE68A'
  },
  {
    icon: <TrendingUp size={28} color="#7C3AED" />,
    title: 'Global Trade & Logistics Hubs',
    description: 'Tuas Mega Port automation, automated logistics warehousing, and Changi airfreight multimodal supply chains.',
    bg: '#FAF5FF',
    border: '#E9D5FF'
  },
  {
    icon: <GraduationCap size={28} color="#E11D48" />,
    title: 'Top University & Design Immersions',
    description: 'Campus masterclasses at NUS (#8 World), NTU (#15 World), SUTD (MIT-partnered) and SMU business schools.',
    bg: '#FFF1F2',
    border: '#FECDD3'
  }
]

const FAQS = [
  {
    q: 'How many complimentary slots do teachers or chaperones receive?',
    a: 'For all our educational tour cohorts, Flying Wonders provides 1 complimentary chaperone package (twin-sharing accommodation, all meals, admissions, and coach travel) for every 10 paying students (1:10 ratio).'
  },
  {
    q: 'Can itineraries be customized to match specific school curriculums (IB, CBSE, IGCSE, B.Tech)?',
    a: 'Yes, absolutely. We tailor daily workshops, laboratory sessions, and guided walkthroughs to align precisely with specific syllabus learning outcomes (e.g. IB Environmental Systems, CBSE Physics, B.Tech IoT/Robotics, or MBA FinTech).'
  },
  {
    q: 'What safety and emergency protocols are in place in Singapore?',
    a: 'Singapore is universally recognized as the world’s safest country for student travel. Flying Wonders provides 24/7 dedicated on-ground tour managers, comprehensive student travel medical & emergency evacuation insurance, certified English/Hindi/regional guides, and direct hospital network partnerships.'
  },
  {
    q: 'Do you cater to dietary requirements like Halal, Pure Vegetarian, and Jain meals?',
    a: 'Yes. All student group meal itineraries are fully customized with certified Halal, Pure Vegetarian, Vegan, or Jain meal options prepared by licensed food partners throughout Singapore.'
  },
  {
    q: 'What is the booking lead time and payment schedule for school delegations?',
    a: 'We recommend initiating planning 6 to 12 weeks prior to departure to secure university lab slots, flight blocks, and hotel room allotments. Payment terms typically include a booking deposit with balance structured in milestones prior to departure.'
  }
]

export default function EducationToursPage() {
  const [sanitySettings, setSanitySettings] = useState<any>(null)
  const [selectedCohort, setSelectedCohort] = useState<'All' | 'School' | 'College' | 'MBA'>('All')
  const [activeItineraryId, setActiveItineraryId] = useState<string>('school-stem')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  useEffect(() => {
    client
      .fetch(`*[_type == "educationToursSettings"][0]`)
      .then((res) => {
        if (res) setSanitySettings(res)
      })
      .catch(() => {})
  }, [])

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

  // Dynamic Institutions List
  const institutionsList = useMemo(() => {
    if (sanitySettings?.institutions && Array.isArray(sanitySettings.institutions) && sanitySettings.institutions.length > 0) {
      return sanitySettings.institutions.map((inst: any, idx: number) => ({
        id: inst.id || `inst-${idx}`,
        name: inst.name || '',
        shortName: inst.shortName || inst.name || '',
        badge: inst.badge || 'Academic Lab',
        badgeBg: inst.badgeBg || '#2563EB',
        category: inst.category || 'General',
        cohorts: inst.cohorts || ['School', 'College', 'MBA'],
        location: inst.location || 'Singapore',
        image: inst.imageUrl || INSTITUTIONS[idx % INSTITUTIONS.length].image,
        tagline: inst.tagline || '',
        description: inst.description || '',
        keyHighlights: inst.keyHighlights || [],
        learningOutcomes: inst.learningOutcomes || []
      }))
    }
    return INSTITUTIONS
  }, [sanitySettings])

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    if (selectedCohort === 'All') return institutionsList
    return institutionsList.filter((inst: any) => inst.cohorts?.includes(selectedCohort as any))
  }, [selectedCohort, institutionsList])

  // Dynamic Itineraries List
  const itinerariesList = useMemo(() => {
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modalName,
          email: modalEmail,
          phone: modalPhone,
          tier: 'education',
          travelers: parseInt(modalStudents) || 30,
          travelDate: modalDate,
          notes: `[Education Tour Inquiry]\nInstitution: ${modalInstitution}\nCohort: ${modalCohort}\nDuration: ${durationDays} Days\nNotes: ${modalNotes}`,
          totalPrice: estimatedSgdPerStudent * (parseInt(modalStudents) || 30)
        })
      })

      if (response.ok) {
        setSubmitSuccess(true)
      } else {
        window.open(
          `https://wa.me/6583048408?text=${encodeURIComponent(
            `Hi Flying Wonders, I want to inquire about a Singapore Education Tour for ${modalInstitution} (${modalCohort}, ~${modalStudents} students, ${modalDate}).`
          )}`,
          '_blank'
        )
        setSubmitSuccess(true)
      }
    } catch (err) {
      window.open(
        `https://wa.me/6583048408?text=${encodeURIComponent(
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
      <div style={{ background: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0.6rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: SLATE }}>
          <Link href="/" style={{ color: SLATE, textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={13} />
          <Link href="/services-catalog" style={{ color: SLATE, textDecoration: 'none' }}>Services</Link>
          <ChevronRight size={13} />
          <span style={{ color: EMERALD, fontWeight: 700 }}>Education Tours Singapore</span>
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <section style={{
        background: 'linear-gradient(140deg, #05241B 0%, #093E30 45%, #0B2545 100%)',
        color: '#FFF',
        padding: 'clamp(3.5rem, 7vw, 6rem) 1.5rem clamp(4.5rem, 9vw, 7.5rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Grid Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Top Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.35rem 1rem', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1.5rem', backdropFilter: 'blur(8px)' }}>
            <Sparkles size={15} color="#F59E0B" />
            <span>{sanitySettings?.heroBadge || 'Singapore: The World’s Safest Live Classroom • K-12, College & MBA'}</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.01em'
          }}>
            {sanitySettings?.heroTitle ? (
              sanitySettings.heroTitle
            ) : (
              <>
                Singapore Educational Tours<br />
                <span style={{ color: AMBER_LIGHT }}>& Academic Immersions</span>
              </>
            )}
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.12rem)',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '2rem',
            lineHeight: 1.65,
            maxWidth: '750px',
            margin: '0 auto 2rem'
          }}>
            {sanitySettings?.heroSubtitle || (
              <>Experiential study circuits curated for <strong>Schools (K–12)</strong>, <strong>Engineering Colleges</strong>, and <strong>MBA Business Schools</strong>. Explore world-class innovation labs, sustainable engineering marvels, and top global university campuses.</>
            )}
          </p>

          {/* CTA Group */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: AMBER_LIGHT,
                color: '#1E293B',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(245,158,11,0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
            >
              <span>Request Custom Proposal</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#institutions"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '0.85rem 1.8rem',
                borderRadius: '30px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Compass size={18} color="#6EE7B7" />
              <span>Explore 7 Partner Institutions</span>
            </a>

            <a
              href="#estimator"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.18)',
                padding: '0.85rem 1.8rem',
                borderRadius: '30px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                backdropFilter: 'blur(8px)'
              }}
            >
              <DollarSign size={18} color="#FBBF24" />
              <span>Calculate Group Cost</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Floating Trust Stats Bar ─── */}
      <section style={{ maxWidth: '1150px', margin: '-3.2rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFF',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>75+ Cohorts</div>
              <div style={{ fontSize: '0.75rem', color: SLATE }}>Facilitated since 2018</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>1:10 Free Chaperone</div>
              <div style={{ fontSize: '0.75rem', color: SLATE }}>100% Free teacher slots</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>100% Verified Safety</div>
              <div style={{ fontSize: '0.75rem', color: SLATE }}>Medical & evacuation cover</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>7 Top Institutions</div>
              <div style={{ fontSize: '0.75rem', color: SLATE }}>Science, Tech & Universities</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5 Learning Pillars ─── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Academic Excellence</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Core Educational Learning Pillars
          </h2>
          <p style={{ color: SLATE, fontSize: '0.95rem', maxWidth: '680px', margin: '0 auto' }}>
            Every circuit is structured around Singapore’s national strengths—integrating hands-on STEM discovery, urban ecology, smart port logistics, and world-class higher education.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem'
        }}>
          {LEARNING_PILLARS.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div>{p.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{p.title}</h3>
              <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured 7 Institutions ─── */}
      <section id="institutions" style={{ background: '#FFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Destination Masterclasses</span>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                Featured 7 Institutions & Hubs
              </h2>
              <p style={{ color: SLATE, fontSize: '0.95rem', maxWidth: '650px', margin: 0 }}>
                Direct access, guided laboratory workshops, and faculty briefings across Singapore’s iconic centers of science, sustainability, and higher education.
              </p>
            </div>

            {/* Cohort Tabs */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.35rem', borderRadius: '12px', gap: '4px' }}>
              {(['All', 'School', 'College', 'MBA'] as const).map((cohort) => (
                <button
                  key={cohort}
                  onClick={() => setSelectedCohort(cohort)}
                  style={{
                    border: 'none',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
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
            gap: '2rem'
          }}>
            {filteredInstitutions.map((inst: any) => (
              <div
                key={inst.id}
                style={{
                  background: '#FFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Photo & Badge */}
                <div style={{ position: 'relative', height: '200px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={inst.image}
                    alt={inst.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
                  }} />
                  
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: inst.badgeBg,
                    color: '#FFF',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    {inst.badge}
                  </span>

                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', color: '#FFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#FCD34D', marginBottom: '2px' }}>
                      <MapPin size={12} />
                      <span>{inst.location}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.3 }}>{inst.name}</h3>
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Cohort tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: SLATE }}>Cohorts:</span>
                      {inst.cohorts?.map((c: any) => (
                        <span key={c} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#334155' }}>
                          {c}
                        </span>
                      ))}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: SLATE, lineHeight: 1.6, marginBottom: '1rem' }}>
                      {inst.description}
                    </p>

                    {/* Key Highlights list */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} color="#059669" />
                        <span>Key Highlights:</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.55 }}>
                        {inst.keyHighlights?.slice(0, 3).map((kh: any, i: number) => (
                          <li key={i}>{kh}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                      Guided Lab & Workshop Included
                    </span>
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
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Inquire</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Curated Itinerary Matrix ─── */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customizable Study Circuits</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Curated Day-by-Day Study Itineraries
          </h2>
          <p style={{ color: SLATE, fontSize: '0.95rem', maxWidth: '680px', margin: '0 auto' }}>
            Choose your student cohort to preview comprehensive day-by-day schedules, laboratory workshops, and verified learning outcomes.
          </p>
        </div>

        {/* Itinerary Selectors */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {ITINERARIES.map((it) => (
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
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeItineraryId === it.id ? '0 4px 12px rgba(9,62,48,0.25)' : 'none'
              }}
            >
              <GraduationCap size={16} />
              <span>{it.targetCohort}</span>
              <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({it.duration})</span>
            </button>
          ))}
        </div>

        {/* Active Itinerary Box */}
        <div style={{
          background: '#FFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.75rem', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-block', marginBottom: '0.5rem' }}>
                {activeItinerary.badge}
              </span>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {activeItinerary.title}
              </h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: SLATE, marginTop: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {activeItinerary.duration}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {activeItinerary.targetCohort}</span>
              </div>
            </div>

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
                padding: '0.75rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(9,62,48,0.25)'
              }}
            >
              <Send size={15} />
              <span>Book This Circuit</span>
            </button>
          </div>

          {/* Highlights */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
              Circuit Inclusions:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {activeItinerary.highlights?.map((h: any, i: number) => (
                <span key={i} style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#059669" />
                  <span>{h}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Day By Day Accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activeItinerary.days?.map((d: any) => {
              const isExpanded = expandedDay === d.day
              return (
                <div
                  key={d.day}
                  style={{
                    border: `1px solid ${isExpanded ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: isExpanded ? '#F0FDF4' : '#FFF',
                    transition: 'all 0.15s'
                  }}
                >
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : d.day)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: EMERALD, color: '#FFF', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        D{d.day}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Day 0{d.day}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{d.title}</div>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp size={18} color={SLATE} /> : <ChevronDown size={18} color={SLATE} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginTop: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#FFF', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D97706', display: 'block', marginBottom: '0.25rem' }}>🌅 Morning Schedule</span>
                          <p style={{ fontSize: '0.78rem', color: SLATE, margin: 0, lineHeight: 1.55 }}>{d.morning}</p>
                        </div>
                        <div style={{ background: '#FFF', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563EB', display: 'block', marginBottom: '0.25rem' }}>☀️ Afternoon Immersion</span>
                          <p style={{ fontSize: '0.78rem', color: SLATE, margin: 0, lineHeight: 1.55 }}>{d.afternoon}</p>
                        </div>
                        <div style={{ background: '#FFF', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', display: 'block', marginBottom: '0.25rem' }}>🌙 Evening Debrief & Dinner</span>
                          <p style={{ fontSize: '0.78rem', color: SLATE, margin: 0, lineHeight: 1.55 }}>{d.evening}</p>
                        </div>
                      </div>

                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem' }}>
                        <Lightbulb size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
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
      <section id="estimator" style={{ background: '#FFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Budgeting & Transparency</span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
              Interactive Group Cost Estimator
            </h2>
            <p style={{ color: SLATE, fontSize: '0.95rem', maxWidth: '680px', margin: '0 auto' }}>
              Estimate complete per-student tour packages—including laboratory admissions, private coach transfers, 3 meals daily, travel medical insurance, and complimentary chaperone slots.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            
            {/* Estimator Controls */}
            <div style={{ background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '2rem' }}>
              {/* Slider 1: Students */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#059669" />
                    <span>Number of Students:</span>
                  </label>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: EMERALD, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.2rem 0.75rem', borderRadius: '8px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: SLATE, marginTop: '4px' }}>
                  <span>15 Min Cohort</span>
                  <span>75 Mid-Size</span>
                  <span>150 Mega Group</span>
                </div>
              </div>

              {/* Slider 2: Duration */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#D97706" />
                    <span>Tour Duration (Days):</span>
                  </label>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.2rem 0.75rem', borderRadius: '8px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: SLATE, marginTop: '4px' }}>
                  <span>3 Days Express</span>
                  <span>5 Days Standard</span>
                  <span>7 Days Comprehensive</span>
                </div>
              </div>

              {/* Accommodation Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.6rem' }}>
                  Accommodation Category:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
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
                        borderRadius: '10px',
                        padding: '0.65rem 0.5rem',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: hotelTier === tier.id ? EMERALD : '#0F172A' }}>{tier.name}</div>
                      <div style={{ fontSize: '0.68rem', color: SLATE, marginTop: '2px' }}>{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chaperone Callout */}
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <Users size={18} color="#059669" style={{ flexShrink: 0 }} />
                <span style={{ color: '#065F46' }}>
                  For <strong>{studentCount} students</strong>, you receive <strong>{chaperoneCount} complimentary teacher slots</strong> (100% free flight & tour assistance).
                </span>
              </div>
            </div>

            {/* Estimator Summary Card */}
            <div style={{
              background: 'linear-gradient(145deg, #062B21 0%, #093E30 60%, #0A1C30 100%)',
              color: '#FFF',
              borderRadius: '24px',
              padding: '2.2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6EE7B7' }}>
                Estimated Total Investment
              </span>
              <div style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>SGD ~{estimatedSgdPerStudent}</span>
                  <span style={{ color: '#A7F3D0', fontSize: '0.85rem' }}>/ student</span>
                </div>
                <div style={{ fontSize: '1rem', color: '#FCD34D', marginTop: '0.4rem', fontWeight: 700 }}>
                  Approx. INR ₹{estimatedInrPerStudent.toLocaleString('en-IN')} per student
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#6EE7B7" /> Accommodation ({hotelTier.toUpperCase()})</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>{durationDays - 1} Nights</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#6EE7B7" /> Dedicated Private AC Coach</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Full-Day Transfers</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#6EE7B7" /> All 7 Institution Admissions</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Lab Passes Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#6EE7B7" /> 3 Daily Meals (Halal/Veg/Jain)</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Breakfast, Lunch, Dinner</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#6EE7B7" /> Student Medical Travel Insurance</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Included (SGD 50K Cover)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#FCD34D" /> Free Teacher Chaperones</span>
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
                  marginTop: '2rem',
                  padding: '0.95rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: AMBER_LIGHT,
                  color: '#1E293B',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 6px 18px rgba(245,158,11,0.4)'
                }}
              >
                <span>Lock In This Estimated Quote</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQs ─── */}
      <section style={{ maxWidth: '850px', margin: '5rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coordinator Help Center</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {faqsList.map((faq: any, idx: number) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                style={{
                  background: '#FFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  <span>{faq.q}</span>
                  <span>{isOpen ? <ChevronUp size={18} color={SLATE} /> : <ChevronDown size={18} color={SLATE} />}</span>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 1.2rem 1.2rem', fontSize: '0.82rem', color: SLATE, lineHeight: 1.6, borderTop: '1px solid #F1F5F9' }}>
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
        padding: '5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ready To Plan?</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem' }}>
            Empower Your Students with an Unforgettable Singapore Educational Tour
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Let our educational specialists build a tailored curriculum circuit for your school, college, or MBA institution with verified safety protocols and competitive group rates.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: AMBER_LIGHT,
                color: '#1E293B',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(245,158,11,0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              <span>Request Institutional Proposal</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="https://wa.me/6583048408?text=Hi%20Flying%20Wonders%2C%20I%20am%20interested%20in%20organizing%20a%20Singapore%20Educational%20Tour%20for%20our%20institution."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '0.85rem 1.8rem',
                borderRadius: '30px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                backdropFilter: 'blur(8px)'
              }}
            >
              <MessageCircle size={18} color="#6EE7B7" />
              <span>Instant WhatsApp Consultation</span>
            </a>
          </div>
        </div>
      </section>

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
            padding: '2rem',
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
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ✕
            </button>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Proposal Request Received!
                </h3>
                <p style={{ fontSize: '0.85rem', color: SLATE, lineHeight: 1.6, marginBottom: '1.5rem' }}>
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
                    padding: '0.75rem 2rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: EMERALD, textTransform: 'uppercase' }}>Institutional Quote</span>
                  <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0' }}>
                    Request Education Tour Proposal
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: SLATE, margin: 0 }}>
                    Fill in your institution details for a customized curriculum itinerary and group quotation.
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Target Cohort</label>
                    <select
                      value={modalCohort}
                      onChange={(e) => setModalCohort(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: '#F8FAFC' }}
                    >
                      <option value="School (Grades 6-12)">School (Grades 6–12 / CBSE / ICSE / IB)</option>
                      <option value="College & Engineering">College & Undergraduates (B.Tech / Science)</option>
                      <option value="MBA & Business Schools">MBA & Postgraduates (Management / FinTech)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Coordinator Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={modalName}
                        onChange={(e) => setModalName(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Institution Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DPS / IIT / B-School"
                        value={modalInstitution}
                        onChange={(e) => setModalInstitution(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Official Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@school.edu"
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={modalPhone}
                        onChange={(e) => setModalPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Estimated Students</label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={modalStudents}
                        onChange={(e) => setModalStudents(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Target Month / Year</label>
                      <input
                        type="text"
                        placeholder="e.g. October 2026"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Special Requirements</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Science Centre STEM labs, SUTD design workshop, pure veg meals..."
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box', resize: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginTop: '0.5rem',
                      background: EMERALD,
                      color: '#FFF',
                      border: 'none',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
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


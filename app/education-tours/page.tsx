'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  ShieldCheck,
  Star,
  ArrowRight,
  Users,
  Building2,
  Lightbulb,
  Briefcase,
  Compass,
  Cpu,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  MapPin,
  HelpCircle,
  MessageCircle,
  PhoneCall,
  Send,
  Loader2,
  Check,
  Info,
  DollarSign,
  TrendingUp,
  FileCheck2,
  Layers
} from 'lucide-react'

interface Institution {
  id: string
  name: string
  shortName: string
  badge: string
  badgeColor: string
  category: 'Science & STEM' | 'National Defense & Media' | 'Sustainability & Water Tech' | 'Tech & Design' | 'Business & FinTech' | 'Global Top University'
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
    badgeColor: '#2563EB',
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
    badgeColor: '#D97706',
    category: 'National Defense & Media',
    cohorts: ['School', 'College', 'MBA'],
    location: 'Upper Jurong Road, Singapore',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    tagline: 'Crisis management simulations, digital media broadcasting, and nation-building story.',
    description: 'An interactive center celebrating Singapore’s inspiring transition from a third-world colony to a first-world metropolis. Features dynamic AR simulations, state-of-the-art crisis communication studios, and cross-cultural leadership labs.',
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
    badgeColor: '#0D9488',
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
    badgeColor: '#7C3AED',
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
    badgeColor: '#DC2626',
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
    badgeColor: '#0284C7',
    category: 'Tech & Design',
    cohorts: ['College', 'MBA', 'School'],
    location: 'Jurong West, Singapore',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    tagline: 'World-renowned eco-campus, "The Hive" learning hub & frontier aerospace research.',
    description: 'Consistently ranked among the world’s top 15 universities, NTU’s 200-hectare smart campus is a living testbed for green building tech, autonomous vehicles, and satellite aerospace development. Walk the iconic "Hive" (Learning Hub) designed by Thomas Heatherwick.',
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
    badgeColor: '#EA580C',
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
    icon: <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    title: 'STEM, Robotics & AI',
    description: 'Hands-on programming, molecular biology labs at Singapore Science Centre, and drone/robotics automation testbeds.',
    color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
  },
  {
    icon: <Globe className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
    title: 'Sustainability & Circular Economy',
    description: 'Closed-loop water reclamation (NEWater), Marina Barrage flood control engineering, and zero-carbon building designs.',
    color: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800'
  },
  {
    icon: <Building2 className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'Smart Nation Urban Engineering',
    description: 'Autonomous vehicle testbeds, URA 3D spatial planning, green infrastructure, and high-density transit integration.',
    color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
    title: 'Global Trade & Logistics Hubs',
    description: 'Tuas Mega Port automation, automated logistics warehousing, and Changi airfreight multimodal supply chains.',
    color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
  },
  {
    icon: <GraduationCap className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
    title: 'Top University & Design Immersions',
    description: 'Campus masterclasses at NUS (#8 World), NTU (#15 World), SUTD (MIT-partnered) and SMU business schools.',
    color: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
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
  const [selectedCohort, setSelectedCohort] = useState<'All' | 'School' | 'College' | 'MBA'>('All')
  const [activeItineraryId, setActiveItineraryId] = useState<string>('school-stem')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

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

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    if (selectedCohort === 'All') return INSTITUTIONS
    return INSTITUTIONS.filter((inst) => inst.cohorts.includes(selectedCohort as any))
  }, [selectedCohort])

  // Active Itinerary
  const activeItinerary = useMemo(() => {
    return ITINERARIES.find((it) => it.id === activeItineraryId) || ITINERARIES[0]
  }, [activeItineraryId])

  // Estimator Calculations
  const chaperoneCount = Math.floor(studentCount / 10)
  const baseRatePerDay = hotelTier === 'budget' ? 115 : hotelTier === 'standard' ? 145 : 185
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
        // Fallback open WhatsApp
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'Flying Wonders Educational Tours Singapore',
            url: 'https://flyingwonders.net/education-tours',
            description: 'Singapore Educational Tours for Schools, Colleges, and MBA Business Schools covering Science Centre, Discovery Centre, Marina Barrage, SUTD, SMU, NTU, and NUS.',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'SG'
            },
            offers: {
              '@type': 'Offer',
              category: 'Student Study Tours',
              priceCurrency: 'SGD'
            }
          })
        }}
      />

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--border-color)] bg-gradient-to-b from-emerald-950/10 via-[var(--bg-main)] to-[var(--bg-main)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 mb-6 border border-emerald-300 dark:border-emerald-700/50 shadow-sm">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span>Singapore: The World’s Safest Live Classroom</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-serif text-[var(--text-primary)]">
              Singapore <span className="text-emerald-700 dark:text-emerald-400">Educational Tours</span> & Campus Immersions
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-8 max-w-3xl mx-auto">
              Curated experiential study tours for <strong>Schools (K–12)</strong>, <strong>Engineering Colleges</strong>, and <strong>MBA Business Schools</strong>. Explore world-class innovation labs, sustainable engineering marvels, and top global university campuses.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-7 py-3.5 rounded-xl font-semibold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <span>Request Custom Proposal</span>
                <ArrowRight size={18} />
              </button>

              <a
                href="#institutions"
                className="px-7 py-3.5 rounded-xl font-semibold border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              >
                <Compass size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Explore 7 Partner Institutions</span>
              </a>

              <a
                href="#estimator"
                className="px-7 py-3.5 rounded-xl font-semibold border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              >
                <DollarSign size={18} className="text-amber-500" />
                <span>Calculate Group Cost</span>
              </a>
            </div>

            {/* Key Trust Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm text-left">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">75+ Cohorts</div>
                  <div className="text-xs text-[var(--text-secondary)]">Facilitated since 2018</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Users size={22} />
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">1:10 Free Chaperone</div>
                  <div className="text-xs text-[var(--text-secondary)]">Complimentary teacher ratio</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">100% Verified Safety</div>
                  <div className="text-xs text-[var(--text-secondary)]">Medical & evacuation cover</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">7 Top Institutions</div>
                  <div className="text-xs text-[var(--text-secondary)]">Science, tech & universities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Learning Pillars Section ─── */}
      <section className="py-16 border-b border-[var(--border-color)] bg-[var(--card-bg)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Academic Excellence</span>
            <h2 className="text-3xl font-bold font-serif mt-2 mb-4 text-[var(--text-primary)]">
              Core Educational Learning Pillars
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Every itinerary is structured around Singapore’s national strengths—integrating STEM discovery, urban ecology, autonomous logistics, and world-class higher education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {LEARNING_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${pillar.color}`}
              >
                <div className="mb-4">{pillar.icon}</div>
                <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">{pillar.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured 7 Institutions Section ─── */}
      <section id="institutions" className="py-20 border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Destination Masterclasses</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif mt-2 text-[var(--text-primary)]">
                Featured 7 Institutions & Hubs
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2 max-w-2xl">
                Direct access, guided laboratory workshops, and faculty briefings across Singapore’s iconic centers of science, sustainability, and higher education.
              </p>
            </div>

            {/* Cohort Filter Buttons */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] self-start md:self-end">
              {(['All', 'School', 'College', 'MBA'] as const).map((cohort) => (
                <button
                  key={cohort}
                  onClick={() => setSelectedCohort(cohort)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    selectedCohort === cohort
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {cohort === 'All' ? 'All Institutions' : `${cohort} Tours`}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInstitutions.map((inst) => (
              <div
                key={inst.id}
                className="group flex flex-col rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Image */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={inst.image}
                    alt={inst.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow"
                      style={{ backgroundColor: inst.badgeColor }}
                    >
                      {inst.badge}
                    </span>
                  </div>

                  {/* Location & Name Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-slate-200 mb-1">
                      <MapPin size={12} className="text-amber-400" />
                      <span>{inst.location}</span>
                    </div>
                    <h3 className="text-lg font-bold leading-snug">{inst.name}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Cohort tags */}
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Cohorts:</span>
                      {inst.cohorts.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] border border-[var(--border-color)]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                      {inst.description}
                    </p>

                    {/* Key Highlights */}
                    <div className="mb-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Key Highlights</span>
                      </div>
                      <ul className="space-y-1.5">
                        {inst.keyHighlights.slice(0, 3).map((item, i) => (
                          <li key={i} className="text-[11px] text-[var(--text-secondary)] flex items-start gap-1.5">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-4 border-t border-[var(--border-color)] mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Guided Lab & Tour Included
                    </span>
                    <button
                      onClick={() => {
                        setModalNotes(`Interested in institution: ${inst.name}`)
                        setIsModalOpen(true)
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1"
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

      {/* ─── Curated Itinerary Matrix Section ─── */}
      <section className="py-20 border-b border-[var(--border-color)] bg-[var(--card-bg)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Customizable Study Circuits</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mt-2 mb-4 text-[var(--text-primary)]">
              Curated Day-by-Day Study Itineraries
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Select your academic focus to preview day-by-day itineraries, learning outcomes, and field visits.
            </p>
          </div>

          {/* Itinerary Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {ITINERARIES.map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  setActiveItineraryId(it.id)
                  setExpandedDay(1)
                }}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                  activeItineraryId === it.id
                    ? 'bg-emerald-700 text-white dark:bg-emerald-600 border-emerald-600 shadow-md'
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <GraduationCap size={16} />
                <span>{it.targetCohort}</span>
                <span className="text-[11px] opacity-80">({it.duration})</span>
              </button>
            ))}
          </div>

          {/* Active Itinerary Content Card */}
          <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-8 border-b border-[var(--border-color)] gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 mb-2">
                  {activeItinerary.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--text-primary)]">
                  {activeItinerary.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Clock size={14} /> {activeItinerary.duration}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users size={14} /> Cohort: {activeItinerary.targetCohort}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setModalCohort(activeItinerary.targetCohort)
                  setModalNotes(`Inquiring about circuit: ${activeItinerary.title}`)
                  setIsModalOpen(true)
                }}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 transition-all text-xs sm:text-sm flex items-center gap-2 self-start lg:self-center shadow"
              >
                <Send size={15} />
                <span>Book This Circuit</span>
              </button>
            </div>

            {/* Key Highlights Pill Row */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
                Circuit Highlights Included:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeItinerary.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Day by Day Accordion */}
            <div className="space-y-4">
              {activeItinerary.days.map((d) => {
                const isExpanded = expandedDay === d.day
                return (
                  <div
                    key={d.day}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-[var(--border-color)] bg-[var(--bg-main)]'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : d.day)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow">
                          D{d.day}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Day 0{d.day}
                          </div>
                          <div className="text-base font-bold text-[var(--text-primary)]">
                            {d.title}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-6 pt-2 border-t border-[var(--border-color)]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs">
                          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
                            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">🌅 Morning Schedule</span>
                            <p className="text-[var(--text-secondary)]">{d.morning}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
                            <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">☀️ Afternoon Immersion</span>
                            <p className="text-[var(--text-secondary)]">{d.afternoon}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
                            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">🌙 Evening Debrief & Dinner</span>
                            <p className="text-[var(--text-secondary)]">{d.evening}</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-800 text-xs flex items-start gap-2">
                          <Lightbulb size={16} className="text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-200">Core Learning Outcome: </span>
                            <span className="text-emerald-800 dark:text-emerald-300">{d.learningOutcome}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Estimator Section ─── */}
      <section id="estimator" className="py-20 border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Budgeting & Transparency</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mt-2 mb-4 text-[var(--text-primary)]">
              Interactive Group Cost Estimator
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Calculate realistic per-student package estimates, including admissions, private coach transfers, meals, insurance, and complimentary chaperone slots.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Estimator Controls (7 cols) */}
            <div className="lg:col-span-7 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Student Count Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Number of Students:</span>
                  </label>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
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
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-[var(--text-secondary)] mt-1">
                  <span>15 Min Cohort</span>
                  <span>75 Mid-Size</span>
                  <span>150 Mega Group</span>
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <span>Tour Duration (Days):</span>
                  </label>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
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
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-[var(--text-secondary)] mt-1">
                  <span>3 Days (Express)</span>
                  <span>5 Days (Standard)</span>
                  <span>7 Days (Comprehensive)</span>
                </div>
              </div>

              {/* Hotel Tier Selector */}
              <div>
                <label className="text-sm font-bold text-[var(--text-primary)] mb-3 block flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" />
                  <span>Accommodation Category:</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'budget', name: 'Youth Hostel', desc: 'Quad-share, safe student hubs' },
                    { id: 'standard', name: '3-Star Hotel', desc: 'Twin/Triple share, near MRT' },
                    { id: 'premium', name: '4-Star Hotel', desc: 'Executive twin, Orchard/Marina' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setHotelTier(tier.id as any)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        hotelTier === tier.id
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500'
                          : 'border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--text-primary)]">{tier.name}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Chaperone Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-start gap-3">
                <Users size={18} className="text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    Complimentary Chaperone Allocation:
                  </span>{' '}
                  <span className="text-emerald-800 dark:text-emerald-300">
                    For <strong>{studentCount} students</strong>, you receive{' '}
                    <strong>{chaperoneCount} complimentary teacher/faculty slots</strong> (100% free flight & tour assistance).
                  </span>
                </div>
              </div>
            </div>

            {/* Estimator Summary Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">Estimated Tour Cost</span>
              <div className="mt-3 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">SGD ~{estimatedSgdPerStudent}</span>
                  <span className="text-emerald-300 text-sm font-medium">/ student</span>
                </div>
                <div className="text-slate-300 text-sm mt-1">
                  Approx. <strong>INR ₹{estimatedInrPerStudent.toLocaleString('en-IN')}</strong> per student
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-emerald-800/60 text-xs text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Accommodation ({hotelTier.toUpperCase()})</span>
                  <span className="font-semibold text-emerald-300">{durationDays - 1} Nights</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Private AC Coach Transport</span>
                  <span className="font-semibold text-emerald-300">Dedicated Full-Day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Institution Lab Admissions</span>
                  <span className="font-semibold text-emerald-300">All Passes Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> 3 Daily Meals (Halal / Veg / Jain)</span>
                  <span className="font-semibold text-emerald-300">Breakfast, Lunch, Dinner</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Travel Medical Insurance</span>
                  <span className="font-semibold text-emerald-300">Included (SGD 50K Cover)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Free Teacher Chaperones</span>
                  <span className="font-semibold text-amber-300">{chaperoneCount} Free Slots</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setModalStudents(String(studentCount))
                  setModalNotes(`Estimated Cost: SGD ${estimatedSgdPerStudent} (~INR ${estimatedInrPerStudent}) for ${durationDays} Days in ${hotelTier} tier.`)
                  setIsModalOpen(true)
                }}
                className="w-full mt-8 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <span>Lock In This Estimated Quote</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[10px] text-slate-400 text-center mt-3">
                *Final quotation may vary with flight block dates and seasonal laboratory fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Teacher & Safety Commitment ─── */}
      <section className="py-16 border-b border-[var(--border-color)] bg-[var(--card-bg)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">24/7 Crisis Response Protocol</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Dedicated Singapore Operations Manager assigned to each delegation with direct medical coordination, embassy liaisons, and emergency chaperone hotline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <FileCheck2 size={26} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Curriculum Certificates</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Official certificates of completion awarded to all student participants to bolster university college application portfolios and STEM credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Globe size={26} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Complete Visa & Flight Handling</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                End-to-end group visa facilitation (Singapore Electronic Visa & ICA clearances), group airfare blocks with major airlines (Singapore Airlines, IndiGo, Air India), and SG Arrival Card submission assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ─── */}
      <section className="py-20 border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Everything You Need To Know</span>
            <h2 className="text-3xl font-bold font-serif mt-2 mb-4 text-[var(--text-primary)]">
              Teacher & Tour Coordinator FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-sm sm:text-base font-bold text-[var(--text-primary)]">{faq.q}</span>
                    <span className="text-[var(--text-secondary)] shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section className="py-20 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">Ready To Plan?</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif mt-2 mb-6">
            Empower Your Students with a Singapore Educational Journey
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-10">
            Let our educational specialists build a tailored circuit for your school, college, or MBA institution with guaranteed high safety, verified learning outcomes, and competitive group rates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xl flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Request Institutional Proposal</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="https://wa.me/6583048408?text=Hi%20Flying%20Wonders%2C%20I%20am%20interested%20in%20organizing%20a%20Singapore%20Educational%20Tour%20for%20our%20institution."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl font-bold bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/40 text-white transition-all shadow-xl flex items-center gap-2 text-sm sm:text-base"
            >
              <MessageCircle size={18} />
              <span>Instant WhatsApp Consultation</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Inquiry Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setIsModalOpen(false)
                setSubmitSuccess(false)
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            >
              ✕
            </button>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold font-serif text-[var(--text-primary)] mb-2">
                  Proposal Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
                  Thank you. Our senior educational tour director will contact you within 24 hours with a comprehensive customized itinerary and budget proposal.
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href="https://wa.me/6583048408?text=Hi%20Flying%20Wonders%2C%20I%20just%20submitted%20an%20educational%20tour%20inquiry."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-800 text-white text-xs flex items-center gap-2"
                  >
                    <MessageCircle size={14} />
                    <span>Chat on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsModalOpen(false)
                      setSubmitSuccess(false)
                    }}
                    className="px-6 py-2.5 rounded-xl font-bold border border-[var(--border-color)] text-[var(--text-primary)] text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Institutional Quote</span>
                  <h3 className="text-2xl font-bold font-serif text-[var(--text-primary)] mt-1">
                    Request Education Tour Proposal
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Fill in your institution details for a customized curriculum itinerary and group quotation.
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                      Target Student Cohort
                    </label>
                    <select
                      value={modalCohort}
                      onChange={(e) => setModalCohort(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="School (Grades 6-12)">School (Grades 6–12 / CBSE / ICSE / IB)</option>
                      <option value="College & Engineering">College & Undergraduates (B.Tech / Science)</option>
                      <option value="MBA & Business Schools">MBA & Postgraduates (Management / FinTech)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                        Coordinator Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={modalName}
                        onChange={(e) => setModalName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                        Institution / College Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Delhi Public School / IIT"
                        value={modalInstitution}
                        onChange={(e) => setModalInstitution(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="coordinator@institution.edu"
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={modalPhone}
                        onChange={(e) => setModalPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                        Estimated Student Count
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={modalStudents}
                        onChange={(e) => setModalStudents(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                        Target Travel Month / Year
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. October 2026"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                      Specific Requirements / Focus Areas
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. We want to focus on Singapore Science Centre labs, SUTD design workshop, and Marina Barrage."
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-800 text-white text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing Request...</span>
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


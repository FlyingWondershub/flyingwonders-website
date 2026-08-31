const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

const educationToursData = {
  _id: 'educationToursSettingsSingleton',
  _type: 'educationToursSettings',
  pageTitle: 'Singapore Educational Tours for Schools, Colleges & MBA | Flying Wonders',
  metaDescription: 'Curated Singapore educational tours for K-12 schools, Engineering colleges, and MBA business schools with visits to Science Centre, Discovery Centre, Marina Barrage, SUTD, SMU, NTU, and NUS.',

  // Hero Section
  heroBadge: 'Singapore: The World’s Safest Live Classroom • K-12, College & MBA',
  heroTitle: 'Singapore Educational Tours & Academic Immersions',
  heroSubtitle: 'Curated study circuits for Schools (K–12), Engineering Colleges, and MBA Business Schools. Explore world-class innovation labs, sustainable engineering marvels, and top global university campuses.',

  // Statistics Bar
  statsList: [
    { _key: 'stat-1', value: '75+ Cohorts', label: 'Facilitated since 2018' },
    { _key: 'stat-2', value: '1:10 Free Chaperone', label: '100% Free teacher slots' },
    { _key: 'stat-3', value: '100% Verified Safety', label: 'Medical & evacuation cover' },
    { _key: 'stat-4', value: '7 Top Institutions', label: 'Science, Tech & Universities' }
  ],

  // 5 Learning Pillars
  learningPillars: [
    {
      _key: 'pillar-1',
      title: 'STEM, Robotics & AI',
      description: 'Hands-on coding, molecular labs at Science Centre, and drone/robotics automation testbeds.'
    },
    {
      _key: 'pillar-2',
      title: 'Sustainability & Circular Economy',
      description: 'Closed-loop water reclamation (NEWater), Marina Barrage flood engineering, and zero-carbon buildings.'
    },
    {
      _key: 'pillar-3',
      title: 'Smart Nation Urban Engineering',
      description: 'Autonomous vehicle testbeds, URA 3D spatial planning, green infrastructure, and transit systems.'
    },
    {
      _key: 'pillar-4',
      title: 'Global Trade & Logistics Hubs',
      description: 'Tuas Mega Port automation, automated logistics warehousing, and Changi multimodal supply chains.'
    },
    {
      _key: 'pillar-5',
      title: 'Top University & Design Immersions',
      description: 'Campus masterclasses at NUS (#8 World), NTU (#15 World), SUTD (MIT-partnered) and SMU.'
    }
  ],

  // 7 Partner Institutions
  institutions: [
    {
      _key: 'inst-1',
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
      videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A',
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
        { _key: 'ws-1', title: 'DNA Molecular Extraction Lab', duration: '90 Mins', focus: 'Gel electrophoresis and DNA isolation under expert biologists.' },
        { _key: 'ws-2', title: 'AI & Robotics Hands-on Arena', duration: '75 Mins', focus: 'Sensor calibration, pathfinding algorithms, and logic programming.' },
        { _key: 'ws-3', title: '8K Fulldome Astrophysics Session', duration: '60 Mins', focus: 'Deep space exploration and atmospheric dynamics.' }
      ]
    },
    {
      _key: 'inst-2',
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
      videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A',
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
        { _key: 'ws-4', title: 'Crisis Room Command Simulation', duration: '90 Mins', focus: 'Collaborative scenario simulation managing resource allocation during city emergencies.' },
        { _key: 'ws-5', title: 'Digital Media Studio Anchoring', duration: '60 Mins', focus: 'Green-screen broadcast production, teleprompter delivery, and camera directing.' }
      ]
    },
    {
      _key: 'inst-3',
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
      videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A',
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
        { _key: 'ws-6', title: 'Hydraulic Gate Mechanics Briefing', duration: '60 Mins', focus: 'Engineering analysis of crest gate activation during tidal surges.' },
        { _key: 'ws-7', title: 'Eco-Singapore Carbon Neutrality Tour', duration: '75 Mins', focus: 'Zero-waste urban ecosystems and solar infrastructure review.' }
      ]
    },
    {
      _key: 'inst-4',
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
      videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A',
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
        { _key: 'ws-8', title: 'FabLab 3D Additive Prototyping', duration: '90 Mins', focus: 'Hands-on SLA 3D printing and CAD translation workshops.' },
        { _key: 'ws-9', title: 'MIT Design Thinking Case Sprint', duration: '90 Mins', focus: 'Rapid prototyping sprint solving smart city mobility challenges.' }
      ]
    },
    {
      _key: 'inst-5',
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
      videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A',
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
        { _key: 'ws-10', title: 'Financial Trading Simulation', duration: '90 Mins', focus: 'Live trading floor simulations with multi-currency risk management.' },
        { _key: 'ws-11', title: 'Asian FinTech & Venture Landscape', duration: '75 Mins', focus: 'Monetary Authority of Singapore (MAS) sandboxes & ASEAN market entry.' }
      ]
    },
    {
      _key: 'inst-6',
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
      videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A',
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
        { _key: 'ws-12', title: 'The Hive Flipped Classroom Experience', duration: '60 Mins', focus: 'Collaborative case breakdown inside Thomas Heatherwick-designed pods.' },
        { _key: 'ws-13', title: 'CleanTech Autonomous Mobility Telemetry', duration: '90 Mins', focus: 'Sensor arrays, lidar maps, and EV battery testing.' }
      ]
    },
    {
      _key: 'inst-7',
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
      videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A',
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
        { _key: 'ws-14', title: 'BLOCK71 Deep-Tech Startup Incubation', duration: '90 Mins', focus: 'Venture scaling, founder pitch evaluation, and patent commercialization.' },
        { _key: 'ws-15', title: 'NUS International Admissions Masterclass', duration: '60 Mins', focus: 'Portfolio requirements, scholarship avenues, and faculty interviews.' }
      ]
    }
  ],

  // 3 Curated Study Circuits
  itineraries: [
    {
      _key: 'itin-1',
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
          _key: 'day-1',
          day: 1,
          title: 'Arrival, Changi Canopy Tech & Science Centre Journey',
          morning: 'Touchdown at Singapore Changi Airport. Visit the Jewel Rain Vortex & Canopy Park engineering marvel.',
          afternoon: 'Guided visit to Singapore Science Centre. Interactive molecular labs, Kinetic Garden & DNA workshop.',
          evening: 'Immersive planetarium screening at the 8K Digital Omni-Theatre. Welcome dinner.',
          learningOutcome: 'Hands-on physics and astronomy concepts in Southeast Asia’s premier science pavilion.'
        },
        {
          _key: 'day-2',
          day: 2,
          title: 'Urban Ecology, Water Security & Gardens by the Bay',
          morning: 'Marina Barrage: Discover how the 9 crest gates and pump house control flooding and create an urban reservoir.',
          afternoon: 'Explore Gardens by the Bay (Flower Dome & Cloud Forest) focusing on vertical farming and mist climate systems.',
          evening: 'Spectacular Spectra Light & Water Show at Marina Bay Sands waterfront promenade.',
          learningOutcome: 'Understand water catchment engineering, tropical biodiversity, and sustainable architectural design.'
        },
        {
          _key: 'day-3',
          day: 3,
          title: 'National Resilience, Defence Tech & Night Safari',
          morning: 'Singapore Discovery Centre: AR historical timeline and crisis simulation leadership workshops.',
          afternoon: 'Cross-cultural heritage trail through Chinatown & Little India with interactive cultural scavenger hunt.',
          evening: 'Guided tram tour and nocturnal animal conservation briefing at the world-famous Night Safari.',
          learningOutcome: 'Develop team problem-solving under crisis conditions and examine global wildlife conservation.'
        },
        {
          _key: 'day-4',
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
      _key: 'itin-2',
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
          _key: 'day-5',
          day: 1,
          title: 'Arrival & Singapore Smart Nation Urban Planning Walk',
          morning: 'Arrival at Changi Airport. Check-in at student hotel accommodation.',
          afternoon: 'Urban Redevelopment Authority (URA) Singapore City Gallery: 3D scale model & Smart Nation digital masterplan.',
          evening: 'Marina Bay Financial District walk examining smart urban infrastructure and autonomous sensor systems.',
          learningOutcome: 'Comprehend high-density urban planning, IoT infrastructure, and smart city governance.'
        },
        {
          _key: 'day-6',
          day: 2,
          title: 'NUS Campus Immersion & BLOCK71 Deep-Tech Ecosystem',
          morning: 'NUS Kent Ridge Campus: Tour University Town, Yale-NUS library, and faculty of computing/engineering.',
          afternoon: 'NUS Enterprise BLOCK71: Meet startup founders and attend a briefing on Singapore venture incubation.',
          evening: 'Interactive networking dinner with current international university scholars.',
          learningOutcome: 'Gain direct insights into university admissions, entrepreneurship, and commercial tech research.'
        },
        {
          _key: 'day-7',
          day: 3,
          title: 'SUTD Design Innovation FabLab & NEWater Reclamation',
          morning: 'SUTD (Singapore University of Technology and Design): Hands-on 3D printing & FabLab prototyping seminar.',
          afternoon: 'NEWater Plant: Advanced microfiltration and reverse osmosis industrial purification walkthrough.',
          evening: 'Dinner at Lau Pa Sat Satay Street followed by Helix Bridge structural engineering observation.',
          learningOutcome: 'Apply human-centric design thinking and analyze advanced industrial membrane water purification.'
        },
        {
          _key: 'day-8',
          day: 4,
          title: 'NTU "The Hive" Green Campus & CleanTech Park',
          morning: 'NTU Campus Tour: Explore Thomas Heatherwick’s "The Hive", ADM building, and satellite labs.',
          afternoon: 'Jurong CleanTech Park & Singapore Science Centre AI Future Technology Wing.',
          evening: 'Clarke Quay river cruise studying the Singapore River cleanup and historic trading quays.',
          learningOutcome: 'Evaluate green building design certifications and state-of-the-art AI robotics automation.'
        },
        {
          _key: 'day-9',
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
      _key: 'itin-3',
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
          _key: 'day-10',
          day: 1,
          title: 'Arrival & Singapore Economic Transformation Overview',
          morning: 'Arrival in Singapore. Private coach transfer to downtown 4-star business hotel.',
          afternoon: 'Orientation briefing on Singapore’s transition into Asia’s treasury and multinational HQ capital.',
          evening: 'Executive dinner at Marina Bay overlooking the world’s most dense financial district.',
          learningOutcome: 'Analyze the legal, tax, and governance foundations that make Singapore the #1 ease of doing business hub.'
        },
        {
          _key: 'day-11',
          day: 2,
          title: 'SMU Case Study Pedagogy & FinTech Masterclass',
          morning: 'SMU Campus: Executive seminar on Asian Capital Markets, ASEAN digital economy, and FinTech regulation.',
          afternoon: 'Visit to a Singapore FinTech / Web3 accelerator hub in Tanjong Pagar.',
          evening: 'Networking session with Singapore-based alumni, CFOs, and business leaders.',
          learningOutcome: 'Examine monetary authority sandboxes, cross-border payment rails, and venture financing.'
        },
        {
          _key: 'day-12',
          day: 3,
          title: 'PSA World-Class Automated Port & Logistics Operations',
          morning: 'PSA Singapore: Exclusive briefing on Tuas Mega Port automation, automated guided vehicles (AGVs), and AI supply chain.',
          afternoon: 'Jurong Island & Petrochemical logistics overview / URA Masterplan review.',
          evening: 'Dinner and debrief on global trade route resilience and maritime security.',
          learningOutcome: 'Understand mega-hub supply chain operations handling over 37 million TEUs annually.'
        },
        {
          _key: 'day-13',
          day: 4,
          title: 'NUS Business School Masterclass & ESG Strategies',
          morning: 'NUS Business School (Mochtar Riady Building): Lecture on sustainable business models & Asian ESG frameworks.',
          afternoon: 'Marina Barrage & Sentosa Carbon-Neutral tourism district corporate site study.',
          evening: 'Gala farewell dinner with certificates of completion awarded by tour directors.',
          learningOutcome: 'Deconstruct corporate ESG transformation and decarbonization strategies in high-growth markets.'
        },
        {
          _key: 'day-14',
          day: 5,
          title: 'Executive Capstone Presentation & Departure',
          morning: 'Group syndicate case presentations summarizing key business learnings and strategic recommendations.',
          afternoon: 'Corporate shopping and transit to Changi International Airport.',
          evening: 'Flight departure.',
          learningOutcome: 'Synthesize actionable market entry and operational frameworks for international business roles.'
        }
      ]
    }
  ],

  // Pricing Defaults
  estimatorBudgetRatePerDay: 115,
  estimatorStandardRatePerDay: 145,
  estimatorPremiumRatePerDay: 185,

  // FAQs
  faqs: [
    {
      _key: 'faq-1',
      q: 'How many complimentary slots do teachers or chaperones receive?',
      a: 'For all our educational tour cohorts, Flying Wonders provides 1 complimentary chaperone package (twin-sharing accommodation, all meals, admissions, and coach travel) for every 10 paying students (1:10 ratio).',
      category: 'Logistics & Chaperones'
    },
    {
      _key: 'faq-2',
      q: 'Can itineraries be customized to match specific school curriculums (IB, CBSE, IGCSE, B.Tech)?',
      a: 'Yes, absolutely. We tailor daily workshops, laboratory sessions, and guided walkthroughs to align precisely with specific syllabus learning outcomes (e.g. IB Environmental Systems, CBSE Physics, B.Tech IoT/Robotics, or MBA FinTech).',
      category: 'Curriculum & Labs'
    },
    {
      _key: 'faq-3',
      q: 'What safety and emergency protocols are in place in Singapore?',
      a: 'Singapore is universally recognized as the world’s safest country for student travel. Flying Wonders provides 24/7 dedicated on-ground tour managers, comprehensive student travel medical & emergency evacuation insurance, certified English/Hindi/regional guides, and direct hospital network partnerships.',
      category: 'Safety & Medical'
    },
    {
      _key: 'faq-4',
      q: 'Do you cater to dietary requirements like Halal, Pure Vegetarian, and Jain meals?',
      a: 'Yes. All student group meal itineraries are fully customized with certified Halal, Pure Vegetarian, Vegan, or Jain meal options prepared by licensed food partners throughout Singapore.',
      category: 'Logistics & Chaperones'
    },
    {
      _key: 'faq-5',
      q: 'What is the booking lead time and payment schedule for school delegations?',
      a: 'We recommend initiating planning 6 to 12 weeks prior to departure to secure university lab slots, flight blocks, and hotel room allotments. Payment terms typically include a booking deposit with balance structured in milestones prior to departure.',
      category: 'Booking & Payment'
    }
  ]
};

async function seedEducationTours() {
  try {
    console.log("Checking for existing educationToursSettings document in Sanity...");
    const existing = await client.fetch(`*[_type == "educationToursSettings"][0]`);

    if (existing) {
      console.log(`Found existing document (${existing._id}). Updating with full data...`);
      await client.createOrReplace({
        ...educationToursData,
        _id: existing._id
      });
      console.log("✅ Successfully replaced and populated existing educationToursSettings document in Sanity!");
    } else {
      console.log("No existing document found. Creating new educationToursSettings document...");
      await client.createOrReplace(educationToursData);
      console.log("✅ Successfully created new educationToursSettings document in Sanity!");
    }
  } catch (error) {
    console.error("❌ Error seeding Sanity document:", error);
  }
}

seedEducationTours();

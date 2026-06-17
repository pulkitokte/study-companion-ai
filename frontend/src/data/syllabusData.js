/**
 * StudyMind — Static Syllabus Definitions
 * Single source of truth for all competitive exam content.
 *
 * STRUCTURE:
 *   SYLLABUS_DATA[examId].subjects[subjectId].topics[] ← topic entries
 *
 * This file is STATIC — never written to at runtime.
 * All progress data is stored separately in StorageAdapter → NAMESPACES.syllabus
 *
 * Exam IDs:    'upsc' | 'ssc_cgl' | 'banking_po'
 * Difficulty:  'easy' | 'medium' | 'hard'
 * XP:          30 (easy) | 50 (medium) | 70 (hard) — awarded on first completion
 */

// ─────────────────────────────────────────────────────────────────────────────
// UPSC CIVIL SERVICES EXAMINATION
// ─────────────────────────────────────────────────────────────────────────────

const UPSC_SUBJECTS = {
  polity: {
    id: "polity",
    label: "Indian Polity & Governance",
    emoji: "⚖️",
    color: "#4FC3F7",
    topics: [
      {
        id: "constitution_preamble",
        label: "Preamble & Historical Background of the Constitution",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "constituent_assembly",
        label: "Constituent Assembly — Composition, Debates & Framing",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "features_constitution",
        label: "Salient Features of the Indian Constitution",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "basic_structure",
        label: "Basic Structure Doctrine & Key Constitutional Amendments",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "schedules_articles",
        label: "Schedules, Important Articles & Constitutional Provisions",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "fundamental_rights_overview",
        label: "Fundamental Rights — Overview & Art 12–13",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "right_equality",
        label: "Right to Equality (Art 14–18)",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "right_freedom",
        label: "Right to Freedom (Art 19–22) & Reasonable Restrictions",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "right_exploitation_religion",
        label: "Rights Against Exploitation & Freedom of Religion (Art 23–28)",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "cultural_educational_rights",
        label: "Cultural & Educational Rights (Art 29–30) & Art 32",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "writs",
        label:
          "Writs — Habeas Corpus, Mandamus, Certiorari, Quo Warranto, Prohibition",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "dpsp",
        label: "Directive Principles — Classification, Features & Key Articles",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "fundamental_duties",
        label: "Fundamental Duties (Art 51A) — Significance & Enforceability",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "parliament_structure",
        label:
          "Parliament — Structure, Composition, Sessions & Presiding Officers",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "lok_sabha",
        label: "Lok Sabha — Powers, Speaker, Deputy Speaker & Committees",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "rajya_sabha",
        label: "Rajya Sabha — Powers, Special Powers & Council of States",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "legislation_budget",
        label:
          "Legislative Process — Ordinary, Money & Constitutional Amendment Bills",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "president_powers",
        label:
          "President — Election, Removal, Powers & Constitutional Position",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "pm_cabinet",
        label: "Prime Minister, Council of Ministers & Cabinet System",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "governor_state_exec",
        label: "Governor, State Legislature & State Executive Structure",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "supreme_court",
        label:
          "Supreme Court — Composition, Jurisdiction, Powers & Appointments",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "high_courts",
        label:
          "High Courts, Subordinate Courts & Alternative Dispute Resolution",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "judicial_review",
        label:
          "Judicial Review, Public Interest Litigation & Judicial Activism",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "federalism_centre_state",
        label:
          "Federalism & Centre–State Relations (Legislative, Administrative, Financial)",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "emergency_provisions",
        label:
          "Emergency Provisions — National (352), State (356) & Financial (360)",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "panchayati_raj",
        label: "Panchayati Raj System — 73rd Amendment, Structure & Functions",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "urban_local_bodies",
        label:
          "Urban Local Bodies — 74th Amendment, Municipal Corporations & Challenges",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "constitutional_bodies",
        label: "Election Commission, CAG, Finance Commission & UPSC",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "statutory_bodies",
        label: "NITI Aayog, Lokpal, CVC, NHRC & Other Statutory Authorities",
        difficulty: "medium",
        xp: 50,
      },
    ],
  },

  history: {
    id: "history",
    label: "Indian & World History",
    emoji: "📜",
    color: "#FFB347",
    topics: [
      {
        id: "indus_valley",
        label: "Indus Valley Civilisation — Features, Decline & Significance",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "vedic_period",
        label: "Vedic Period — Early Vedic, Later Vedic & Vedic Literature",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "mahajanapadas_jainism",
        label: "Mahajanapadas, Rise of Magadha, Buddhism & Jainism",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "mauryan_empire",
        label:
          "Mauryan Empire — Chandragupta, Bindusara, Ashoka & Administration",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "post_mauryan",
        label: "Post-Mauryan Period — Kushanas, Sungas & Satavahanas",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gupta_empire",
        label: "Gupta Empire — Administration, Culture & Golden Age",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "south_india_ancient",
        label:
          "Ancient South India — Sangam Age, Pallavas, Chalukyas & Rashtrakutas",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "early_medieval",
        label:
          "Early Medieval India — Rajputs, Tripartite Struggle & Regional Kingdoms",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "delhi_sultanate",
        label: "Delhi Sultanate — Five Dynasties, Administration & Economy",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "bhakti_sufi",
        label: "Bhakti Movement & Sufi Movement — Saints, Teachings & Impact",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "vijayanagara_deccan",
        label: "Vijayanagara Empire & Deccan Sultanates",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "mughal_empire",
        label: "Mughal Empire — Babur to Aurangzeb, Battles & Expansion",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "mughal_admin_culture",
        label: "Mughal Administration, Economy, Art, Architecture & Culture",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "maratha_empire",
        label: "Maratha Empire — Shivaji, Peshwas & Expansion",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "british_expansion",
        label:
          "British Expansion — East India Company, Key Battles & Subsidiary Alliance",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "revolt_1857",
        label: "Revolt of 1857 — Causes, Key Events, Leaders & Consequences",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "social_reform_movements",
        label: "Social & Religious Reform Movements of the 19th Century",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "early_nationalism",
        label:
          "Rise of Indian Nationalism & Formation of the Indian National Congress",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "moderates_extremists",
        label: "Moderates, Extremists, Partition of Bengal & Swadeshi Movement",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gandhi_freedom_struggle",
        label:
          "Gandhian Era — NCM, CDM, Round Table Conferences & Civil Disobedience",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "revolutionary_underground",
        label:
          "Revolutionary Movements — Bhagat Singh, Subhash Bose & Armed Resistance",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "quit_india_ina",
        label:
          "Quit India Movement, Indian National Army & Road to Independence",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "partition_integration",
        label:
          "Partition of India, Independence (1947) & Integration of Princely States",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "world_history",
        label:
          "World History — French Revolution, World Wars, Cold War & Decolonisation",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "art_culture",
        label:
          "Indian Art & Culture — Architecture, Classical Dance, Music & Painting",
        difficulty: "medium",
        xp: 50,
      },
    ],
  },

  geography: {
    id: "geography",
    label: "Indian & World Geography",
    emoji: "🌍",
    color: "#00FFC8",
    topics: [
      {
        id: "earth_interior",
        label: "Interior of the Earth — Layers, Composition & Plate Tectonics",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "landforms",
        label:
          "Landforms — Mountains, Plateaus, Plains, Valleys & Their Formation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "rocks_minerals",
        label: "Rocks, Minerals & Rock Cycle — Types & Characteristics",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "atmosphere_layers",
        label: "Atmosphere — Structure, Composition, Insolation & Heat Budget",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "climate_weather",
        label:
          "Climate & Weather — Pressure Belts, Winds, Precipitation & Storms",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "hydrosphere_oceans",
        label: "Hydrosphere — Ocean Currents, Tides, Waves & Coral Reefs",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "india_physiography",
        label:
          "Indian Physiography — Himalayan Ranges, Peninsular Plateau & Coastal Plains",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "india_drainage",
        label:
          "Indian Drainage System — Himalayan Rivers, Peninsular Rivers & Interlinking",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "india_climate",
        label:
          "Indian Climate — Monsoon Mechanism, Seasons & Regional Climate Types",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "india_soils",
        label:
          "Indian Soils — Types (Alluvial, Red, Black, Laterite) & Distribution",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "india_vegetation",
        label: "Natural Vegetation & Wildlife — Forest Types & Protected Areas",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "india_agriculture",
        label:
          "Indian Agriculture — Crops, Crop Seasons, Irrigation & Agricultural Reforms",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "india_minerals_energy",
        label: "Indian Minerals, Energy Resources & Major Power Plants",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "india_industries",
        label:
          "Indian Industries — Major Types, Locations & Industrial Corridors",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "india_transport",
        label:
          "Indian Transport Network — Railways, Roads, Airways & Waterways",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "india_population",
        label:
          "Indian Population — Census Data, Trends, Demographics & Urbanisation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "world_continents",
        label: "World Geography — Continents, Major Mountain Ranges & Deserts",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "world_water_bodies",
        label: "World Water Bodies — Oceans, Major Seas, Rivers & Lakes",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "world_climate_zones",
        label:
          "World Climate Classification — Koppen System & Major Climate Zones",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "world_countries_geo",
        label:
          "Important Countries — Location, Resources & Geopolitical Significance",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "straits_geopolitics",
        label: "Straits, Passes, Gulfs, Gulfs & Geopolitical Hotspots",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "disaster_management",
        label:
          "Natural Disasters — Earthquakes, Cyclones, Floods & Disaster Management",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "map_skills",
        label: "Map Reading, Geographical Mapping & Map-Based Questions",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "urban_rural_geo",
        label: "Urban & Rural Settlements, Migration & Population Distribution",
        difficulty: "easy",
        xp: 30,
      },
    ],
  },

  economy: {
    id: "economy",
    label: "Indian Economy",
    emoji: "💹",
    color: "#B5FF47",
    topics: [
      {
        id: "basic_macro_concepts",
        label:
          "Basic Macroeconomic Concepts — GDP, GNP, NDP, NNP & National Income",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "national_income_accounting",
        label: "National Income — Measurement Methods & Economic Accounting",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "money_inflation",
        label: "Money, Money Supply (M0–M4), Inflation & Deflation",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "fiscal_policy",
        label: "Fiscal Policy — Types of Budget, Deficits, Taxation & FRBM Act",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "monetary_policy",
        label: "Monetary Policy — Instruments, Transmission & RBI Role",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "rbi_banking_system",
        label: "RBI — Structure, Functions, Monetary Policy & Banking Reforms",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "commercial_banks",
        label: "Banking System — Commercial Banks, Co-operatives, RRBs & NBFCs",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "capital_markets",
        label:
          "Capital Markets — SEBI, Stock Exchanges, Bonds & Financial Instruments",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "indian_agriculture_eco",
        label:
          "Agricultural Economy — MSP, Procurement, Marketing & Allied Sectors",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "industrial_policy",
        label: "Industrial Policy — Sectors, Reforms, MSMEs & Make in India",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "economic_planning",
        label: "Economic Planning — Five-Year Plans, Objectives & NITI Aayog",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "lpg_reforms",
        label:
          "LPG Reforms of 1991 — Liberalisation, Privatisation & Globalisation",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "poverty_hdi",
        label: "Poverty, Unemployment, Inequality & Human Development Index",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "foreign_trade_policy",
        label: "Foreign Trade Policy & India's External Sector",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "wto_international_eco",
        label:
          "WTO, IMF, World Bank, UNCTAD & International Economic Institutions",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "balance_of_payments",
        label: "Balance of Payments, Current Account & Exchange Rate Systems",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "fdi_fii_investment",
        label: "FDI, FII & Foreign Investment Policy in India",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gst_indirect_tax",
        label: "GST — Structure, Council, Rates, Slabs & Impact",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "union_budget_analysis",
        label: "Union Budget — Concepts, Deficit Types & Budget Analysis",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "government_schemes_eco",
        label:
          "Flagship Government Schemes — Social, Economic & Financial Inclusion",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "infrastructure_digital",
        label:
          "Infrastructure — Transport, Digital Economy, Smart Cities & NIP",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "economic_survey_current",
        label:
          "Economic Survey, Recent Economic Developments & Key Data Points",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  environment: {
    id: "environment",
    label: "Environment & Ecology",
    emoji: "🌱",
    color: "#00FF64",
    topics: [
      {
        id: "ecology_basics",
        label:
          "Ecology — Concepts, Components, Interactions & Ecological Niche",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "ecosystem_types",
        label: "Ecosystem Types — Forest, Grassland, Desert, Wetland & Marine",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "food_chains_energy",
        label: "Food Chains, Food Webs, Energy Flow & Trophic Levels",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "nutrient_cycles",
        label: "Biogeochemical Cycles — Carbon, Nitrogen, Phosphorus & Water",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "biodiversity_levels",
        label:
          "Biodiversity — Types (Alpha, Beta, Gamma), Levels & Significance",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "biodiversity_hotspots",
        label: "Biodiversity Hotspots — Global & India's Hotspots",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "threatened_species",
        label:
          "Threatened Species — IUCN Red List Categories & Conservation Status",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "protected_areas",
        label:
          "Protected Areas — National Parks, Wildlife Sanctuaries, Tiger & Biosphere Reserves",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "climate_change",
        label: "Climate Change — Causes, Consequences & Mitigation Strategies",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "global_warming_ghg",
        label:
          "Global Warming, Greenhouse Gases, Carbon Credits & Carbon Trading",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "ozone_depletion",
        label: "Ozone Layer Depletion, ODS & Montreal Protocol",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "air_pollution",
        label:
          "Air Pollution — Pollutants, Sources, Health Impacts & Control Measures",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "water_pollution",
        label:
          "Water Pollution, Eutrophication & Integrated Water Resource Management",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "soil_waste",
        label: "Soil Degradation, Desertification & Solid Waste Management",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "environment_laws",
        label:
          "Environmental Laws — Environment Protection Act, Wildlife Act & Forest Acts",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "environment_bodies",
        label:
          "Environmental Bodies — CPCB, SPCB, NGT, MoEFCC & Their Functions",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "international_conventions",
        label:
          "International Conventions — Paris, CBD, CITES, Ramsar, Kyoto & Rio",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "renewable_energy",
        label:
          "Renewable Energy — Solar, Wind, Hydroelectric, Biomass & Green Hydrogen",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "natural_disasters_env",
        label:
          "Natural Hazards — Earthquakes, Floods, Cyclones, Droughts & El Niño",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "sdgs_green_economy",
        label:
          "Sustainable Development Goals (SDGs), Green Economy & Circular Economy",
        difficulty: "medium",
        xp: 50,
      },
    ],
  },

  science_tech: {
    id: "science_tech",
    label: "Science & Technology",
    emoji: "🔬",
    color: "#FF6B9D",
    topics: [
      {
        id: "physics_concepts",
        label:
          "Physics — Motion, Force, Energy, Waves, Optics & Electromagnetic Spectrum",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "chemistry_concepts",
        label:
          "Chemistry — Elements, Periodic Table, Acids, Bases, Metals & Polymers",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "cell_genetics",
        label: "Cell Biology, Cell Division, DNA, RNA & Heredity",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "human_body_systems",
        label: "Human Body — Digestive, Respiratory & Circulatory Systems",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "nervous_endocrine",
        label: "Nervous System, Endocrine Glands, Hormones & Human Diseases",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "nutrition_vitamins",
        label:
          "Nutrition, Vitamins, Minerals, Deficiency Diseases & Public Health",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "biotech_genetics",
        label: "Biotechnology — GM Crops, Cloning, Stem Cells & Applications",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "isro_space",
        label:
          "ISRO — Satellite Programmes, Launch Vehicles, Key Missions & Achievements",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "space_global",
        label:
          "Global Space Technology — NASA, ESA, SpaceX, JAXA & Recent Missions",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "nuclear_technology",
        label:
          "Nuclear Technology — Fission, Fusion, Reactors & India's Nuclear Policy",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "defence_drdo",
        label:
          "Defence Technology — DRDO, Missile Systems, BrahMos & Recent Developments",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "computer_internet_basics",
        label:
          "Computer Basics, Internet, Networks & Communication Technologies",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "ai_ml_robotics",
        label:
          "Artificial Intelligence, Machine Learning, Robotics & Deep Learning",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "cybersecurity_privacy",
        label: "Cybersecurity — Threats, Data Privacy, Encryption & Cyber Laws",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "blockchain_fintech",
        label:
          "Blockchain, Cryptocurrency, Digital Currency & Fintech Innovation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "nanotechnology",
        label: "Nanotechnology, Smart Materials & Advanced Manufacturing",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "agri_biotech",
        label:
          "Agricultural Technology — GM Crops, Precision Farming & Biotech",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "medical_tech",
        label:
          "Medical Technology — Vaccines, mRNA, Diagnostics & Pharma Innovation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "clean_energy_ev",
        label:
          "Clean Energy Technology — EVs, Green Hydrogen, Smart Grids & Energy Storage",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "emerging_tech",
        label: "Emerging Technologies — 5G, IoT, Quantum Computing & AR/VR",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  current_affairs: {
    id: "current_affairs",
    label: "Current Affairs",
    emoji: "📰",
    color: "#FFD700",
    topics: [
      {
        id: "national_politics_current",
        label: "National Political Developments, Elections & Governance Events",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "economic_current",
        label: "Current Economic Issues — Macro Data, Policies & RBI Decisions",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "social_welfare_current",
        label:
          "Social Issues — Education, Health, Gender, SC/ST & Welfare Schemes",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "new_schemes_policies",
        label:
          "New Government Schemes, Flagship Policies & Programmes (Ongoing)",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "judiciary_current",
        label: "Important Supreme Court & High Court Judgments",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "india_foreign_policy",
        label:
          "India's Bilateral Relations, Treaties & Foreign Policy Developments",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "international_events",
        label:
          "Major International Events, Conflicts, Summits & Geopolitical Shifts",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "international_orgs",
        label:
          "International Organisations — UN, G20, BRICS, SCO & Key Outcomes",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "env_current",
        label: "Recent Environmental Events, Conventions & Climate Agreements",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "science_current",
        label: "Recent Science & Technology Breakthroughs & Innovations",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "space_missions_current",
        label: "Recent Space Missions — ISRO, NASA, ESA & Key Findings",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "defence_security_current",
        label:
          "Defence Acquisitions, Security Developments & Strategic Affairs",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "indices_reports",
        label: "Global Indices & Reports — HDI, EDB, WCI, GII, Press Freedom",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "awards_national_intl",
        label:
          "Awards — Nobel, Bharat Ratna, Padma, Sahitya Akademi & National Awards",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "sports_events",
        label:
          "Major Sports Events — Olympics, Commonwealth, Asian Games & India",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "books_authors_current",
        label: "Important Books, Authors, Films & Cultural Events",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "personalities_firsts",
        label:
          "Important Personalities — Appointments, Deaths & Historic Firsts",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "monthly_revision",
        label: "Monthly Current Affairs Revision — Ongoing Tracker",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  ethics: {
    id: "ethics",
    label: "Ethics, Integrity & Aptitude",
    emoji: "🧭",
    color: "#7C6FFF",
    topics: [
      {
        id: "ethics_foundational",
        label: "Ethics — Nature, Determinants, Sources & Classification",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "integrity_impartiality",
        label: "Integrity, Impartiality, Non-Partisanship & Objectivity",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "compassion_tolerance",
        label: "Compassion, Empathy, Tolerance, Moral Courage & Accountability",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "attitude_concept",
        label:
          "Attitude — Concept, Formation, Functions & Influence on Behaviour",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "emotional_intelligence",
        label:
          "Emotional Intelligence — Concept, Dimensions & Public Service Applications",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "aptitude_foundational",
        label: "Aptitude & Foundational Values for Civil Services",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "accountability_transparency",
        label: "Accountability, Transparency, RTI & Citizen's Charter",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "governance_ethics",
        label:
          "Ethics in Governance, Public Administration & Policy Formulation",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "corporate_ethics",
        label: "Corporate Governance, Business Ethics & CSR",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "probity_public_life",
        label:
          "Probity in Public Life — Conflict of Interest, Corruption & Whistle-blowing",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "western_thinkers",
        label:
          "Western Ethical Thinkers — Plato, Aristotle, Kant, Mill & Rawls",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "indian_thinkers",
        label:
          "Indian Ethical Traditions — Kautilya, Gandhi, Ambedkar & Tagore",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "case_study_framework",
        label:
          "Case Study Approach — Ethical Frameworks & Decision-Making Models",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "model_answers_practice",
        label:
          "Ethics Model Answers — Writing Practice & Evaluation Techniques",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "previous_year_ethics",
        label: "Previous Year Ethics Papers — Analysis & Pattern Study",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  essay: {
    id: "essay",
    label: "Essay Writing",
    emoji: "✍️",
    color: "#FF6B2B",
    topics: [
      {
        id: "essay_structure_technique",
        label:
          "Essay Structure — Introduction Types, Body & Conclusion Techniques",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "essay_philosophical",
        label: "Theme: Philosophy, Values & Ethics Essays",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "essay_social",
        label: "Theme: Social Issues, Gender & Inclusive Growth Essays",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "essay_political_governance",
        label: "Theme: Politics, Governance, Democracy & Constitution Essays",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "essay_economic",
        label: "Theme: Economic Development, Poverty & Employment Essays",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "essay_environment",
        label: "Theme: Environment, Climate & Sustainability Essays",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "essay_science_tech",
        label: "Theme: Science, Technology, Innovation & Digital Essays",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "essay_international",
        label:
          "Theme: India & World, International Relations & Geopolitics Essays",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "essay_quote_based",
        label: "Quote-Based Essay Techniques — Interpretation & Expansion",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "essay_prev_year_analysis",
        label: "Previous 10 Years UPSC Essay Paper — Analysis & Trend Study",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "essay_practice_set1",
        label: "Essay Practice Set 1 — Write & Self-Evaluate 5 Essays",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "essay_practice_set2",
        label: "Essay Practice Set 2 — Write & Self-Evaluate 5 Essays",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SSC COMBINED GRADUATE LEVEL (CGL)
// ─────────────────────────────────────────────────────────────────────────────

const SSC_CGL_SUBJECTS = {
  quant: {
    id: "quant",
    label: "Quantitative Aptitude",
    emoji: "📐",
    color: "#00FFC8",
    topics: [
      {
        id: "number_system_ssc",
        label: "Number System — Types, Properties, Divisibility & HCF/LCM",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "simplification_ssc",
        label: "Simplification & Approximation — BODMAS & Fractions",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "percentage_ssc",
        label: "Percentage — Calculations, Increase/Decrease & Applications",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "ratio_proportion_ssc",
        label: "Ratio, Proportion & Partnership",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "average_ssc",
        label: "Average — Simple, Weighted Average & Combined Average",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "profit_loss_ssc",
        label: "Profit, Loss, Discount & Marked Price",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "interest_ssc",
        label: "Simple Interest & Compound Interest — Formulas & Shortcuts",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "time_work_ssc",
        label: "Time & Work, Work & Wages, Pipes & Cisterns",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "speed_distance_ssc",
        label: "Speed, Distance & Time — Trains, Boats & Streams",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "mixture_alligation_ssc",
        label: "Mixture, Alligation & Concentration Problems",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "algebra_ssc",
        label: "Algebra — Polynomials, Identities & Equations",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "linear_quadratic_ssc",
        label: "Linear & Quadratic Equations — Solutions & Graphs",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "geometry_triangles",
        label: "Geometry — Lines, Angles, Triangles & Congruence",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "circles_polygons_ssc",
        label: "Circles, Quadrilaterals, Polygons & Theorems",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "mensuration_2d_ssc",
        label: "Mensuration 2D — Area & Perimeter of Plane Figures",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "mensuration_3d_ssc",
        label: "Mensuration 3D — Volume & Surface Area of Solids",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "trigonometry_ssc",
        label: "Trigonometry — Ratios, Identities & Heights & Distances",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "coordinate_geometry_ssc",
        label:
          "Coordinate Geometry — Straight Lines, Distance & Section Formula",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "sequence_series_ssc",
        label: "Sequence & Series — Arithmetic, Geometric & Special Series",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "pnc_ssc",
        label: "Permutation & Combination — Counting Principles & Applications",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "probability_ssc",
        label: "Probability — Classical, Conditional & Applied Problems",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "statistics_ssc",
        label: "Statistics — Mean, Median, Mode, Variance & Standard Deviation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "di_ssc",
        label: "Data Interpretation — Bar, Line, Pie Chart & Tabular DI",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  reasoning: {
    id: "reasoning",
    label: "General Intelligence & Reasoning",
    emoji: "🧩",
    color: "#7C6FFF",
    topics: [
      {
        id: "analogy_ssc",
        label: "Verbal Analogy — Word, Number & Letter-Based",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "classification_ssc",
        label: "Classification & Odd One Out — All Types",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "series_ssc",
        label: "Series Completion — Number, Letter, Mixed & Alpha-Numeric",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "coding_decoding_ssc",
        label: "Coding-Decoding — Letter, Number & Mixed Coding",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "blood_relations_ssc",
        label: "Blood Relations — Direct & Coded",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "direction_distance_ssc",
        label: "Direction Sense & Distance Calculation",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "order_ranking_ssc",
        label: "Order, Ranking & Position-Based Problems",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "syllogism_ssc",
        label: "Syllogism — Statement, Conclusions, Assumptions & Arguments",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "venn_diagram_ssc",
        label: "Venn Diagrams & Logical Sets — Shading & Interpretation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "math_operations_ssc",
        label: "Mathematical Operations & BODMAS Manipulations",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "matrix_figures_ssc",
        label: "Figure Matrix, Figure Series & Non-Verbal Reasoning",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "mirror_water_ssc",
        label: "Mirror Image, Water Image & Clock Reflection",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "paper_folding_ssc",
        label: "Paper Folding, Cutting, Punching & Completion",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "embedded_figures_ssc",
        label: "Embedded Figures & Hidden Pattern Detection",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "dice_cubes_counting",
        label: "Dice, Cube Assembly, Cube Painting & Counting Figures",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  english: {
    id: "english",
    label: "English Language & Comprehension",
    emoji: "📖",
    color: "#FFB347",
    topics: [
      {
        id: "spot_error_ssc",
        label: "Spot the Error — Parts of Speech, Agreement & Usage",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "sentence_improvement_ssc",
        label: "Sentence Improvement & Sentence Correction",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "fill_blanks_ssc",
        label: "Fill in the Blanks — Vocabulary & Grammar Based",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "cloze_test_ssc",
        label: "Cloze Test — Passage-Based & Contextual Fillers",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "synonyms_antonyms_ssc",
        label: "Synonyms, Antonyms & Contextual Word Meaning",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "idioms_phrases_ssc",
        label: "Idioms, Phrases & Phrasal Verbs",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "one_word_sub_ssc",
        label: "One Word Substitution — Common & Advanced",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "spelling_ssc",
        label: "Spelling Check — Correct Spelling Identification",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "active_passive_ssc",
        label: "Active & Passive Voice — All Tenses",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "direct_indirect_ssc",
        label: "Direct & Indirect Speech (Narration) — All Types",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "para_jumbles_ssc",
        label: "Para Jumbles — Sentence Rearrangement",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "reading_comp_ssc",
        label: "Reading Comprehension — Passages, Inference & Vocabulary",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "grammar_tenses_ssc",
        label:
          "Grammar Fundamentals — Tenses, Articles, Prepositions & Subject-Verb Agreement",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "grammar_advanced_ssc",
        label:
          "Advanced Grammar — Clauses, Conditionals, Conjunctions & Modifiers",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  general_knowledge: {
    id: "general_knowledge",
    label: "General Awareness & GK",
    emoji: "🌐",
    color: "#4FC3F7",
    topics: [
      {
        id: "gk_history_ssc",
        label: "Indian History — Ancient, Medieval & Modern (Static GK)",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gk_geography_ssc",
        label: "Geography — India & World (Static GK)",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gk_polity_ssc",
        label: "Indian Polity & Constitution (Static GK)",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gk_economy_ssc",
        label: "Indian Economy — Basic Concepts & Static GK",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gk_science_ssc",
        label: "General Science — Physics, Chemistry & Biology Basics",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "gk_technology_ssc",
        label: "Technology, Inventions & Computer Awareness",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "gk_books_authors_ssc",
        label: "Books, Authors, Newspapers, Publishers & Literary Awards",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "gk_sports_ssc",
        label: "Sports — Trophies, Records, Venues, Players & Recent Events",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "gk_awards_ssc",
        label: "Awards & Honours — National & International Awards",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "gk_current_ssc",
        label: "Current Affairs — Last 12 Months (Ongoing Tracker)",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BANKING PO (PROBATIONARY OFFICER)
// ─────────────────────────────────────────────────────────────────────────────

const BANKING_PO_SUBJECTS = {
  quant: {
    id: "quant",
    label: "Quantitative Aptitude",
    emoji: "📊",
    color: "#00FFC8",
    topics: [
      {
        id: "number_series_bank",
        label: "Number Series — Missing Number & Wrong Number Series",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "simplification_bank",
        label: "Simplification & Approximation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "quadratic_eq_bank",
        label: "Quadratic Equations & Inequalities",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "percentage_ratio_bank",
        label: "Percentage, Ratio & Proportion",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "average_mixture_bank",
        label: "Average, Mixture & Alligation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "profit_discount_bank",
        label: "Profit, Loss & Discount",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "interest_installment",
        label: "Simple Interest, Compound Interest & Instalment Problems",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "time_work_pipes_bank",
        label: "Time & Work, Pipes & Cisterns",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "speed_train_boat_bank",
        label: "Speed, Distance, Time — Trains, Boats & Races",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "mensuration_bank",
        label: "Mensuration — 2D & 3D Figures",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "pnc_probability_bank",
        label: "Permutation, Combination & Probability",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "di_bar_line_bank",
        label: "Data Interpretation — Bar Graph & Line Graph",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "di_pie_table_bank",
        label: "Data Interpretation — Pie Chart & Tabular DI",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "di_mixed_caselet_bank",
        label: "Data Interpretation — Mixed Graph & Caselet DI",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "arithmetic_misc_bank",
        label:
          "Miscellaneous Arithmetic — Ages, Partnership & Problems on Numbers",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "statistics_bank",
        label: "Statistics — Mean, Median, Mode & Index Numbers",
        difficulty: "medium",
        xp: 50,
      },
    ],
  },

  reasoning: {
    id: "reasoning",
    label: "Reasoning Ability",
    emoji: "🧩",
    color: "#7C6FFF",
    topics: [
      {
        id: "linear_seating_bank",
        label:
          "Linear Seating Arrangement — Single Row, Double Row & Variations",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "circular_seating_bank",
        label: "Circular Seating Arrangement — Facing Center & Outside",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "floor_puzzle_bank",
        label: "Floor & Building-Based Puzzles — Flats & Apartments",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "month_day_puzzle_bank",
        label: "Month, Day & Year Scheduling Puzzles",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "box_set_puzzle_bank",
        label: "Box, Set & Category-Based Puzzles",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "blood_relations_bank",
        label: "Blood Relations — Direct, Coded & Puzzle-Based",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "inequality_bank",
        label: "Coded & Direct Inequality — Simple & Combined",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "syllogism_bank",
        label: "Syllogism — Traditional, Possibility & New Pattern",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "coding_decoding_bank",
        label: "Coding-Decoding — Old Pattern, New Pattern & Dictionary-Based",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "direction_bank",
        label: "Direction Sense & Distance — Simple & Complex Cases",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "order_ranking_bank",
        label: "Order, Ranking, Position & Comparison Problems",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "input_output_bank",
        label: "Input-Output Machine — Step-Based & Final Output",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "alphanumeric_series_bank",
        label: "Alphanumeric Series, Data Sufficiency & Miscellaneous",
        difficulty: "medium",
        xp: 50,
      },
    ],
  },

  english: {
    id: "english",
    label: "English Language",
    emoji: "📝",
    color: "#FFB347",
    topics: [
      {
        id: "rc_main_bank",
        label: "Reading Comprehension — Vocabulary, Inference & Tone",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "rc_theme_purpose_bank",
        label: "RC — Theme Identification, Author's Purpose & Title",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "fillers_single_bank",
        label: "Single Word Fillers — Grammar & Context Based",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "fillers_double_bank",
        label: "Double Fillers & Phrase Fillers (New Pattern)",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "error_detection_bank",
        label: "Error Detection & Sentence Correction — New & Old Pattern",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "para_jumbles_bank",
        label: "Para Jumbles — Sentence Rearrangement (New Pattern)",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "cloze_test_bank",
        label: "Cloze Test — Traditional & New Pattern",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "vocab_usage_bank",
        label: "Word Usage, Contextual Vocabulary & Misspelled Words",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "phrase_replacement_bank",
        label: "Phrase Replacement & Sentence Connectors",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "paragraph_completion_bank",
        label: "Paragraph Completion & Odd Sentence Out",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  banking_awareness: {
    id: "banking_awareness",
    label: "Banking & Financial Awareness",
    emoji: "🏦",
    color: "#FF6B9D",
    topics: [
      {
        id: "banking_history",
        label: "History of Banking in India — Phases & Nationalisation",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "rbi_structure_functions",
        label:
          "RBI — Structure, Functions, Departments & Monetary Policy Tools",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "rbi_policy_rates",
        label:
          "Key Policy Rates — Repo, Reverse Repo, CRR, SLR, MSF & Bank Rate",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "types_of_banks",
        label:
          "Types of Banks — Commercial, Co-operative, RRB, Small Finance & Payments Bank",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "banking_products",
        label:
          "Banking Products — Loans, Deposits, CASA Ratio & NPA Classification",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "negotiable_instruments",
        label:
          "Negotiable Instruments — Cheque, DD, LoC, BoE & Promissory Note",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "payment_systems",
        label: "Payment Systems — NEFT, RTGS, IMPS, UPI, NACH & SWIFT",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "financial_inclusion",
        label: "Financial Inclusion — Jan Dhan, Mudra Loans, PMSBY & PMJJBY",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "basel_norms_npa",
        label: "Basel Norms (I, II, III), Capital Adequacy, Provisioning & NPA",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "international_banking",
        label: "International Banking Bodies — IMF, World Bank, IFC, ADB & BIS",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "banking_terminology",
        label: "Important Banking Terminology, Abbreviations & Full Forms",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "banking_current_affairs",
        label: "Recent Banking Developments, Mergers, RBI Circulars & News",
        difficulty: "hard",
        xp: 70,
      },
    ],
  },

  general_awareness: {
    id: "general_awareness",
    label: "General & Economy Awareness",
    emoji: "🌐",
    color: "#4FC3F7",
    topics: [
      {
        id: "current_affairs_bank",
        label: "Current Affairs — Last 6 Months (National & International)",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "budget_economic_survey",
        label: "Union Budget, Economic Survey & Key Economic Data",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "govt_schemes_bank",
        label: "Government Schemes, Missions & Social Programmes",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "international_orgs_bank",
        label: "International Organisations, Summits & Trade Agreements",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "awards_bank",
        label: "Awards, Prizes & Recognition — National & International",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "sports_bank",
        label: "Sports — Recent Events, Championships & Indian Achievements",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "science_tech_bank",
        label: "Science & Technology — Recent Developments & Launch Events",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "static_gk_bank",
        label: "Static GK — Headquarters, Taglines, Books, Authors & Firsts",
        difficulty: "easy",
        xp: 30,
      },
    ],
  },

  computer: {
    id: "computer",
    label: "Computer Knowledge",
    emoji: "💻",
    color: "#B5FF47",
    topics: [
      {
        id: "computer_fundamentals",
        label:
          "Computer Fundamentals — History, Types, Generation & Components",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "input_output_comp",
        label: "Input/Output Devices & Storage Media — Types & Characteristics",
        difficulty: "easy",
        xp: 30,
      },
      {
        id: "memory_types_comp",
        label:
          "Memory — RAM, ROM, Cache, Virtual & Secondary Storage Hierarchy",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "number_system_comp",
        label: "Number System — Binary, Octal, Hexadecimal & Conversions",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "ms_office_comp",
        label: "MS Office Suite — Word, Excel, PowerPoint Features & Shortcuts",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "internet_networking_comp",
        label:
          "Internet, Networking — OSI Model, TCP/IP, DNS, Protocols & Topologies",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "database_sql_comp",
        label: "Database & DBMS — SQL Basics, Tables, Keys & Simple Queries",
        difficulty: "hard",
        xp: 70,
      },
      {
        id: "cybersecurity_comp",
        label:
          "Cybersecurity — Malware, Firewall, Encryption, VPN & Data Safety",
        difficulty: "medium",
        xp: 50,
      },
      {
        id: "os_software_comp",
        label:
          "Operating Systems, System Software, Application Software & Programming Languages",
        difficulty: "medium",
        xp: 50,
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MASTER DATA OBJECT
// ─────────────────────────────────────────────────────────────────────────────

const SYLLABUS_DATA = {
  upsc: {
    id: "upsc",
    label: "UPSC Civil Services Examination",
    shortLabel: "UPSC CSE",
    emoji: "🏛️",
    color: "#7C6FFF",
    description: "Union Public Service Commission — Prelims, Mains & Interview",
    subjects: UPSC_SUBJECTS,
  },

  ssc_cgl: {
    id: "ssc_cgl",
    label: "SSC Combined Graduate Level",
    shortLabel: "SSC CGL",
    emoji: "📋",
    color: "#00FFC8",
    description: "Staff Selection Commission — Tier I, II, III & IV",
    subjects: SSC_CGL_SUBJECTS,
  },

  banking_po: {
    id: "banking_po",
    label: "Banking Probationary Officer",
    shortLabel: "Banking PO",
    emoji: "🏦",
    color: "#FF6B9D",
    description: "SBI PO, IBPS PO, RBI Grade B — Prelims & Mains",
    subjects: BANKING_PO_SUBJECTS,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS (used by syllabusService.js)
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all exam objects as an array (ordered) */
export function getAllExams() {
  return Object.values(SYLLABUS_DATA);
}

/** Returns exam IDs */
export function getExamIds() {
  return Object.keys(SYLLABUS_DATA);
}

/** Returns a single exam object or null */
export function getExam(examId) {
  return SYLLABUS_DATA[examId] ?? null;
}

/** Returns all subjects of an exam as an array */
export function getSubjectsArray(examId) {
  const exam = getExam(examId);
  if (!exam) return [];
  return Object.values(exam.subjects);
}

/** Returns a single subject or null */
export function getSubject(examId, subjectId) {
  return getExam(examId)?.subjects?.[subjectId] ?? null;
}

/** Returns topics array for a given subject */
export function getTopics(examId, subjectId) {
  return getSubject(examId, subjectId)?.topics ?? [];
}

/** Returns a single topic or null */
export function getTopic(examId, subjectId, topicId) {
  return getTopics(examId, subjectId).find((t) => t.id === topicId) ?? null;
}

/** Returns total topic count for an exam */
export function getTotalTopicCount(examId) {
  const exam = getExam(examId);
  if (!exam) return 0;
  return Object.values(exam.subjects).reduce(
    (sum, sub) => sum + sub.topics.length,
    0,
  );
}

/** Returns total topic count for a subject */
export function getSubjectTopicCount(examId, subjectId) {
  return getTopics(examId, subjectId).length;
}

/** Returns max possible XP for a subject (sum of all topic XP) */
export function getSubjectMaxXP(examId, subjectId) {
  return getTopics(examId, subjectId).reduce((sum, t) => sum + t.xp, 0);
}

/** Returns max possible XP for an entire exam */
export function getExamMaxXP(examId) {
  const exam = getExam(examId);
  if (!exam) return 0;
  return Object.values(exam.subjects).reduce((sum, sub) => {
    return sum + sub.topics.reduce((s, t) => s + t.xp, 0);
  }, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default SYLLABUS_DATA;

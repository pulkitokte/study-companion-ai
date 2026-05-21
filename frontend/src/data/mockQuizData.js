// FILE PATH: frontend/src/data/mockQuizData.js

// ─── CATEGORIES ────────────────────────────────────────────────────
export const CATEGORIES = [
  {
    id: "polity",
    label: "Indian Polity",
    emoji: "⚖️",
    color: "#00FFC8",
    description: "Constitution, Parliament, Judiciary",
  },
  {
    id: "history",
    label: "History",
    emoji: "🏛️",
    color: "#FFD700",
    description: "Ancient, Medieval, Modern India",
  },
  {
    id: "geography",
    label: "Geography",
    emoji: "🌏",
    color: "#4FC3F7",
    description: "Physical, Human, Economic Geography",
  },
  {
    id: "economy",
    label: "Economy",
    emoji: "📈",
    color: "#FFB347",
    description: "Macro, Micro, Budget, Policy",
  },
  {
    id: "science",
    label: "Science & Tech",
    emoji: "🔬",
    color: "#B5FF47",
    description: "Physics, Chemistry, Biology, Space",
  },
  {
    id: "environment",
    label: "Environment",
    emoji: "🌿",
    color: "#00E676",
    description: "Ecology, Climate, Biodiversity",
  },
  {
    id: "current",
    label: "Current Affairs",
    emoji: "📰",
    color: "#FF6B9D",
    description: "National, International, Government",
  },
  {
    id: "csat",
    label: "CSAT / Reasoning",
    emoji: "🧠",
    color: "#7C6FFF",
    description: "Aptitude, Comprehension, Logic",
  },
];

// ─── DIFFICULTY CONFIG ─────────────────────────────────────────────
export const DIFFICULTIES = [
  {
    id: "easy",
    label: "Easy",
    color: "#00FFC8",
    xpMultiplier: 1,
    description: "Basic conceptual questions",
    timePerQ: 45,
  },
  {
    id: "medium",
    label: "Medium",
    color: "#FFB347",
    xpMultiplier: 1.5,
    description: "Application-level questions",
    timePerQ: 60,
  },
  {
    id: "hard",
    label: "Hard",
    color: "#FF6B2B",
    xpMultiplier: 2,
    description: "UPSC Prelims standard questions",
    timePerQ: 90,
  },
  {
    id: "mixed",
    label: "Mixed",
    color: "#7C6FFF",
    xpMultiplier: 1.8,
    description: "Random difficulty mix",
    timePerQ: 75,
  },
];

// ─── BASE XP PER CORRECT ANSWER ────────────────────────────────────
export const BASE_XP = 50;

// ─── QUESTION BANK ─────────────────────────────────────────────────
export const QUESTIONS = {
  polity: {
    easy: [
      {
        id: "pol-e-1",
        question:
          "Which Article of the Indian Constitution abolishes untouchability?",
        options: ["Article 14", "Article 17", "Article 21", "Article 46"],
        correct: 1,
        explanation:
          "Article 17 abolishes untouchability and forbids its practice in any form. Its enforcement is made a punishable offence under law.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "pol-e-2",
        question:
          'The concept of "Judicial Review" in India is borrowed from which country?',
        options: ["United Kingdom", "Canada", "USA", "Australia"],
        correct: 2,
        explanation:
          "The concept of Judicial Review is borrowed from the USA. It allows Indian courts to examine the constitutionality of laws.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "pol-e-3",
        question: "Who is the constitutional head of India?",
        options: [
          "Prime Minister",
          "Chief Justice",
          "President",
          "Speaker of Lok Sabha",
        ],
        correct: 2,
        explanation:
          "The President of India is the constitutional head of state. The Prime Minister is the head of government (executive head).",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "pol-e-4",
        question:
          "Which schedule of the Constitution contains the anti-defection law?",
        options: [
          "Eighth Schedule",
          "Ninth Schedule",
          "Tenth Schedule",
          "Eleventh Schedule",
        ],
        correct: 2,
        explanation:
          "The Tenth Schedule, added by the 52nd Constitutional Amendment Act (1985), contains provisions regarding disqualification of members on grounds of defection.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "pol-e-5",
        question:
          "What is the minimum age to become a member of the Rajya Sabha?",
        options: ["21 years", "25 years", "30 years", "35 years"],
        correct: 2,
        explanation:
          "The minimum age to become a member of Rajya Sabha is 30 years. For Lok Sabha, the minimum age is 25 years.",
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "pol-m-1",
        question:
          'Which case established the "Basic Structure" doctrine of the Indian Constitution?',
        options: [
          "Golaknath Case",
          "Kesavananda Bharati Case",
          "Minerva Mills Case",
          "Maneka Gandhi Case",
        ],
        correct: 1,
        explanation:
          'In Kesavananda Bharati v. State of Kerala (1973), the Supreme Court established that Parliament cannot amend the "basic structure" of the Constitution.',
        difficulty: "medium",
        xp: 75,
      },
      {
        id: "pol-m-2",
        question:
          "Under which Article can the President of India proclaim a National Emergency?",
        options: ["Article 352", "Article 356", "Article 360", "Article 365"],
        correct: 0,
        explanation:
          "Article 352 deals with the Proclamation of Emergency (National Emergency) due to war, external aggression, or armed rebellion.",
        difficulty: "medium",
        xp: 75,
      },
      {
        id: "pol-m-3",
        question:
          "The Comptroller and Auditor General of India submits its report relating to accounts of the Union to:",
        options: [
          "Prime Minister",
          "Finance Minister",
          "President of India",
          "Speaker of Lok Sabha",
        ],
        correct: 2,
        explanation:
          "Under Article 151, the CAG submits its reports relating to accounts of the Union to the President, who then causes them to be laid before each House of Parliament.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "pol-h-1",
        question:
          "Which of the following is NOT a ground for disqualification of a Member of Parliament under the Tenth Schedule?",
        options: [
          "Voluntarily giving up membership of a political party",
          "Voting contrary to the party's direction without prior permission",
          "Absence from the House for more than 60 days",
          "Merger of the original party with another party",
        ],
        correct: 2,
        explanation:
          "Absence from the House is not a ground for disqualification under the Tenth Schedule (anti-defection law). It is governed separately under Article 102(1)(b).",
        difficulty: "hard",
        xp: 100,
      },
      {
        id: "pol-h-2",
        question:
          "Consider the following statements about the National Emergency under Article 352: 1) It must be approved by both Houses within one month. 2) Once approved, it operates for six months. 3) It can be revoked by a special majority in Lok Sabha. Which are correct?",
        options: ["1 and 2 only", "2 and 3 only", "1 and 3 only", "1, 2 and 3"],
        correct: 3,
        explanation:
          "All three are correct. The Emergency must be approved within one month (by 2/3 majority), operates for six months thereafter, and Lok Sabha can pass a resolution by simple majority to revoke it.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },

  history: {
    easy: [
      {
        id: "his-e-1",
        question:
          "The Battle of Plassey in 1757 was fought between the British and:",
        options: ["Tipu Sultan", "Siraj-ud-Daula", "Mir Qasim", "Hyder Ali"],
        correct: 1,
        explanation:
          "The Battle of Plassey (1757) was fought between the British East India Company and Siraj-ud-Daula, the Nawab of Bengal. The British victory laid the foundation of British rule in India.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "his-e-2",
        question: "Who founded the Maurya Empire?",
        options: ["Ashoka", "Bindusara", "Chandragupta Maurya", "Bimbisara"],
        correct: 2,
        explanation:
          "Chandragupta Maurya founded the Maurya Empire around 322 BCE with the guidance of his mentor Chanakya (Kautilya).",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "his-e-3",
        question:
          "The Non-Cooperation Movement was launched by Mahatma Gandhi in:",
        options: ["1919", "1920", "1922", "1930"],
        correct: 1,
        explanation:
          "The Non-Cooperation Movement was launched in September 1920. It was suspended in February 1922 following the Chauri Chaura incident.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "his-e-4",
        question: "Akbar's policy of religious tolerance was known as:",
        options: ["Sulh-i-kul", "Din-i-Ilahi", "Mahzar", "Ibadat Khana"],
        correct: 0,
        explanation:
          'Sulh-i-kul meaning "universal peace" or "absolute peace" was Akbar\'s principle of governance that promoted tolerance across all religions.',
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "his-m-1",
        question: "The Permanent Settlement of 1793 was introduced by:",
        options: [
          "Warren Hastings",
          "Lord Wellesley",
          "Lord Cornwallis",
          "Lord Dalhousie",
        ],
        correct: 2,
        explanation:
          "Lord Cornwallis introduced the Permanent Settlement (Zamindari System) in Bengal in 1793, which fixed land revenue permanently with zamindars.",
        difficulty: "medium",
        xp: 75,
      },
      {
        id: "his-m-2",
        question: "Which Harappan site is located in present-day Gujarat?",
        options: ["Harappa", "Mohenjo-daro", "Lothal", "Kalibangan"],
        correct: 2,
        explanation:
          "Lothal is located in Gujarat and was an important Harappan port city. Harappa and Mohenjo-daro are in Pakistan, while Kalibangan is in Rajasthan.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "his-h-1",
        question:
          "The Treaty of Salbai (1782) was signed between the British and which Maratha chief, ending the First Anglo-Maratha War?",
        options: [
          "Mahadaji Scindia",
          "Nana Fadnavis",
          "Peshwa Madhavrao II",
          "Holkar",
        ],
        correct: 0,
        explanation:
          "The Treaty of Salbai was negotiated by Mahadaji Scindia on behalf of the Marathas in 1782. It ended the First Anglo-Maratha War and maintained the status quo for 20 years.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },

  geography: {
    easy: [
      {
        id: "geo-e-1",
        question: "Which is the largest river basin in India?",
        options: ["Godavari", "Ganga", "Brahmaputra", "Indus"],
        correct: 1,
        explanation:
          "The Ganga river basin is the largest in India, covering about 26% of the country's total geographical area across 11 states.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "geo-e-2",
        question: "The Tropic of Cancer passes through how many Indian states?",
        options: ["6", "7", "8", "9"],
        correct: 2,
        explanation:
          "The Tropic of Cancer (23.5°N) passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "geo-e-3",
        question:
          "Which ocean current keeps the ports of Western Europe ice-free?",
        options: [
          "Labrador Current",
          "Gulf Stream",
          "Canary Current",
          "Humboldt Current",
        ],
        correct: 1,
        explanation:
          "The Gulf Stream, a warm Atlantic Ocean current, keeps the ports of Western Europe ice-free throughout the year despite their high latitudes.",
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "geo-m-1",
        question:
          "The Eastern Ghats are discontinuous and are dissected by rivers. Which of the following rivers does NOT flow through the Eastern Ghats?",
        options: ["Mahanadi", "Godavari", "Tapti", "Krishna"],
        correct: 2,
        explanation:
          "The Tapti (Tapi) river flows westward into the Arabian Sea through the Deccan trap region, not through the Eastern Ghats. The others flow east through the Eastern Ghats.",
        difficulty: "medium",
        xp: 75,
      },
      {
        id: "geo-m-2",
        question:
          "Roaring Forties, Furious Fifties, and Shrieking Sixties are associated with:",
        options: [
          "Ocean Currents",
          "Westerly Winds",
          "Trade Winds",
          "Jet Streams",
        ],
        correct: 1,
        explanation:
          "These are names for the strong westerly winds (anti-trades) found in the Southern Hemisphere between 40°–70° south latitudes, named for their intensity.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "geo-h-1",
        question:
          "Consider: 1) El Niño causes droughts in Australia 2) La Niña brings excess rain to South Asia 3) ENSO events affect the Indian summer monsoon. Which are correct?",
        options: ["1 and 2 only", "2 and 3 only", "1 and 3 only", "1, 2 and 3"],
        correct: 3,
        explanation:
          "All three statements are correct. El Niño suppresses Australian rainfall, La Niña enhances South Asian monsoon, and ENSO is strongly correlated with Indian monsoon variability.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },

  economy: {
    easy: [
      {
        id: "eco-e-1",
        question: "Which body presents the Union Budget in India?",
        options: [
          "Reserve Bank of India",
          "NITI Aayog",
          "Ministry of Finance",
          "Planning Commission",
        ],
        correct: 2,
        explanation:
          "The Union Budget is presented by the Finance Minister on behalf of the Ministry of Finance, typically on February 1st every year.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "eco-e-2",
        question: "What does GDP stand for?",
        options: [
          "Gross Domestic Product",
          "General Development Plan",
          "Gross Developmental Programme",
          "Government Development Policy",
        ],
        correct: 0,
        explanation:
          "GDP stands for Gross Domestic Product. It measures the total monetary value of all goods and services produced within a country in a specific period.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "eco-e-3",
        question: "The RBI is India's:",
        options: [
          "Commercial Bank",
          "Central Bank",
          "Development Bank",
          "Investment Bank",
        ],
        correct: 1,
        explanation:
          "The Reserve Bank of India (RBI) is India's central bank, established in 1935. It regulates the monetary policy, issues currency, and supervises the banking sector.",
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "eco-m-1",
        question: "The Laffer Curve represents the relationship between:",
        options: [
          "Inflation and unemployment",
          "Tax rate and tax revenue",
          "Money supply and interest rates",
          "Imports and exports",
        ],
        correct: 1,
        explanation:
          "The Laffer Curve illustrates the relationship between tax rates and tax revenue collected. It suggests there is an optimal tax rate beyond which increasing taxes reduces total revenue.",
        difficulty: "medium",
        xp: 75,
      },
      {
        id: "eco-m-2",
        question: "A Current Account Deficit means a country:",
        options: [
          "Spends more on imports of goods and services than it earns from exports",
          "Has more government expenditure than revenue",
          "Has negative foreign exchange reserves",
          "Imports more capital goods than it exports",
        ],
        correct: 0,
        explanation:
          "A Current Account Deficit occurs when a country's total imports of goods, services, and transfers exceed its total exports. It must be financed by capital account surpluses.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "eco-h-1",
        question:
          "Which of the following is NOT included in India's fiscal deficit calculation?",
        options: [
          "Revenue deficit",
          "Capital expenditure from borrowings",
          "Market borrowings",
          "Disinvestment proceeds",
        ],
        correct: 3,
        explanation:
          "Disinvestment proceeds are capital receipts and are NOT part of fiscal deficit calculation. Fiscal Deficit = Total Expenditure − Revenue Receipts − Non-Debt Capital Receipts.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },

  science: {
    easy: [
      {
        id: "sci-e-1",
        question: 'Which planet is known as the "Red Planet"?',
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        correct: 2,
        explanation:
          "Mars is called the Red Planet because its surface is covered with iron oxide (rust), giving it a distinctive reddish appearance.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "sci-e-2",
        question: "Which gas is most abundant in Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Argon", "Nitrogen"],
        correct: 3,
        explanation:
          "Nitrogen makes up approximately 78% of Earth's atmosphere, making it the most abundant gas. Oxygen is second at about 21%.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "sci-e-3",
        question: "What is the SI unit of electric current?",
        options: ["Volt", "Watt", "Ampere", "Ohm"],
        correct: 2,
        explanation:
          "The Ampere (A) is the SI base unit for electric current. It is defined in terms of the force between parallel current-carrying conductors.",
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "sci-m-1",
        question: "CRISPR-Cas9 technology is primarily used for:",
        options: [
          "Drug delivery",
          "Gene editing",
          "Protein synthesis",
          "Vaccine production",
        ],
        correct: 1,
        explanation:
          "CRISPR-Cas9 is a revolutionary gene-editing technology that allows scientists to edit DNA sequences with precision. It won the Nobel Prize in Chemistry in 2020.",
        difficulty: "medium",
        xp: 75,
      },
      {
        id: "sci-m-2",
        question: "India's Mars Orbiter Mission (Mangalyaan) was launched in:",
        options: ["2012", "2013", "2014", "2015"],
        correct: 1,
        explanation:
          "Mangalyaan was launched on November 5, 2013 by ISRO. It entered Mars orbit in September 2014, making India the first Asian nation to reach Mars orbit.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "sci-h-1",
        question:
          "Quantum entanglement, recently demonstrated and recognized with the 2022 Nobel Prize in Physics, implies that two entangled particles:",
        options: [
          "Travel faster than the speed of light",
          "Share correlated states regardless of the distance separating them",
          "Exchange information instantaneously",
          "Cannot exist independently once separated",
        ],
        correct: 1,
        explanation:
          "Quantum entanglement means two particles share correlated quantum states — measuring one instantly determines the state of the other regardless of distance. This does NOT allow faster-than-light communication.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },

  environment: {
    easy: [
      {
        id: "env-e-1",
        question:
          "Which gas is primarily responsible for the greenhouse effect?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correct: 2,
        explanation:
          "Carbon Dioxide (CO₂) is the primary driver of the anthropogenic greenhouse effect. Other greenhouse gases include methane, nitrous oxide, and water vapour.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "env-e-2",
        question: "Project Tiger was launched in India in:",
        options: ["1965", "1970", "1973", "1980"],
        correct: 2,
        explanation:
          "Project Tiger was launched on April 1, 1973 to protect Bengal tigers. India now has 53 tiger reserves and houses approximately 70% of the world's wild tiger population.",
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "env-m-1",
        question: "The Ramsar Convention deals with the conservation of:",
        options: ["Mangroves", "Wetlands", "Coral Reefs", "Grasslands"],
        correct: 1,
        explanation:
          "The Ramsar Convention (1971) is an international treaty for the conservation and sustainable use of wetlands. India has 75+ Ramsar sites.",
        difficulty: "medium",
        xp: 75,
      },
      {
        id: "env-m-2",
        question: 'The term "ecological footprint" measures:',
        options: [
          "The area of land disturbed by a species",
          "The biologically productive area needed to sustain a population's resource consumption and waste",
          "The number of species affected by human activity",
          "The carbon emissions per capita",
        ],
        correct: 1,
        explanation:
          "Ecological footprint measures the biologically productive land and water area required to sustain a given population's consumption and absorb its wastes.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "env-h-1",
        question:
          "Under the Paris Agreement, India's Nationally Determined Contributions (NDCs) include all EXCEPT:",
        options: [
          "Reduce emissions intensity of GDP by 45% by 2030 from 2005 levels",
          "Achieve about 50% cumulative electric power installed capacity from non-fossil sources by 2030",
          "Achieve net zero emissions by 2050",
          "Create additional carbon sink of 2.5-3 billion tonnes through forest cover",
        ],
        correct: 2,
        explanation:
          "India's NDC target is net zero by 2070, not 2050. The 2050 target belongs to other nations. India's key NDC commitments include the 45% emission intensity reduction and 50% non-fossil power capacity.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },

  current: {
    easy: [
      {
        id: "cur-e-1",
        question: "Which organization publishes the Global Hunger Index?",
        options: [
          "WHO",
          "FAO",
          "Concern Worldwide & Welthungerhilfe",
          "World Bank",
        ],
        correct: 2,
        explanation:
          "The Global Hunger Index (GHI) is published annually by Concern Worldwide (Ireland) and Welthungerhilfe (Germany). India's ranking in the GHI has been a topic of debate.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "cur-e-2",
        question:
          "The G20 Presidency rotates among member countries. India held the G20 presidency in:",
        options: ["2021-22", "2022-23", "2023-24", "2024-25"],
        correct: 2,
        explanation:
          'India held the G20 Presidency from December 2022 to November 2023, hosting the G20 Summit in New Delhi in September 2023 under the theme "Vasudhaiva Kutumbakam".',
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "cur-m-1",
        question:
          'The "One Sun, One World, One Grid" initiative was launched by India to promote:',
        options: [
          "Nuclear energy cooperation",
          "Global solar energy interconnection",
          "Unified electricity pricing",
          "Solar panel manufacturing",
        ],
        correct: 1,
        explanation:
          "The OSOWOG initiative aims to establish a global solar power grid that can transfer electricity between countries and continents, enabling 24/7 solar power availability globally.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "cur-h-1",
        question:
          'The "Global Biofuels Alliance" launched at G20 2023 is primarily aimed at:',
        options: [
          "Replacing all fossil fuels by 2030",
          "Accelerating biofuel adoption and building global standards for sustainable biofuels",
          "Creating a cartel of biofuel-producing nations",
          "Regulating sugarcane prices globally",
        ],
        correct: 1,
        explanation:
          "The Global Biofuels Alliance, launched by India at G20 2023, aims to accelerate biofuel adoption worldwide, develop sustainable aviation fuel, and build capacity in developing nations for biofuel production.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },

  csat: {
    easy: [
      {
        id: "csa-e-1",
        question:
          "If A is the brother of B, B is the sister of C, and C is the father of D, what is A to D?",
        options: ["Uncle", "Father", "Grandfather", "Brother"],
        correct: 0,
        explanation:
          "A is brother of B → A is male. B is sister of C → B is female. C is father of D. A and C are siblings (both related through B). So A is uncle of D.",
        difficulty: "easy",
        xp: 50,
      },
      {
        id: "csa-e-2",
        question:
          "A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/h?",
        options: ["30", "36", "40", "54"],
        correct: 1,
        explanation:
          "Speed = Distance/Time = 150/15 = 10 m/s. To convert to km/h: 10 × (18/5) = 36 km/h.",
        difficulty: "easy",
        xp: 50,
      },
    ],
    medium: [
      {
        id: "csa-m-1",
        question:
          'Read: "All managers are leaders. Some leaders are visionaries. No visionary is a failure." Which conclusion MUST be true?',
        options: [
          "All managers are visionaries",
          "Some managers may be visionaries",
          "No manager is a failure",
          "Some visionaries are managers",
        ],
        correct: 1,
        explanation:
          "All managers are leaders. Some leaders are visionaries — so SOME managers MAY be visionaries (not all). We cannot conclude all are. Option B is the only definite conclusion from the given premises.",
        difficulty: "medium",
        xp: 75,
      },
    ],
    hard: [
      {
        id: "csa-h-1",
        question:
          'A passage: "Economic growth measured solely by GDP is inadequate. Sen\'s capability approach argues development must expand human freedoms." Which inference is MOST strongly supported?',
        options: [
          "GDP should be abolished as a metric",
          "Development policy should focus on expanding human capabilities, not just income growth",
          "Sen disagrees with all economic measurement",
          "Freedom is more important than economic stability",
        ],
        correct: 1,
        explanation:
          "The passage argues that GDP alone is inadequate and that Sen's approach emphasises human freedoms/capabilities. The most supported inference is that development policy must go beyond income — expanding capabilities and freedoms.",
        difficulty: "hard",
        xp: 100,
      },
    ],
  },
};

// ─── HELPER: get questions for a quiz session ──────────────────────
export function getQuizQuestions(categoryId, difficulty, count = 10) {
  const catQuestions = QUESTIONS[categoryId];
  if (!catQuestions) return [];

  let pool = [];

  if (difficulty === "mixed") {
    pool = [
      ...(catQuestions.easy ?? []),
      ...(catQuestions.medium ?? []),
      ...(catQuestions.hard ?? []),
    ];
  } else {
    pool = catQuestions[difficulty] ?? [];
  }

  // Shuffle and return up to `count`
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, pool.length));
}

// ─── HELPER: calculate score summary ──────────────────────────────
export function calcScore(answers, questions, difficulty) {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty);
  const multiplier = diff?.xpMultiplier ?? 1;
  let correct = 0;
  let totalXP = 0;

  answers.forEach((ans, i) => {
    const q = questions[i];
    if (!q) return;
    if (ans === q.correct) {
      correct++;
      totalXP += Math.round(q.xp * multiplier);
    }
  });

  const accuracy =
    questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  return {
    correct,
    wrong: questions.length - correct,
    totalXP,
    accuracy,
    total: questions.length,
  };
}

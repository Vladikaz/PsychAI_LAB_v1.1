/**
 * Expert-level mock data for Lab visualizations
 * These simulate what the AI would return for linguistic analysis
 */

import type { InterferenceAnalysis, EtymologyAnalysis, CognitiveAnalysis } from "./labStore";

export const mockInterferenceAnalysis: InterferenceAnalysis = {
  bridges: [
    {
      l1Concept: "Subject-Verb-Object word order",
      l2Concept: "SVO structure in declarative sentences",
      type: "grammatical",
      transferType: "positive",
      explanation: "English and Russian share SVO in basic statements, enabling direct structural transfer."
    },
    {
      l1Concept: "Plural noun endings",
      l2Concept: "-s/-es plural markers",
      type: "grammatical",
      transferType: "positive",
      explanation: "Both languages mark plurality explicitly, though morphology differs."
    },
    {
      l1Concept: "International vocabulary (телефон)",
      l2Concept: "Telephone/technology terms",
      type: "lexical",
      transferType: "positive",
      explanation: "Cognates from Greek/Latin roots transfer easily between languages."
    }
  ],
  pitfalls: [
    {
      l1Pattern: "Omission of articles (no articles in Russian)",
      l2Error: "'I see book' instead of 'I see a/the book'",
      severity: "high",
      explanation: "Russian lacks articles entirely, causing systematic omission in English output.",
      correction: "Explicit article decision trees: Is it specific? → 'the'. First mention? → 'a/an'."
    },
    {
      l1Pattern: "Verb aspect (perfective/imperfective)",
      l2Error: "Confusion between simple and progressive tenses",
      severity: "high",
      explanation: "Russian aspect doesn't map 1:1 to English tense-aspect combinations.",
      correction: "Focus on temporal context clues: 'right now' → progressive, 'every day' → simple."
    },
    {
      l1Pattern: "Preposition usage (на столе = on table)",
      l2Error: "'I am on lesson' instead of 'I am in class'",
      severity: "medium",
      explanation: "Preposition semantics differ; direct translation fails.",
      correction: "Teach collocations as chunks, not individual prepositions."
    }
  ],
  falseFriends: [
    {
      l1Word: "магазин (magazin)",
      l2Word: "magazine",
      l1Meaning: "store/shop",
      l2Meaning: "periodical publication"
    },
    {
      l1Word: "фабрика (fabrika)",
      l2Word: "fabric",
      l1Meaning: "factory",
      l2Meaning: "cloth/material"
    },
    {
      l1Word: "симпатичный (simpatichny)",
      l2Word: "sympathetic",
      l1Meaning: "attractive/good-looking",
      l2Meaning: "showing understanding"
    },
    {
      l1Word: "актуальный (aktualny)",
      l2Word: "actual",
      l1Meaning: "relevant/current",
      l2Meaning: "real/true"
    }
  ],
  decisionTree: [
    {
      step: 1,
      l1Logic: "In Russian, 'I have' uses dative construction: 'У меня есть'",
      l2Result: "Student may produce: 'At me is book'",
      isError: true
    },
    {
      step: 2,
      l1Logic: "Russian allows flexible word order for emphasis",
      l2Result: "Student may produce: 'Very interesting was the movie'",
      isError: true
    },
    {
      step: 3,
      l1Logic: "Russian uses reflexive verbs for middle voice",
      l2Result: "Student correctly uses: 'I washed myself'",
      isError: false
    },
    {
      step: 4,
      l1Logic: "Double negatives are grammatical in Russian",
      l2Result: "Student may produce: 'I don't see nobody'",
      isError: true
    }
  ]
};

export const mockEtymologyAnalysis: EtymologyAnalysis = {
  connections: [
    {
      id: "1",
      word: "telephone",
      root: "tele- + phone",
      rootLanguage: "Greek",
      cognates: [
        { language: "Russian", word: "телефон" },
        { language: "German", word: "Telefon" },
        { language: "French", word: "téléphone" },
        { language: "Spanish", word: "teléfono" }
      ],
      meaning: "far + sound/voice"
    },
    {
      id: "2",
      word: "biology",
      root: "bio- + -logy",
      rootLanguage: "Greek",
      cognates: [
        { language: "Russian", word: "биология" },
        { language: "German", word: "Biologie" },
        { language: "French", word: "biologie" }
      ],
      meaning: "life + study of"
    },
    {
      id: "3",
      word: "photograph",
      root: "photo- + -graph",
      rootLanguage: "Greek",
      cognates: [
        { language: "Russian", word: "фотография" },
        { language: "German", word: "Fotografie" },
        { language: "French", word: "photographie" }
      ],
      meaning: "light + writing/drawing"
    },
    {
      id: "4",
      word: "democracy",
      root: "demo- + -cracy",
      rootLanguage: "Greek",
      cognates: [
        { language: "Russian", word: "демократия" },
        { language: "German", word: "Demokratie" },
        { language: "French", word: "démocratie" }
      ],
      meaning: "people + rule/power"
    },
    {
      id: "5",
      word: "manuscript",
      root: "manu- + script",
      rootLanguage: "Latin",
      cognates: [
        { language: "Russian", word: "манускрипт" },
        { language: "German", word: "Manuskript" },
        { language: "French", word: "manuscrit" }
      ],
      meaning: "hand + written"
    }
  ],
  rootGroups: [
    {
      root: "graph/scrib (to write)",
      meaning: "Writing, drawing, or recording",
      words: ["photograph", "biography", "autograph", "graphic", "manuscript", "describe", "prescription"]
    },
    {
      root: "tele (far, distant)",
      meaning: "At a distance, remote",
      words: ["telephone", "television", "telegram", "telepathy", "telescope"]
    },
    {
      root: "bio (life)",
      meaning: "Living organisms, life processes",
      words: ["biology", "biography", "antibiotic", "biodiversity", "biopsy"]
    },
    {
      root: "demo (people)",
      meaning: "Population, common people",
      words: ["democracy", "demographics", "epidemic", "pandemic"]
    }
  ]
};

export const mockCognitiveAnalysis: CognitiveAnalysis = {
  loadPoints: [
    { position: 0, word: "The", load: 10, reason: "High-frequency function word" },
    { position: 1, word: "unprecedented", load: 85, reason: "Low-frequency, 5 syllables, abstract" },
    { position: 2, word: "ramifications", load: 90, reason: "Complex morphology, abstract semantics" },
    { position: 3, word: "of", load: 5, reason: "Function word" },
    { position: 4, word: "the", load: 5, reason: "Function word" },
    { position: 5, word: "geopolitical", load: 80, reason: "Compound, domain-specific" },
    { position: 6, word: "restructuring", load: 75, reason: "Nominalization, multiple morphemes" },
    { position: 7, word: "necessitate", load: 70, reason: "Formal register, Latinate" },
    { position: 8, word: "a", load: 5, reason: "Function word" },
    { position: 9, word: "paradigmatic", load: 95, reason: "Academic vocabulary, Greek origin, abstract" },
    { position: 10, word: "shift", load: 25, reason: "Common word but metaphorical use" },
    { position: 11, word: "in", load: 5, reason: "Function word" },
    { position: 12, word: "diplomatic", load: 55, reason: "Domain-specific but familiar" },
    { position: 13, word: "discourse", load: 65, reason: "Academic register, multiple meanings" }
  ],
  overallScore: 72,
  heatmapSegments: [
    { text: "The ", load: 10, startIndex: 0, endIndex: 4 },
    { text: "unprecedented ", load: 85, startIndex: 4, endIndex: 18 },
    { text: "ramifications ", load: 90, startIndex: 18, endIndex: 32 },
    { text: "of the ", load: 5, startIndex: 32, endIndex: 39 },
    { text: "geopolitical ", load: 80, startIndex: 39, endIndex: 52 },
    { text: "restructuring ", load: 75, startIndex: 52, endIndex: 66 },
    { text: "necessitate ", load: 70, startIndex: 66, endIndex: 78 },
    { text: "a ", load: 5, startIndex: 78, endIndex: 80 },
    { text: "paradigmatic ", load: 95, startIndex: 80, endIndex: 93 },
    { text: "shift ", load: 25, startIndex: 93, endIndex: 99 },
    { text: "in ", load: 5, startIndex: 99, endIndex: 102 },
    { text: "diplomatic ", load: 55, startIndex: 102, endIndex: 113 },
    { text: "discourse.", load: 65, startIndex: 113, endIndex: 123 }
  ],
  scaffoldingAdvice: [
    {
      position: "Before 'unprecedented ramifications'",
      advice: "Pre-teach vocabulary: 'unprecedented' (never happened before) and 'ramifications' (consequences, effects). Use L1 cognates if available.",
      priority: "high"
    },
    {
      position: "After 'geopolitical restructuring'",
      advice: "Pause for comprehension check. Ask students to paraphrase: 'What is changing between countries?'",
      priority: "high"
    },
    {
      position: "At 'paradigmatic shift'",
      advice: "This is the highest cognitive load point. Provide visual anchor: draw old model → new model diagram. Allow 30-second processing time.",
      priority: "high"
    },
    {
      position: "End of sentence",
      advice: "Summarize full sentence in simpler terms before proceeding. Consider chunking into two shorter sentences for lower-level learners.",
      priority: "medium"
    }
  ],
  graphData: [
    { position: 1, mentalEffort: 10, label: "The" },
    { position: 2, mentalEffort: 85, label: "unprecedented" },
    { position: 3, mentalEffort: 90, label: "ramifications" },
    { position: 4, mentalEffort: 15, label: "of the" },
    { position: 5, mentalEffort: 80, label: "geopolitical" },
    { position: 6, mentalEffort: 75, label: "restructuring" },
    { position: 7, mentalEffort: 70, label: "necessitate" },
    { position: 8, mentalEffort: 10, label: "a" },
    { position: 9, mentalEffort: 95, label: "paradigmatic" },
    { position: 10, mentalEffort: 25, label: "shift" },
    { position: 11, mentalEffort: 10, label: "in" },
    { position: 12, mentalEffort: 55, label: "diplomatic" },
    { position: 13, mentalEffort: 65, label: "discourse" }
  ]
};

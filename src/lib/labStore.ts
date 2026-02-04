/**
 * Lab State Store
 * Simple state persistence for lab tools to prevent data loss when navigating
 */

import { getDemoScopeId } from "./demoScope";

interface InterferenceMapState {
  l1Text: string;
  l2Text: string;
  taskCategory: string;
  contentArea: string;
  analysisResult: InterferenceAnalysis | null;
}

interface EtymologyState {
  words: string;
  analysisResult: EtymologyAnalysis | null;
}

interface CognitiveScannerState {
  textPassage: string;
  analysisResult: CognitiveAnalysis | null;
}

export interface InterferenceAnalysis {
  bridges: Array<{
    l1Concept: string;
    l2Concept: string;
    type: "grammatical" | "lexical" | "phonetic";
    transferType: "positive" | "neutral";
    explanation: string;
  }>;
  pitfalls: Array<{
    l1Pattern: string;
    l2Error: string;
    severity: "high" | "medium" | "low";
    explanation: string;
    correction: string;
  }>;
  falseFriends: Array<{
    l1Word: string;
    l2Word: string;
    l1Meaning: string;
    l2Meaning: string;
  }>;
  decisionTree: Array<{
    step: number;
    l1Logic: string;
    l2Result: string;
    isError: boolean;
  }>;
}

export interface EtymologyAnalysis {
  connections: Array<{
    id: string;
    word: string;
    root: string;
    rootLanguage: string;
    cognates: Array<{
      language: string;
      word: string;
    }>;
    meaning: string;
  }>;
  rootGroups: Array<{
    root: string;
    meaning: string;
    words: string[];
  }>;
}

export interface CognitiveAnalysis {
  loadPoints: Array<{
    position: number;
    word: string;
    load: number; // 0-100
    reason: string;
  }>;
  overallScore: number;
  heatmapSegments: Array<{
    text: string;
    load: number;
    startIndex: number;
    endIndex: number;
  }>;
  scaffoldingAdvice: Array<{
    position: string;
    advice: string;
    priority: "high" | "medium" | "low";
  }>;
  graphData: Array<{
    position: number;
    mentalEffort: number;
    label: string;
  }>;
}

interface LabState {
  interferenceMap: InterferenceMapState;
  etymology: EtymologyState;
  cognitiveScanner: CognitiveScannerState;
}

const STORAGE_KEY_PREFIX = "lab_state_";

const getStorageKey = () => `${STORAGE_KEY_PREFIX}${getDemoScopeId()}`;

const defaultState: LabState = {
  interferenceMap: {
    l1Text: "",
    l2Text: "",
    taskCategory: "grammar",
    contentArea: "",
    analysisResult: null,
  },
  etymology: {
    words: "",
    analysisResult: null,
  },
  cognitiveScanner: {
    textPassage: "",
    analysisResult: null,
  },
};

export const getLabState = (): LabState => {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      return { ...defaultState, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load lab state:", e);
  }
  return defaultState;
};

export const saveLabState = (state: Partial<LabState>) => {
  try {
    const current = getLabState();
    const updated = { ...current, ...state };
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save lab state:", e);
  }
};

export const updateInterferenceMapState = (update: Partial<InterferenceMapState>) => {
  const current = getLabState();
  saveLabState({
    interferenceMap: { ...current.interferenceMap, ...update },
  });
};

export const updateEtymologyState = (update: Partial<EtymologyState>) => {
  const current = getLabState();
  saveLabState({
    etymology: { ...current.etymology, ...update },
  });
};

export const updateCognitiveScannerState = (update: Partial<CognitiveScannerState>) => {
  const current = getLabState();
  saveLabState({
    cognitiveScanner: { ...current.cognitiveScanner, ...update },
  });
};

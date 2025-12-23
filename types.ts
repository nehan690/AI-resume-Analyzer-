
export interface ResumeAnalysis {
  score: number;
  atsCompatibility: number;
  strengths: string[];
  weaknesses: string[];
  keywordSuggestions: string[];
  improvementRecommendations: string[];
  suggestedSkills: string[];
  summary: string;
}

export interface AnalysisState {
  loading: boolean;
  result: ResumeAnalysis | null;
  error: string | null;
}

// Added Language type to fix error: Module '"../types"' has no exported member 'Language'.
export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'go' | 'rust' | 'other';

// Added AnalysisTab enum to fix error: '"../types"' has no exported member named 'AnalysisTab'.
export enum AnalysisTab {
  EXPLAIN = 'EXPLAIN',
  BUGS = 'BUGS',
  OPTIMIZE = 'OPTIMIZE',
  TESTS = 'TESTS',
  RESOURCES = 'RESOURCES',
}

// Added Message interface to fix error: Module '"../types"' has no exported member 'Message'.
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

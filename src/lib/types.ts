export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: string[];
  experience: string[];
  certifications: string[];
  languages: string[];
  experienceYears: number;
};

export type CategoryScores = {
  skills: number;
  keywords: number;
  experience: number;
  formatting: number;
};

export type AiFeedback = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rewrittenBullets: string[];
  careerRecommendations: string[];
};

export type AnalysisPayload = {
  id?: number;
  filename: string;
  rawText: string;
  parsedResume: ParsedResume;
  atsScore: number;
  matchScore: number | null;
  categoryScores: CategoryScores;
  extractedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  aiFeedback: AiFeedback;
  jobDescription?: string;
  createdAt?: string;
};

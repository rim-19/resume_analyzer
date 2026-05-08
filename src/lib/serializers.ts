import type { AnalysisPayload } from "@/lib/types";

type DbAnalysis = {
  id: number;
  filename: string;
  rawText: string;
  parsedResume: unknown;
  atsScore: number;
  matchScore: number | null;
  categoryScores: unknown;
  extractedSkills: unknown;
  missingSkills: unknown;
  aiFeedback: unknown;
  jobDescription: string | null;
  createdAt: Date;
};

export function toAnalysisPayload(analysis: DbAnalysis): AnalysisPayload {
  return {
    id: analysis.id,
    filename: analysis.filename,
    rawText: analysis.rawText,
    parsedResume: analysis.parsedResume as AnalysisPayload["parsedResume"],
    atsScore: analysis.atsScore,
    matchScore: analysis.matchScore,
    categoryScores: analysis.categoryScores as AnalysisPayload["categoryScores"],
    extractedSkills: analysis.extractedSkills as string[],
    missingSkills: analysis.missingSkills as string[],
    matchedKeywords: [],
    aiFeedback: analysis.aiFeedback as AnalysisPayload["aiFeedback"],
    jobDescription: analysis.jobDescription ?? undefined,
    createdAt: analysis.createdAt.toISOString()
  };
}

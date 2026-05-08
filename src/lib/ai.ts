import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "@/lib/constants";
import type { AiFeedback, CategoryScores, ParsedResume } from "@/lib/types";

const fallbackFeedback: AiFeedback = {
  summary: "Resume analysis completed with deterministic ATS scoring. AI feedback is unavailable right now.",
  strengths: ["Clear resume structure", "Detected relevant technical skills"],
  weaknesses: ["Some achievements could be more measurable", "Job-specific keywords may need refinement"],
  suggestions: ["Add quantified impact to recent bullet points", "Mirror important job description keywords naturally", "Keep the technical summary focused on the target role"],
  rewrittenBullets: ["Improved a user-facing workflow by measuring performance, reducing friction, and documenting the final impact."],
  careerRecommendations: ["Target roles that match the strongest detected skills while filling missing keyword gaps."]
};

function jsonFromText(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

function ensureFeedback(value: Partial<AiFeedback>): AiFeedback {
  return {
    summary: value.summary || fallbackFeedback.summary,
    strengths: value.strengths?.slice(0, 6) || fallbackFeedback.strengths,
    weaknesses: value.weaknesses?.slice(0, 6) || fallbackFeedback.weaknesses,
    suggestions: value.suggestions?.slice(0, 8) || fallbackFeedback.suggestions,
    rewrittenBullets: value.rewrittenBullets?.slice(0, 4) || fallbackFeedback.rewrittenBullets,
    careerRecommendations: value.careerRecommendations?.slice(0, 4) || fallbackFeedback.careerRecommendations
  };
}

export async function generateAiFeedback(input: {
  rawText: string;
  parsedResume: ParsedResume;
  atsScore: number;
  categoryScores: CategoryScores;
  missingSkills: string[];
  jobDescription?: string;
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallbackFeedback;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Analyze this resume as an ATS and recruiter. Use only the resume text, parsed resume, score data, missing skills, and job description below. Do not invent employers, degrees, projects, metrics, certifications, or skills that are not present. If a recommendation is speculative, phrase it as a recommendation, not as a fact.

Return strict valid JSON only with keys:
summary string, strengths string[], weaknesses string[], suggestions string[], rewrittenBullets string[], careerRecommendations string[].
Rules:
- summary must be 1 concise paragraph.
- strengths must be grounded in resume/job data.
- weaknesses must focus on actual missing or weak evidence.
- suggestions must be practical resume edits.
- rewrittenBullets may improve wording but must not invent fake numbers, employers, or technologies.
- careerRecommendations must be relevant to the detected role and missing skills.

ATS score: ${input.atsScore}
Category scores: ${JSON.stringify(input.categoryScores)}
Parsed resume: ${JSON.stringify(input.parsedResume)}
Missing skills: ${input.missingSkills.join(", ") || "None detected"}
Job description: ${input.jobDescription || "No job description provided"}
Resume text:
${input.rawText.slice(0, 12000)}`;

    const result = await model.generateContent(prompt);
    return ensureFeedback(jsonFromText(result.response.text()));
  } catch (error) {
    console.error("Gemini feedback failed:", error);
    return fallbackFeedback;
  }
}

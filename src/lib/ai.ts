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
    strengths: value.strengths?.slice(0, 10) || fallbackFeedback.strengths,
    weaknesses: value.weaknesses?.slice(0, 10) || fallbackFeedback.weaknesses,
    suggestions: value.suggestions?.slice(0, 12) || fallbackFeedback.suggestions,
    rewrittenBullets: value.rewrittenBullets?.slice(0, 6) || fallbackFeedback.rewrittenBullets,
    careerRecommendations: value.careerRecommendations?.slice(0, 6) || fallbackFeedback.careerRecommendations
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
    const prompt = `Act as a world-class Executive Resume Writer and Senior Technical Recruiter with expertise in Applicant Tracking Systems (ATS) and talent acquisition for high-growth tech companies.

Your task is to provide a deep, hyper-specific analysis of the provided resume, evaluating it against the job description (if provided) and general industry standards.

CONTEXT DATA:
- ATS Overall Score: ${input.atsScore}/100
- Category Scores: ${JSON.stringify(input.categoryScores)}
- Detected Skills: ${input.parsedResume.skills.join(", ")}
- Missing Job Keywords: ${input.missingSkills.join(", ") || "None"}
- Target Job: ${input.jobDescription || "General Industry Standard"}

CONSTRAINTS:
1. Do not invent any facts (employers, dates, degrees).
2. If suggesting an improvement, be specific.
3. LANGUAGE: Detect the language of the resume text. Provide the ENTIRE analysis (summary, strengths, suggestions, etc.) in that same language.
4. Use professional, encouraging, but blunt and realistic tone.
5. Return ONLY a valid JSON object.

JSON STRUCTURE & RULES:
{
  "summary": "A 3-4 sentence professional evaluation of the candidate's marketability and role alignment. Highlight the biggest 'hook' or the biggest 'red flag'.",
  "strengths": ["Identify 4-6 specific strengths. Use technical evidence (e.g., 'Strong cloud architecture foundation with AWS certification')."],
  "weaknesses": ["Identify 4-6 critical gaps. Focus on missing skills from the job description or vague descriptions of past impact."],
  "suggestions": ["Provide 6-8 highly actionable edits. Include keyword placement advice and structural improvements (e.g., 'Move the Skills section above Experience for better ATS visibility')."],
  "rewrittenBullets": ["Take 3-4 existing bullet points and rewrite them using the Google XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]). Ensure they sound premium and impact-driven."],
  "careerRecommendations": ["Suggest 3-4 strategic next steps for career growth based on the detected level and current market trends."]
}

RESUME CONTENT:
${input.rawText.slice(0, 15000)}`;

    const result = await model.generateContent(prompt);
    return ensureFeedback(jsonFromText(result.response.text()));
  } catch (error) {
    console.error("GEMINI API ERROR:", error);
    return fallbackFeedback;
  }
}

export async function generateCoverLetter(input: {
  resumeText: string;
  jobDescription: string;
  name: string;
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("API key missing");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Act as a world-class Executive Resume Writer. Write a high-impact, tailored cover letter for ${input.name} based on their resume and the job description below.
  
  RULES:
  1. Detect the language of the resume/job description and write the cover letter in that same language.
  2. Use a modern, professional, and enthusiastic tone.
  3. Focus on how the candidate's specific skills solve the employer's problems.
  4. Include placeholders like [Hiring Manager Name] or [Company Name] if they are not detected in the job description.
  5. Keep it to one page (approx 300-400 words).
  6. Return only the plain text of the cover letter.
  
  RESUME:
  ${input.resumeText.slice(0, 10000)}
  
  JOB DESCRIPTION:
  ${input.jobDescription || "Standard role in this field"}
  
  FINAL TAILORED COVER LETTER:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

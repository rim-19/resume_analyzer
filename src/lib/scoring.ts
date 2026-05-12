import { SKILL_KEYWORDS } from "@/lib/constants";
import { clamp } from "@/lib/utils";
import type { CategoryScores, ParsedResume } from "@/lib/types";

const ACTION_WORDS = ["built", "created", "led", "improved", "optimized", "reduced", "increased", "launched", "designed", "developed"];
const STOP_WORDS = new Set([
  "with", "from", "this", "that", "your", "have", "will", "resume", "experience", 
  "need", "include", "required", "skills", "education", "professional", "summary",
  "contact", "phone", "email", "address", "work", "history", "present", "about",
  "using", "during", "within", "across", "other"
]);

function includesTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(text);
}

function uniqueCaseInsensitive(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const clean = value.trim();
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      output.push(clean);
    }
  }

  return output;
}

export function extractKeywords(text: string) {
  const skillMatches = SKILL_KEYWORDS.filter((skill) => includesTerm(text, skill));
  const wordMatches = text
    .toLowerCase()
    .match(/\b[a-z][a-z+#.]{2,}\b/g)
    ?.filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  return uniqueCaseInsensitive([...skillMatches, ...(wordMatches ?? [])]).slice(0, 80);
}

export function calculateMatch(resumeText: string, resumeSkills: string[], jobDescription?: string) {
  if (!jobDescription?.trim()) {
    return { matchScore: null, missingSkills: [], matchedKeywords: resumeSkills.slice(0, 12), jobKeywords: [] };
  }

  const jobKeywords = extractKeywords(jobDescription);
  const jobSkills = jobKeywords.filter((k) => SKILL_KEYWORDS.some((s) => s.toLowerCase() === k.toLowerCase()));
  
  const matchedKeywords = jobKeywords.filter((keyword) => includesTerm(resumeText, keyword));
  const matchedSkills = matchedKeywords.filter((k) => SKILL_KEYWORDS.some((s) => s.toLowerCase() === k.toLowerCase()));
  
  const missingSkills = uniqueCaseInsensitive(
    jobSkills.filter((skill) => !includesTerm(resumeText, skill))
  ).slice(0, 12);

  let finalScore = 0;
  if (jobSkills.length > 0) {
    // Technical job: Skills are priority
    const skillScore = (matchedSkills.length / jobSkills.length) * 100;
    const generalScore = jobKeywords.length ? (matchedKeywords.length / jobKeywords.length) * 100 : 0;
    finalScore = skillScore * 0.8 + generalScore * 0.2;
  } else {
    // Non-technical job: Rely on keyword density but with a penalty if the resume is too technical for the role
    const generalScore = jobKeywords.length ? (matchedKeywords.length / jobKeywords.length) * 100 : 0;
    const techBias = (resumeSkills.length / 15) * 100; // How "technical" is the resume?
    finalScore = Math.max(0, generalScore - (techBias > 50 ? 20 : 0)); // Penalty if resume is technical but job isn't
  }

  return { matchScore: Math.round(clamp(finalScore)), missingSkills, matchedKeywords: matchedKeywords.slice(0, 20), jobKeywords };
}

export function calculateAtsScore(parsed: ParsedResume, rawText: string, jobDescription?: string) {
  const match = calculateMatch(rawText, parsed.skills, jobDescription);
  const skillTarget = jobDescription ? Math.max(8, match.jobKeywords.filter((keyword) => SKILL_KEYWORDS.map((s) => s.toLowerCase()).includes(keyword.toLowerCase())).length) : 10;
  const skillScore = jobDescription && match.matchScore !== null ? match.matchScore : clamp((parsed.skills.length / skillTarget) * 100);

  const keywordCount = extractKeywords(rawText).length;
  const keywordScore = clamp((keywordCount / 28) * 100);
  const quantifiedBullets = (rawText.match(/\d+%|\$\d+|\b\d+x\b|\b\d+\s*(users|clients|projects|teams|hours|days)\b/gi) ?? []).length;
  const actionVerbHits = ACTION_WORDS.filter((word) => rawText.toLowerCase().includes(word)).length;
  const experienceScore = clamp(parsed.experienceYears * 16 + quantifiedBullets * 8 + actionVerbHits * 5);
  const formattingScore = clamp(
    (parsed.email ? 18 : 0) +
      (parsed.phone ? 14 : 0) +
      (parsed.education.length ? 18 : 0) +
      (parsed.experience.length ? 24 : 0) +
      (parsed.skills.length ? 18 : 0) +
      (rawText.length > 900 ? 8 : 0)
  );

  const categoryScores: CategoryScores = {
    skills: clamp(skillScore),
    keywords: keywordScore,
    experience: experienceScore,
    formatting: formattingScore
  };

  const atsScore = clamp(categoryScores.skills * 0.4 + categoryScores.keywords * 0.25 + categoryScores.experience * 0.2 + categoryScores.formatting * 0.15);

  return {
    atsScore,
    categoryScores,
    matchScore: match.matchScore,
    missingSkills: match.missingSkills,
    matchedKeywords: match.matchedKeywords
  };
}

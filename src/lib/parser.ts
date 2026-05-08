import mammoth from "mammoth";
import pdf from "pdf-parse";
import { SKILL_KEYWORDS } from "@/lib/constants";
import type { ParsedResume } from "@/lib/types";

function normalizeText(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractTextFromFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const result = await pdf(buffer);
    return normalizeText(result.text);
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value);
  }

  throw new Error("Unsupported file format. Upload a PDF or DOCX resume.");
}

function findSection(text: string, names: string[]) {
  const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`(?:^|\\n)\\s*(${escaped})\\s*\\n([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z /&-]{2,}\\s*\\n|$)`, "i");
  return text.match(pattern)?.[2]?.trim() ?? "";
}

function splitLines(section: string) {
  return section
    .split(/\n|•/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

function extractSkills(text: string) {
  return SKILL_KEYWORDS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(text);
  });
}

function extractExperienceYears(text: string) {
  const explicit = [...text.matchAll(/(\d+)\+?\s*(?:years|yrs)\s+(?:of\s+)?experience/gi)].map((match) => Number(match[1]));
  if (explicit.length) return Math.max(...explicit);

  const years = [...text.matchAll(/\b(20\d{2}|19\d{2})\b/g)].map((match) => Number(match[1]));
  if (years.length >= 2) {
    const min = Math.min(...years);
    const max = Math.max(...years, new Date().getFullYear());
    return Math.min(20, Math.max(0, max - min));
  }

  return 0;
}

export function parseResumeText(rawText: string): ParsedResume {
  const text = normalizeText(rawText);
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = text.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,5}\d{2,4}/)?.[0] ?? "";
  const name = lines.find((line) => !line.includes("@") && !/\d{3}/.test(line) && line.length < 80) ?? "Unknown Candidate";

  const education = splitLines(findSection(text, ["education", "academic background"]));
  const experience = splitLines(findSection(text, ["experience", "work experience", "employment", "professional experience"]));
  const certifications = splitLines(findSection(text, ["certifications", "certificates", "licenses"]));
  const languages = splitLines(findSection(text, ["languages"]));
  const sectionSkills = splitLines(findSection(text, ["skills", "technical skills", "core skills"]));
  const detectedSkills = extractSkills(text);
  const combinedSkills = [...new Set([...detectedSkills, ...sectionSkills.flatMap((line) => line.split(/,|;/).map((skill) => skill.trim()))])]
    .filter((skill) => skill.length > 1)
    .slice(0, 30);

  return {
    name,
    email,
    phone,
    skills: combinedSkills,
    education,
    experience,
    certifications,
    languages,
    experienceYears: extractExperienceYears(text)
  };
}

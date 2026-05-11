import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAiFeedback } from "@/lib/ai";
import { MAX_FILE_SIZE, SAMPLE_RESUME_TEXT } from "@/lib/constants";
import { extractTextFromFile, parseResumeText } from "@/lib/parser";
import { prisma } from "@/lib/prisma";
import { calculateAtsScore } from "@/lib/scoring";
import { toAnalysisPayload } from "@/lib/serializers";

const formSchema = z.object({
  jobDescription: z.string().optional(),
  demo: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsedForm = formSchema.parse({
      jobDescription: formData.get("jobDescription")?.toString(),
      demo: formData.get("demo")?.toString()
    });
    const file = formData.get("file");

    let filename = "demo-resume.txt";
    let rawText = SAMPLE_RESUME_TEXT;

    if (parsedForm.demo !== "true") {
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Upload a PDF or DOCX resume." }, { status: 400 });
      }

      const extension = file.name.toLowerCase().split(".").pop();
      const allowedType =
        extension === "pdf" ||
        extension === "docx" ||
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!allowedType) {
        return NextResponse.json({ error: "Only PDF and DOCX resumes are supported." }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File size must be 5MB or less." }, { status: 400 });
      }

      filename = file.name;
      rawText = await extractTextFromFile(file);
    }

    if (rawText.length < 80) {
      return NextResponse.json({ error: "Could not extract enough resume text from this file." }, { status: 422 });
    }

    const parsedResume = parseResumeText(rawText);
    const score = calculateAtsScore(parsedResume, rawText, parsedForm.jobDescription);

    const aiFeedback = await generateAiFeedback({
      rawText,
      parsedResume,
      atsScore: score.atsScore,
      categoryScores: score.categoryScores,
      missingSkills: score.missingSkills,
      jobDescription: parsedForm.jobDescription
    });

    const analysis = await prisma.analysis.create({
      data: {
        filename,
        candidateName: parsedResume.name,
        email: parsedResume.email || null,
        phone: parsedResume.phone || null,
        atsScore: score.atsScore,
        matchScore: score.matchScore,
        extractedSkills: parsedResume.skills,
        missingSkills: score.missingSkills,
        categoryScores: score.categoryScores,
        parsedResume,
        aiFeedback,
        jobDescription: parsedForm.jobDescription || null,
        rawText
      }
    });

    return NextResponse.json({
      ...toAnalysisPayload(analysis),
      matchedKeywords: score.matchedKeywords
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ 
      error: "Analysis failed. Check your file, database, and Gemini configuration.",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
 
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAiFeedback } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { calculateAtsScore } from "@/lib/scoring";
import { toAnalysisPayload } from "@/lib/serializers";

const bodySchema = z.object({
  analysisId: z.number(),
  jobDescription: z.string().min(40, "Paste a more complete job description.")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { analysisId, jobDescription, rawText: providedRawText, parsedResume: providedParsedResume } = body;

    let rawText = providedRawText;
    let parsedResume = providedParsedResume;

    if (!rawText || !parsedResume) {
      const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
      if (!analysis) {
        return NextResponse.json({ error: "Analysis data missing or not found." }, { status: 404 });
      }
      rawText = analysis.rawText;
      parsedResume = analysis.parsedResume;
    }

    const score = calculateAtsScore(parsedResume, rawText, jobDescription);
    const aiFeedback = await generateAiFeedback({
      rawText,
      parsedResume,
      atsScore: score.atsScore,
      categoryScores: score.categoryScores,
      missingSkills: score.missingSkills,
      jobDescription
    });

    const result = {
      id: analysisId || Date.now(),
      filename: "recalculated-analysis",
      rawText,
      parsedResume,
      atsScore: score.atsScore,
      matchScore: score.matchScore,
      missingSkills: score.missingSkills,
      categoryScores: score.categoryScores,
      aiFeedback,
      jobDescription,
      createdAt: new Date()
    };

    return NextResponse.json({ ...toAnalysisPayload(result as any), matchedKeywords: score.matchedKeywords });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Job matching failed." }, { status: 500 });
  }
}

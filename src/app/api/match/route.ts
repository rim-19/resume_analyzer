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
    const body = bodySchema.parse(await request.json());
    const analysis = await prisma.analysis.findUnique({ where: { id: body.analysisId } });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    const parsedResume = analysis.parsedResume as ReturnType<typeof toAnalysisPayload>["parsedResume"];
    const score = calculateAtsScore(parsedResume, analysis.rawText, body.jobDescription);
    const aiFeedback = await generateAiFeedback({
      rawText: analysis.rawText,
      parsedResume,
      atsScore: score.atsScore,
      categoryScores: score.categoryScores,
      missingSkills: score.missingSkills,
      jobDescription: body.jobDescription
    });

    const updated = await prisma.analysis.update({
      where: { id: body.analysisId },
      data: {
        atsScore: score.atsScore,
        matchScore: score.matchScore,
        missingSkills: score.missingSkills,
        categoryScores: score.categoryScores,
        aiFeedback,
        jobDescription: body.jobDescription
      }
    });

    return NextResponse.json({ ...toAnalysisPayload(updated), matchedKeywords: score.matchedKeywords });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Job matching failed." }, { status: 500 });
  }
}

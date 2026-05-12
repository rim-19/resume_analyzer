import { NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { analysisId, jobDescription, resumeText: providedResumeText, name: providedName } = await req.json();

    let resumeText = providedResumeText;
    let name = providedName;
    let fallbackJobDescription = jobDescription;

    if (!resumeText || !name) {
      if (!analysisId) {
        return NextResponse.json({ error: "Analysis ID or resume data is required." }, { status: 400 });
      }

      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId }
      });

      if (!analysis) {
        return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
      }

      resumeText = analysis.rawText;
      name = (analysis.parsedResume as any).name || "Candidate";
      fallbackJobDescription = jobDescription || analysis.jobDescription || "";
    }

    const coverLetter = await generateCoverLetter({
      resumeText,
      jobDescription: fallbackJobDescription || "Standard role in this field",
      name: name || "Candidate"
    });

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Cover Letter Error:", error);
    return NextResponse.json({ error: "Failed to generate cover letter." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toAnalysisPayload } from "@/lib/serializers";

export async function GET() {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(analyses.map(toAnalysisPayload));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load saved analyses." }, { status: 500 });
  }
}

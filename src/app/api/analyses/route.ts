import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toAnalysisPayload } from "@/lib/serializers";

export async function GET() {
  try {
    return NextResponse.json([]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load saved analyses." }, { status: 500 });
  }
}

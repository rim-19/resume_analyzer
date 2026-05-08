-- CreateTable
CREATE TABLE "analyses" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "candidateName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "ats_score" INTEGER NOT NULL,
    "match_score" INTEGER,
    "extracted_skills" JSONB NOT NULL,
    "missing_skills" JSONB NOT NULL,
    "category_scores" JSONB NOT NULL,
    "parsed_resume" JSONB NOT NULL,
    "ai_feedback" JSONB NOT NULL,
    "job_description" TEXT,
    "raw_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

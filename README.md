# ResumeIQ — AI Resume Analyzer

An AI tool that reads a resume, scores it the way an Applicant Tracking System (ATS) would, and suggests concrete, evidence-based rewrites.

## Overview

Upload a CV as PDF or DOCX and ResumeIQ parses it, evaluates it against ATS-style criteria, and returns an actionable report: a weighted score, strengths and weaknesses, rewritten experience bullets, and a matching cover letter. It's built for job seekers who want to see how a recruiter's automated screen would read their resume.

## Features

- Upload **PDF or DOCX** by drag and drop, parsed on the server
- **ATS score** with a weighted breakdown (skills, keywords, experience, formatting)
- **Evidence-based** strengths and weaknesses
- **Rewrites** experience bullets using the Google XYZ formula
- Generates a tailored **cover letter**
- Visual **charts** of the breakdown and **PDF export** of the report

## Tech stack

- **App:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **AI:** Google Gemini (`@google/generative-ai`)
- **Parsing:** pdf-parse, mammoth (DOCX)
- **Charts / export:** Recharts, jsPDF, html2canvas
- **Data:** Prisma

## Getting started

```bash
npm install            # runs prisma generate (postinstall)
cp .env.example .env   # then fill in the values below
npm run prisma:migrate
npm run dev            # http://localhost:3000
```

## Environment variables

```
GEMINI_API_KEY=        # Google Gemini API key
DATABASE_URL=          # database connection string (Prisma)
```

Never commit real keys — `.env` is gitignored.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run prisma:generate` / `npm run prisma:migrate` — Prisma client and migrations

## Live demo

https://resume-analyzer-six-gold.vercel.app

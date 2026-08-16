# ResumeIQ — AI Resume Analyzer

A stateless AI tool that reads a resume, scores it the way an Applicant Tracking System (ATS) would, and suggests concrete, evidence-based rewrites.

## Overview

Upload a CV as PDF or DOCX and ResumeIQ parses it, evaluates it against ATS-style criteria, and returns an actionable report: a weighted score, strengths and weaknesses, rewritten experience bullets, and a matching cover letter. It runs **statelessly** — your resume is processed in memory and nothing about it is stored. Built for job seekers who want to see how a recruiter's automated screen would read their CV.

## Features

- Upload **PDF or DOCX** by drag and drop
- **Stateless** — resumes are analyzed in memory, never persisted
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

## Getting started

```bash
npm install
cp .env.example .env   # add your Gemini key
npm run dev            # http://localhost:3000
```

## Environment variables

```
GEMINI_API_KEY=        # Google Gemini API key (required)
DATABASE_URL=          # optional
```

Never commit real keys — `.env` is gitignored.

## Live demo

https://resume-analyzer-six-gold.vercel.app

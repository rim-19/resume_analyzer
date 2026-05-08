"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Gauge,
  History,
  Layers3,
  Loader2,
  ScanSearch,
  Sparkles,
  UploadCloud,
  WandSparkles,
  Zap
} from "lucide-react";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ReportButton } from "@/components/ReportButton";
import { ScoreRing } from "@/components/ScoreRing";
import { MAX_FILE_SIZE, SAMPLE_JOB_DESCRIPTION } from "@/lib/constants";
import type { AnalysisPayload } from "@/lib/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTION);
  const [analysis, setAnalysis] = useState<AnalysisPayload | null>(null);
  const [history, setHistory] = useState<AnalysisPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [progressMode, setProgressMode] = useState<"analysis" | "match" | null>(null);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    const response = await fetch("/api/analyses");
    if (response.ok) setHistory(await response.json());
  }, []);

  useEffect(() => {
    loadHistory().catch(() => undefined);
  }, [loadHistory]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError("");
    setFile(acceptedFiles[0] ?? null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    onDropRejected: () => setError("Upload a PDF or DOCX resume up to 5MB.")
  });

  async function analyze(useDemo = false) {
    setLoading(true);
    setProgressMode("analysis");
    setError("");
    try {
      const body = new FormData();
      if (useDemo) body.set("demo", "true");
      if (file && !useDemo) body.set("file", file);
      body.set("jobDescription", jobDescription);

      if (!useDemo && !file) {
        setError("Choose a resume file or use the demo example.");
        return;
      }

      const response = await fetch("/api/analyze", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Analysis failed.");
      setAnalysis(payload);
      await loadHistory();
      setTimeout(() => document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
      setProgressMode(null);
    }
  }

  async function rematch() {
    if (!analysis?.id) return;
    setMatching(true);
    setProgressMode("match");
    setError("");
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: analysis.id, jobDescription })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Job matching failed.");
      setAnalysis(payload);
      await loadHistory();
      setTimeout(() => document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job matching failed.");
    } finally {
      setMatching(false);
      setProgressMode(null);
    }
  }

  const current = useMemo(() => analysis ?? history[0] ?? null, [analysis, history]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      <div className="fixed inset-0 -z-10 grid-texture opacity-60" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.32)_52%,rgba(0,0,0,0.82)_100%)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/45 px-5 py-3 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-white/[0.06] text-cyan-200 shadow-[0_0_34px_rgba(34,211,238,0.16)]">
              <LogoMark />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight">ResumeIQ</p>
              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">AI Resume Analyzer</p>
            </div>
          </a>
          <div className="hidden items-center gap-6 text-sm font-semibold text-zinc-400 md:flex">
            <a className="transition hover:text-white" href="#upload">Start here</a>
            <a className="transition hover:text-white" href="#analysis">Results</a>
            <a className="transition hover:text-white" href="#matching">Rematch</a>
            <a className="transition hover:text-white" href="#analytics">History</a>
          </div>
          <button onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })} className="rounded-xl border border-pink-300/20 bg-white px-4 py-2 text-sm font-black text-black shadow-[0_0_34px_rgba(236,72,153,0.16)] transition hover:-translate-y-0.5 hover:bg-pink-200">
            Go to Step 1
          </button>
        </nav>
      </header>

      <section id="top" className="noise mx-auto max-w-7xl px-5 pb-14 pt-16 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_44px_rgba(34,211,238,0.12)] backdrop-blur">
            <Sparkles size={15} />
            AI powered resume intelligence
          </div>
          <h1 className="aurora-text text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">Analyze Your Resume With AI</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
            Get ATS scores, missing skills analysis, and professional AI recommendations instantly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-cyan-200">
              Start with Step 1
              <ArrowRight size={17} />
            </button>
            <button onClick={() => analyze(true)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-300/20 bg-pink-300/[0.06] px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-pink-300/40 hover:bg-pink-300/10 disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={17} /> : <WandSparkles size={17} />}
              Run demo now
            </button>
          </div>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-3 md:grid-cols-3">
          <FlowStep number="1" title="Paste job" text="Put the job description first." />
          <FlowStep number="2" title="Upload resume" text="Drop your PDF or DOCX file." />
          <FlowStep number="3" title="Analyze" text="Click one button and read results below." />
        </div>

        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mx-auto mt-14 grid max-w-6xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="neon-border rounded-3xl">
            <div className="dark-shell rounded-3xl border border-white/10 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Dashboard preview</p>
                  <h2 className="mt-2 text-2xl font-black">ATS intelligence cockpit</h2>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">Live</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <PreviewMetric label="ATS Score" value={current ? `${current.atsScore}` : "92"} />
                <PreviewMetric label="Match" value={current?.matchScore === null || !current ? "76%" : `${current.matchScore}%`} />
                <PreviewMetric label="Skills" value={current ? `${current.extractedSkills.length}` : "18"} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <ScoreRing score={current?.atsScore ?? 92} label="ATS score" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">AI brief</p>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    Resume is strong for frontend SaaS roles. Add cloud deployment and quantified delivery impact to improve recruiter confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <FeatureCard icon={BrainCircuit} title="AI recommendations" text="AI generates weaknesses, rewrites, role alignment, and career advice." accent="pink" />
            <FeatureCard icon={Gauge} title="ATS scoring" text="Weighted scoring for skills, keywords, structure, and experience relevance." />
            <FeatureCard icon={BarChart3} title="Visual analytics" text="Dark transparent Recharts visuals for skills, radar, and match signals." />
          </div>
        </motion.div>
      </section>

      <section id="upload" className="mx-auto max-w-7xl px-5 py-10">
        <SectionTitle eyebrow="Start here" title="Paste the job description, upload the resume, then analyze." />
        <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100">
          Recommended flow: complete Step 1 and Step 2, then click Step 3. Results appear directly below in the Analysis Dashboard.
        </div>
        <div className="mt-8 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4">
            <StepCard number="01" title="Paste job description" text="This lets the app calculate job match and missing skills." />
            <GlassCard>
              <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className="min-h-64 w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/40 focus:shadow-[0_0_44px_rgba(34,211,238,0.12)]" />
            </GlassCard>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} className="neon-border rounded-3xl">
            <div
              {...getRootProps()}
              className={`scanline min-h-[430px] cursor-pointer rounded-3xl border p-8 text-center backdrop-blur-2xl transition ${
                isDragActive ? "border-cyan-300/50 bg-cyan-300/10 shadow-[0_0_80px_rgba(34,211,238,0.24)]" : "border-white/10 bg-white/[0.04] hover:border-cyan-300/30 hover:bg-white/[0.06]"
              }`}
            >
              <input {...getInputProps()} />
              <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-pink-200">Step 02 / Upload resume</p>
              <div className="mx-auto grid size-20 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_54px_rgba(34,211,238,0.16)]">
                <UploadCloud size={38} />
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight">{file ? file.name : "Drop your resume here"}</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-400">PDF or DOCX, up to 5MB. The parser extracts text, structures sections, scores ATS quality, and stores the analysis in PostgreSQL.</p>
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Step 03 / Analyze</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <button disabled={loading} onClick={(event) => { event.stopPropagation(); analyze(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:opacity-60">
                  {loading ? <Loader2 className="animate-spin" size={17} /> : <BrainCircuit size={17} />}
                  Run AI analysis
                  </button>
                  <button disabled={loading} onClick={(event) => { event.stopPropagation(); analyze(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-300/20 bg-pink-300/[0.06] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-pink-300/10 disabled:opacity-60">
                  <Zap size={17} />
                  Use demo resume
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-500">Use demo resume skips upload and runs the same full analysis with sample data.</p>
              </div>
              {error ? <p className="mx-auto mt-5 max-w-xl rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-bold text-rose-100">{error}</p> : null}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="analysis" className="mx-auto max-w-7xl px-5 py-10">
        <SectionTitle eyebrow="Analysis dashboard" title="Glassmorphism cards, live ATS scores, and AI recruiter feedback." />
        {progressMode ? (
          <AnalysisProgress mode={progressMode} />
        ) : current ? (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} id="analysis-report" className="report-surface mt-8 overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
            <div className="dark-shell border-b border-white/10 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Professional report</p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{current.parsedResume.name}</h2>
                  <p className="mt-3 text-sm text-zinc-400">{current.parsedResume.email || "No email detected"} / {current.parsedResume.phone || "No phone detected"}</p>
                </div>
                <ReportButton />
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[0.95fr_1.05fr] md:p-6">
              <div className="space-y-5">
                <div className="grid gap-4">
                  <GlassCard><ScoreRing score={current.atsScore} label="ATS score" /></GlassCard>
                  <GlassCard><ScoreRing score={current.matchScore} label="Job match" tone="amber" /></GlassCard>
                </div>
                <GlassCard>
                  <h3 className="text-lg font-black">Resume summary</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{current.aiFeedback.summary}</p>
                </GlassCard>
              </div>

              <div className="space-y-5">
                <AiPanel title="Strengths" items={current.aiFeedback.strengths} tone="cyan" />
                <AiPanel title="Weaknesses" items={current.aiFeedback.weaknesses} tone="pink" />
                <AiPanel title="Suggestions" items={current.aiFeedback.suggestions} tone="cyan" />
              </div>
            </div>
          </motion.div>
        ) : (
          <EmptyDashboard />
        )}
      </section>

      <section id="matching" className="mx-auto max-w-7xl px-5 py-10">
        <SectionTitle eyebrow="Optional rematch" title="Already analyzed? Change the job description and recalculate only the match." />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <GlassCard>
            <div className="mb-5 flex items-center gap-3">
              <FileText className="text-cyan-200" />
              <div>
                <h3 className="text-xl font-black">Resume profile</h3>
                <p className="text-sm text-zinc-500">{current ? current.parsedResume.name : "Run an analysis to load a resume profile."}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(current?.extractedSkills ?? ["React", "Next.js", "TypeScript", "ATS", "AI"]).slice(0, 18).map((skill) => (
                <span key={skill} className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1.5 text-sm font-bold text-cyan-100">{skill}</span>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-5 flex items-center gap-3">
              <BriefcaseBusiness className="text-pink-200" />
              <div>
                <h3 className="text-xl font-black">Target job description</h3>
                <p className="text-sm text-zinc-500">Paste a role and recalculate the match score.</p>
              </div>
            </div>
            <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className="min-h-52 w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/40 focus:shadow-[0_0_44px_rgba(34,211,238,0.12)]" />
            <button disabled={!analysis?.id || matching} onClick={rematch} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:opacity-50">
              {matching ? <Loader2 className="animate-spin" size={17} /> : <BarChart3 size={17} />}
              Recalculate match
            </button>
          </GlassCard>
        </div>
      </section>

      <section id="analytics" className="mx-auto max-w-7xl px-5 py-10">
        <SectionTitle eyebrow="Analytics page" title="Signal-rich charts and saved analysis history." />
        <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div>{current ? <DashboardCharts analysis={current} /> : <EmptyDashboard compact />}</div>
          <GlassCard>
            <div className="mb-4 flex items-center gap-3">
              <History className="text-cyan-200" />
              <h3 className="text-xl font-black">Saved analyses</h3>
            </div>
            <div className="no-scrollbar max-h-[520px] space-y-2 overflow-auto pr-1">
              {history.length ? (
                history.map((item) => (
                  <button key={item.id} onClick={() => setAnalysis(item)} className="group w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-black">{item.parsedResume.name}</p>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-black text-cyan-100">{item.atsScore}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-zinc-500">{item.filename} / saved report</p>
                  </button>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-500">No saved analyses yet.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur">
          <h2 className="aurora-text text-3xl font-black tracking-tight md:text-5xl">Ready to optimize the next resume?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Upload, score, match, improve, and export a professional report from one premium AI dashboard.</p>
        </div>
      </footer>
    </main>
  );
}

function AnalysisProgress({ mode }: { mode: "analysis" | "match" }) {
  const steps =
    mode === "analysis"
      ? [
          "Reading resume file",
          "Extracting skills and sections",
          "Calculating ATS and job match scores",
          "Generating AI recommendations",
          "Saving report to database"
        ]
      : ["Reading saved resume", "Comparing new job description", "Updating match score", "Refreshing AI suggestions"];

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-8 overflow-hidden rounded-3xl border border-cyan-300/20 bg-white/[0.04] shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="dark-shell border-b border-white/10 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Analysis running</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">{mode === "analysis" ? "Building your resume report" : "Refreshing job match"}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">Keep this page open. Results will appear here automatically when the AI response is ready.</p>
          </div>
          <div className="grid size-16 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_54px_rgba(34,211,238,0.18)]">
            <Loader2 className="animate-spin" size={30} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr] md:p-6">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${index === 0 ? "bg-cyan-300 text-black" : "border border-white/10 text-zinc-400"}`}>
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white">{step}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 via-pink-300 to-violet-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <SkeletonCard tall />
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 ${tall ? "min-h-44" : "min-h-28"}`}>
      <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
      <div className="mt-5 space-y-3">
        <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition hover:border-white/15 hover:bg-white/[0.055]">{children}</div>;
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, accent = "cyan" }: { icon: typeof BrainCircuit; title: string; text: string; accent?: "cyan" | "pink" }) {
  const accentClass = accent === "pink" ? "hover:border-pink-300/25 hover:bg-pink-300/[0.06]" : "hover:border-cyan-300/25 hover:bg-cyan-300/[0.06]";
  const iconClass = accent === "pink" ? "text-pink-200" : "text-cyan-200";

  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl transition hover:-translate-y-1 ${accentClass}`}>
      <div className={`mb-4 grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] ${iconClass}`}>
        <Icon size={21} />
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
    </div>
  );
}

function FlowStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur">
      <div className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">{number}</div>
      <h3 className="font-black">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{text}</p>
    </div>
  );
}

function StepCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-pink-200">{number}</p>
      <h3 className="mt-4 text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{text}</p>
    </div>
  );
}

function AiPanel({ title, items, tone }: { title: string; items: string[]; tone: "cyan" | "pink" }) {
  const color = tone === "cyan" ? "bg-cyan-300" : "bg-pink-300";

  return (
    <GlassCard>
      <div className="mb-4 flex items-center gap-2">
        <div className={`size-2 rounded-full ${color} shadow-[0_0_18px_currentColor]`} />
        <h3 className="text-lg font-black">{title}</h3>
      </div>
      <ul className="space-y-3 text-sm leading-7 text-zinc-400">
        {items.slice(0, 5).map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2 className={`mt-0.5 shrink-0 ${tone === "cyan" ? "text-cyan-200" : "text-pink-200"}`} size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function EmptyDashboard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid place-items-center rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-2xl ${compact ? "min-h-[420px]" : "mt-8 min-h-[520px]"}`}>
      <div className="max-w-xl">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          <Layers3 size={30} />
        </div>
        <h3 className="mt-6 text-3xl font-black">Run a scan to activate this dashboard.</h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">Use the demo resume or upload a PDF/DOCX to unlock ATS scores, charts, AI recommendations, matching, history, and export.</p>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" className="size-7" aria-hidden="true">
      <path d="M18 42V18h16.5C41.4 18 46 22.1 46 28.1c0 4.1-2.2 7.4-5.8 9.1L47 42H36.8l-5.5-4.3h-4.6V42H18Zm8.7-11.5h7.1c2.2 0 3.5-1 3.5-2.7 0-1.8-1.3-2.8-3.5-2.8h-7.1v5.5Z" fill="url(#logo-mark)" />
      <path d="M16 46h32" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" />
      <circle cx="49" cy="15" r="4" fill="#F472B6" />
      <defs>
        <linearGradient id="logo-mark" x1="18" y1="18" x2="47" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset=".45" stopColor="#A5F3FC" />
          <stop offset="1" stopColor="#F9A8D4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

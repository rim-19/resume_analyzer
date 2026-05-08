"use client";

type ScoreRingProps = {
  score: number | null;
  label: string;
  tone?: "mint" | "amber" | "rose";
};

export function ScoreRing({ score, label, tone = "mint" }: ScoreRingProps) {
  const value = score ?? 0;
  const color = tone === "mint" ? "#22d3ee" : tone === "amber" ? "#a78bfa" : "#fb7185";

  return (
    <div className="flex items-center gap-4">
      <div
        className="grid size-28 shrink-0 place-items-center rounded-full shadow-[0_0_44px_rgba(34,211,238,0.16),inset_0_0_0_1px_rgba(255,255,255,0.1)]"
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid size-20 place-items-center rounded-full border border-white/10 bg-black/80">
          <span className="text-3xl font-black text-white">{score === null ? "--" : value}</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">{label}</p>
        <p className="mt-2 max-w-64 text-sm leading-6 text-zinc-400">{score === null ? "Add a job description to activate matching intelligence." : "Weighted from skills, keywords, experience, and structure."}</p>
      </div>
    </div>
  );
}

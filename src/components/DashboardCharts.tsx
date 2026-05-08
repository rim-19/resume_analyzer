"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalysisPayload } from "@/lib/types";

export function DashboardCharts({ analysis }: { analysis: AnalysisPayload }) {
  const categoryData = [
    { name: "Skills", value: analysis.categoryScores.skills },
    { name: "Keywords", value: analysis.categoryScores.keywords },
    { name: "Experience", value: analysis.categoryScores.experience },
    { name: "Structure", value: analysis.categoryScores.formatting }
  ];
  const pieData = [
    { name: "Extracted", value: analysis.extractedSkills.length || 1 },
    { name: "Missing", value: analysis.missingSkills.length || 1 }
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="mesh-panel rounded-2xl border border-white/10 p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">ATS breakdown</h3>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">Weighted</span>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#a1a1aa" />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="#71717a" />
              <Tooltip cursor={{ fill: "rgba(34,211,238,0.06)" }} contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mesh-panel rounded-2xl border border-white/10 p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">Resume radar</h3>
          <span className="rounded-full border border-pink-300/20 bg-pink-300/10 px-3 py-1 text-xs font-bold text-pink-200">Profile</span>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={categoryData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <Radar dataKey="value" stroke="#f472b6" fill="#22d3ee" fillOpacity={0.28} />
              <Tooltip contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mesh-panel rounded-2xl border border-white/10 p-5 shadow-soft lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">Skills coverage</h3>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white">{analysis.extractedSkills.length} signals detected</span>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={4}>
                  <Cell fill="#22d3ee" />
                  <Cell fill="#f472b6" />
                </Pie>
                <Tooltip contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid content-start gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Detected skills</p>
            <div className="flex flex-wrap gap-2">
              {analysis.extractedSkills.slice(0, 24).map((skill) => (
                <span key={skill} className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-100">
                  {skill}
                </span>
              ))}
            </div>
            <p className="pt-4 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Missing job keywords</p>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.length ? (
                analysis.missingSkills.map((skill) => (
                  <span key={skill} className="rounded-full border border-pink-300/20 bg-pink-300/10 px-3 py-1 text-sm font-bold text-pink-100">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-400">No missing job-specific skills detected yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

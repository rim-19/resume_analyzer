"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

export function ReportButton() {
  async function exportReport() {
    const element = document.getElementById("analysis-report");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(image, "PNG", 0, 0, width, Math.min(height, pdf.internal.pageSize.getHeight()));
    pdf.save("resume-analysis-report.pdf");
  }

  return (
    <button onClick={exportReport} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-black shadow-[0_0_34px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-cyan-200">
      <Download size={17} />
      Export report
    </button>
  );
}

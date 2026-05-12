"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, FileText } from "lucide-react";
import { useState } from "react";

interface CoverLetterModalProps {
  content: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CoverLetterModal({ content, isOpen, onClose }: CoverLetterModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Tailored Cover Letter</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-0.5">AI Generated Mastery</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:bg-white/10 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="no-scrollbar max-h-[60vh] overflow-y-auto p-8">
              {content ? (
                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-zinc-300">
                  {content}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="size-12 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                  <p className="text-zinc-400 font-bold">Crafting your professional narrative...</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/5 bg-black/20 p-6">
              <p className="text-xs text-zinc-500 italic">Pro Tip: Always proofread and personalize AI-generated content before sending.</p>
              <button
                onClick={handleCopy}
                disabled={!content}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-violet-200 disabled:opacity-50"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

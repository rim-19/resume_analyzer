"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type = "success", isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={20} />,
    error: <XCircle className="text-rose-400" size={20} />,
    info: <Info className="text-cyan-400" size={20} />,
  };

  const borders = {
    success: "border-emerald-500/20 bg-emerald-500/10",
    error: "border-rose-500/20 bg-rose-500/10",
    info: "border-cyan-500/20 bg-cyan-500/10",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className={`fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-2xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl ${borders[type]}`}
        >
          <div className="shrink-0">{icons[type]}</div>
          <p className="min-w-[200px] text-sm font-bold text-white">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

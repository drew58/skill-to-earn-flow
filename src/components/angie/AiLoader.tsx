import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const MESSAGES = [
  "Angie is building your roadmap…",
  "Analyzing your skill potential…",
  "Finding realistic opportunities…",
  "Mapping the first 24 hours…",
  "Drafting outreach scripts…",
];

export function AiLoader() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-[#8B5CF6]/50 blur-2xl" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] shadow-2xl"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-sm text-white/70"
        >
          {MESSAGES[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

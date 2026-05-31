import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Loader2, Brain, Target, Trash2, Lock } from "lucide-react";
import { GlassCard } from "@/components/angie/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/coach")({ component: CoachPage });

type Msg = { id?: string; role: "user" | "assistant"; content: string; metadata?: any };
type Memory = { key: string; value: string };

const STARTERS = [
  "What should I do this week to earn my first $200?",
  "I'm stuck. Help me pick one focus skill.",
  "Build me a mission for tomorrow.",
  "Review my plan and tell me what's missing.",
];

function CoachPage() {
  const { user, session } = useAuth();
  const { isPro, remaining, increment } = useSubscription();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [memory, setMemory] = useState<Memory[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: conv } = await supabase.from("coach_conversations").select("id").eq("user_id", user.id).maybeSingle();
      if (conv) {
        const { data } = await supabase
          .from("coach_messages")
          .select("id,role,content,metadata")
          .eq("conversation_id", conv.id)
          .order("created_at")
          .limit(100);
        setMessages((data ?? []) as Msg[]);
      }
      const { data: mem } = await supabase.from("user_memory").select("key,value").eq("user_id", user.id);
      setMemory((mem ?? []) as Memory[]);
    })();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text: string) => {
    if (!text.trim() || sending || !session) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (r.status === 402) toast.error("AI credits exhausted", { description: "Please top up to keep chatting." });
        else if (r.status === 429) toast.error("Going too fast", { description: "Try again in a moment." });
        else toast.error(data?.error ?? "Coach error");
        setMessages((m) => m.slice(0, -1));
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply, metadata: { actions: data.actions } }]);
      const newMemoryActions = (data.actions ?? []).filter((a: any) => a.kind === "memory_saved");
      if (newMemoryActions.length) {
        const { data: mem } = await supabase.from("user_memory").select("key,value").eq("user_id", user!.id);
        setMemory((mem ?? []) as Memory[]);
      }
      const newMissionActions = (data.actions ?? []).filter((a: any) => a.kind === "mission_added");
      if (newMissionActions.length) {
        toast.success("Mission added", { description: newMissionActions[0].result.title });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Network error");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const clearMemory = async (key: string) => {
    await supabase.from("user_memory").delete().eq("user_id", user!.id).eq("key", key);
    setMemory((m) => m.filter((x) => x.key !== key));
  };

  return (
    <div className="grid h-[calc(100vh-9rem)] gap-5 lg:grid-cols-[1fr_300px]">
      {/* Chat */}
      <GlassCard className="flex h-full flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] shadow-[0_0_28px_-6px_rgba(139,92,246,0.7)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Angie · Your AI coach</div>
              <div className="text-[11px] text-white/45">Knows your goals, plans, and history</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/50">
                {remaining("coachPerDay")} left today
              </span>
            )}
            <span className="rounded-full bg-[#22C55E]/15 px-2.5 py-1 text-[10px] font-medium text-[#86EFAC]">Online</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md py-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30 ring-1 ring-inset ring-white/10">
                <Sparkles className="h-5 w-5 text-[#A78BFA]" />
              </div>
              <div className="mt-3 text-base font-semibold">Hi, I'm Angie.</div>
              <div className="mt-1 text-sm text-white/55">Tell me what you're working on. I'll remember and coach you over time.</div>
              <div className="mt-5 grid gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-white/75 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6]">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_8px_30px_-12px_rgba(139,92,246,0.7)]"
                    : "border border-white/10 bg-white/[0.04] text-white/90",
                )}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-headings:mb-1.5 prose-headings:mt-3">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                )}
                {m.metadata?.actions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.metadata.actions.map((a: any, j: number) => (
                      <span key={j} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/70">
                        {a.kind === "memory_saved" ? <Brain className="h-2.5 w-2.5" /> : <Target className="h-2.5 w-2.5" />}
                        {a.kind === "memory_saved" ? `Saved: ${a.result.key}` : `Mission: ${a.result.title}`}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Angie is thinking…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-white/5 p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 focus-within:border-[#5B8CFF]/60 focus-within:ring-2 focus-within:ring-[#5B8CFF]/30">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
              }}
              rows={1}
              placeholder="Ask Angie anything about your income journey…"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-white/40 outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.7)] transition-opacity disabled:opacity-40"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Memory sidebar */}
      <div className="hidden lg:block">
        <GlassCard className="flex h-full flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#A78BFA]" />
            <h3 className="text-sm font-semibold">What Angie remembers</h3>
          </div>
          {memory.length === 0 ? (
            <div className="text-xs text-white/45">As you chat, Angie will save your goals, focus skill, blockers, and wins here.</div>
          ) : (
            <ul className="space-y-2">
              {memory.map((m) => (
                <li key={m.key} className="group rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">{m.key.replace(/_/g, " ")}</div>
                    <button onClick={() => clearMemory(m.key)} className="opacity-0 transition-opacity group-hover:opacity-100 text-white/40 hover:text-white">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-white/85">{m.value}</div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

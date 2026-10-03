"use client";

import React, { useState } from "react";
import { MobileNav, APP_LINKS } from "@/components/mobile-nav";
import { Backdrop, PageHead, Glyph } from "@/components/fx";

const categories = ["DSA", "OOP", "DBMS", "OS", "Aptitude", "Reasoning", "System Design", "Networking"];
const PLEX = { fontFamily: '"IBM Plex Sans", sans-serif' };
const card = "glow-card rounded-2xl border border-black/[0.07] bg-white";
const label = "font-pixel text-[11px] tracking-widest text-black/35 uppercase";

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  answer: string;
  hint1: string;
  hint2: string;
  explanation: string;
}

type MessageType = "correct" | "wrong" | "hint" | "warning" | "";

export default function AIQuestionPage() {
  const [selectedCat, setSelectedCat] = useState("DSA");
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<{ q: string; correct: boolean; cat: string }[]>([]);

  const generate = async (cat?: string) => {
    const category = cat ?? selectedCat;
    setLoading(true);
    setError("");
    setQuestion(null);
    setSelected("");
    setAttempts(0);
    setMessage("");
    setMessageType("");
    setShowAnswer(false);

    try {
      const res = await fetch(`/api/generate-question?category=${category}&t=${Date.now()}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuestion(data);
      }
    } catch {
      setError("Network error — please try again.");
    }
    setLoading(false);
  };

  const checkAnswer = () => {
    if (!selected) { setMessage("Please select an option first."); setMessageType("warning"); return; }
    if (!question) return;
    if (attempts === 0) setTotal((t) => t + 1);
    if (selected === question.answer) {
      setMessage("Correct Answer!"); setMessageType("correct");
      setScore((s) => s + 1); setShowAnswer(true);
      setHistory((h) => [{ q: question.question, correct: true, cat: question.category }, ...h.slice(0, 4)]);
      return;
    }
    const na = attempts + 1; setAttempts(na);
    if (na === 1) { setMessage(`Hint 1: ${question.hint1}`); setMessageType("hint"); }
    else if (na === 2) { setMessage(`Hint 2: ${question.hint2}`); setMessageType("hint"); }
    else {
      setMessage(`Correct Answer: ${question.answer}. ${question.explanation}`);
      setMessageType("wrong"); setShowAnswer(true);
      setHistory((h) => [{ q: question.question, correct: false, cat: question.category }, ...h.slice(0, 4)]);
    }
  };

  const LETTERS = ["A", "B", "C", "D"];
  const msgCls: Record<string, string> = {
    correct: "border-emerald-600/30 bg-emerald-50 text-emerald-800",
    wrong: "border-red-500/30 bg-red-50 text-red-800",
    hint: "border-black/10 bg-white text-black/70",
    warning: "border-black/10 bg-white text-black/60",
  };
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const GenBtn = ({ text, className = "" }: { text: string; className?: string }) => (
    <button onClick={() => generate()} disabled={loading} className={`px-6 py-3 bg-[#111] text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest disabled:opacity-60 ${className}`} style={{ color: "#fff" }}>
      {loading ? "GENERATING..." : text}
    </button>
  );

  return (
    <main className="grain relative overflow-hidden min-h-screen bg-[#F5F4F0] text-[#111] px-6 pt-28 pb-20">
      <MobileNav links={APP_LINKS} cta={null} />
      <Backdrop />
      <div className="relative z-10 max-w-5xl mx-auto">
        <PageHead icon="integrations" tag="POWERED BY GEMINI" title="AI questions" sub="Fresh placement-style questions, generated on demand." />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          <aside className="space-y-4 rise" style={{ animationDelay: "250ms" }}>
            <div className={`${card} p-5`}>
              <div className={`${label} mb-4 flex items-center gap-2`}><Glyph name="layers" size={13} />Category</div>
              <div className="flex flex-wrap lg:flex-col gap-2 mb-5">
                {categories.map((c) => (
                  <button key={c} onClick={() => setSelectedCat(c)} className={`opt text-left text-sm px-4 py-2.5 rounded-xl border ${selectedCat === c ? "border-[#111] bg-[#111]" : "border-black/[0.08] text-black/55 hover:border-black/25"}`} style={selectedCat === c ? { color: "#fff" } : undefined}>{c}</button>
                ))}
              </div>
              <GenBtn text="GENERATE QUESTION" className="w-full" />
              {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
            </div>

            {total > 0 && (
              <div className={`${card} p-5`}>
                <div className={`${label} mb-4`}>Session score</div>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  {[[score, "Correct"], [total - score, "Wrong"], [`${pct}%`, "Accuracy"]].map(([v, l]) => (
                    <div key={l as string}><div className="text-2xl font-light" style={PLEX}>{v}</div><div className="text-[10px] tracking-widest text-black/35 uppercase mt-1">{l}</div></div>
                  ))}
                </div>
                <div className="h-px bg-black/[0.08] relative"><div className="absolute left-0 -top-px h-[3px] bg-[#111] transition-all duration-700" style={{ width: `${pct}%` }} /></div>
              </div>
            )}

            {history.length > 0 && (
              <div className={`${card} p-5`}>
                <div className={`${label} mb-4`}>Recent</div>
                <div className="divide-y divide-black/[0.06]">
                  {history.map((h, i) => (
                    <div key={i} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] tracking-widest text-black/35 uppercase">{h.cat}</span>
                        <span className={`text-[10px] tracking-widest ${h.correct ? "text-emerald-700" : "text-red-600"}`}>{h.correct ? "CORRECT" : "WRONG"}</span>
                      </div>
                      <p className="text-xs text-black/55 leading-snug">{h.q.slice(0, 60)}{h.q.length > 60 ? "..." : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="rise" style={{ animationDelay: "350ms" }}>
            {!question && !loading && (
              <div className={`${card} p-8 md:p-12`}>
                <div className={`${label} mb-4`}>Ready</div>
                <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3" style={PLEX}>Generate a fresh question</h2>
                <p className="text-sm text-black/45 leading-relaxed mb-8 max-w-md">Pick a category and Gemini writes a new placement-style multiple-choice question for you.</p>
                <div className="divide-y divide-black/[0.06] mb-8 max-w-md">
                  {["Fresh, unique question every time", "Two-level progressive hints", "Full explanation after reveal", "Session score tracking"].map((t) => (
                    <div key={t} className="py-3 text-sm text-black/55">{t}</div>
                  ))}
                </div>
                <GenBtn text="GENERATE FIRST QUESTION" />
              </div>
            )}

            {loading && (
              <div className={`${card} p-12 text-center`}>
                <div className="flex justify-center text-black/30 mb-4 pulse-dot"><Glyph name="spark" size={26} /></div>
                <p className={`${label} mb-3`}>Crafting your question...</p>
                <p className="text-sm text-black/45 mb-6">Generating a unique {selectedCat} question</p>
                <div className="shimmer relative h-px bg-black/[0.08] max-w-xs mx-auto overflow-hidden" />
              </div>
            )}

            {question && !loading && (
              <div key={question.id} className={`${card} rise p-6 md:p-8`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">{question.category.toUpperCase()}</span>
                    <span className="inline-flex px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">AI</span>
                  </div>
                  <span className="font-pixel text-[11px] tracking-widest text-black/30">{Math.max(0, 3 - attempts)} LEFT</span>
                </div>

                <h2 className="text-xl md:text-2xl font-light leading-snug tracking-tight mb-8" style={PLEX}>{question.question}</h2>

                <div className="space-y-2.5 mb-6">
                  {question.options.map((opt, idx) => {
                    const isSel = selected === opt;
                    const isCorrect = showAnswer && opt === question.answer;
                    const isWrong = showAnswer && isSel && opt !== question.answer;
                    const state = isCorrect ? "border-emerald-600/40 bg-emerald-50" : isWrong ? "border-red-500/40 bg-red-50" : isSel ? "border-[#111]" : "border-black/[0.08] hover:border-black/25";
                    return (
                      <button key={opt} onClick={() => !showAnswer && setSelected(opt)} className={`opt w-full flex items-center gap-4 text-left px-4 py-3.5 rounded-xl border bg-white text-sm ${state}`} style={{ cursor: showAnswer ? "default" : "pointer" }}>
                        <span className="font-pixel text-[11px] tracking-widest text-black/35 w-4">{LETTERS[idx]}</span>
                        <span className="flex-1 text-black/80">{opt}</span>
                        {isCorrect && <span className="text-[11px] tracking-widest text-emerald-700">CORRECT</span>}
                        {isWrong && <span className="text-[11px] tracking-widest text-red-600">WRONG</span>}
                      </button>
                    );
                  })}
                </div>

                {!showAnswer ? (
                  <button onClick={checkAnswer} className="w-full px-8 py-3 bg-[#111] text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest" style={{ color: "#fff" }}>SUBMIT ANSWER</button>
                ) : (
                  <GenBtn text="NEXT QUESTION" className="w-full" />
                )}

                {message && <div key={message} className={`pop mt-4 px-4 py-3 rounded-xl border text-sm leading-relaxed ${msgCls[messageType] ?? ""}`}>{message}</div>}

                {showAnswer && (
                  <div className="mt-4 pt-4 border-t border-black/[0.06]">
                    <div className={`${label} mb-2 flex items-center gap-2`}><Glyph name="book" size={13} />Explanation</div>
                    <p className="text-sm text-black/55 leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

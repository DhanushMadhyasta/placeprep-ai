"use client";

import { useEffect, useState } from "react";
import { placementQuestions } from "../data/placementQuestions";
import { MobileNav, APP_LINKS } from "@/components/mobile-nav";
import { Backdrop, Glyph, CountUp } from "@/components/fx";

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

const LETTERS = ["A", "B", "C", "D"];
const PLEX = { fontFamily: '"IBM Plex Sans", sans-serif' };
const shell = "grain relative overflow-hidden min-h-screen bg-[#F5F4F0] text-[#111] px-6 pt-28 pb-20";
const btn = "w-full px-8 py-3 bg-[#111] text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest";

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const shuffled = [...placementQuestions].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 25).map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));
    setQuestions(picked);
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;
    if (timeLeft === 0) { nextQuestion(); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, questions.length]);

  if (questions.length === 0) {
    return (
      <main className={shell}>
        <MobileNav links={APP_LINKS} cta={null} />
        <Backdrop />
        <p className="font-pixel text-[11px] tracking-widest text-black/40 text-center pt-24"><span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />PREPARING YOUR QUESTIONS</span></p>
      </main>
    );
  }

  const question = questions[currentQuestion];

  // message format: "kind|text" where kind = ok | hint | err | warn
  const checkAnswer = () => {
    if (!selected) { setMessage("warn|Please select an option first."); return; }
    if (selected === question.answer) {
      setScore((s) => s + 1);
      setMessage("ok|Correct answer.");
      setShowNext(true);
      return;
    }
    const na = attempts + 1;
    setAttempts(na);
    if (na === 1) setMessage(`hint|Hint 1: ${question.hint1}`);
    else if (na === 2) setMessage(`hint|Hint 2: ${question.hint2}`);
    else {
      setMessage(`err|Correct answer: ${question.answer}. ${question.explanation}`);
      setShowNext(true);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestion((p) => p + 1);
    setSelected(""); setAttempts(0); setMessage(""); setShowNext(false); setTimeLeft(60);
  };

  if (currentQuestion >= questions.length) {
    if (!sessionStorage.getItem("quizSaved")) {
      const ta = Number(localStorage.getItem("totalAttempts")) || 0;
      localStorage.setItem("totalAttempts", (ta + 1).toString());
      const ts = Number(localStorage.getItem("totalScore")) || 0;
      localStorage.setItem("totalScore", (ts + score).toString());
      sessionStorage.setItem("quizSaved", "true");
    }
    const pct = Math.round((score / questions.length) * 100);
    const best = Number(localStorage.getItem("bestScore")) || 0;
    if (score > best) localStorage.setItem("bestScore", score.toString());
    const finalBest = Math.max(score, Number(localStorage.getItem("bestScore")) || 0);
    const grade = pct >= 80 ? "Placement Ready" : pct >= 60 ? "Good Performance" : "Keep Practising";

    return (
      <main className={shell}>
        <MobileNav links={APP_LINKS} cta={null} />
        <Backdrop />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <p className="rise inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04] mb-5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />QUIZ COMPLETE</p>
          <h1 className="rise text-5xl font-light tracking-tight mb-12" style={{ ...PLEX, animationDelay: "100ms" }}>{grade}</h1>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[["Score", score, `/${questions.length}`, "target"], ["Best", finalBest, "", "award"], ["Accuracy", pct, "%", "trend"]].map(([l, v, suf, g], i) => (
              <div key={l as string} className="glow-card rise rounded-2xl border border-black/[0.07] bg-white py-6" style={{ animationDelay: `${200 + i * 90}ms` }}>
                <div className="flex justify-center text-black/30 mb-3"><Glyph name={g as string} /></div>
                <div className="font-pixel text-[11px] tracking-widest text-black/35 mb-2 uppercase">{l}</div>
                <div className="text-3xl font-light" style={PLEX}><CountUp value={v as number} suffix={suf as string} /></div>
              </div>
            ))}
          </div>
          <button className={btn} style={{ color: "#fff" }} onClick={() => { sessionStorage.removeItem("quizSaved"); window.location.reload(); }}>
            RESTART QUIZ
          </button>
        </div>
      </main>
    );
  }

  const [kind, text] = message ? [message.split("|")[0], message.slice(message.indexOf("|") + 1)] : ["", ""];
  const msgCls: Record<string, string> = {
    ok: "border-emerald-600/30 bg-emerald-50 text-emerald-800",
    err: "border-red-500/30 bg-red-50 text-red-800",
    hint: "border-black/10 bg-white text-black/70",
    warn: "border-black/10 bg-white text-black/60",
  };
  const timerPct = (timeLeft / 60) * 100;

  return (
    <main className={shell}>
      <MobileNav links={APP_LINKS} cta={null} />
        <Backdrop />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="rise flex items-end justify-between mb-6">
          <div>
            <p className="font-pixel text-[11px] tracking-widest text-black/35 mb-1 flex items-center gap-1.5"><Glyph name="layers" size={13} />QUESTION</p>
            <p className="text-3xl font-light" style={PLEX}>{currentQuestion + 1}<span className="text-black/25"> / {questions.length}</span></p>
          </div>
          <div className="text-right">
            <p className="font-pixel text-[11px] tracking-widest text-black/35 mb-1 flex items-center justify-end gap-1.5"><Glyph name="target" size={13} />SCORE</p>
            <p className="text-3xl font-light" style={PLEX}>{score}</p>
          </div>
          <div className="text-right">
            <p className="font-pixel text-[11px] tracking-widest text-black/35 mb-1 flex items-center justify-end gap-1.5"><Glyph name="clock" size={13} />TIME</p>
            <p className={`text-3xl font-light ${timeLeft <= 15 ? "text-red-600" : ""}`} style={PLEX}>{timeLeft}s</p>
          </div>
        </div>

        <div className="h-px bg-black/[0.08] mb-1"><div className="h-px bg-[#111] transition-all duration-500" style={{ width: `${(currentQuestion / questions.length) * 100}%` }} /></div>
        <div className="h-px bg-black/[0.08] mb-10"><div className="h-px bg-black/40 transition-all duration-1000 ease-linear" style={{ width: `${timerPct}%` }} /></div>

        <div key={currentQuestion} className="glow-card rise rounded-2xl border border-black/[0.07] bg-white p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">{question.category.toUpperCase()}</span>
            <span className="font-pixel text-[11px] tracking-widest text-black/30">{Math.max(0, 3 - attempts)} ATTEMPT{3 - attempts !== 1 ? "S" : ""} LEFT</span>
          </div>

          <h2 className="text-xl md:text-2xl font-light leading-snug tracking-tight mb-8" style={PLEX}>{question.question}</h2>

          <div className="space-y-2.5 mb-6">
            {question.options.map((opt, idx) => {
              const isSel = selected === opt;
              const isCorrect = showNext && opt === question.answer;
              const isWrong = showNext && isSel && opt !== question.answer;
              const state = isCorrect ? "border-emerald-600/40 bg-emerald-50" : isWrong ? "border-red-500/40 bg-red-50" : isSel ? "border-[#111]" : "border-black/[0.08] hover:border-black/25";
              return (
                <button key={opt} onClick={() => !showNext && setSelected(opt)} className={`opt w-full flex items-center gap-4 text-left px-4 py-3.5 rounded-xl border bg-white text-sm ${state}`} style={{ cursor: showNext ? "default" : "pointer" }}>
                  <span className="font-pixel text-[11px] tracking-widest text-black/35 w-4">{LETTERS[idx]}</span>
                  <span className="flex-1 text-black/80">{opt}</span>
                  {isCorrect && <span className="text-[11px] tracking-widest text-emerald-700">CORRECT</span>}
                  {isWrong && <span className="text-[11px] tracking-widest text-red-600">WRONG</span>}
                </button>
              );
            })}
          </div>

          {!showNext && <button className={btn} style={{ color: "#fff" }} onClick={checkAnswer}>SUBMIT ANSWER</button>}

          {message && <div key={message} className={`pop mt-4 px-4 py-3 rounded-xl border text-sm leading-relaxed ${msgCls[kind]}`}>{text}</div>}

          {showNext && (
            <button className={`${btn} mt-4`} style={{ color: "#fff" }} onClick={nextQuestion}>
              {currentQuestion === questions.length - 1 ? "FINISH QUIZ" : "NEXT QUESTION"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

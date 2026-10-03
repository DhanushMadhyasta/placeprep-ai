"use client";

import { useEffect, useState } from "react";
import { MobileNav, APP_LINKS } from "@/components/mobile-nav";
import { Backdrop, PageHead, CountUp, Glyph } from "@/components/fx";

const PLEX = { fontFamily: '"IBM Plex Sans", sans-serif' };
const TIPS = [
  ["Aptitude", "Practise time-and-work, profit-loss and percentages daily."],
  ["DSA", "Know trees, graphs and DP patterns. They appear in most technical rounds."],
  ["DBMS", "Master SQL joins, normalization and ACID properties."],
  ["OS", "Understand process scheduling, deadlocks and memory management."],
  ["System Design", "Study low-level design patterns and scalability basics."],
];

export default function DashboardPage() {
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    setTotalAttempts(Number(localStorage.getItem("totalAttempts")) || 0);
    setTotalScore(Number(localStorage.getItem("totalScore")) || 0);
    setBestScore(Number(localStorage.getItem("bestScore")) || 0);
  }, []);

  const avgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
  const avgPct = Math.round((avgScore / 25) * 100);

  const clearData = () => {
    localStorage.removeItem("totalAttempts");
    localStorage.removeItem("totalScore");
    localStorage.removeItem("bestScore");
    setTotalAttempts(0); setTotalScore(0); setBestScore(0);
  };

  const stats = [
    { l: "Total attempts", g: "layers", n: totalAttempts, suf: "" },
    { l: "Best score", g: "award", n: bestScore, suf: "/25" },
    { l: "Avg score", g: "trend", n: avgScore, suf: "/25" },
    { l: "Avg accuracy", g: "target", n: avgPct, suf: "%" },
  ];
  const level = avgPct >= 80 ? "Placement Ready" : avgPct >= 60 ? "On the Right Track" : "Keep Practising";
  const card = "glow-card rounded-2xl border border-black/[0.07] bg-white";

  return (
    <main className="grain relative min-h-screen bg-[#F5F4F0] text-[#111] px-6 pt-28 pb-20 overflow-hidden">
      <Backdrop />
      <MobileNav links={APP_LINKS} cta={null} />
      <div className="relative z-10 max-w-4xl mx-auto">
        <PageHead icon="platform" tag="DASHBOARD" title="Your progress" sub="Track how you are improving over time." />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {stats.map((st, i) => (
            <div key={st.l} className={`${card} rise p-6`} style={{ animationDelay: `${300 + i * 80}ms` }}>
              <div className="flex items-center justify-between mb-8 text-black/30"><span className="font-pixel text-[11px] tracking-widest uppercase text-black/35">{st.l}</span><Glyph name={st.g} /></div>
              <div className="text-3xl font-light" style={PLEX}><CountUp value={st.n} suffix={st.suf} /></div>
            </div>
          ))}
        </div>

        {totalAttempts > 0 && (
          <div className={`${card} rise p-6 md:p-8 mb-3`} style={{ animationDelay: "650ms" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-pixel text-[11px] tracking-widest text-black/35 uppercase">Current level</span>
              <span className="inline-flex px-3 py-1 rounded-full text-[11px] tracking-widest text-black/50 bg-black/[0.04]">{level.toUpperCase()}</span>
            </div>
            <div className="h-px bg-black/[0.08] relative mb-3"><div className="absolute left-0 -top-px h-[3px] bg-[#111] transition-all duration-700" style={{ width: `${avgPct}%` }} /></div>
            <div className="flex justify-between text-[11px] text-black/35 tracking-widest"><span>0%</span><span>{avgPct}%</span><span>100%</span></div>
          </div>
        )}

        <div className={`${card} rise p-6 md:p-8 mb-8`} style={{ animationDelay: "750ms" }}>
          <div className="font-pixel text-[11px] tracking-widest text-black/35 uppercase mb-5">Placement tips</div>
          <div className="divide-y divide-black/[0.06]">
            {TIPS.map(([t, d]) => (
              <div key={t} className="flex gap-6 py-3.5 text-sm">
                <span className="font-pixel text-[11px] tracking-widest text-black/40 w-28 shrink-0 pt-0.5 uppercase">{t}</span>
                <span className="text-black/55 leading-relaxed">{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href="/quiz" className="px-8 py-3 bg-[#111] text-sm rounded-xl hover:bg-[#333] hover:-translate-y-0.5 transition-all duration-300 tracking-widest" style={{ color: "#fff" }}>START NEW QUIZ</a>
          {totalAttempts > 0 && (
            <button onClick={clearData} className="px-8 py-3 border border-black/10 text-sm rounded-xl hover:border-black/25 transition-colors tracking-widest" style={{ color: "rgba(0,0,0,0.6)" }}>RESET PROGRESS</button>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { IntroAnimation } from "@/components/intro-animation";
import { PixelIcon } from "@/components/pixel-icon";
import { RevealText } from "@/components/reveal-text";
import { StackingAgentCards } from "@/components/stacking-agent-cards";
import { MobileNav } from "@/components/mobile-nav";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease` }}>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">{children}</span>;
}

const PLEX = { fontFamily: '"IBM Plex Sans", sans-serif' };
const fade = (on: boolean, d = 0, blur = 16) => ({
  opacity: on ? 1 : 0,
  filter: on ? "blur(0px)" : `blur(${blur}px)`,
  transform: on ? "translateY(0px)" : "translateY(24px)",
  transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${d}ms`,
});

const FEATURES = [
  { title: "Placement question bank", desc: "Curated questions across Aptitude, DSA, System Design and Reasoning, shuffled fresh every session." },
  { title: "60-second timer", desc: "Every question is timed. Train under pressure so the real exam feels easier." },
  { title: "Smart hints", desc: "Two progressive hints per question guide you without giving the answer away." },
  { title: "AI question mode", desc: "Generate a fresh question on demand with Gemini when you want something new." },
  { title: "Dashboard analytics", desc: "Track attempts, average accuracy and your best score over time." },
  { title: "Placement Ready grade", desc: "Get a verdict after every session: Placement Ready, On the Right Track, or Keep Practising." },
];
const STEPS = [
  { n: "01", title: "Start", desc: "Begin a quiz of 25 random questions from the placement bank." },
  { n: "02", title: "Answer", desc: "60 seconds a question, two attempts, and hints when you are stuck." },
  { n: "03", title: "Learn", desc: "Read the explanation for every question before moving on." },
  { n: "04", title: "Track", desc: "Watch accuracy and best score climb on your dashboard." },
]
const ROW1 = ["Aptitude", "DSA", "System Design", "Reasoning", "OOP", "DBMS", "Time & Work", "Profit & Loss", "Percentages", "Trees"];
const ROW2 = ["Graphs", "Dynamic Programming", "SQL Joins", "Normalization", "ACID", "Process Scheduling", "Deadlocks", "Memory Management", "LLD Patterns", "Scalability"];

export default function HomePage() {
  const router = useRouter();
  const [heroReady, setHeroReady] = useState(false);
  const handleIntroDone = useCallback(() => setHeroReady(true), []);
  const [user, setUser] = useState<{ fullName: string; username: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("placeprep_token");
      const stored = localStorage.getItem("placeprep_user");

      if (!token || !stored) {
        setUser(null);
        setAuthChecked(true);
        return;
      }

      // Validate token live with Supabase — catches deleted users instantly
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (!supabaseUser || error) {
        localStorage.removeItem("placeprep_user");
        localStorage.removeItem("placeprep_token");
        document.cookie = "placeprep_token=; path=/; max-age=0";
        setUser(null);
      } else {
        try { setUser(JSON.parse(stored)); } catch { }
      }

      setAuthChecked(true);
    };

    validateSession();

    // Poll every 15 seconds — re-checks while user sits on home page
    const interval = setInterval(validateSession, 15_000);

    // Listen for localStorage changes (when AuthWatcher clears the token)
    const onStorage = () => {
      const token = localStorage.getItem("placeprep_token");
      if (!token) { setUser(null); setAuthChecked(true); }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = () => {
    document.cookie = "placeprep_token=; path=/; max-age=0";
    localStorage.removeItem("placeprep_user");
    localStorage.removeItem("placeprep_token");
    setUser(null);
    router.replace("/login");
  };

  const firstName = user?.fullName?.split(" ")[0] ?? "";

  const Head = ({ icon, tag, title }: { icon: "platform" | "agents" | "workflow" | "integrations"; tag: string; title: string }) => (
    <div className="mb-16">
      <PixelIcon type={icon} size={40} />
      <div className="mt-4"><Tag>{tag}</Tag></div>
      <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">{title}</RevealText>
    </div>
  );

  const primary = "px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest";
  const ghost = "px-8 py-3 border border-black/10 text-black/60 text-sm rounded-xl hover:border-black/25 hover:text-black transition-colors tracking-widest";
  const ctas = user ? (
    <>
      <a href="/quiz" className={primary} style={{ color: "#fff" }}>START QUIZ</a>
      <a href="/ai-quiz" className={ghost} style={{ color: "rgba(0,0,0,0.6)" }}>AI QUESTIONS</a>
      <a href="/dashboard" className={ghost} style={{ color: "rgba(0,0,0,0.6)" }}>DASHBOARD</a>
    </>
  ) : (
    <>
      <a href="/register" className={primary} style={{ color: "#fff" }}>GET STARTED FREE</a>
      <a href="/login" className={ghost} style={{ color: "rgba(0,0,0,0.6)" }}>SIGN IN</a>
    </>
  );

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      <IntroAnimation onDone={handleIntroDone} />
      <MobileNav loggedIn={!!user} />

      {authChecked && user && (
        <div className="fixed top-6 right-5 z-[60] hidden md:flex items-center gap-3 text-[11px] text-black/50 tracking-wide">
          <span>{firstName}</span>
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/[0.03]">SIGN OUT</button>
        </div>
      )}

      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        <img src="/images/arc.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 60%" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "65%", background: "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col px-6 md:px-12 pb-12 max-w-3xl">
          {user && <div className="font-pixel text-[11px] tracking-widest text-black/40 mb-4" style={fade(heroReady, 0)}>WELCOME BACK, {firstName.toUpperCase()}</div>}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-light leading-[1.0] tracking-tight mb-8" style={{ ...PLEX, ...fade(heroReady, 0, 24) }}>
            Crack your<br />dream company<br />interview.
          </h1>
          <p className="text-base text-black/45 max-w-md mb-8 leading-relaxed" style={fade(heroReady, 120)}>
            Practise DSA, aptitude, system design and reasoning with timed sessions, smart hints and AI-generated challenges.
          </p>
          <div className="flex flex-wrap gap-3 mb-10" style={fade(heroReady, 200)}>{ctas}</div>
          <div className="flex gap-8 sm:gap-12">
            {[["60s", "Per question"], ["2", "Hints"], ["6", "Categories"]].map(([v, l], i) => (
              <div key={l} style={fade(heroReady, 280 + i * 80)}>
                <div className="text-3xl font-light tracking-tight" style={PLEX}>{v}</div>
                <div className="text-xs text-black/40 tracking-widest uppercase mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="platform" className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <Head icon="platform" tag="FEATURES" title={"Everything you need\nto get placed."} />
          <div className="grid grid-cols-12 gap-3">
            {FEATURES.map((f, i) => (
              <BentoCard key={f.title} className="col-span-12 md:col-span-4 p-8 min-h-[220px]" delay={(i % 3) * 80}>
                <span className="font-pixel text-[11px] text-black/20 tracking-widest block mb-10">0{i + 1}</span>
                <h3 className="text-lg font-light mb-2">{f.title}</h3>
                <p className="text-sm text-black/45 leading-relaxed">{f.desc}</p>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>CATEGORIES</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">{"Four tracks.\nOne placement plan."}</RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">Cover every section of a company screening, from aptitude to system design.</p>
          </div>
          <StackingAgentCards />
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <Head icon="workflow" tag="HOW IT WORKS" title={"From first question\nto placement ready."} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {STEPS.map((st, i) => (
              <BentoCard key={st.n} className="flex flex-col min-h-[260px] p-7" delay={i * 70}>
                <span className="font-pixel text-[11px] text-black/20 tracking-widest">{st.n}</span>
                <div className="mt-auto pt-16">
                  <h3 className="text-2xl font-light mb-3">{st.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed">{st.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4"><Tag>POWERED BY GEMINI</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">{"Stuck in a loop?\nGenerate something new."}</RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">AI Question Mode creates a fresh placement-style question whenever you want one.</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-black/[0.07] min-h-[420px] flex items-center justify-center p-6">
            <img src="/images/arc.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative w-full max-w-md rounded-xl border border-white/50 p-6" style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", background: "rgba(255,255,255,0.65)" }}>
              <div className="flex items-center justify-between mb-4">
                <Tag>SAMPLE QUESTION</Tag>
                <span className="font-pixel text-[11px] text-black/30 tracking-widest">DSA</span>
              </div>
              <p className="text-sm text-black/70 leading-relaxed mb-4">What data structure does BFS use to explore nodes level by level?</p>
              {["Stack", "Queue", "Heap", "Linked List"].map((o, i) => (
                <div key={o} className={`px-4 py-2.5 mb-2 rounded-lg border text-xs ${i === 1 ? "border-emerald-600/30 bg-emerald-50 text-emerald-700" : "border-black/[0.07] bg-white/60 text-black/50"}`}>{o}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section id="topics" className="border-t border-black/[0.06] overflow-hidden select-none">
        {[ROW1, ROW2].map((row, r) => (
          <div key={r} className={`flex ${r === 0 ? "border-b border-black/[0.06]" : ""}`} style={{ animation: `${r === 0 ? "marqueeLeft 28s" : "marqueeRight 22s"} linear infinite` }}>
            {[0, 1, 2].map((rep) => (
              <div key={rep} className="flex shrink-0">
                {row.map((c) => (
                  <div key={c} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                    <span className="text-sm text-black/45 whitespace-nowrap tracking-wide">{c}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <img src="/images/footer.png" alt="" aria-hidden="true" className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none" style={{ opacity: 0.85 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6">Your placement season<br />starts now.</h2>
          <p className="text-sm text-black/45 leading-relaxed mb-10">{user ? "Keep pushing. Every question gets you closer." : "No fluff. Just you, the clock, and the placement question bank."}</p>
          <div className="flex flex-wrap justify-center gap-3">{ctas}</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <span className="font-pixel text-xs tracking-[0.25em] text-black/50">PLACEPREP AI</span>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {(user
              ? [["Quiz", "/quiz"], ["AI Questions", "/ai-quiz"], ["Dashboard", "/dashboard"]]
              : [["Sign In", "/login"], ["Register", "/register"]]
            ).map(([l, h]) => (
              <a key={l} href={h} className="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest">{l}</a>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04] flex flex-col sm:flex-row justify-between gap-2 text-xs text-black/25">
          <span>© {new Date().getFullYear()} PlacePrep AI. All rights reserved.</span>
          <span>Designed &amp; developed by Dhanush Madhyasta</span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { PixelIcon } from "@/components/pixel-icon";
import { Glyph } from "@/components/fx";

const PLEX = { fontFamily: '"IBM Plex Sans", sans-serif' };

const POINTS = [
  { g: "clock", t: "Timed practice", d: "60 seconds per question, built for exam pressure." },
  { g: "spark", t: "AI-generated questions", d: "Fresh placement-style MCQs from Gemini on demand." },
  { g: "trend", t: "Progress you can see", d: "Attempts, accuracy and best score on your dashboard." },
];

export function AuthShell({ tag, title, sub, children }: { tag: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <main className="grain relative min-h-screen bg-[#F5F4F0] text-[#111] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-black/[0.06] p-12">
        <img src="/images/arc.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-70" style={{ objectPosition: "center 65%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #F5F4F0 0%, rgba(245,244,240,0.55) 35%, rgba(245,244,240,0.15) 60%, rgba(245,244,240,0.8) 100%)" }} />
        <a href="/" className="relative font-pixel text-xs tracking-[0.25em] text-black/60 hover:text-black transition-colors" style={{ color: "rgba(0,0,0,0.6)" }}>PLACEPREP AI</a>
        <div className="relative max-w-md">
          <div className="rise"><PixelIcon type="agents" size={44} /></div>
          <h2 className="rise mt-6 text-5xl font-light leading-[1.05] tracking-tight" style={{ ...PLEX, animationDelay: "100ms" }}>Your placement prep, one login away.</h2>
          <div className="mt-10 divide-y divide-black/[0.07] border-y border-black/[0.07]">
            {POINTS.map((p, i) => (
              <div key={p.t} className="rise flex items-start gap-4 py-4" style={{ animationDelay: `${250 + i * 90}ms` }}>
                <span className="mt-0.5 text-black/40"><Glyph name={p.g} /></span>
                <div>
                  <div className="text-sm text-black/80">{p.t}</div>
                  <div className="text-xs text-black/40 mt-0.5 leading-relaxed">{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-black/30">Aptitude · DSA · System Design · Reasoning</p>
      </aside>

      {/* Form side */}
      <section className="relative flex items-center justify-center px-6 py-16 min-h-screen lg:min-h-0">
        <a href="/" className="lg:hidden absolute top-6 left-6 font-pixel text-xs tracking-[0.25em]" style={{ color: "rgba(0,0,0,0.6)" }}>PLACEPREP AI</a>
        <div className="relative z-10 w-full max-w-sm">
          <span className="rise inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />{tag}
          </span>
          <h1 className="rise mt-5 text-4xl font-light tracking-tight" style={{ ...PLEX, animationDelay: "80ms" }}>{title}</h1>
          <p className="rise mt-2 mb-8 text-sm text-black/45" style={{ animationDelay: "160ms" }}>{sub}</p>
          <div className="rise" style={{ animationDelay: "240ms" }}>{children}</div>
        </div>
      </section>
    </main>
  );
}

const inputCls = "w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-black/25 outline-none transition-all duration-300 focus:border-black/40 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.05)]";

export function Field({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block font-pixel text-[11px] tracking-widest text-black/40 uppercase mb-2">{label}</span>
      <input className={inputCls} {...props} />
      {hint && <span className="block text-[11px] text-black/35 mt-1.5">{hint}</span>}
    </label>
  );
}

export function PasswordField({ label, strength, ...props }: { label: string; strength?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const v = String(props.value ?? "");
  const score = Math.min(4, (v.length >= 6 ? 1 : 0) + (v.length >= 10 ? 1 : 0) + (/[A-Z]/.test(v) && /[a-z]/.test(v) ? 1 : 0) + (/\d/.test(v) && /[^A-Za-z0-9]/.test(v) ? 1 : 0));
  return (
    <label className="block">
      <span className="block font-pixel text-[11px] tracking-widest text-black/40 uppercase mb-2">{label}</span>
      <div className="relative">
        <input className={`${inputCls} pr-16`} type={show ? "text" : "password"} {...props} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-widest text-black/35 hover:text-black/70 transition-colors" style={{ color: undefined }}>{show ? "HIDE" : "SHOW"}</button>
      </div>
      {strength && v.length > 0 && (
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-[3px] flex-1 rounded-full transition-all duration-500" style={{ background: i < score ? "#111" : "rgba(0,0,0,0.08)" }} />)}
        </div>
      )}
    </label>
  );
}

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return <div key={String(children)} className="pop px-4 py-3 rounded-xl border border-red-500/25 bg-red-50 text-sm text-red-800">{children}</div>;
}

export function PrimaryButton({ loading, children, ...props }: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} disabled={loading || props.disabled} className="w-full px-8 py-3.5 bg-[#111] text-sm rounded-xl tracking-widest hover:bg-[#333] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0" style={{ color: "#fff" }}>
      {children}
    </button>
  );
}

export function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="h-px flex-1 bg-black/[0.08]" /><span className="text-[11px] text-black/30 tracking-widest uppercase">{text}</span><span className="h-px flex-1 bg-black/[0.08]" />
    </div>
  );
}

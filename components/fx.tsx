"use client"

import { useEffect, useRef, useState } from "react"
import { PixelIcon } from "@/components/pixel-icon"
import { RevealText } from "@/components/reveal-text"

/** Page backdrop: faded arc image, dot grid and film grain. Also drives the card hover glow. */
export function Backdrop() {
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".glow-card") as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty("--mouse-x", `${e.clientX - r.left}px`)
      el.style.setProperty("--mouse-y", `${e.clientY - r.top}px`)
    }
    document.addEventListener("mousemove", move)
    return () => document.removeEventListener("mousemove", move)
  }, [])
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-[560px] overflow-hidden pointer-events-none" aria-hidden="true">
        <img src="/images/arc.png" alt="" className="w-full h-full object-cover opacity-45" style={{ objectPosition: "center 70%", WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 85%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 85%)" }} />
        <div className="dot-grid absolute inset-0" />
      </div>
    </>
  )
}

export function PageHead({ icon, tag, title, sub }: { icon: "platform" | "agents" | "workflow" | "integrations"; tag: string; title: string; sub?: string }) {
  return (
    <div className="mb-12">
      <div className="rise"><PixelIcon type={icon} size={40} /></div>
      <div className="mt-4 rise" style={{ animationDelay: "80ms" }}>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />{tag}
        </span>
      </div>
      <RevealText as="h1" className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">{title}</RevealText>
      {sub && <p className="mt-3 text-sm text-black/45 max-w-md rise" style={{ animationDelay: "300ms" }}>{sub}</p>}
    </div>
  )
}

export function CountUp({ value, suffix = "", duration = 900 }: { value: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])
  return <>{n}{suffix}</>
}

const PATHS: Record<string, string> = {
  target: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 5a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 100 2 1 1 0 000-2z",
  award: "M8 4h8v5a4 4 0 01-8 0V4zM8 6H5v2a3 3 0 003 3M16 6h3v2a3 3 0 01-3 3M12 13v4M9 20h6M10 17h4",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13",
}
export function Glyph({ name, size = 18 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.spark} />
    </svg>
  )
}

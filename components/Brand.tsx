import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="PlacePrep AI home">
      <span className="brand-mark" aria-hidden="true">P</span>
      <span>PlacePrep<span className="brand-accent"> AI</span></span>
      {!compact && <span className="brand-caption">PLACEMENT PREPARATION</span>}
    </Link>
  );
}

export function AppNavigation({ active }: { active?: string }) {
  const links = [
    ["/quiz", "Practice", "quiz"],
    ["/ai-quiz", "AI practice", "ai-quiz"],
    ["/dashboard", "Progress", "dashboard"],
  ];
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Brand />
        <nav className="app-nav" aria-label="Main navigation">
          {links.map(([href, label, key]) => (
            <Link key={href} href={href} className={active === key ? "app-nav-link is-active" : "app-nav-link"} aria-current={active === key ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

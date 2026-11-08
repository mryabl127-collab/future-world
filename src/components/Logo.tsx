export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <path d="M24 3 6 10v13c0 11 7.7 19.6 18 22 10.3-2.4 18-11 18-22V10L24 3Z" stroke="var(--primary)" strokeWidth="2" fill="color-mix(in oklab, var(--primary) 12%, transparent)" />
      <circle cx="24" cy="23" r="8" stroke="var(--primary)" strokeWidth="1.5" />
      <path d="M16 23h16M24 15c3 3 3 13 0 16M24 15c-3 3-3 13 0 16" stroke="var(--primary)" strokeWidth="1.2" />
    </svg>
  );
}

import Link from "next/link";

interface Props {
  href: string;
  emoji: string;
  title: string;
  subtitle?: string;
  colorClass: string;
  badge?: React.ReactNode;
  size?: "lg" | "md";
}

/** Grande pulsante-card, facile da toccare con le dita piccole. */
export function Tile({ href, emoji, title, subtitle, colorClass, badge, size = "md" }: Props) {
  const big = size === "lg";
  return (
    <Link
      href={href}
      className={`no-select relative flex flex-col items-center justify-center gap-2 rounded-[var(--radius-bubble)] ${colorClass} p-5 text-center shadow-md transition active:scale-95 ${
        big ? "min-h-44" : "min-h-36"
      }`}
    >
      <span className={big ? "text-7xl" : "text-5xl"} aria-hidden>
        {emoji}
      </span>
      <span className={`font-black ${big ? "text-3xl" : "text-xl"}`}>{title}</span>
      {subtitle && <span className="text-sm font-semibold text-muted">{subtitle}</span>}
      {badge && <span className="absolute right-3 top-3">{badge}</span>}
    </Link>
  );
}

import { useMemo } from "react";
import { getQuoteOfTheDay } from "../data/quotes";
import { cn } from "../lib/utils";

export default function QuoteOfTheDay({ className }) {
  const quote = useMemo(() => getQuoteOfTheDay(), []);

  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 45%, color-mix(in oklab, var(--color-primary) 12%, transparent))",
        }}
        aria-hidden
      />
      <div
        className="absolute w-56 h-56 rounded-full pointer-events-none -top-24 -start-16 blur-3xl opacity-40"
        style={{ background: "var(--color-primary)" }}
        aria-hidden
      />
      <div
        className="absolute w-64 h-64 rounded-full pointer-events-none -bottom-28 -end-10 bg-sky-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative px-6 py-6 sm:px-10 ">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full animate-ping bg-primary/50 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-primary">
              Quote of the day
            </span>
          </div>
          <span
            className="font-serif text-5xl leading-none transition-colors select-none sm:text-6xl text-foreground/10 group-hover:text-foreground/15"
            aria-hidden
          >
            ”
          </span>
        </div>

        <blockquote dir="ltr" lang="en" className="max-w-2xl mx-auto">
          <p
            className="text-lg sm:text-xl md:text-[1.4rem] leading-[1.75] text-foreground font-medium tracking-wide text-center"
            style={{
              fontFamily:
                "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Times New Roman', serif",
            }}
          >
            {quote.text}
          </p>
          <footer className="flex items-center justify-center gap-3 mt-7">
            <span className="w-10 h-px bg-gradient-to-r from-primary/80 to-transparent" />
            <cite className="text-sm not-italic tracking-wider text-muted-foreground">
              {quote.author}
            </cite>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

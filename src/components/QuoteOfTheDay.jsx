import { useMemo } from "react";
import { Quote } from "lucide-react";
import { getQuoteOfTheDay } from "../data/quotes";
import { cn } from "../lib/utils";

export default function QuoteOfTheDay({ className }) {
  const quote = useMemo(() => getQuoteOfTheDay(), []);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60",
        "bg-gradient-to-br from-primary/10 via-card to-card",
        "px-6 py-7 sm:px-10 sm:py-9",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--color-primary) 0, transparent 45%), radial-gradient(circle at 80% 80%, var(--color-primary) 0, transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary shadow-sm">
            <Quote className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-primary/90">
              Quote of the day
            </span>
            <span className="h-px w-12 bg-primary/40" />
          </div>
        </div>

        <blockquote className="max-w-2xl" dir="ltr" lang="en">
          <p
            className="text-[1.15rem] sm:text-xl md:text-[1.35rem] leading-[1.7] text-foreground/95 font-medium"
            style={{
              fontFamily:
                "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, serif",
            }}
          >
            <span className="text-primary/50 text-3xl leading-none me-1 align-[-0.2em]">
              “
            </span>
            {quote.text}
            <span className="text-primary/50 text-3xl leading-none ms-0.5 align-[-0.2em]">
              ”
            </span>
          </p>
          <footer className="mt-5 flex items-center gap-3">
            <span className="h-px w-8 sm:w-12 bg-border" />
            <cite className="not-italic text-sm text-muted-foreground tracking-wide">
              — {quote.author}
            </cite>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

import { useEffect, useState, useRef, useCallback } from "react";

const lines = [
  { text: "$ subnet calc 192.168.1.0/24", delay: 0 },
  { text: "", delay: 600 },
  { text: "  Network:     192.168.1.0", delay: 800 },
  { text: "  Broadcast:   192.168.1.255", delay: 1000 },
  { text: "  Usable IPs:  192.168.1.1 - 192.168.1.254", delay: 1200 },
  { text: "  Total Hosts: 254", delay: 1400 },
  { text: "  Subnet Mask: 255.255.255.0", delay: 1600 },
  { text: "", delay: 1800 },
  { text: "  ✓ Calculation complete in 0.3ms", delay: 2000 },
];

export function DemoTerminal() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const runAnimation = useCallback(() => {
    lines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
      }, line.delay);
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          runAnimation();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runAnimation]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">techguide — subnet-calculator</span>
      </div>

      {/* Terminal content */}
      <div className="p-4 font-mono text-sm leading-relaxed min-h-[220px] bg-background">
        {visibleLines.map((line, i) => (
          <div key={i} className={line.startsWith("$") ? "text-primary font-semibold" : line.includes("✓") ? "text-success" : "text-foreground/80"}>
            {line || "\u00A0"}
          </div>
        ))}
        {visibleLines.length < lines.length && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}

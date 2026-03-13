import { useEffect, useRef, useState, useCallback } from "react";

interface AnimatedCounterProps {
  target: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AnimatedCounter({ target, label, icon: Icon }: AnimatedCounterProps) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  const animateValue = useCallback((val: string) => {
    // Extract numeric part
    const numMatch = val.match(/(\d+)/);
    if (!numMatch) {
      setDisplay(val);
      return;
    }

    const numericTarget = parseInt(numMatch[1], 10);
    const prefix = val.slice(0, val.indexOf(numMatch[1]));
    const suffix = val.slice(val.indexOf(numMatch[1]) + numMatch[1].length);
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += numericTarget / steps;
      if (current >= numericTarget) {
        current = numericTarget;
        clearInterval(timer);
      }
      setDisplay(`${prefix}${Math.floor(current)}${suffix}`);
    }, stepTime);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          animateValue(target);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, animateValue]);

  return (
    <div ref={ref} className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Icon className="h-5 w-5 text-primary" />
        <span className="text-2xl sm:text-3xl font-bold text-foreground">{display}</span>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

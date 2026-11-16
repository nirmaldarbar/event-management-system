import { useEffect, useRef } from "react";

// Site-wide background: a faint grid that lights up around the cursor, a soft
// spotlight that follows it, and two slowly drifting colour glows.
// It is disabled for touch devices and for people who prefer reduced motion.
export default function InteractiveBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduce) return undefined;

    let raf = 0;
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.3;
    let x = tx;
    let y = ty;

    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      raf = Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* faint base grid, fading out towards the bottom */}
      <div
        className="bg-grid absolute inset-0"
        style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 85%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 85%)" }}
      />
      {/* grid lines that light up near the cursor */}
      <div className="bg-grid-lit absolute inset-0 opacity-60" />
      {/* soft spotlight */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(520px circle at var(--mx, 50%) var(--my, 30%), hsl(var(--primary) / 0.09), transparent 65%)" }}
      />
      {/* drifting colour glows */}
      <div className="absolute -left-40 -top-48 h-[34rem] w-[34rem] animate-drift-a rounded-full bg-primary/15 blur-[120px] dark:bg-primary/20" />
      <div className="absolute -right-40 top-[28%] h-[30rem] w-[30rem] animate-drift-b rounded-full bg-fuchsia-500/10 blur-[120px] dark:bg-fuchsia-500/12" />
    </div>
  );
}

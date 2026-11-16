import { useEffect, useRef } from "react";

// A light "constellation" canvas: dots drift slowly, connect when close, and
// are gently pushed away by the cursor. Pauses when off-screen or the tab is hidden.
export default function ParticleField({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let frame = 0;
    let visible = true;
    let pts = [];
    let color = "243 75% 56%";
    const mouse = { x: -9999, y: -9999 };

    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      if (v) color = v;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 13000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.2 + 0.7,
      }));
    };

    const draw = () => {
      if (frame++ % 90 === 0) readColor();
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130 && d2 > 1) {
            const d = Math.sqrt(d2);
            const push = (130 - d) / 130;
            p.x += (dx / d) * push * 1.6;
            p.y += (dy / d) * push * 1.6;
          }
        }
        ctx.beginPath();
        ctx.fillStyle = `hsl(${color} / 0.55)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 115 * 115) {
            ctx.strokeStyle = `hsl(${color} / ${(1 - Math.sqrt(d2) / 115) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
        // links to the cursor
        const mx = pts[i].x - mouse.x;
        const my = pts[i].y - mouse.y;
        const md = Math.sqrt(mx * mx + my * my);
        if (md < 170) {
          ctx.strokeStyle = `hsl(${color} / ${(1 - md / 170) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    };

    const loop = () => {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    readColor();
    resize();
    if (reduce) {
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}

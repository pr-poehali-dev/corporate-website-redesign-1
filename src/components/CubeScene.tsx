import { useEffect, useRef, useState, useCallback } from "react";

interface CubeSceneProps {
  faces: React.ReactNode[];
  faceLabels: string[];
}

const FACE_COUNT = 6;
// For a hexagonal prism rotation: each face is 60deg apart
const DEG = 360 / FACE_COUNT; // 60deg

export default function CubeScene({ faces, faceLabels }: CubeSceneProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [angle, setAngle] = useState(0);
  const scrollLock = useRef(false);
  const touchStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((next: number) => {
    if (animating) return;
    const idx = ((next % FACE_COUNT) + FACE_COUNT) % FACE_COUNT;
    setAnimating(true);
    setAngle(a => {
      const diff = idx - current;
      const shortDiff = diff > 3 ? diff - FACE_COUNT : diff < -3 ? diff + FACE_COUNT : diff;
      return a - shortDiff * DEG;
    });
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 750);
  }, [animating, current]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Scroll wheel
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollLock.current) return;
      scrollLock.current = true;
      if (e.deltaY > 0 || e.deltaX > 0) next();
      else prev();
      setTimeout(() => { scrollLock.current = false; }, 800);
    };
    const el = containerRef.current;
    el?.addEventListener("wheel", onWheel, { passive: false });
    return () => el?.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  // Touch swipe
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => { touchStart.current = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStart.current === null) return;
      const dx = touchStart.current - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) { if (dx > 0) next(); else prev(); }
      touchStart.current = null;
    };
    const el = containerRef.current;
    el?.addEventListener("touchstart", onTouchStart, { passive: true });
    el?.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => { el?.removeEventListener("touchstart", onTouchStart); el?.removeEventListener("touchend", onTouchEnd); };
  }, [next, prev]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const radius = typeof window !== "undefined"
    ? Math.round(window.innerWidth / (2 * Math.tan(Math.PI / FACE_COUNT)))
    : 800;

  return (
    <div ref={containerRef} className="cube-scene-root" style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#0d0603" }}>

      {/* 3D viewport */}
      <div style={{ width: "100%", height: "100%", perspective: `${radius * 2.2}px`, perspectiveOrigin: "50% 50%" }}>
        <div
          className="cube-drum"
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg)`,
            transition: animating ? "transform 0.72s cubic-bezier(0.77,0,0.18,1)" : "none",
          }}
        >
          {faces.map((face, i) => {
            const faceAngle = i * DEG;
            return (
              <div
                key={i}
                className="cube-face"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  transform: `rotateY(${faceAngle}deg) translateZ(${radius}px)`,
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {face}
              </div>
            );
          })}
        </div>
      </div>

      {/* Face indicator dots */}
      <div style={{
        position: "fixed",
        right: 28,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 100,
      }}>
        {faceLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            title={label}
            style={{
              width: i === current ? 10 : 7,
              height: i === current ? 10 : 7,
              borderRadius: "50%",
              border: `1px solid rgba(212,170,90,${i === current ? 1 : 0.4})`,
              background: i === current ? "hsl(42 80% 58%)" : "transparent",
              cursor: "none",
              transition: "all 0.35s ease",
              boxShadow: i === current ? "0 0 10px rgba(212,170,90,0.6)" : "none",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={prev}
        style={{
          position: "fixed", left: 20, top: "50%", transform: "translateY(-50%)",
          zIndex: 100, background: "rgba(212,170,90,0.1)", border: "1px solid rgba(212,170,90,0.3)",
          color: "rgba(212,170,90,0.8)", width: 40, height: 40, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "none", transition: "all 0.3s",
          fontSize: 18,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,170,90,0.25)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,170,90,0.1)"; }}
      >‹</button>
      <button
        onClick={next}
        style={{
          position: "fixed", right: 52, top: "50%", transform: "translateY(-50%)",
          zIndex: 100, background: "rgba(212,170,90,0.1)", border: "1px solid rgba(212,170,90,0.3)",
          color: "rgba(212,170,90,0.8)", width: 40, height: 40, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "none", transition: "all 0.3s",
          fontSize: 18,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,170,90,0.25)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,170,90,0.1)"; }}
      >›</button>

      {/* Current face label */}
      <div style={{
        position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, display: "flex", alignItems: "center", gap: 16,
      }}>
        {faceLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase",
              color: i === current ? "hsl(42 80% 65%)" : "rgba(255,255,255,0.25)",
              fontWeight: 300, fontFamily: "inherit",
              background: "none", border: "none", cursor: "none",
              transition: "color 0.35s ease",
              padding: "4px 0",
              borderBottom: i === current ? "1px solid rgba(212,170,90,0.5)" : "1px solid transparent",
            }}
          >{label}</button>
        ))}
      </div>

      {/* Edge glow between faces */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99,
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.5)",
      }} />
    </div>
  );
}

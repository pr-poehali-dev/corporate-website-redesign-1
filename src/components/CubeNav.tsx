import { useEffect, useRef, useState } from "react";

export interface CubeFace {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Props {
  faces: CubeFace[];
  currentFace: number;
  onFaceChange: (index: number) => void;
}

// Настоящий 3D куб: 6 граней
// front, right, back, left, top, bottom
// Позиции граней фиксированы — вращается сам куб
const CUBE_FACE_TRANSFORMS = [
  `translateZ(var(--half))`,                        // 0: front
  `rotateY(-90deg) translateZ(var(--half))`,        // 1: right
  `rotateY(180deg) translateZ(var(--half))`,        // 2: back
  `rotateY(90deg)  translateZ(var(--half))`,        // 3: left
  `rotateX(-90deg) translateZ(var(--half))`,        // 4: top
  `rotateX(90deg)  translateZ(var(--half))`,        // 5: bottom
];

// Чтобы показать грань i — нужно повернуть куб в обратную сторону
const CUBE_ROTATIONS = [
  { x: 0,   y: 0   },   // 0: front
  { x: 0,   y: 90  },   // 1: right
  { x: 0,   y: 180 },   // 2: back
  { x: 0,   y: -90 },   // 3: left
  { x: 90,  y: 0   },   // 4: top
  { x: -90, y: 0   },   // 5: bottom
];

export default function CubeNav({ faces, currentFace, onFaceChange }: Props) {
  const [size, setSize] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isAnimating = useRef(false);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const maxH = h - 140 - 80;
      const maxW = w - 140;
      setSize(Math.min(maxW, maxH, 560));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    let lastScroll = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating.current) return;
      const now = Date.now();
      if (now - lastScroll < 800) return;
      lastScroll = now;
      if (e.deltaY > 0) onFaceChange((currentFace + 1) % faces.length);
      else onFaceChange((currentFace - 1 + faces.length) % faces.length);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [currentFace, faces.length, onFaceChange]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (isAnimating.current) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) {
        if (dy < 0) onFaceChange((currentFace + 1) % faces.length);
        else onFaceChange((currentFace - 1 + faces.length) % faces.length);
      } else if (Math.abs(dx) > 40) {
        if (dx < 0) onFaceChange((currentFace + 1) % faces.length);
        else onFaceChange((currentFace - 1 + faces.length) % faces.length);
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [currentFace, faces.length, onFaceChange]);

  useEffect(() => {
    isAnimating.current = true;
    const t = setTimeout(() => { isAnimating.current = false; }, 900);
    return () => clearTimeout(t);
  }, [currentFace]);

  const half = size / 2;
  const rot = CUBE_ROTATIONS[currentFace];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(145deg, hsl(28 70% 8%) 0%, hsl(33 60% 14%) 50%, hsl(28 70% 8%) 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(212,170,90,0.08) 0%, transparent 60%)`
      }} />

      {/* 3D Scene */}
      <div style={{ perspective: `${size * 3}px`, perspectiveOrigin: "50% 50%", marginTop: "64px" }}>
        <div
          style={{
            width: size,
            height: size,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: "transform 0.85s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        >
          {faces.map((face, i) => {
            const transformStr = CUBE_FACE_TRANSFORMS[i].replace(/var\(--half\)/g, `${half}px`);
            const isActive = i === currentFace;
            return (
              <div
                key={face.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: size,
                  height: size,
                  transform: transformStr,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  overflow: "hidden",
                  border: "1px solid rgba(212,170,90,0.18)",
                  boxShadow: isActive
                    ? "0 0 80px rgba(212,170,90,0.15), inset 0 1px 0 rgba(255,220,100,0.1)"
                    : "inset 0 1px 0 rgba(255,220,100,0.05)",
                  background: "rgba(18,10,2,0.92)",
                  backdropFilter: "blur(20px)",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none z-10" style={{
                    boxShadow: "inset 0 0 60px rgba(212,170,90,0.06)",
                    border: "1px solid rgba(212,170,90,0.3)",
                  }} />
                )}
                <div className="w-full h-full overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
                  {face.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot navigation */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {faces.map((face, i) => (
          <button
            key={face.id}
            onClick={() => onFaceChange(i)}
            title={face.label}
            style={{
              width: i === currentFace ? 8 : 5,
              height: i === currentFace ? 8 : 5,
              borderRadius: "50%",
              background: i === currentFace ? "hsl(42 80% 60%)" : "rgba(212,170,90,0.3)",
              border: i === currentFace ? "1px solid rgba(212,170,90,0.8)" : "1px solid rgba(212,170,90,0.2)",
              boxShadow: i === currentFace ? "0 0 8px rgba(212,170,90,0.6)" : "none",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={() => onFaceChange((currentFace - 1 + faces.length) % faces.length)}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ background: "rgba(212,170,90,0.1)", border: "1px solid rgba(212,170,90,0.2)", borderRadius: 2, color: "rgba(212,170,90,0.7)" }}
      >
        ↑
      </button>
      <button
        onClick={() => onFaceChange((currentFace + 1) % faces.length)}
        className="fixed left-6 bottom-24 z-50 w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ background: "rgba(212,170,90,0.1)", border: "1px solid rgba(212,170,90,0.2)", borderRadius: 2, color: "rgba(212,170,90,0.7)" }}
      >
        ↓
      </button>

      {/* Current face label */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <span className="text-xs tracking-[0.4em] uppercase font-light" style={{ color: "rgba(212,170,90,0.5)" }}>
          {String(currentFace + 1).padStart(2, "0")} / {String(faces.length).padStart(2, "0")}
        </span>
        <span className="w-8 h-px" style={{ background: "rgba(212,170,90,0.3)" }} />
        <span className="text-xs tracking-[0.3em] uppercase font-light" style={{ color: "rgba(212,170,90,0.7)" }}>
          {faces[currentFace].label}
        </span>
      </div>

      {/* Swipe hint (mobile) */}
      <div className="fixed bottom-8 right-6 z-50 md:hidden">
        <span className="text-xs tracking-widest uppercase font-light" style={{ color: "rgba(212,170,90,0.3)" }}>свайп</span>
      </div>
    </div>
  );
}

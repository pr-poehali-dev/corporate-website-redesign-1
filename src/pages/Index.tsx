import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const PHOTO_URL = "https://cdn.poehali.dev/projects/6725aecc-6f9c-4bb1-9cad-3cce49e60509/files/cba1f3e8-a18b-4b75-8839-a91d2390aaba.jpg";

const services = [
  { title: "Индивидуальная консультация", desc: "Работа с тревогой, страхами, депрессией, кризисными состояниями. Глубокий анализ ситуации и выработка стратегии.", duration: "60 мин", price: "5 000 ₽" },
  { title: "Работа с отношениями", desc: "Партнёрские конфликты, созависимость, одиночество, развод. Восстановление ресурсного состояния и личных границ.", duration: "90 мин", price: "7 500 ₽" },
  { title: "Личностный рост", desc: "Раскрытие потенциала, устранение блоков и ограничивающих убеждений. Программа работы на 8–12 сессий.", duration: "60 мин", price: "5 000 ₽" },
  { title: "Психологическая диагностика", desc: "Комплексная оценка психологического состояния, выявление ключевых запросов и составление плана работы.", duration: "120 мин", price: "9 000 ₽" },
];

const reviews = [
  { name: "Анна К.", text: "После нескольких сессий с Олесей я наконец почувствовала, что снова управляю своей жизнью. Профессионализм и чуткость на высшем уровне.", date: "Март 2024" },
  { name: "Михаил В.", text: "Обратился в сложный период — развод и карьерный кризис одновременно. Работа с Олесей помогла расставить приоритеты и двигаться вперёд.", date: "Январь 2024" },
  { name: "Елена С.", text: "Работаем уже полгода. Изменения колоссальные — и в отношениях с собой, и в семье. Рекомендую без оговорок.", date: "Апрель 2024" },
];

const faqs = [
  { q: "Как проходит первая сессия?", a: "Первая встреча — это знакомство и диагностика. Мы обсудим ваш запрос, историю, ожидания от работы. Я сформирую план дальнейших сессий под вашу ситуацию." },
  { q: "Консультации проходят онлайн или очно?", a: "Работаю в обоих форматах. Онлайн-сессии проводятся в Zoom или Skype, очные — по предварительной записи." },
  { q: "Сколько сессий потребуется?", a: "Зависит от запроса. Краткосрочная работа — 4–8 встреч, глубинная проработка — от 3 месяцев. Обсудим на первой сессии." },
  { q: "Конфиденциальность данных?", a: "Полная конфиденциальность. Всё сказанное на сессии остаётся между нами. Исключений нет." },
];

const TIMES = ["10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00"];
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

/* ── Particle Canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.6 + 0.1,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,170,90,${p.o})`;
        ctx.fill();
      });
      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,170,90,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Floating Orbs ── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {([
        { w: 600, h: 600, top: "-10%", left: "-10%", right: undefined, bottom: undefined, dur: "18s", del: "0s" },
        { w: 400, h: 400, top: "30%", left: undefined, right: "-5%", bottom: undefined, dur: "24s", del: "4s" },
        { w: 300, h: 300, top: undefined, left: "20%", right: undefined, bottom: "10%", dur: "20s", del: "8s" },
        { w: 200, h: 200, top: "60%", left: "60%", right: undefined, bottom: undefined, dur: "15s", del: "2s" },
      ] as { w: number; h: number; top?: string; left?: string; right?: string; bottom?: string; dur: string; del: string }[]).map((o, i) => (
        <div key={i} className="absolute rounded-full orb-float" style={{
          width: o.w, height: o.h,
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          background: i % 2 === 0
            ? "radial-gradient(circle, rgba(212,170,90,0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(180,120,40,0.10) 0%, transparent 70%)",
          animationDuration: o.dur, animationDelay: o.del,
          filter: "blur(40px)",
        }} />
      ))}
    </div>
  );
}

/* ── Scroll reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── Spark Trail ── */
function SparkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    window.addEventListener("resize", () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
    const sparks: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number }[] = [];
    let mx = -999, my = -999;
    window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 3; i++) {
        sparks.push({
          x: mx + (Math.random() - 0.5) * 8,
          y: my + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5 - 0.5,
          life: 1, maxLife: 1,
          size: Math.random() * 3 + 1,
          hue: 35 + Math.random() * 20,
        });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.05;
        s.life -= 0.04;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        const alpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 65%, ${alpha})`;
        ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${s.hue}, 90%, 65%, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-[9998] pointer-events-none hidden md:block" style={{ mixBlendMode: "screen" }} />;
}

/* ── Diamond Cursor ── */
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { posRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);
    const animate = () => {
      const { x, y } = posRef.current;
      const t = trailPosRef.current;
      t.x += (x - t.x) * 0.1; t.y += (y - t.y) * 0.1;
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${x}px, ${y}px) rotate(45deg) translate(-50%, -50%)`;
      if (trailRef.current) trailRef.current.style.transform = `translate(${t.x}px, ${t.y}px) rotate(45deg) translate(-50%, -50%)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <>
      {/* Inner diamond */}
      <div ref={cursorRef} className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block"
        style={{ width: 14, height: 14, willChange: "transform" }}>
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(135deg, #fff9e0 0%, #f5c842 40%, #d4891a 70%, #fff3b0 100%)",
          boxShadow: "0 0 6px rgba(245,200,66,0.9), 0 0 14px rgba(212,150,30,0.6), inset 0 0 4px rgba(255,255,255,0.5)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }} />
        {/* facet lines */}
        <div style={{ position: "absolute", inset: 0, clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.6)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.6)" }} />
        </div>
      </div>
      {/* Trailing ring diamond */}
      <div ref={trailRef} className="fixed top-0 left-0 z-[9997] pointer-events-none hidden md:block"
        style={{ width: 30, height: 30, willChange: "transform" }}>
        <div style={{
          width: "100%", height: "100%",
          border: "1.5px solid rgba(245,200,66,0.5)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          boxShadow: "0 0 10px rgba(212,170,90,0.3)",
        }} />
      </div>
    </>
  );
}

/* ── Tilt Card ── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(6px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px)"; };
  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ transition: "transform 0.15s ease" }}>
      {children}
    </div>
  );
}

/* ── Ripple Button ── */
function RippleBtn({ children, className = "", onClick, style, disabled = false, type = "button" }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
  style?: React.CSSProperties; disabled?: boolean; type?: "button" | "submit";
}) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const rect = btn.getBoundingClientRect();
    circle.className = "ripple-effect";
    circle.style.cssText = `width:${diameter}px;height:${diameter}px;left:${e.clientX - rect.left - diameter/2}px;top:${e.clientY - rect.top - diameter/2}px`;
    btn.querySelector(".ripple-effect")?.remove();
    btn.appendChild(circle);
    if (onClick) onClick();
  };
  return (
    <button type={type} className={`ripple-btn ${className}`} onClick={handleClick} style={style} disabled={disabled}>
      {children}
    </button>
  );
}

/* ── Reveal Section wrapper ── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

export default function Index() {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDay(calYear, calMonth);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); setSelectedDay(null); setSelectedTime(null); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); setSelectedDay(null); setSelectedTime(null); };
  const isPast = (day: number) => { const d = new Date(calYear, calMonth, day); const t = new Date(); t.setHours(0,0,0,0); return d < t; };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!selectedDay || !selectedTime || !form.name || !form.phone) return; setSubmitted(true); };
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  const parallaxX = (mousePos.x - 0.5) * 30;
  const parallaxY = (mousePos.y - 0.5) * 20;

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          33% { transform: translateY(-30px) scale(1.05); }
          66% { transform: translateY(15px) scale(0.97); }
        }
        .orb-float { animation: orbFloat linear infinite; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, hsl(42 80% 55%) 0%, hsl(42 100% 75%) 40%, hsl(38 90% 50%) 60%, hsl(42 80% 55%) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(212,170,90,0.2), 0 0 30px rgba(212,170,90,0.05); }
          50% { box-shadow: 0 0 20px rgba(212,170,90,0.4), 0 0 60px rgba(212,170,90,0.15), 0 0 100px rgba(212,170,90,0.05); }
        }
        .glow-border { animation: borderGlow 3s ease-in-out infinite; }

        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotate-slow { animation: rotateSlow 30s linear infinite; }
        .rotate-slow-rev { animation: rotateSlow 40s linear infinite reverse; }

        @keyframes pulseGold {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .pulse-gold { animation: pulseGold 2.5s ease-in-out infinite; }

        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .line-grow { transform-origin: left; animation: lineGrow 1.2s ease forwards; }

        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .service-card { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease; }
        .service-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 60px rgba(0,0,0,0.15), 0 0 40px rgba(212,170,90,0.1); }

        .review-card { transition: transform 0.4s ease, border-color 0.3s ease; }
        .review-card:hover { transform: translateY(-6px); }

        @keyframes textReveal {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0% 0 0); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-title-word {
          display: inline-block;
          opacity: 0;
          animation: fadeSlideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .btn-gold-fill {
          position: relative;
          overflow: hidden;
        }
        .btn-gold-fill::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .btn-gold-fill:hover::before { transform: translateX(100%); }

        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .noise-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .float-photo { animation: floatY 6s ease-in-out infinite; }

        .stat-num {
          opacity: 0;
          animation: countUp 0.8s ease forwards;
        }

        /* ── Aurora background ── */
        @keyframes aurora1 {
          0%, 100% { transform: translateX(-20%) translateY(0%) rotate(0deg) scale(1); }
          33% { transform: translateX(10%) translateY(-15%) rotate(15deg) scale(1.1); }
          66% { transform: translateX(-5%) translateY(10%) rotate(-8deg) scale(0.95); }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translateX(20%) translateY(10%) rotate(0deg) scale(1); }
          33% { transform: translateX(-15%) translateY(-5%) rotate(-12deg) scale(1.15); }
          66% { transform: translateX(8%) translateY(15%) rotate(6deg) scale(0.9); }
        }
        .aurora-1 { animation: aurora1 18s ease-in-out infinite; }
        .aurora-2 { animation: aurora2 22s ease-in-out infinite; }

        /* ── Glitch text ── */
        @keyframes glitch1 {
          0%, 90%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
          92% { clip-path: inset(20% 0 60% 0); transform: translate(-4px, 2px); }
          94% { clip-path: inset(50% 0 30% 0); transform: translate(4px, -2px); }
          96% { clip-path: inset(70% 0 10% 0); transform: translate(-2px, 1px); }
          98% { clip-path: inset(10% 0 80% 0); transform: translate(3px, -1px); }
        }
        @keyframes glitch2 {
          0%, 90%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
          93% { clip-path: inset(40% 0 40% 0); transform: translate(4px, -2px); color: #ffd700; }
          95% { clip-path: inset(15% 0 70% 0); transform: translate(-3px, 1px); color: #ff9900; }
          97% { clip-path: inset(80% 0 5% 0); transform: translate(2px, 3px); color: #ffd700; }
        }
        .glitch-wrap { position: relative; display: inline-block; }
        .glitch-wrap::before, .glitch-wrap::after {
          content: attr(data-text);
          position: absolute; top: 0; left: 0;
          font-family: inherit; font-size: inherit; font-weight: inherit; font-style: inherit;
          color: inherit;
        }
        .glitch-wrap::before { animation: glitch1 8s infinite; color: #d4aa5a; }
        .glitch-wrap::after { animation: glitch2 8s infinite 0.1s; color: #ffcc44; }

        /* ── Tilt card ── */
        .tilt-card { transform-style: preserve-3d; transition: transform 0.15s ease; }
        .tilt-card-inner { transform: translateZ(20px); }

        /* ── Ripple ── */
        .ripple-btn { position: relative; overflow: hidden; }
        .ripple-btn .ripple-effect {
          position: absolute; border-radius: 50%;
          background: rgba(255,255,255,0.25);
          transform: scale(0);
          animation: rippleAnim 0.7s linear;
          pointer-events: none;
        }
        @keyframes rippleAnim {
          to { transform: scale(4); opacity: 0; }
        }

        /* ── Magnetic hover ── */
        .mag-btn { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

        /* ── Number counter ── */
        @keyframes flipNum {
          from { transform: rotateX(-90deg) translateY(-20px); opacity: 0; }
          to { transform: rotateX(0deg) translateY(0); opacity: 1; }
        }
        .flip-num { animation: flipNum 0.6s cubic-bezier(0.16,1,0.3,1) forwards; perspective: 400px; }

        /* ── Scan line sweep ── */
        @keyframes scanSweep {
          0% { top: -10%; opacity: 0.6; }
          100% { top: 110%; opacity: 0; }
        }
        .scan-line {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(212,170,90,0.4), transparent);
          animation: scanSweep 4s linear infinite;
          pointer-events: none;
          z-index: 5;
        }

        /* ── Gold dust ── */
        @keyframes dustFloat {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-20px) rotate(720deg); opacity: 0; }
        }
        .dust-particle {
          position: absolute; width: 3px; height: 3px;
          background: rgba(212,180,80,0.8);
          animation: dustFloat linear infinite;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }

        /* ── Section divider wave ── */
        .wave-divider { position: relative; overflow: hidden; }
        .wave-divider::after {
          content: '';
          position: absolute; bottom: -1px; left: 0; right: 0; height: 60px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23fdf8ef' d='M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E") no-repeat bottom;
          background-size: cover;
          pointer-events: none;
        }

        /* ── Spotlight hover ── */
        .spotlight-card {
          position: relative;
          overflow: hidden;
        }
        .spotlight-card::before {
          content: '';
          position: absolute;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(212,170,90,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: opacity 0.3s;
          opacity: 0;
          z-index: 0;
        }
        .spotlight-card:hover::before { opacity: 1; }

        /* ── Text gradient reveal ── */
        @keyframes gradReveal {
          from { background-position: 100% 0; }
          to { background-position: 0% 0; }
        }
        .grad-reveal {
          background: linear-gradient(90deg, hsl(32 60% 18%) 50%, transparent 50%);
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .grad-reveal.visible {
          animation: gradReveal 1s ease forwards;
        }

        /* ── Floating badge ── */
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .badge-float { animation: badgeFloat 4s ease-in-out infinite; }
      `}</style>

      <CustomCursor />
      <SparkTrail />

      <div className="min-h-screen bg-background font-body text-foreground" style={{ cursor: "none" }}>

        {/* NAV */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-sm"
          style={{ background: `rgba(82,52,18,${Math.min(scrollY / 100, 0.97)})`, transition: "background 0.3s" }}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-display text-white text-xl font-light tracking-widest uppercase relative">
              Олеся Гудкова
              <span className="absolute -bottom-1 left-0 h-px bg-gradient-to-r from-gold to-transparent w-full" />
            </span>
            <nav className="hidden md:flex items-center gap-8">
              {[["Обо мне","about"],["Услуги","services"],["Отзывы","reviews"],["FAQ","faq"],["Запись","booking"]].map(([l,id]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-body font-light transition-all hover:tracking-[0.35em] duration-300">
                  {l}
                </button>
              ))}
            </nav>
            <button onClick={() => scrollTo("booking")}
              className="hidden md:block btn-gold-fill border border-gold text-gold text-xs tracking-widest uppercase px-5 py-2 hover:bg-gold hover:text-white transition-all font-body font-light glow-border">
              Записаться
            </button>
            <button className="md:hidden text-white" onClick={() => setMenuOpen(o => !o)}>
              <Icon name={menuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4" style={{ background: "hsl(32 60% 15%)" }}>
              {[["Обо мне","about"],["Услуги","services"],["Отзывы","reviews"],["FAQ","faq"],["Запись","booking"]].map(([l,id]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-body text-left transition-colors">
                  {l}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* HERO */}
        <section className="relative min-h-screen flex items-center overflow-hidden noise-bg"
          style={{ background: "linear-gradient(135deg, hsl(30 65% 12%) 0%, hsl(35 60% 20%) 40%, hsl(30 65% 12%) 100%)" }}>

          <ParticleCanvas />
          <FloatingOrbs />

          {/* Aurora layers */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="aurora-1 absolute w-[900px] h-[500px] rounded-full opacity-30"
              style={{ top: "10%", left: "-10%", background: "radial-gradient(ellipse, rgba(212,150,30,0.25) 0%, rgba(180,100,20,0.1) 40%, transparent 70%)", filter: "blur(60px)" }} />
            <div className="aurora-2 absolute w-[700px] h-[400px] rounded-full opacity-25"
              style={{ bottom: "5%", right: "-5%", background: "radial-gradient(ellipse, rgba(255,200,80,0.2) 0%, rgba(200,130,30,0.08) 40%, transparent 70%)", filter: "blur(50px)" }} />
          </div>

          {/* Gold dust particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="dust-particle" style={{
                left: `${(i * 8.3) % 100}%`,
                animationDuration: `${8 + (i % 5) * 2}s`,
                animationDelay: `${i * 0.8}s`,
                width: i % 3 === 0 ? 4 : 2, height: i % 3 === 0 ? 4 : 2,
              }} />
            ))}
          </div>

          {/* Scan line */}
          <div className="scan-line" />

          {/* Decorative rotating rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="rotate-slow w-[700px] h-[700px] rounded-full border border-gold/5" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="rotate-slow-rev w-[500px] h-[500px] rounded-full border border-gold/8" style={{ borderStyle: "dashed" }} />
          </div>

          {/* Radial glow from mouse */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(212,170,90,0.08), transparent 60%)`,
            transition: "background 0.3s ease",
          }} />

          <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 w-full grid md:grid-cols-2 gap-12 items-center z-10">
            <div>
              <div style={{ animationDelay: "0.1s" }} className="animate-fade-in">
                <p className="text-gold text-xs tracking-[0.4em] uppercase font-body font-light mb-6 flex items-center gap-3">
                  <span className="w-8 h-px bg-gold/60 line-grow" />
                  Клинический психолог · Онлайн по всему миру
                </p>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-light leading-[1.05] mb-8">
                <span className="hero-title-word text-white" style={{ animationDelay: "0.3s" }}>Меняю</span>
                <br />
                <span className="hero-title-word shimmer-text italic text-6xl md:text-8xl glitch-wrap" data-text="судьбы" style={{ animationDelay: "0.5s" }}>судьбы</span>
                <br />
                <span className="hero-title-word text-white" style={{ animationDelay: "0.7s" }}>людей</span>
              </h1>
              <p className="text-white/50 text-sm leading-relaxed font-body font-light max-w-sm mb-10"
                style={{ opacity: 0, animation: "fadeSlideUp 0.9s 0.9s ease forwards" }}>
                Проводник энергии света. Работа с более чем 200 энергиями.
                Индивидуальный подход к каждому клиенту.
              </p>
              <div className="flex flex-col sm:flex-row gap-4" style={{ opacity: 0, animation: "fadeSlideUp 0.9s 1.1s ease forwards" }}>
                <RippleBtn onClick={() => scrollTo("booking")}
                  className="btn-gold-fill mag-btn relative text-white text-xs tracking-widest uppercase px-8 py-4 font-body font-light glow-border"
                  style={{ background: "linear-gradient(135deg, hsl(32 65% 28%), hsl(38 75% 42%), hsl(42 80% 48%))" }}>
                  Записаться на консультацию
                </RippleBtn>
                <RippleBtn onClick={() => scrollTo("about")}
                  className="mag-btn border border-white/20 text-white text-xs tracking-widest uppercase px-8 py-4 hover:border-gold/50 hover:bg-white/5 transition-all font-body font-light duration-300">
                  Узнать больше
                </RippleBtn>
              </div>
            </div>

            {/* Photo with effects */}
            <div className="flex justify-center md:justify-end" style={{ opacity: 0, animation: "fadeSlideUp 1s 0.4s ease forwards" }}>
              <div className="relative float-photo"
                style={{ transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`, transition: "transform 0.4s ease" }}>
                {/* Glow behind photo */}
                <div className="absolute inset-0 blur-3xl scale-110 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(212,170,90,0.25) 0%, transparent 70%)" }} />
                {/* Spinning decorative ring */}
                <div className="absolute -inset-8 rounded-full border border-gold/15 rotate-slow pointer-events-none" />
                <div className="absolute -inset-14 rounded-full border border-gold/8 rotate-slow-rev pointer-events-none" />
                {/* Corner accents */}
                <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-gold/60" />
                <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-gold/60" />
                <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-gold/60" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-gold/60" />
                <img src={PHOTO_URL} alt="Олеся Гудкова"
                  className="w-72 md:w-80 h-auto object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-1000 hover:scale-105"
                  style={{ filter: "sepia(20%) contrast(1.05)" }} />
                {/* Scanline overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)" }} />
                {/* Floating badges */}
                <div className="badge-float absolute -left-16 top-1/4 z-30 hidden md:block"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(212,170,90,0.3)", padding: "8px 14px", whiteSpace: "nowrap" }}>
                  <p className="text-gold text-xs font-body tracking-widest">✦ 10+ лет</p>
                </div>
                <div className="badge-float absolute -right-14 bottom-1/3 z-30 hidden md:block" style={{ animationDelay: "2s", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(212,170,90,0.3)", padding: "8px 14px", whiteSpace: "nowrap" }}>
                  <p className="text-gold text-xs font-body tracking-widest">✦ 500+ клиентов</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.2)" }}>
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 divide-x divide-white/10">
              {[["10+","лет практики"],["500+","клиентов"],["200+","энергий"]].map(([num, label], i) => (
                <div key={label} className="py-6 px-4 md:px-8 text-center group">
                  <p className="font-display text-gold text-3xl font-light stat-num group-hover:scale-110 transition-transform duration-300 inline-block"
                    style={{ animationDelay: `${1.3 + i * 0.15}s` }}>{num}</p>
                  <p className="text-white/30 text-xs tracking-widest uppercase mt-1 font-body">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-20 right-8 flex flex-col items-center gap-2 pulse-gold pointer-events-none hidden md:flex">
            <span className="text-gold/60 text-xs tracking-widest uppercase font-body" style={{ writingMode: "vertical-rl" }}>scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-gold/40 to-transparent" />
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-24 relative overflow-hidden" style={{ background: "hsl(42 35% 95%)" }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,170,90,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <Reveal>
                <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4 flex items-center gap-3">
                  <span className="w-6 h-px bg-gold" />
                  Обо мне
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mb-2 gold-line" style={{ color: "hsl(32 60% 18%)" }}>
                  Олеся Гудкова
                </h2>
              </Reveal>
              <div className="mt-8 space-y-4 text-sm leading-relaxed font-body font-light" style={{ color: "hsl(30 20% 30%)" }}>
                {["Клинический психолог с опытом более 10 лет. Работаю с тревогой, депрессией, кризисными состояниями, отношениями и личностным ростом.",
                  "Моя миссия — менять судьбы людей. Я помогаю клиентам выйти из замкнутого круга повторяющихся сценариев и обрести внутреннюю свободу.",
                  "Работаю с более чем 200 энергиями и являюсь проводником энергии света. Синтез классической психологии и работы с энергетическими состояниями даёт глубокие и устойчивые результаты."
                ].map((text, i) => (
                  <Reveal key={i} delay={i * 150}>
                    <p>{text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "GraduationCap", title: "Образование", desc: "МГУ, кафедра клинической психологии. Повышение квалификации — Австрия, Израиль." },
                { icon: "Award", title: "Сертификаты", desc: "Международная сертификация по когнитивно-поведенческой терапии, психоанализу." },
                { icon: "Users", title: "Подход", desc: "Интегративный метод. Работа с сознанием, подсознанием и энергетическим телом." },
                { icon: "Globe", title: "Формат", desc: "Онлайн-консультации для клиентов по всему миру." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 100}>
                  <div className="bg-white p-6 border border-amber-100 hover:border-gold/50 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-100/50 hover:-translate-y-1">
                    <Icon name={item.icon} size={20} className="text-gold mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <h4 className="font-display text-lg font-light mb-2" style={{ color: "hsl(32 60% 18%)" }}>{item.title}</h4>
                    <p className="text-xs leading-relaxed font-body font-light" style={{ color: "hsl(30 15% 45%)" }}>{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(212,170,90,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(180,120,40,0.04) 0%, transparent 50%)" }} />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <Reveal>
                <div>
                  <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4 flex items-center gap-3">
                    <span className="w-6 h-px bg-gold" />Услуги
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl font-light gold-line" style={{ color: "hsl(32 60% 18%)" }}>
                    Направления работы
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <button onClick={() => scrollTo("booking")}
                  className="btn-gold-fill self-start md:self-auto border border-amber-700 text-amber-800 text-xs tracking-widest uppercase px-6 py-3 hover:bg-amber-800 hover:text-white transition-all font-body font-light whitespace-nowrap duration-300">
                  Записаться
                </button>
              </Reveal>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((s, i) => (
                <Reveal key={i} delay={i * 120}>
                  <TiltCard>
                    <div className="spotlight-card service-card bg-white border border-amber-100 p-8 group relative overflow-hidden cursor-pointer h-full">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: "linear-gradient(135deg, rgba(212,170,90,0.05) 0%, transparent 60%)" }} />
                      <div className="absolute top-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gold to-amber-400 group-hover:w-full transition-all duration-500" />
                      <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-gradient-to-l from-gold/40 to-transparent group-hover:w-full transition-all duration-700" />
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="font-display text-gold text-5xl font-light opacity-15 group-hover:opacity-50 transition-opacity duration-300 select-none">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-2xl font-light" style={{ color: "hsl(32 60% 22%)" }}>{s.price}</span>
                      </div>
                      <h3 className="font-display text-2xl font-light mb-3 relative z-10" style={{ color: "hsl(32 60% 18%)" }}>{s.title}</h3>
                      <p className="text-sm leading-relaxed font-body font-light mb-4 relative z-10" style={{ color: "hsl(30 15% 45%)" }}>{s.desc}</p>
                      <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase font-body font-light relative z-10">
                        <Icon name="Clock" size={12} />
                        <span>{s.duration}</span>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews" className="py-24 relative overflow-hidden noise-bg" style={{ background: "linear-gradient(160deg, hsl(30 65% 14%) 0%, hsl(35 60% 22%) 50%, hsl(30 65% 14%) 100%)" }}>
          <FloatingOrbs />
          <ParticleCanvas />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <Reveal>
              <div className="mb-16 text-center">
                <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4">Отзывы</p>
                <h2 className="font-display text-white text-4xl md:text-5xl font-light gold-line-center">
                  Истории клиентов
                </h2>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r, i) => (
                <Reveal key={i} delay={i * 150}>
                  <div className="review-card border border-white/10 hover:border-gold/40 p-8 relative overflow-hidden group"
                    style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: "radial-gradient(circle at 50% 0%, rgba(212,170,90,0.07), transparent 70%)" }} />
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon name="Quote" size={28} className="text-gold/30 mb-6 group-hover:text-gold/60 transition-colors duration-300" />
                    <p className="text-white/65 text-sm leading-relaxed font-body font-light mb-8 italic relative z-10">
                      "{r.text}"
                    </p>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 relative z-10">
                      <span className="text-white font-body font-light text-sm">{r.name}</span>
                      <span className="text-white/30 text-xs font-body">{r.date}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BOOKING */}
        <section id="booking" className="py-24 relative overflow-hidden" style={{ background: "hsl(42 35% 95%)" }}>
          <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,170,90,0.07) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <Reveal>
              <div className="mb-16">
                <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4 flex items-center gap-3">
                  <span className="w-6 h-px bg-gold" />Запись
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-light gold-line" style={{ color: "hsl(32 60% 18%)" }}>
                  Онлайн-запись
                </h2>
              </div>
            </Reveal>

            {submitted ? (
              <Reveal>
                <div className="max-w-lg border border-gold/40 p-12 text-center glow-border" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)" }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-6 pulse-gold">
                    <Icon name="CheckCircle" size={32} className="text-white" />
                  </div>
                  <h3 className="font-display text-3xl font-light mb-3" style={{ color: "hsl(32 60% 18%)" }}>Заявка принята</h3>
                  <p className="text-sm leading-relaxed font-body font-light" style={{ color: "hsl(30 15% 45%)" }}>
                    Олеся свяжется с вами в течение 2 часов для подтверждения записи на{" "}
                    <strong className="font-light" style={{ color: "hsl(32 60% 22%)" }}>
                      {selectedDay} {MONTHS[calMonth]}, {selectedTime}
                    </strong>
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="grid md:grid-cols-2 gap-12">
                <Reveal>
                  <div className="bg-white border border-amber-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <button onClick={prevMonth} className="p-2 hover:bg-amber-50 transition-colors rounded" style={{ color: "hsl(30 30% 50%)" }}>
                        <Icon name="ChevronLeft" size={18} />
                      </button>
                      <span className="font-display text-xl font-light" style={{ color: "hsl(32 60% 18%)" }}>
                        {MONTHS[calMonth]} {calYear}
                      </span>
                      <button onClick={nextMonth} className="p-2 hover:bg-amber-50 transition-colors rounded" style={{ color: "hsl(30 30% 50%)" }}>
                        <Icon name="ChevronRight" size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 mb-2">
                      {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                        <div key={d} className="text-center text-xs tracking-widest uppercase py-2 font-body" style={{ color: "hsl(30 15% 60%)" }}>{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_,i) => {
                        const day = i + 1;
                        const past = isPast(day);
                        const isWeekend = (firstDay + i) % 7 >= 5;
                        const selected = selectedDay === day;
                        return (
                          <button key={day} disabled={past || isWeekend}
                            onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                            className={`aspect-square text-sm font-body font-light transition-all duration-200 rounded-sm
                              ${selected ? "text-white shadow-lg" : ""}
                              ${!selected && !past && !isWeekend ? "hover:bg-amber-50" : ""}
                              ${past || isWeekend ? "cursor-not-allowed" : "cursor-pointer"}
                            `}
                            style={{
                              background: selected ? "linear-gradient(135deg, hsl(38 75% 35%), hsl(42 80% 45%))" : undefined,
                              color: past || isWeekend ? "hsl(30 10% 75%)" : selected ? "white" : "hsl(32 40% 20%)",
                            }}>
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {selectedDay && (
                      <div className="mt-6 border-t border-amber-100 pt-6">
                        <p className="text-xs tracking-widest uppercase mb-3 font-body" style={{ color: "hsl(30 15% 55%)" }}>
                          Выберите время
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {TIMES.map(t => (
                            <button key={t} onClick={() => setSelectedTime(t)}
                              className="py-2 text-xs font-body font-light tracking-wide border transition-all duration-200"
                              style={{
                                borderColor: selectedTime === t ? "hsl(38 75% 38%)" : "hsl(38 30% 85%)",
                                background: selectedTime === t ? "linear-gradient(135deg, hsl(38 75% 35%), hsl(42 80% 45%))" : "transparent",
                                color: selectedTime === t ? "white" : "hsl(30 25% 35%)",
                              }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={200}>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {[
                      { label: "Ваше имя *", key: "name", placeholder: "Иван Иванов", type: "text" },
                      { label: "Телефон *", key: "phone", placeholder: "+7 (___) ___-__-__", type: "tel" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs tracking-widest uppercase font-body block mb-2" style={{ color: "hsl(30 15% 55%)" }}>
                          {f.label}
                        </label>
                        <input value={form[f.key as keyof typeof form]}
                          onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          required={f.label.includes("*")} type={f.type} placeholder={f.placeholder}
                          className="w-full border bg-white px-4 py-3 text-sm font-body font-light outline-none transition-all duration-300 placeholder:opacity-30"
                          style={{ borderColor: "hsl(38 30% 85%)", color: "hsl(30 35% 20%)" }}
                          onFocus={e => (e.target.style.borderColor = "hsl(38 75% 38%)")}
                          onBlur={e => (e.target.style.borderColor = "hsl(38 30% 85%)")} />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs tracking-widest uppercase font-body block mb-2" style={{ color: "hsl(30 15% 55%)" }}>
                        Комментарий
                      </label>
                      <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                        rows={4} placeholder="Кратко опишите ваш запрос..."
                        className="w-full border bg-white px-4 py-3 text-sm font-body font-light outline-none transition-all duration-300 resize-none placeholder:opacity-30"
                        style={{ borderColor: "hsl(38 30% 85%)", color: "hsl(30 35% 20%)" }}
                        onFocus={e => (e.target.style.borderColor = "hsl(38 75% 38%)")}
                        onBlur={e => (e.target.style.borderColor = "hsl(38 30% 85%)")} />
                    </div>
                    {selectedDay && selectedTime && (
                      <div className="px-4 py-3 text-sm font-body font-light flex items-center gap-2 border border-amber-200 bg-amber-50">
                        <Icon name="CalendarCheck" size={14} className="text-gold" />
                        <span style={{ color: "hsl(32 60% 22%)" }}>{selectedDay} {MONTHS[calMonth]}, {selectedTime}</span>
                      </div>
                    )}
                    <RippleBtn type="submit"
                      disabled={!selectedDay || !selectedTime || !form.name || !form.phone}
                      className="btn-gold-fill relative text-white text-xs tracking-widest uppercase px-8 py-4 font-body font-light disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] mt-2"
                      style={{ background: "linear-gradient(135deg, hsl(32 65% 28%), hsl(38 75% 42%), hsl(42 80% 48%))" }}>
                      Отправить заявку
                    </RippleBtn>
                    <p className="text-xs font-body font-light" style={{ color: "hsl(30 10% 65%)" }}>
                      Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                    </p>
                  </form>
                </Reveal>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-80 h-80 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,170,90,0.05) 0%, transparent 70%)", transform: "translate(30%, -50%)" }} />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <Reveal>
              <div className="mb-16">
                <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4 flex items-center gap-3">
                  <span className="w-6 h-px bg-gold" />FAQ
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-light gold-line" style={{ color: "hsl(32 60% 18%)" }}>
                  Частые вопросы
                </h2>
              </div>
            </Reveal>
            <div className="max-w-3xl border-t border-amber-100">
              {faqs.map((item, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="border-b border-amber-100">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full py-6 flex items-center justify-between text-left group">
                      <span className="font-display text-lg md:text-xl font-light group-hover:text-gold transition-colors pr-6 duration-300" style={{ color: "hsl(32 60% 18%)" }}>
                        {item.q}
                      </span>
                      <div className={`w-8 h-8 border border-amber-200 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === i ? "bg-gold border-gold rotate-45" : "group-hover:border-gold"}`}>
                        <Icon name="Plus" size={14} className={openFaq === i ? "text-white" : "text-gold"} />
                      </div>
                    </button>
                    {openFaq === i && (
                      <div className="pb-6 text-sm leading-relaxed font-body font-light" style={{ color: "hsl(30 15% 45%)", animation: "fadeSlideUp 0.4s ease forwards" }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 relative overflow-hidden noise-bg"
          style={{ background: "linear-gradient(135deg, hsl(30 65% 12%) 0%, hsl(35 60% 22%) 50%, hsl(30 65% 12%) 100%)" }}>
          <FloatingOrbs />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(800px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(212,170,90,0.1), transparent 60%)`,
          }} />
          {/* Decorative lines */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
          <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
            <Reveal>
              <p className="text-gold text-xs tracking-[0.4em] uppercase font-body font-light mb-6">Первый шаг</p>
              <h2 className="font-display text-white text-4xl md:text-6xl font-light mb-8 leading-tight">
                Готовы к <span className="shimmer-text italic">переменам?</span>
              </h2>
              <p className="text-white/45 text-sm font-body font-light max-w-lg mx-auto mb-12 leading-relaxed">
                Запишитесь на первую консультацию. Это безопасно, конфиденциально
                и может стать началом новой главы вашей жизни.
              </p>
              <RippleBtn onClick={() => scrollTo("booking")}
                className="btn-gold-fill mag-btn relative text-white text-xs tracking-widest uppercase px-12 py-5 font-body font-light glow-border"
                style={{ background: "linear-gradient(135deg, hsl(32 65% 28%), hsl(38 75% 42%), hsl(42 80% 48%))" }}>
                Записаться на консультацию
              </RippleBtn>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12" style={{ background: "hsl(28 50% 9%)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div>
                <p className="font-display text-white text-xl font-light tracking-widest uppercase mb-3">
                  Олеся Гудкова
                </p>
                <p className="text-white/25 text-xs font-body font-light leading-relaxed">
                  Клинический психолог<br />Проводник энергии света
                </p>
              </div>
              <div>
                <p className="text-white/35 text-xs tracking-widest uppercase mb-4 font-body">Контакты</p>
                <div className="space-y-2">
                  {[
                    { icon: "Phone", text: "+7 (999) 123-45-67", href: "tel:+79991234567" },
                    { icon: "Mail", text: "hello@olesyagoode.com", href: "mailto:hello@olesyagoode.com" },
                  ].map(c => (
                    <a key={c.href} href={c.href} className="flex items-center gap-2 text-white/50 hover:text-gold text-sm font-body font-light transition-colors duration-300 group">
                      <Icon name={c.icon} size={14} className="text-gold/50 group-hover:text-gold transition-colors" />
                      {c.text}
                    </a>
                  ))}
                  <div className="flex items-center gap-2 text-white/50 text-sm font-body font-light">
                    <Icon name="Globe" size={14} className="text-gold/50" />
                    По всему миру — онлайн
                  </div>
                </div>
              </div>
              <div>
                <p className="text-white/35 text-xs tracking-widest uppercase mb-4 font-body">Социальные сети</p>
                <div className="flex gap-3">
                  {[{ icon: "MessageCircle", label: "Telegram" }, { icon: "Instagram", label: "Instagram" }, { icon: "Youtube", label: "YouTube" }].map(s => (
                    <button key={s.label}
                      className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/35 hover:border-gold hover:text-gold transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gold/10">
                      <Icon name={s.icon} size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-white/15 text-xs font-body font-light">© 2024 Олеся Гудкова. Все права защищены.</p>
              <button onClick={() => scrollTo("booking")}
                className="text-white/15 hover:text-gold text-xs tracking-widest uppercase font-body transition-colors duration-300">
                Записаться на консультацию ↑
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
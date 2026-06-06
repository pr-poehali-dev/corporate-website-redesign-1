import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import CubeNav from "@/components/CubeNav";

const PHOTO_URL = "https://cdn.poehali.dev/projects/6725aecc-6f9c-4bb1-9cad-3cce49e60509/files/0dc71764-d8aa-4cdd-a077-ac546ecdeec8.jpg";

const services = [
  { title: "Индивидуальная консультация", desc: "Работа с тревогой, страхами, депрессией, кризисными состояниями. Глубокий анализ и выработка стратегии.", duration: "60 мин", price: "5 000 ₽", icon: "Brain" },
  { title: "Работа с отношениями", desc: "Партнёрские конфликты, созависимость, одиночество, развод. Восстановление ресурсного состояния.", duration: "90 мин", price: "7 500 ₽", icon: "Heart" },
  { title: "Личностный рост", desc: "Раскрытие потенциала, устранение блоков и ограничивающих убеждений. Программа 8–12 сессий.", duration: "60 мин", price: "5 000 ₽", icon: "Sparkles" },
  { title: "Психологическая диагностика", desc: "Комплексная оценка состояния, выявление ключевых запросов и составление плана работы.", duration: "120 мин", price: "9 000 ₽", icon: "ScanSearch" },
];

const reviews = [
  { name: "Анатолий Шапчиц", text: "Светлый, добрый и очень позитивный человек, который может помочь каждому, кто способен поверить в себя. Сеансы Олеси поднимают настроение, добавляют бодрости и уверенности. Она всегда знает, когда тебе написать и как преподнести, чтобы до тебя это долетело.", avatar: "А" },
  { name: "Михаил В.", text: "Обратился в сложный период — развод и карьерный кризис одновременно. Работа с Олесей помогла расставить приоритеты и двигаться вперёд.", avatar: "М" },
  { name: "Елена С.", text: "Работаем уже полгода. Изменения колоссальные — и в отношениях с собой, и в семье. Рекомендую без оговорок.", avatar: "Е" },
];

const faqs = [
  { q: "Как проходит первая сессия?", a: "Первая встреча — знакомство и диагностика. Мы обсудим ваш запрос, историю, ожидания. Я сформирую план дальнейших сессий под вашу ситуацию." },
  { q: "Консультации онлайн или очно?", a: "Работаю в обоих форматах. Онлайн-сессии в Zoom или Skype, очные — по предварительной записи." },
  { q: "Сколько сессий потребуется?", a: "Зависит от запроса. Краткосрочная работа — 4–8 встреч, глубинная проработка — от 3 месяцев." },
  { q: "Конфиденциальность?", a: "Полная конфиденциальность. Всё сказанное на сессии остаётся между нами. Исключений нет." },
];

const TIMES = ["10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00"];
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MONTHS_SHORT = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

/* ═══ PARTICLE CANVAS ═══ */
function ParticleCanvas({ count = 80 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.5 + 0.1,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,170,90,${p.o})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < 90) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(212,170,90,${0.1 * (1 - d / 90)})`; ctx.lineWidth = 0.4; ctx.stroke(); }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}



/* ═══ DIAMOND CURSOR 3D ═══ */
function CustomCursor() {
  const posRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const angle = useRef(0);
  const scaleAnim = useRef(1);
  const targetScale = useRef(1);
  const raf = useRef(0);

  useEffect(() => {
    const SIZE = 52;
    const cx = SIZE / 2, cy = SIZE / 2;

    // 3D vertices of a brilliant-cut diamond (normalized, then projected)
    // Crown: top table octagon + girdle, Pavilion: cone to culet
    const project = (x: number, y: number, z: number, angleY: number) => {
      const cosA = Math.cos(angleY), sinA = Math.sin(angleY);
      const rx = x * cosA - z * sinA;
      const rz = x * sinA + z * cosA;
      const fov = 160;
      const scale = fov / (fov + rz + 20);
      return { sx: cx + rx * scale, sy: cy + y * scale, z: rz, visible: true };
    };

    // Diamond geometry: R=crown radius, r=table radius, h=crown height, ph=pavilion height
    const R = 18, r = 11, crownH = 7, pavH = 18, girdleY = 4;
    const N = 8; // octagonal facets
    const tableY = girdleY - crownH;
    const culetY = girdleY + pavH;

    // Build vertices
    const tableVerts = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 + Math.PI / N;
      return { x: r * Math.cos(a), y: tableY, z: r * Math.sin(a) };
    });
    const girdleVerts = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      return { x: R * Math.cos(a), y: girdleY, z: R * Math.sin(a) };
    });
    const culet = { x: 0, y: culetY, z: 0 };

    // Face colors [light, mid, dark] — gold palette
    const crownColors = ["#fff3a0","#f5d060","#d4960a","#c8820a","#e8b830","#ffeaa0","#d4960a","#f5d060"];
    const pavColors   = ["#8a5500","#c8820a","#d4960a","#f5d060","#8a5500","#c8820a","#d4960a","#f5d060"];

    const canvas = canvasRef.current!;
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;

    const drawDiamond = (angleY: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Project all vertices
      const tp = tableVerts.map(v => project(v.x, v.y, v.z, angleY));
      const gp = girdleVerts.map(v => project(v.x, v.y, v.z, angleY));
      const cp = project(culet.x, culet.y, culet.z, angleY);

      type Face = { pts: {sx:number,sy:number,z:number}[]; color: string; alpha: number; bright: number };
      const faces: Face[] = [];

      // Table face (top flat octagon)
      faces.push({ pts: tp, color: "#fff9c0", alpha: 0.95, bright: 1 });

      // Crown facets: table edge → girdle edge
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        const pts = [tp[i], tp[j], gp[j], gp[i]];
        const avgZ = pts.reduce((s, p) => s + p.z, 0) / 4;
        const bright = 0.55 + 0.45 * Math.sin(Math.PI / N * i + angleY * 0.5);
        faces.push({ pts, color: crownColors[i % crownColors.length], alpha: 0.92, bright });
      }

      // Pavilion facets: girdle → culet
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        const pts = [gp[i], gp[j], cp];
        const bright = 0.4 + 0.6 * Math.abs(Math.cos((i / N) * Math.PI * 2 + angleY));
        faces.push({ pts, color: pavColors[i % pavColors.length], alpha: 0.95, bright });
      }

      // Sort back-to-front by average Z
      faces.sort((a, b) => {
        const za = a.pts.reduce((s, p) => s + p.z, 0) / a.pts.length;
        const zb = b.pts.reduce((s, p) => s + p.z, 0) / b.pts.length;
        return za - zb;
      });

      // Draw faces
      faces.forEach(f => {
        if (f.pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(f.pts[0].sx, f.pts[0].sy);
        f.pts.slice(1).forEach(p => ctx.lineTo(p.sx, p.sy));
        ctx.closePath();

        // Parse hex color and apply brightness
        const hex = f.color.replace("#","");
        const rr = parseInt(hex.slice(0,2),16), gg = parseInt(hex.slice(2,4),16), bb = parseInt(hex.slice(4,6),16);
        const br = f.bright;
        ctx.fillStyle = `rgba(${Math.min(255,rr*br|0)},${Math.min(255,gg*br|0)},${Math.min(255,bb*br|0)},${f.alpha})`;
        ctx.fill();

        // Edge highlight
        ctx.strokeStyle = "rgba(255,240,150,0.2)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Center sparkle
      const sp = project(0, tableY - 1, 0, angleY);
      const grad = ctx.createRadialGradient(sp.sx, sp.sy, 0, sp.sx, sp.sy, 5);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(sp.sx, sp.sy, 5, 0, Math.PI*2);
      ctx.fillStyle = grad; ctx.fill();
    };

    const onMove = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const onClick = () => { targetScale.current = 2.0; setTimeout(() => { targetScale.current = 1; }, 380); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    const loop = () => {
      angle.current += 0.032;
      scaleAnim.current += (targetScale.current - scaleAnim.current) * 0.18;

      const { x, y } = pos.current;
      drawDiamond(angle.current);

      if (posRef.current) {
        posRef.current.style.transform = `translate(${x - SIZE/2}px,${y - SIZE/2}px) scale(${scaleAnim.current})`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    loop();

    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("click", onClick); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <div ref={posRef} className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block"
      style={{ willChange: "transform", filter: "drop-shadow(0 0 8px rgba(245,200,66,0.8)) drop-shadow(0 0 20px rgba(212,150,30,0.5))" }}>
      <div ref={innerRef}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>
    </div>
  );
}

/* ═══ REVEAL HOOK ═══ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, on };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, on } = useReveal();
  return (
    <div ref={ref} className={className} style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(36px)", transition: `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ═══ TILT CARD ═══ */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -14;
    el.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateZ(8px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(700px) rotateY(0) rotateX(0) translateZ(0)"; };
  return <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: "transform 0.18s ease", transformStyle: "preserve-3d" }}>{children}</div>;
}

/* ═══ RIPPLE BUTTON ═══ */
function Btn({ children, onClick, className = "", style, disabled = false, type = "button" as "button" | "submit" }) {
  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const span = document.createElement("span");
    const d = Math.max(btn.clientWidth, btn.clientHeight);
    const r = btn.getBoundingClientRect();
    span.style.cssText = `position:absolute;border-radius:50%;width:${d}px;height:${d}px;left:${e.clientX - r.left - d/2}px;top:${e.clientY - r.top - d/2}px;background:rgba(255,255,255,0.2);transform:scale(0);animation:ripple 0.65s linear;pointer-events:none`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 700);
    onClick?.();
  };
  return <button type={type} className={className} style={{ position: "relative", overflow: "hidden", ...style }} onClick={handle} disabled={disabled}>{children}</button>;
}

/* ═══ MAIN ═══ */
export default function Index() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [sent, setSent] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [activeService, setActiveService] = useState(0);
  const [currentFace, setCurrentFace] = useState(0);

  const onFaceChange = useCallback((i: number) => setCurrentFace(i), []);

  useEffect(() => {
    const s = () => setScrollY(window.scrollY);
    const m = (e: MouseEvent) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("scroll", s, { passive: true });
    window.addEventListener("mousemove", m);
    return () => { window.removeEventListener("scroll", s); window.removeEventListener("mousemove", m); };
  }, []);

  const days = getDaysInMonth(year, month);
  const first = getFirstDay(year, month);
  const prevM = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else { setMonth(m => m-1); } setDay(null); setTime(null); };
  const nextM = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else { setMonth(m => m+1); } setDay(null); setTime(null); };
  const isPast = (d: number) => new Date(year, month, d) < new Date(new Date().setHours(0,0,0,0));
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (day && time && form.name && form.phone) setSent(true); };
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenu(false); };

  const headerBg = `rgba(18,10,2,${Math.min(scrollY / 80, 0.96)})`;

  // ── 6 граней куба ──
  const cubeFaces = [
    {
      id: "hero",
      label: "Главная",
      content: (
        <div className="relative w-full h-full flex items-center overflow-hidden"
          style={{ background: "linear-gradient(145deg, hsl(28 70% 10%) 0%, hsl(33 65% 17%) 45%, hsl(28 70% 10%) 100%)" }}>
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ opacity: 0.22, mixBlendMode: "luminosity" }}>
            <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: "linear-gradient(145deg,rgba(18,8,2,0.7) 0%,rgba(30,16,4,0.5) 50%,rgba(18,8,2,0.7) 100%)" }} />
          <ParticleCanvas count={60} />
          <div className="scan" />
          <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-24 w-full">
            <p className="flex items-center gap-3 text-xs tracking-[0.4em] uppercase font-body font-light mb-8" style={{ color: "rgba(212,170,90,0.7)", opacity: 0, animation: "fadeIn 1s .2s ease forwards" }}>
              <span className="w-8 h-px inline-block" style={{ background: "rgba(212,170,90,0.6)" }} />Клинический психолог
            </p>
            <h1 className="font-display font-light leading-[1.05] mb-10" style={{ fontSize: "clamp(3rem,7vw,6rem)", color: "white", opacity: 0, animation: "up60 1s .35s ease forwards" }}>
              <span className="glitch shimmer" data-text="Олеся">Олеся</span><br />
              <span style={{ color: "rgba(255,255,255,0.55)" }}>Гудкова</span>
            </h1>
            <p className="font-body font-light leading-[1.85] mb-12 max-w-md" style={{ fontSize: "clamp(0.9rem,1.5vw,1.05rem)", color: "rgba(255,255,255,0.45)", opacity: 0, animation: "fadeIn 1s .6s ease forwards" }}>
              Помогаю людям обрести внутреннюю свободу и изменить жизнь. 10+ лет практики, 500+ клиентов.
            </p>
            <div className="flex flex-wrap gap-4" style={{ opacity: 0, animation: "fadeIn 1s .8s ease forwards" }}>
              <Btn onClick={() => onFaceChange(5)} className="gold-grad glow-btn text-white text-xs tracking-[0.3em] uppercase px-10 py-4 font-body font-light hover:brightness-110 transition-all">Записаться</Btn>
              <Btn onClick={() => onFaceChange(1)} className="text-xs tracking-[0.3em] uppercase px-8 py-4 font-body font-light transition-all hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.65)" }}>Обо мне</Btn>
            </div>
          </div>
          <div className="absolute bottom-6 right-8 flex flex-col items-center gap-2 z-10" style={{ opacity: 0, animation: "fadeIn 1s 1.2s ease forwards" }}>
            <span className="text-xs tracking-[0.3em] uppercase font-body" style={{ color: "rgba(212,170,90,0.45)" }}>скролл</span>
            <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(212,170,90,0.5), transparent)" }} />
          </div>
        </div>
      ),
    },
    {
      id: "about",
      label: "Обо мне",
      content: (
        <div className="w-full min-h-full py-24 px-8 relative overflow-hidden" style={{ background: "hsl(40 35% 96%)" }}>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(212,170,90,0.07) 0%,transparent 70%)" }} />
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center pt-8">
            <div>
              <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "hsl(38 70% 40%)" }}>
                <span className="w-6 h-px bg-gold/80 inline-block" />Обо мне
              </p>
              <h2 className="font-display font-light leading-tight mb-2" style={{ fontSize: "clamp(2.4rem,5vw,3.8rem)", color: "hsl(28 60% 16%)" }}>Олеся Гудкова</h2>
              <div className="w-14 h-0.5 mt-4 mb-8 rounded-full" style={{ background: "linear-gradient(90deg,hsl(38 75% 42%),transparent)" }} />
              <div className="space-y-4 text-sm leading-[1.85] font-body font-light" style={{ color: "hsl(28 20% 32%)" }}>
                {["Клинический психолог с опытом более 10 лет. Работаю с тревогой, депрессией, кризисными состояниями, отношениями и личностным ростом.",
                  "Моя миссия — менять судьбы людей. Помогаю клиентам выйти из замкнутого круга повторяющихся сценариев и обрести внутреннюю свободу.",
                  "Работаю с более чем 200 энергиями. Синтез классической психологии и работы с энергетическими состояниями даёт глубокие и устойчивые результаты."
                ].map((t, i) => <p key={i}>{t}</p>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "GraduationCap", title: "Образование", desc: "МГУ, кафедра клинической психологии. Повышение квалификации — Австрия, Израиль." },
                { icon: "Award", title: "Сертификаты", desc: "Международная сертификация по КПТ и психоанализу." },
                { icon: "Layers", title: "Подход", desc: "Интегративный метод: сознание, подсознание и энергетическое тело." },
                { icon: "Globe", title: "Формат", desc: "Онлайн-консультации для клиентов по всему миру." },
              ].map((c, i) => (
                <TiltCard key={i} className="h-full">
                  <div className="glass-light p-6 h-full hover:shadow-xl transition-all duration-300 group" style={{ borderRadius: 2 }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: "linear-gradient(135deg,hsl(38 75% 42%),hsl(44 82% 52%))" }}>
                      <Icon name={c.icon} size={16} className="text-white" />
                    </div>
                    <h4 className="font-display text-lg font-light mb-2" style={{ color: "hsl(28 60% 16%)" }}>{c.title}</h4>
                    <p className="text-xs leading-relaxed font-body font-light" style={{ color: "hsl(28 15% 45%)" }}>{c.desc}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "services",
      label: "Услуги",
      content: (
        <div className="w-full h-full py-6 px-6 relative overflow-hidden" style={{ background: "hsl(28 25% 10%)" }}>
          <ParticleCanvas count={30} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 60%,rgba(212,150,30,0.06) 0%,transparent 55%)" }} />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase font-body font-light mb-2" style={{ color: "rgba(212,170,90,0.75)" }}>
                  <span className="w-4 h-px inline-block" style={{ background: "rgba(212,170,90,0.7)" }} />Услуги
                </p>
                <h2 className="font-display font-light" style={{ fontSize: "clamp(1.3rem,2.5vw,2rem)", color: "white" }}>Направления работы</h2>
              </div>
              <Btn onClick={() => onFaceChange(5)} className="text-xs tracking-[0.2em] uppercase px-4 py-2 font-body font-light transition-all duration-300 hover:brightness-110 whitespace-nowrap" style={{ border: "1px solid rgba(212,170,90,0.45)", color: "hsl(42 80% 60%)" }}>Записаться</Btn>
            </div>
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {services.map((s, i) => (
                <button key={i} onClick={() => setActiveService(i)}
                  className={`service-tab text-xs tracking-[0.15em] uppercase px-3 py-2 font-body font-light whitespace-nowrap transition-all duration-300 ${activeService === i ? "active" : ""}`}
                  style={{ color: activeService === i ? "hsl(42 80% 62%)" : "rgba(255,255,255,0.38)", background: activeService === i ? "rgba(212,170,90,0.1)" : "transparent", borderBottom: activeService === i ? "2px solid hsl(42 80% 50%)" : "2px solid transparent", fontSize: "0.65rem" }}>
                  {s.title}
                </button>
              ))}
            </div>
            <TiltCard>
              <div className="glass p-5 relative overflow-hidden" style={{ borderRadius: 2 }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(212,170,90,0.3),transparent)" }} />
                <div className="grid md:grid-cols-2 gap-6 items-center relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full gold-grad flex-shrink-0">
                        <Icon name={services[activeService].icon} size={15} className="text-white" />
                      </div>
                      <span className="font-display text-4xl font-light opacity-15 select-none" style={{ color: "hsl(42 80% 58%)" }}>{String(activeService + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="font-display font-light mb-2" style={{ fontSize: "clamp(1rem,2vw,1.4rem)", color: "white" }}>{services[activeService].title}</h3>
                    <p className="leading-[1.7] font-body font-light mb-3" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)" }}>{services[activeService].desc}</p>
                    <div className="flex items-center gap-2 font-body font-light" style={{ fontSize: "0.7rem", color: "rgba(212,170,90,0.7)" }}>
                      <Icon name="Clock" size={11} />{services[activeService].duration}
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-4">
                    <div>
                      <p className="font-body font-light mb-1 text-center md:text-right" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>Стоимость</p>
                      <p className="font-display font-light" style={{ fontSize: "2.2rem", color: "hsl(42 80% 60%)" }}>{services[activeService].price}</p>
                    </div>
                    <Btn onClick={() => onFaceChange(5)} className="gold-grad glow-btn text-white tracking-[0.2em] uppercase px-6 py-3 font-body font-light hover:brightness-110 transition-all" style={{ fontSize: "0.7rem" }}>Записаться</Btn>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      ),
    },
    {
      id: "reviews",
      label: "Отзывы",
      content: (
        <div className="w-full min-h-full py-24 px-8 relative overflow-hidden" style={{ background: "hsl(40 35% 96%)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 40%,rgba(212,170,90,0.06) 0%,transparent 55%)" }} />
          <div className="max-w-5xl mx-auto relative z-10 pt-8">
            <div className="mb-14">
              <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "hsl(38 70% 40%)" }}>
                <span className="w-6 h-px bg-gold/80 inline-block" />Отзывы
              </p>
              <h2 className="font-display font-light" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "hsl(28 60% 16%)" }}>Истории клиентов</h2>
              <div className="w-14 h-0.5 mt-4 rounded-full" style={{ background: "linear-gradient(90deg,hsl(38 75% 42%),transparent)" }} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r, i) => (
                <TiltCard key={i} className="h-full">
                  <div className="review-card glass-light p-8 h-full flex flex-col" style={{ borderRadius: 2 }}>
                    <div className="flex gap-1 mb-5">
                      {Array.from({length:5}).map((_,k) => (
                        <svg key={k} width="13" height="13" viewBox="0 0 24 24" fill="hsl(42 80% 52%)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      ))}
                    </div>
                    <p className="text-sm leading-[1.85] font-body font-light italic flex-1 mb-6" style={{ color: "hsl(28 20% 32%)" }}>"{r.text}"</p>
                    <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid rgba(212,170,90,0.15)" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-display text-white gold-grad">{r.avatar}</div>
                      <span className="font-body font-light text-sm" style={{ color: "hsl(28 40% 22%)" }}>{r.name}</span>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "faq",
      label: "FAQ",
      content: (
        <div className="w-full min-h-full py-24 px-8 relative overflow-hidden" style={{ background: "hsl(40 35% 96%)" }}>
          <div className="max-w-3xl mx-auto pt-8">
            <div className="mb-12">
              <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "hsl(38 70% 40%)" }}>
                <span className="w-6 h-px bg-gold/80 inline-block" />FAQ
              </p>
              <h2 className="font-display font-light" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "hsl(28 60% 16%)" }}>Частые вопросы</h2>
              <div className="w-14 h-0.5 mt-4 rounded-full" style={{ background: "linear-gradient(90deg,hsl(38 75% 42%),transparent)" }} />
            </div>
            {faqs.map((item, i) => (
              <div key={i} className="faq-item px-2">
                <button onClick={() => setFaq(faq === i ? null : i)} className="w-full py-6 flex items-center justify-between text-left group gap-6">
                  <span className="font-display text-lg md:text-xl font-light transition-colors duration-200" style={{ color: faq === i ? "hsl(38 65% 35%)" : "hsl(28 55% 18%)" }}>{item.q}</span>
                  <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${faq === i ? "gold-grad rotate-45" : ""}`} style={{ border: faq === i ? "none" : "1px solid rgba(212,170,90,0.4)" }}>
                    <Icon name="Plus" size={14} style={{ color: faq === i ? "white" : "hsl(38 65% 40%)" }} />
                  </div>
                </button>
                {faq === i && (
                  <p className="pb-6 text-sm leading-[1.85] font-body font-light" style={{ color: "hsl(28 15% 42%)", animation: "fadeIn .35s ease" }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "booking",
      label: "Запись",
      content: (
        <div className="w-full min-h-full py-24 px-8 relative overflow-hidden" style={{ background: "hsl(28 25% 10%)" }}>
          <ParticleCanvas count={30} />
          <div className="max-w-5xl mx-auto relative z-10 pt-8">
            <div className="mb-12">
              <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "rgba(212,170,90,0.75)" }}>
                <span className="w-6 h-px inline-block" style={{ background: "rgba(212,170,90,0.7)" }} />Запись
              </p>
              <h2 className="font-display font-light" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "white" }}>Онлайн-запись</h2>
              <div className="w-14 h-0.5 mt-4 rounded-full" style={{ background: "linear-gradient(90deg,hsl(42 80% 50%),transparent)" }} />
            </div>
            {sent ? (
              <div className="max-w-md glass p-14 text-center glow-btn" style={{ borderRadius: 2 }}>
                <div className="w-16 h-16 rounded-full gold-grad flex items-center justify-center mx-auto mb-6">
                  <Icon name="Check" size={28} className="text-white" />
                </div>
                <h3 className="font-display text-3xl font-light mb-3 text-white">Заявка принята</h3>
                <p className="text-sm font-body font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Олеся свяжется с вами в течение 2 часов.{" "}
                  <span style={{ color: "hsl(42 80% 62%)" }}>{day} {MONTHS_SHORT[month]}, {time}</span>
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="glass p-7" style={{ borderRadius: 2 }}>
                  <div className="flex items-center justify-between mb-7">
                    <button onClick={prevM} className="w-9 h-9 flex items-center justify-center transition-all duration-200 hover:bg-white/8 rounded" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <Icon name="ChevronLeft" size={17} />
                    </button>
                    <span className="font-display text-xl font-light text-white">{MONTHS[month]} {year}</span>
                    <button onClick={nextM} className="w-9 h-9 flex items-center justify-center transition-all duration-200 hover:bg-white/8 rounded" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <Icon name="ChevronRight" size={17} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                      <div key={d} className="text-center text-xs font-body py-1" style={{ color: "rgba(255,255,255,0.22)" }}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({length: first}).map((_,i) => <div key={`e${i}`} />)}
                    {Array.from({length: days}).map((_,i) => {
                      const d = i+1; const past = isPast(d);
                      return (
                        <button key={d} onClick={() => !past && setDay(d)} disabled={past}
                          className="aspect-square flex items-center justify-center text-sm font-body font-light transition-all duration-200"
                          style={{ background: day===d ? "linear-gradient(135deg,hsl(32 65% 28%),hsl(42 80% 44%))" : "transparent", color: past ? "rgba(255,255,255,0.12)" : day===d ? "white" : "rgba(255,255,255,0.6)", border: day===d ? "none" : "1px solid transparent", boxShadow: day===d ? "0 0 12px rgba(212,170,90,0.3)" : "none" }}
                          onMouseEnter={e => { if (!past && day!==d) (e.currentTarget as HTMLElement).style.background = "rgba(212,170,90,0.1)"; }}
                          onMouseLeave={e => { if (day!==d) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                  {day && (
                    <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(212,170,90,0.12)" }}>
                      <p className="text-xs tracking-widest uppercase mb-4 font-body" style={{ color: "rgba(255,255,255,0.3)" }}>Время</p>
                      <div className="grid grid-cols-3 gap-2">
                        {TIMES.map(t => (
                          <button key={t} onClick={() => setTime(t)} className="py-2.5 text-xs font-body font-light tracking-wide transition-all duration-200"
                            style={{ border: `1px solid ${time===t ? "hsl(42 80% 50%)" : "rgba(212,170,90,0.18)"}`, background: time===t ? "linear-gradient(135deg,hsl(32 65% 28%),hsl(42 80% 44%))" : "transparent", color: time===t ? "white" : "rgba(255,255,255,0.55)", boxShadow: time===t ? "0 0 12px rgba(212,170,90,0.25)" : "none" }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={submit} className="flex flex-col gap-5">
                  {[{l:"Ваше имя *",k:"name",p:"Иван Иванов",t:"text"},{l:"Телефон *",k:"phone",p:"+7 (___) ___-__-__",t:"tel"}].map(f => (
                    <div key={f.k}>
                      <label className="block text-xs tracking-widest uppercase mb-2 font-body" style={{ color: "rgba(255,255,255,0.3)" }}>{f.l}</label>
                      <input value={form[f.k as keyof typeof form]} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))}
                        required={f.l.includes("*")} type={f.t} placeholder={f.p}
                        className="w-full px-4 py-3.5 text-sm font-body font-light outline-none transition-all duration-300"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,170,90,0.18)", color: "rgba(255,255,255,0.85)", borderRadius: 0 }}
                        onFocus={e => e.target.style.borderColor = "hsl(42 80% 50%)"}
                        onBlur={e => e.target.style.borderColor = "rgba(212,170,90,0.18)"} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2 font-body" style={{ color: "rgba(255,255,255,0.3)" }}>Комментарий</label>
                    <textarea value={form.comment} onChange={e => setForm(p => ({...p,comment:e.target.value}))} rows={3}
                      placeholder="Кратко опишите ваш запрос..."
                      className="w-full px-4 py-3.5 text-sm font-body font-light outline-none transition-all duration-300 resize-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,170,90,0.18)", color: "rgba(255,255,255,0.85)", borderRadius: 0 }}
                      onFocus={e => e.target.style.borderColor = "hsl(42 80% 50%)"}
                      onBlur={e => e.target.style.borderColor = "rgba(212,170,90,0.18)"} />
                  </div>
                  {day && time && (
                    <div className="flex items-center gap-3 px-4 py-3 text-sm font-body font-light" style={{ background: "rgba(212,170,90,0.08)", border: "1px solid rgba(212,170,90,0.2)" }}>
                      <Icon name="CalendarCheck" size={15} className="text-gold flex-shrink-0" />
                      <span style={{ color: "hsl(42 80% 65%)" }}>{day} {MONTHS_SHORT[month]}, {time}</span>
                    </div>
                  )}
                  <Btn type="submit" disabled={!day || !time || !form.name || !form.phone}
                    className="gold-grad glow-btn text-white text-xs tracking-[0.28em] uppercase px-8 py-4 font-body font-light disabled:opacity-25 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-300 mt-1">
                    Отправить заявку
                  </Btn>
                  <p className="text-xs font-body font-light" style={{ color: "rgba(255,255,255,0.2)" }}>Нажимая кнопку, вы соглашаетесь с обработкой персональных данных</p>
                </form>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }
        @keyframes orb { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-28px) scale(1.06)} 70%{transform:translateY(12px) scale(0.96)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes glow { 0%,100%{box-shadow:0 0 12px rgba(212,170,90,0.25),0 0 30px rgba(212,170,90,0.08)} 50%{box-shadow:0 0 24px rgba(212,170,90,0.5),0 0 60px rgba(212,170,90,0.18)} }
        @keyframes rotL { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes rotR { from{transform:rotate(0)} to{transform:rotate(-360deg)} }
        @keyframes up60 { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scanLine { 0%{top:-4%;opacity:.5} 100%{top:104%;opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes badgeFloat { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
        @keyframes glitch1 { 0%,89%,100%{clip-path:inset(0 0 100% 0);transform:none} 91%{clip-path:inset(15% 0 65% 0);transform:translate(-3px,1px)} 94%{clip-path:inset(55% 0 25% 0);transform:translate(3px,-1px)} 97%{clip-path:inset(75% 0 5% 0);transform:translate(-2px,2px)} }
        @keyframes glitch2 { 0%,89%,100%{clip-path:inset(0 0 100% 0);transform:none} 92%{clip-path:inset(35% 0 45% 0);transform:translate(3px,-2px);color:#ffd700} 95%{clip-path:inset(10% 0 75% 0);transform:translate(-2px,1px);color:#ff9900} 98%{clip-path:inset(85% 0 3% 0);transform:translate(2px,2px)} }
        @keyframes aurora1 { 0%,100%{transform:translateX(-15%) translateY(0) rotate(0) scale(1)} 33%{transform:translateX(8%) translateY(-12%) rotate(12deg) scale(1.08)} 66%{transform:translateX(-4%) translateY(8%) rotate(-6deg) scale(0.94)} }
        @keyframes aurora2 { 0%,100%{transform:translateX(15%) translateY(8%) rotate(0) scale(1)} 33%{transform:translateX(-10%) translateY(-4%) rotate(-10deg) scale(1.12)} 66%{transform:translateX(6%) translateY(12%) rotate(5deg) scale(0.9)} }
        @keyframes dustUp { 0%{transform:translateY(100px) rotate(0);opacity:0} 10%{opacity:.7} 90%{opacity:.4} 100%{transform:translateY(-60px) rotate(540deg);opacity:0} }
        @keyframes lineGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes countIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes tabSlide { from{transform:scaleX(0)} to{transform:scaleX(1)} }

        .shimmer { background:linear-gradient(90deg,hsl(42 80% 55%) 0%,hsl(42 100% 78%) 38%,hsl(38 90% 52%) 62%,hsl(42 80% 55%) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3.5s linear infinite; }
        .glow-btn { animation: glow 3s ease-in-out infinite; }
        .rot-l { animation: rotL 28s linear infinite; }
        .rot-r { animation: rotR 38s linear infinite; }
        .orb { animation: orb ease-in-out infinite; }
        .float-y { animation: float 5s ease-in-out infinite; }
        .badge { animation: badgeFloat 4s ease-in-out infinite; }
        .glitch { position:relative;display:inline-block; }
        .glitch::before,.glitch::after { content:attr(data-text);position:absolute;top:0;left:0;font:inherit; }
        .glitch::before { animation:glitch1 9s infinite;color:#d4aa5a; }
        .glitch::after { animation:glitch2 9s .15s infinite;color:#ffcc44; }
        .aurora-a { animation:aurora1 20s ease-in-out infinite; }
        .aurora-b { animation:aurora2 26s ease-in-out infinite; }
        .line-grow { transform-origin:left;animation:lineGrow 1s ease forwards; }
        .count-in { opacity:0;animation:countIn .7s ease forwards; }
        .scan { position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,170,90,.35),transparent);animation:scanLine 5s linear infinite;pointer-events:none;z-index:4; }

        .glass { background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);border:1px solid rgba(212,170,90,0.15); }
        .glass-light { background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);border:1px solid rgba(212,170,90,0.2); }
        .gold-grad { background:linear-gradient(135deg,hsl(32 65% 28%),hsl(38 75% 42%),hsl(44 82% 52%)); }
        .text-grad { background:linear-gradient(135deg,hsl(38 70% 30%),hsl(42 75% 44%));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }

        .service-tab { transition:all .3s ease;position:relative;overflow:hidden; }
        .service-tab.active::after { content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,hsl(42 80% 50%),transparent); }
        .service-tab:not(.active):hover { background:rgba(212,170,90,0.06); }

        .review-card { transition:transform .35s ease,box-shadow .35s ease; }
        .review-card:hover { transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,0.2),0 0 30px rgba(212,170,90,0.08); }

        .faq-item { border-bottom:1px solid rgba(212,170,90,0.12);transition:background .2s; }
        .faq-item:hover { background:rgba(212,170,90,0.03); }

        .nav-link { position:relative; }
        .nav-link::after { content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:hsl(42 80% 50%);transform:scaleX(0);transform-origin:center;transition:transform .3s ease; }
        .nav-link:hover::after { transform:scaleX(1); }

        * { cursor: none !important; }
      `}</style>

      <CustomCursor />

      {/* ── FIXED NAV поверх куба ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        style={{ background: "rgba(18,10,2,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,170,90,0.15)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => onFaceChange(0)} className="font-display text-xl font-light tracking-[0.2em] uppercase relative" style={{ color: "white" }}>
            Олеся Гудкова
            <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-gold to-transparent opacity-60" />
          </button>
          <nav className="hidden md:flex items-center gap-7">
            {[["Обо мне",1],["Услуги",2],["Отзывы",3],["FAQ",4],["Запись",5]].map(([l,i]) => (
              <button key={String(i)} onClick={() => onFaceChange(Number(i))}
                className="nav-link text-xs tracking-[0.3em] uppercase font-body font-light transition-colors duration-200"
                style={{ color: currentFace === Number(i) ? "hsl(42 80% 62%)" : "rgba(255,255,255,0.65)" }}>
                {l}
              </button>
            ))}
          </nav>
          <Btn onClick={() => onFaceChange(5)}
            className="hidden md:flex items-center gap-2 text-xs tracking-[0.25em] uppercase px-5 py-2.5 font-body font-light hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,hsl(32 65% 28%),hsl(42 80% 44%))", color: "white" }}>
            Записаться
          </Btn>
          <button onClick={() => setMenu(m => !m)} className="md:hidden w-9 h-9 flex flex-col gap-1.5 items-center justify-center" style={{ color: "white" }}>
            <span className="w-5 h-px bg-current" /><span className="w-5 h-px bg-current" /><span className="w-5 h-px bg-current" />
          </button>
        </div>
        {menu && (
          <div className="md:hidden px-6 pb-5 flex flex-col gap-4" style={{ background: "rgba(18,10,2,0.96)" }}>
            {[["Обо мне",1],["Услуги",2],["Отзывы",3],["FAQ",4],["Запись",5]].map(([l,i]) => (
              <button key={String(i)} onClick={() => { onFaceChange(Number(i)); setMenu(false); }} className="text-xs tracking-[0.3em] uppercase text-left transition-colors" style={{ color: "rgba(255,255,255,0.6)" }}>{l}</button>
            ))}
          </div>
        )}
      </header>

      {/* ── 3D CUBE ── */}
      <CubeNav
        faces={cubeFaces}
        currentFace={currentFace}
        onFaceChange={onFaceChange}
      />

      {/* old layout removed */}
      <div className="hidden">

        {/* ── NAV ── */}
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{ background: headerBg, backdropFilter: scrollY > 20 ? "blur(20px)" : "none", borderBottom: scrollY > 20 ? "1px solid rgba(212,170,90,0.15)" : "none" }}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => go("hero")} className="font-display text-xl font-light tracking-[0.2em] uppercase relative"
              style={{ color: scrollY > 20 ? "white" : "white" }}>
              Олеся Гудкова
              <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-gold to-transparent opacity-60" />
            </button>
            <nav className="hidden md:flex items-center gap-7">
              {[["Обо мне","about"],["Услуги","services"],["Отзывы","reviews"],["FAQ","faq"],["Запись","booking"]].map(([l,id]) => (
                <button key={id} onClick={() => go(id)}
                  className="nav-link text-xs tracking-[0.3em] uppercase font-body font-light transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.65)" }}>
                  {l}
                </button>
              ))}
            </nav>
            <Btn onClick={() => go("booking")}
              className="hidden md:flex items-center gap-2 text-xs tracking-[0.25em] uppercase px-5 py-2.5 font-body font-light transition-all duration-300 hover:scale-105"
              style={{ border: "1px solid rgba(212,170,90,0.6)", color: "hsl(42 80% 65%)" }}>
              <Icon name="CalendarDays" size={13} />
              Записаться
            </Btn>
            <button className="md:hidden" onClick={() => setMenu(o => !o)} style={{ color: "white" }}>
              <Icon name={menu ? "X" : "Menu"} size={20} />
            </button>
          </div>
          {menu && (
            <div className="md:hidden px-6 pb-5 pt-2 flex flex-col gap-4 border-t border-white/10" style={{ background: "rgba(18,10,2,0.97)" }}>
              {[["Обо мне","about"],["Услуги","services"],["Отзывы","reviews"],["FAQ","faq"],["Запись","booking"]].map(([l,id]) => (
                <button key={id} onClick={() => go(id)} className="text-xs tracking-[0.3em] uppercase text-left transition-colors" style={{ color: "rgba(255,255,255,0.6)" }}>{l}</button>
              ))}
            </div>
          )}
        </header>

        {/* ── HERO ── */}
        <section id="hero" className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: "linear-gradient(145deg, hsl(28 70% 10%) 0%, hsl(33 65% 17%) 45%, hsl(28 70% 10%) 100%)" }}>

          {/* Background video */}
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.22, mixBlendMode: "luminosity" }}
          >
            <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
          </video>

          {/* Dark overlay over video */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(145deg, rgba(18,8,2,0.72) 0%, rgba(30,16,4,0.55) 50%, rgba(18,8,2,0.72) 100%)" }} />

          <ParticleCanvas count={90} />

          {/* Aurora */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="aurora-a absolute rounded-full opacity-25" style={{ width: 800, height: 450, top: "5%", left: "-8%", background: "radial-gradient(ellipse,rgba(212,150,30,0.3) 0%,rgba(180,100,20,0.1) 40%,transparent 70%)", filter: "blur(55px)" }} />
            <div className="aurora-b absolute rounded-full opacity-20" style={{ width: 600, height: 380, bottom: "8%", right: "-4%", background: "radial-gradient(ellipse,rgba(255,200,80,0.22) 0%,rgba(200,130,30,0.08) 40%,transparent 70%)", filter: "blur(50px)" }} />
          </div>

          {/* Dust */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ position: "absolute", left: `${(i * 10.1) % 100}%`, width: i%3===0?4:2, height: i%3===0?4:2, background: "rgba(212,180,80,0.75)", clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)", animation: `dustUp ${9 + (i%5)*2}s ${i*0.9}s linear infinite` }} />
            ))}
          </div>

          {/* Scan */}
          <div className="scan" />

          {/* Rotating rings */}
          <div className="absolute top-1/2 right-16 -translate-y-1/2 pointer-events-none hidden lg:block" style={{ transform: "translateY(-50%)" }}>
            <div className="rot-l absolute rounded-full" style={{ width: 480, height: 480, top: -240, right: -120, border: "1px solid rgba(212,170,90,0.08)" }} />
            <div className="rot-r absolute rounded-full" style={{ width: 320, height: 320, top: -160, right: -40, border: "1px dashed rgba(212,170,90,0.12)" }} />
          </div>

          {/* Mouse spotlight */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(600px circle at ${mouse.x*100}% ${mouse.y*100}%,rgba(212,170,90,0.07),transparent 60%)` }} />

          <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 w-full grid lg:grid-cols-2 gap-16 items-center z-10">

            {/* Left */}
            <div>
              <div style={{ opacity: 0, animation: "fadeIn .6s .1s ease forwards" }}>
                <div className="flex items-center gap-3 mb-7">
                  <span className="line-grow h-px w-10 bg-gold opacity-70 inline-block" />
                  <span className="text-xs tracking-[0.38em] uppercase font-body font-light" style={{ color: "rgba(212,170,90,0.8)" }}>
                    Проводник энергии света
                  </span>
                </div>
              </div>

              <h1 className="font-display font-light leading-[1.04] mb-8">
                <span className="block text-white" style={{ fontSize: "clamp(3rem,7vw,5.5rem)", opacity: 0, animation: "up60 .9s .3s cubic-bezier(0.16,1,0.3,1) forwards" }}>Меняю</span>
                <span className="block shimmer glitch italic" data-text="судьбы" style={{ fontSize: "clamp(3.5rem,8.5vw,6.5rem)", opacity: 0, animation: "up60 .9s .5s cubic-bezier(0.16,1,0.3,1) forwards" }}>судьбы</span>
                <span className="block text-white" style={{ fontSize: "clamp(3rem,7vw,5.5rem)", opacity: 0, animation: "up60 .9s .7s cubic-bezier(0.16,1,0.3,1) forwards" }}>людей</span>
              </h1>

              <p className="text-sm leading-relaxed font-body font-light max-w-md mb-10" style={{ color: "rgba(255,255,255,0.45)", opacity: 0, animation: "up60 .9s .9s ease forwards" }}>
                Клинический психолог. Работа с более чем 200 энергиями.<br />
                Онлайн по всему миру — безопасно и конфиденциально.
              </p>

              <div className="flex flex-wrap gap-4" style={{ opacity: 0, animation: "up60 .9s 1.05s ease forwards" }}>
                <Btn onClick={() => go("booking")}
                  className="gold-grad glow-btn text-white text-xs tracking-[0.28em] uppercase px-8 py-4 font-body font-light hover:brightness-110 transition-all duration-300">
                  Записаться на консультацию
                </Btn>
                <Btn onClick={() => go("about")}
                  className="text-xs tracking-[0.28em] uppercase px-8 py-4 font-body font-light transition-all duration-300 hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)" }}>
                  Обо мне
                </Btn>
              </div>
            </div>

            {/* Right — Photo */}
            <div className="flex justify-center lg:justify-end" style={{ opacity: 0, animation: "fadeIn 1s .4s ease forwards" }}>
              <div className="relative float-y" style={{ perspective: "1000px" }}>

                {/* Deep ambient glow layers */}
                <div className="absolute pointer-events-none" style={{ inset: "-60px", background: "radial-gradient(ellipse at 50% 60%, rgba(212,170,90,0.28) 0%, rgba(180,110,20,0.12) 40%, transparent 70%)", filter: "blur(40px)", borderRadius: "50%" }} />
                <div className="absolute pointer-events-none" style={{ inset: "-20px -30px", background: "radial-gradient(ellipse at 30% 40%, rgba(255,220,100,0.12) 0%, transparent 60%)", filter: "blur(25px)" }} />

                {/* Photo frame with 3D depth */}
                <div className="relative" style={{
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.6), 0 40px 100px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,100,0.15)",
                  transform: "rotateY(-4deg) rotateX(2deg)",
                  transformStyle: "preserve-3d",
                }}>
                  {/* Gold frame border */}
                  <div className="absolute inset-0 z-30 pointer-events-none" style={{ border: "1px solid rgba(212,170,90,0.35)", boxShadow: "inset 0 0 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,100,0.2)" }} />

                  {/* Corner brackets */}
                  {["-top-3 -left-3 border-t-2 border-l-2","-top-3 -right-3 border-t-2 border-r-2","-bottom-3 -left-3 border-b-2 border-l-2","-bottom-3 -right-3 border-b-2 border-r-2"].map((cls,i) => (
                    <div key={i} className={`absolute ${cls} w-8 h-8 z-40`} style={{ borderColor: "rgba(212,170,90,0.8)", filter: "drop-shadow(0 0 4px rgba(212,170,90,0.5))" }} />
                  ))}

                  <img src={PHOTO_URL} alt="Олеся Гудкова"
                    className="relative z-10 block object-cover transition-all duration-1000"
                    style={{ width: "min(300px,72vw)", display: "block", filter: "contrast(1.08) brightness(0.97)" }} />

                  {/* Light sweep overlay */}
                  <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,220,100,0.08) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)" }} />
                </div>

                {/* Spinning rings */}
                <div className="rot-l absolute -inset-10 rounded-full pointer-events-none" style={{ border: "1px solid rgba(212,170,90,0.14)", filter: "blur(0.5px)" }} />
                <div className="rot-r absolute -inset-16 rounded-full pointer-events-none" style={{ border: "1px dashed rgba(212,170,90,0.08)" }} />

                {/* Floating badges */}
                <div className="badge absolute -left-24 top-1/4 z-30 hidden lg:block px-4 py-2.5" style={{ background: "rgba(20,12,3,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(212,170,90,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 12px rgba(212,170,90,0.1)", borderRadius: 2 }}>
                  <p className="text-xs font-body tracking-widest" style={{ color: "hsl(42 80% 65%)" }}>✦ 10+ лет</p>
                </div>
                <div className="badge absolute -right-24 bottom-1/3 z-30 hidden lg:block px-4 py-2.5" style={{ animationDelay: "2.1s", background: "rgba(20,12,3,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(212,170,90,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 12px rgba(212,170,90,0.1)", borderRadius: 2 }}>
                  <p className="text-xs font-body tracking-widest" style={{ color: "hsl(42 80% 65%)" }}>✦ 500+ клиентов</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="absolute bottom-0 left-0 right-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)" }}>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 divide-x" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {[["10+","лет практики"],["500+","клиентов"],["200+","энергий"]].map(([n,l], i) => (
                <div key={l} className="py-5 text-center group">
                  <p className="font-display text-3xl font-light count-in group-hover:scale-110 transition-transform duration-300 inline-block"
                    style={{ color: "hsl(42 80% 58%)", animationDelay: `${1.2 + i*.15}s` }}>{n}</p>
                  <p className="text-xs tracking-widest uppercase mt-0.5 font-body" style={{ color: "rgba(255,255,255,0.28)" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>


        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="py-28 relative overflow-hidden" style={{ background: "hsl(40 35% 96%)" }}>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(212,170,90,0.07) 0%,transparent 70%)" }} />
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Reveal>
                <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "hsl(38 70% 40%)" }}>
                  <span className="w-6 h-px bg-gold/80 line-grow inline-block" />Обо мне
                </p>
                <h2 className="font-display font-light leading-tight mb-2" style={{ fontSize: "clamp(2.4rem,5vw,3.8rem)", color: "hsl(28 60% 16%)" }}>
                  Олеся Гудкова
                </h2>
                <div className="w-14 h-0.5 mt-4 mb-8 rounded-full" style={{ background: "linear-gradient(90deg,hsl(38 75% 42%),transparent)" }} />
              </Reveal>
              <div className="space-y-4 text-sm leading-[1.85] font-body font-light" style={{ color: "hsl(28 20% 32%)" }}>
                {["Клинический психолог с опытом более 10 лет. Работаю с тревогой, депрессией, кризисными состояниями, отношениями и личностным ростом.",
                  "Моя миссия — менять судьбы людей. Помогаю клиентам выйти из замкнутого круга повторяющихся сценариев и обрести внутреннюю свободу.",
                  "Работаю с более чем 200 энергиями. Синтез классической психологии и работы с энергетическими состояниями даёт глубокие и устойчивые результаты."
                ].map((t, i) => <Reveal key={i} delay={i * 130}><p>{t}</p></Reveal>)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "GraduationCap", title: "Образование", desc: "МГУ, кафедра клинической психологии. Повышение квалификации — Австрия, Израиль." },
                { icon: "Award", title: "Сертификаты", desc: "Международная сертификация по КПТ и психоанализу." },
                { icon: "Layers", title: "Подход", desc: "Интегративный метод: сознание, подсознание и энергетическое тело." },
                { icon: "Globe", title: "Формат", desc: "Онлайн-консультации для клиентов по всему миру." },
              ].map((c, i) => (
                <Reveal key={c.title} delay={i * 90}>
                  <TiltCard className="h-full">
                    <div className="glass-light p-6 h-full hover:shadow-xl transition-all duration-300 group" style={{ borderRadius: 2 }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: "linear-gradient(135deg,hsl(38 75% 42%),hsl(44 82% 52%))" }}>
                        <Icon name={c.icon} size={16} className="text-white" />
                      </div>
                      <h4 className="font-display text-lg font-light mb-2" style={{ color: "hsl(28 60% 16%)" }}>{c.title}</h4>
                      <p className="text-xs leading-relaxed font-body font-light" style={{ color: "hsl(28 15% 45%)" }}>{c.desc}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-28 relative overflow-hidden" style={{ background: "hsl(28 25% 10%)" }}>
          <ParticleCanvas count={50} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 60%,rgba(212,150,30,0.06) 0%,transparent 55%)" }} />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <Reveal>
                <div>
                  <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "rgba(212,170,90,0.75)" }}>
                    <span className="w-6 h-px inline-block line-grow" style={{ background: "rgba(212,170,90,0.7)" }} />Услуги
                  </p>
                  <h2 className="font-display font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "white" }}>
                    Направления работы
                  </h2>
                  <div className="w-14 h-0.5 mt-4 rounded-full" style={{ background: "linear-gradient(90deg,hsl(42 80% 50%),transparent)" }} />
                </div>
              </Reveal>
              <Reveal delay={150}>
                <Btn onClick={() => go("booking")}
                  className="self-start text-xs tracking-[0.28em] uppercase px-6 py-3 font-body font-light transition-all duration-300 hover:brightness-110"
                  style={{ border: "1px solid rgba(212,170,90,0.45)", color: "hsl(42 80% 60%)" }}>
                  Записаться
                </Btn>
              </Reveal>
            </div>

            {/* Tab nav */}
            <Reveal>
              <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
                {services.map((s, i) => (
                  <button key={i} onClick={() => setActiveService(i)}
                    className={`service-tab text-xs tracking-[0.2em] uppercase px-5 py-3 font-body font-light whitespace-nowrap transition-all duration-300 ${activeService === i ? "active" : ""}`}
                    style={{ color: activeService === i ? "hsl(42 80% 62%)" : "rgba(255,255,255,0.38)", background: activeService === i ? "rgba(212,170,90,0.1)" : "transparent", borderBottom: activeService === i ? "2px solid hsl(42 80% 50%)" : "2px solid transparent" }}>
                    {s.title}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Active service card */}
            <Reveal>
              <TiltCard>
                <div className="glass p-10 md:p-14 relative overflow-hidden" style={{ borderRadius: 2 }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%,rgba(212,170,90,0.06) 0%,transparent 60%)" }} />
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(212,170,90,0.3),transparent)" }} />
                  <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full gold-grad">
                          <Icon name={services[activeService].icon} size={20} className="text-white" />
                        </div>
                        <span className="font-display text-6xl font-light opacity-15 select-none" style={{ color: "hsl(42 80% 58%)" }}>
                          {String(activeService + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="font-display font-light mb-4" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", color: "white" }}>
                        {services[activeService].title}
                      </h3>
                      <p className="text-sm leading-[1.8] font-body font-light mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {services[activeService].desc}
                      </p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-body font-light" style={{ color: "rgba(212,170,90,0.7)" }}>
                          <Icon name="Clock" size={12} />{services[activeService].duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-6">
                      <div>
                        <p className="text-xs tracking-widest uppercase font-body font-light mb-1 text-center md:text-right" style={{ color: "rgba(255,255,255,0.3)" }}>Стоимость</p>
                        <p className="font-display font-light text-right" style={{ fontSize: "3rem", color: "hsl(42 80% 60%)" }}>
                          {services[activeService].price}
                        </p>
                      </div>
                      <Btn onClick={() => go("booking")}
                        className="gold-grad glow-btn text-white text-xs tracking-[0.28em] uppercase px-8 py-4 font-body font-light hover:brightness-110 transition-all">
                        Записаться
                      </Btn>
                    </div>
                  </div>
                  {/* Other services mini list */}
                  <div className="mt-10 pt-8 grid grid-cols-3 gap-3 relative z-10" style={{ borderTop: "1px solid rgba(212,170,90,0.1)" }}>
                    {services.map((s, i) => i !== activeService && (
                      <button key={i} onClick={() => setActiveService(i)}
                        className="text-left px-4 py-3 transition-all duration-200 hover:bg-white/5 group"
                        style={{ border: "1px solid rgba(212,170,90,0.08)" }}>
                        <p className="text-xs font-body font-light leading-snug group-hover:text-gold transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>{s.title}</p>
                        <p className="text-xs font-display font-light mt-1" style={{ color: "hsl(42 75% 50%)" }}>{s.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section id="reviews" className="py-28 relative overflow-hidden" style={{ background: "hsl(40 35% 96%)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 40%,rgba(212,170,90,0.06) 0%,transparent 55%)" }} />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <Reveal>
              <div className="mb-16">
                <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "hsl(38 70% 40%)" }}>
                  <span className="w-6 h-px bg-gold/80 line-grow inline-block" />Отзывы
                </p>
                <h2 className="font-display font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "hsl(28 60% 16%)" }}>
                  Истории клиентов
                </h2>
                <div className="w-14 h-0.5 mt-4 rounded-full" style={{ background: "linear-gradient(90deg,hsl(38 75% 42%),transparent)" }} />
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r, i) => (
                <Reveal key={i} delay={i * 130}>
                  <TiltCard className="h-full">
                    <div className="review-card glass-light p-8 h-full flex flex-col" style={{ borderRadius: 2 }}>
                      {/* Stars */}
                      <div className="flex gap-1 mb-5">
                        {Array.from({length:5}).map((_,k) => (
                          <svg key={k} width="13" height="13" viewBox="0 0 24 24" fill="hsl(42 80% 52%)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        ))}
                      </div>
                      <p className="text-sm leading-[1.85] font-body font-light italic flex-1 mb-6" style={{ color: "hsl(28 20% 32%)" }}>
                        "{r.text}"
                      </p>
                      <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid rgba(212,170,90,0.15)" }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-display text-white gold-grad">
                          {r.avatar}
                        </div>
                        <span className="font-body font-light text-sm" style={{ color: "hsl(28 40% 22%)" }}>{r.name}</span>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOOKING ── */}
        <section id="booking" className="py-28 relative overflow-hidden" style={{ background: "hsl(28 25% 10%)" }}>
          <ParticleCanvas count={40} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(700px circle at ${mouse.x*100}% ${mouse.y*100}%,rgba(212,170,90,0.08),transparent 60%)` }} />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <Reveal>
              <div className="mb-14">
                <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "rgba(212,170,90,0.75)" }}>
                  <span className="w-6 h-px inline-block line-grow" style={{ background: "rgba(212,170,90,0.7)" }} />Запись
                </p>
                <h2 className="font-display font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "white" }}>
                  Онлайн-запись
                </h2>
                <div className="w-14 h-0.5 mt-4 rounded-full" style={{ background: "linear-gradient(90deg,hsl(42 80% 50%),transparent)" }} />
              </div>
            </Reveal>

            {sent ? (
              <Reveal>
                <div className="max-w-md glass p-14 text-center glow-btn" style={{ borderRadius: 2 }}>
                  <div className="w-16 h-16 rounded-full gold-grad flex items-center justify-center mx-auto mb-6">
                    <Icon name="Check" size={28} className="text-white" />
                  </div>
                  <h3 className="font-display text-3xl font-light mb-3 text-white">Заявка принята</h3>
                  <p className="text-sm font-body font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Олеся свяжется с вами в течение 2 часов для подтверждения записи на{" "}
                    <span style={{ color: "hsl(42 80% 62%)" }}>{day} {MONTHS_SHORT[month]}, {time}</span>
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="grid lg:grid-cols-2 gap-10">

                {/* Calendar */}
                <Reveal>
                  <div className="glass p-7" style={{ borderRadius: 2 }}>
                    <div className="flex items-center justify-between mb-7">
                      <button onClick={prevM} className="w-9 h-9 flex items-center justify-center transition-all duration-200 hover:bg-white/8 rounded" style={{ color: "rgba(255,255,255,0.45)" }}>
                        <Icon name="ChevronLeft" size={17} />
                      </button>
                      <span className="font-display text-xl font-light text-white">{MONTHS[month]} {year}</span>
                      <button onClick={nextM} className="w-9 h-9 flex items-center justify-center transition-all duration-200 hover:bg-white/8 rounded" style={{ color: "rgba(255,255,255,0.45)" }}>
                        <Icon name="ChevronRight" size={17} />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 mb-3">
                      {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                        <div key={d} className="text-center text-xs py-1.5 font-body tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: first }).map((_,i) => <div key={`e${i}`} />)}
                      {Array.from({ length: days }).map((_,i) => {
                        const d = i + 1, past = isPast(d), wknd = (first+i)%7 >= 5, sel = day === d;
                        return (
                          <button key={d} disabled={past||wknd} onClick={() => { setDay(d); setTime(null); }}
                            className="aspect-square text-sm font-body font-light transition-all duration-150 rounded-sm"
                            style={{ background: sel ? "linear-gradient(135deg,hsl(32 65% 30%),hsl(42 80% 46%))" : "transparent", color: sel ? "white" : past||wknd ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.75)", cursor: past||wknd ? "not-allowed" : "none", boxShadow: sel ? "0 0 16px rgba(212,170,90,0.3)" : "none" }}>
                            {d}
                          </button>
                        );
                      })}
                    </div>
                    {day && (
                      <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(212,170,90,0.12)" }}>
                        <p className="text-xs tracking-widest uppercase mb-4 font-body" style={{ color: "rgba(255,255,255,0.3)" }}>Время</p>
                        <div className="grid grid-cols-3 gap-2">
                          {TIMES.map(t => (
                            <button key={t} onClick={() => setTime(t)}
                              className="py-2.5 text-xs font-body font-light tracking-wide transition-all duration-200"
                              style={{ border: `1px solid ${time===t ? "hsl(42 80% 50%)" : "rgba(212,170,90,0.18)"}`, background: time===t ? "linear-gradient(135deg,hsl(32 65% 28%),hsl(42 80% 44%))" : "transparent", color: time===t ? "white" : "rgba(255,255,255,0.55)", boxShadow: time===t ? "0 0 12px rgba(212,170,90,0.25)" : "none" }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Reveal>

                {/* Form */}
                <Reveal delay={180}>
                  <form onSubmit={submit} className="flex flex-col gap-5">
                    {[{l:"Ваше имя *",k:"name",p:"Иван Иванов",t:"text"},{l:"Телефон *",k:"phone",p:"+7 (___) ___-__-__",t:"tel"}].map(f => (
                      <div key={f.k}>
                        <label className="block text-xs tracking-widest uppercase mb-2 font-body" style={{ color: "rgba(255,255,255,0.3)" }}>{f.l}</label>
                        <input value={form[f.k as keyof typeof form]} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))}
                          required={f.l.includes("*")} type={f.t} placeholder={f.p}
                          className="w-full px-4 py-3.5 text-sm font-body font-light outline-none transition-all duration-300"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,170,90,0.18)", color: "rgba(255,255,255,0.85)", borderRadius: 0 }}
                          onFocus={e => e.target.style.borderColor = "hsl(42 80% 50%)"}
                          onBlur={e => e.target.style.borderColor = "rgba(212,170,90,0.18)"} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2 font-body" style={{ color: "rgba(255,255,255,0.3)" }}>Комментарий</label>
                      <textarea value={form.comment} onChange={e => setForm(p => ({...p,comment:e.target.value}))} rows={4}
                        placeholder="Кратко опишите ваш запрос..."
                        className="w-full px-4 py-3.5 text-sm font-body font-light outline-none transition-all duration-300 resize-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,170,90,0.18)", color: "rgba(255,255,255,0.85)", borderRadius: 0 }}
                        onFocus={e => e.target.style.borderColor = "hsl(42 80% 50%)"}
                        onBlur={e => e.target.style.borderColor = "rgba(212,170,90,0.18)"} />
                    </div>
                    {day && time && (
                      <div className="flex items-center gap-3 px-4 py-3 text-sm font-body font-light" style={{ background: "rgba(212,170,90,0.08)", border: "1px solid rgba(212,170,90,0.2)" }}>
                        <Icon name="CalendarCheck" size={15} className="text-gold flex-shrink-0" />
                        <span style={{ color: "hsl(42 80% 65%)" }}>{day} {MONTHS_SHORT[month]}, {time}</span>
                      </div>
                    )}
                    <Btn type="submit" disabled={!day || !time || !form.name || !form.phone}
                      className="gold-grad glow-btn text-white text-xs tracking-[0.28em] uppercase px-8 py-4 font-body font-light disabled:opacity-25 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-300 mt-1">
                      Отправить заявку
                    </Btn>
                    <p className="text-xs font-body font-light" style={{ color: "rgba(255,255,255,0.2)" }}>
                      Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                    </p>
                  </form>
                </Reveal>
              </div>
            )}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-28 relative overflow-hidden" style={{ background: "hsl(40 35% 96%)" }}>
          <div className="absolute top-1/2 right-0 w-80 h-80 pointer-events-none" style={{ background: "radial-gradient(circle,rgba(212,170,90,0.06) 0%,transparent 70%)", transform: "translate(30%,-50%)" }} />
          <div className="max-w-7xl mx-auto px-6">
            <Reveal>
              <div className="mb-14">
                <p className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-body font-light mb-5" style={{ color: "hsl(38 70% 40%)" }}>
                  <span className="w-6 h-px bg-gold/80 line-grow inline-block" />FAQ
                </p>
                <h2 className="font-display font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "hsl(28 60% 16%)" }}>
                  Частые вопросы
                </h2>
                <div className="w-14 h-0.5 mt-4 rounded-full" style={{ background: "linear-gradient(90deg,hsl(38 75% 42%),transparent)" }} />
              </div>
            </Reveal>
            <div className="max-w-3xl">
              {faqs.map((item, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="faq-item px-2">
                    <button onClick={() => setFaq(faq === i ? null : i)}
                      className="w-full py-6 flex items-center justify-between text-left group gap-6">
                      <span className="font-display text-lg md:text-xl font-light transition-colors duration-200 group-hover:text-grad"
                        style={{ color: faq === i ? "hsl(38 65% 35%)" : "hsl(28 55% 18%)" }}>
                        {item.q}
                      </span>
                      <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${faq === i ? "gold-grad rotate-45" : ""}`}
                        style={{ border: faq === i ? "none" : "1px solid rgba(212,170,90,0.4)" }}>
                        <Icon name="Plus" size={14} className={faq === i ? "text-white" : ""} style={{ color: faq === i ? "white" : "hsl(38 65% 40%)" }} />
                      </div>
                    </button>
                    {faq === i && (
                      <p className="pb-6 text-sm leading-[1.85] font-body font-light" style={{ color: "hsl(28 15% 42%)", animation: "fadeIn .35s ease" }}>
                        {item.a}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-36 relative overflow-hidden" style={{ background: "linear-gradient(145deg,hsl(28 70% 10%) 0%,hsl(33 65% 17%) 50%,hsl(28 70% 10%) 100%)" }}>
          <ParticleCanvas count={60} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(900px circle at ${mouse.x*100}% ${mouse.y*100}%,rgba(212,170,90,0.09),transparent 60%)` }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gold/25 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
            <Reveal>
              <p className="text-xs tracking-[0.4em] uppercase font-body font-light mb-7" style={{ color: "rgba(212,170,90,0.7)" }}>Первый шаг</p>
              <h2 className="font-display font-light mb-8 leading-tight" style={{ fontSize: "clamp(2.5rem,6vw,5rem)", color: "white" }}>
                Готовы к <span className="shimmer italic">переменам?</span>
              </h2>
              <p className="text-sm font-body font-light max-w-md mx-auto mb-12 leading-[1.85]" style={{ color: "rgba(255,255,255,0.38)" }}>
                Запишитесь на первую консультацию. Безопасно, конфиденциально и может стать началом новой главы вашей жизни.
              </p>
              <Btn onClick={() => go("booking")}
                className="gold-grad glow-btn text-white text-xs tracking-[0.3em] uppercase px-14 py-5 font-body font-light hover:brightness-110 transition-all duration-300">
                Записаться на консультацию
              </Btn>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-14" style={{ background: "hsl(24 50% 7%)", borderTop: "1px solid rgba(212,170,90,0.1)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-10 mb-10">
              <div>
                <p className="font-display text-white text-xl font-light tracking-[0.2em] uppercase mb-3">Олеся Гудкова</p>
                <p className="text-xs font-body font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.22)" }}>
                  Клинический психолог<br />Проводник энергии света
                </p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase mb-5 font-body" style={{ color: "rgba(255,255,255,0.28)" }}>Контакты</p>
                <div className="space-y-3">
                  {[{i:"Phone",t:"+7 (999) 123-45-67",h:"tel:+79991234567"},{i:"Mail",t:"hello@olesyagoode.com",h:"mailto:hello@olesyagoode.com"}].map(c => (
                    <a key={c.h} href={c.h} className="flex items-center gap-2.5 text-sm font-body font-light transition-colors duration-200 group" style={{ color: "rgba(255,255,255,0.42)" }}>
                      <Icon name={c.i} size={13} className="group-hover:text-gold transition-colors" style={{ color: "rgba(212,170,90,0.5)" }} />
                      <span className="group-hover:text-gold transition-colors">{c.t}</span>
                    </a>
                  ))}
                  <div className="flex items-center gap-2.5 text-sm font-body font-light" style={{ color: "rgba(255,255,255,0.42)" }}>
                    <Icon name="Globe" size={13} style={{ color: "rgba(212,170,90,0.5)" }} />
                    По всему миру — онлайн
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase mb-5 font-body" style={{ color: "rgba(255,255,255,0.28)" }}>Соцсети</p>
                <div className="flex gap-3">
                  {[{i:"MessageCircle",l:"TG"},{i:"Instagram",l:"IG"},{i:"Youtube",l:"YT"}].map(s => (
                    <button key={s.l} className="w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ border: "1px solid rgba(212,170,90,0.18)", color: "rgba(255,255,255,0.35)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(42 80% 50%)"; (e.currentTarget as HTMLElement).style.color = "hsl(42 80% 60%)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,170,90,0.18)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}>
                      <Icon name={s.i} size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-body font-light" style={{ color: "rgba(255,255,255,0.14)" }}>© 2024 Олеся Гудкова. Все права защищены.</p>
              <button onClick={() => go("booking")} className="text-xs tracking-widest uppercase font-body transition-colors duration-200" style={{ color: "rgba(255,255,255,0.14)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(42 80% 55%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.14)")}>
                Записаться ↑
              </button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
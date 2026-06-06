import { useState } from "react";
import Icon from "@/components/ui/icon";

const PHOTO_URL = "https://cdn.poehali.dev/projects/6725aecc-6f9c-4bb1-9cad-3cce49e60509/files/cba1f3e8-a18b-4b75-8839-a91d2390aaba.jpg";

const services = [
  {
    title: "Индивидуальная консультация",
    desc: "Работа с тревогой, страхами, депрессией, кризисными состояниями. Глубокий анализ ситуации и выработка стратегии.",
    duration: "60 мин",
    price: "5 000 ₽",
  },
  {
    title: "Работа с отношениями",
    desc: "Партнёрские конфликты, созависимость, одиночество, развод. Восстановление ресурсного состояния и личных границ.",
    duration: "90 мин",
    price: "7 500 ₽",
  },
  {
    title: "Личностный рост",
    desc: "Раскрытие потенциала, устранение блоков и ограничивающих убеждений. Программа работы на 8–12 сессий.",
    duration: "60 мин",
    price: "5 000 ₽",
  },
  {
    title: "Психологическая диагностика",
    desc: "Комплексная оценка психологического состояния, выявление ключевых запросов и составление плана работы.",
    duration: "120 мин",
    price: "9 000 ₽",
  },
];

const reviews = [
  {
    name: "Анна К.",
    text: "После нескольких сессий с Олесей я наконец почувствовала, что снова управляю своей жизнью. Профессионализм и чуткость на высшем уровне.",
    date: "Март 2024",
  },
  {
    name: "Михаил В.",
    text: "Обратился в сложный период — развод и карьерный кризис одновременно. Работа с Олесей помогла расставить приоритеты и двигаться вперёд.",
    date: "Январь 2024",
  },
  {
    name: "Елена С.",
    text: "Работаем уже полгода. Изменения колоссальные — и в отношениях с собой, и в семье. Рекомендую без оговорок.",
    date: "Апрель 2024",
  },
];

const faqs = [
  {
    q: "Как проходит первая сессия?",
    a: "Первая встреча — это знакомство и диагностика. Мы обсудим ваш запрос, историю, ожидания от работы. Я сформирую план дальнейших сессий под вашу ситуацию.",
  },
  {
    q: "Консультации проходят онлайн или очно?",
    a: "Работаю в обоих форматах. Онлайн-сессии проводятся в Zoom или Skype, очные — в Москве, по предварительной записи.",
  },
  {
    q: "Сколько сессий потребуется?",
    a: "Зависит от запроса. Краткосрочная работа — 4–8 встреч, глубинная проработка — от 3 месяцев. Обсудим на первой сессии.",
  },
  {
    q: "Конфиденциальность данных?",
    a: "Полная конфиденциальность. Всё сказанное на сессии остаётся между нами. Исключений нет.",
  },
];

const TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const MONTHS = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
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

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null); setSelectedTime(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null); setSelectedTime(null);
  };

  const isPast = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !selectedTime || !form.name || !form.phone) return;
    setSubmitted(true);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-body text-foreground">

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{background: 'hsl(32 60% 22%)'}}>

        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-white text-xl font-light tracking-widest uppercase">
            Олеся Гудкова
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {[["Обо мне","about"],["Услуги","services"],["Отзывы","reviews"],["FAQ","faq"],["Запись","booking"]].map(([l,id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-body font-light transition-colors">
                {l}
              </button>
            ))}
          </nav>
          <button onClick={() => scrollTo("booking")}
            className="hidden md:block border border-gold text-gold text-xs tracking-widest uppercase px-5 py-2 hover:bg-gold hover:text-white transition-all font-body font-light">
            Записаться
          </button>
          <button className="md:hidden text-white" onClick={() => setMenuOpen(o => !o)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4" style={{background: 'hsl(32 60% 22%)'}}>

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
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{background: 'linear-gradient(135deg, hsl(32 60% 18%) 0%, hsl(38 65% 28%) 50%, hsl(32 60% 18%) 100%)'}}>
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px)"}} />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-6">
              Клинический психолог · Онлайн по всему миру
            </p>
            <h1 className="font-display text-white text-5xl md:text-7xl font-light leading-[1.1] mb-8">
              Меняю<br />
              <span className="italic text-gold">судьбы</span><br />
              людей
            </h1>
            <p className="text-white/60 text-sm leading-relaxed font-body font-light max-w-sm mb-10">
              Проводник энергии света. Работа с более чем 200 энергиями.
              Индивидуальный подход к каждому клиенту.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollTo("booking")}
                className="bg-gold text-white text-xs tracking-widest uppercase px-8 py-4 hover:bg-amber-600 transition-colors font-body font-light">
                Записаться на консультацию
              </button>
              <button onClick={() => scrollTo("about")}
                className="border border-white/30 text-white text-xs tracking-widest uppercase px-8 py-4 hover:border-white/60 transition-colors font-body font-light">
                Узнать больше
              </button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 border border-gold/20" />
              <div className="absolute -inset-8 border border-gold/10" />
              <img src={PHOTO_URL} alt="Олеся Гудкова"
                className="w-72 md:w-96 h-auto object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 divide-x divide-white/10">
            {[["10+","лет практики"],["500+","клиентов"],["200+","энергий"]].map(([num, label]) => (
              <div key={label} className="py-6 px-4 md:px-8 text-center">
                <p className="font-display text-gold text-3xl font-light">{num}</p>
                <p className="text-white/40 text-xs tracking-widest uppercase mt-1 font-body">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4">Обо мне</p>
            <h2 className="font-display text-navy text-4xl md:text-5xl font-light leading-tight mb-2 gold-line">
              Олеся Гудкова
            </h2>
            <div className="mt-8 space-y-4 text-sm text-foreground/70 leading-relaxed font-body font-light">
              <p>
                Клинический психолог с опытом более 10 лет. Работаю с тревогой, депрессией,
                кризисными состояниями, отношениями и личностным ростом.
              </p>
              <p>
                Моя миссия — менять судьбы людей. Я помогаю клиентам выйти из замкнутого круга
                повторяющихся сценариев и обрести внутреннюю свободу.
              </p>
              <p>
                Работаю с более чем 200 энергиями и являюсь проводником энергии света.
                Синтез классической психологии и работы с энергетическими состояниями
                даёт глубокие и устойчивые результаты.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "GraduationCap", title: "Образование", desc: "МГУ, кафедра клинической психологии. Повышение квалификации — Австрия, Израиль." },
              { icon: "Award", title: "Сертификаты", desc: "Международная сертификация по когнитивно-поведенческой терапии, психоанализу." },
              { icon: "Users", title: "Подход", desc: "Интегративный метод. Работа с сознанием, подсознанием и энергетическим телом." },
              { icon: "Globe", title: "Формат", desc: "Онлайн-консультации для клиентов по всему миру." },
            ].map(item => (
              <div key={item.title} className="bg-white p-6 border border-border/50 hover:border-gold/40 transition-colors">
                <Icon name={item.icon} size={20} className="text-gold mb-3" />
                <h4 className="font-display text-navy text-lg font-light mb-2">{item.title}</h4>
                <p className="text-xs text-foreground/60 leading-relaxed font-body font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4">Услуги</p>
              <h2 className="font-display text-navy text-4xl md:text-5xl font-light gold-line">
                Направления работы
              </h2>
            </div>
            <button onClick={() => scrollTo("booking")}
              className="self-start md:self-auto border border-navy text-navy text-xs tracking-widest uppercase px-6 py-3 hover:bg-navy hover:text-white transition-all font-body font-light whitespace-nowrap">
              Записаться
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border">
            {services.map((s, i) => (
              <div key={i} className="bg-white p-8 hover:bg-cream transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <span className="font-display text-gold text-4xl font-light opacity-30 group-hover:opacity-60 transition-opacity">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-navy text-2xl font-light">{s.price}</span>
                </div>
                <h3 className="font-display text-navy text-2xl font-light mb-3">{s.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed font-body font-light mb-4">{s.desc}</p>
                <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase font-body font-light">
                  <Icon name="Clock" size={12} />
                  <span>{s.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24" style={{background: 'hsl(32 60% 22%)'}}>

        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4">Отзывы</p>
            <h2 className="font-display text-white text-4xl md:text-5xl font-light gold-line-center">
              Истории клиентов
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="border border-white/10 p-8 hover:border-gold/30 transition-colors">
                <Icon name="Quote" size={24} className="text-gold/40 mb-6" />
                <p className="text-white/70 text-sm leading-relaxed font-body font-light mb-8 italic">
                  "{r.text}"
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-white font-body font-light text-sm">{r.name}</span>
                  <span className="text-white/30 text-xs font-body">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4">Запись</p>
            <h2 className="font-display text-navy text-4xl md:text-5xl font-light gold-line">
              Онлайн-запись
            </h2>
          </div>

          {submitted ? (
            <div className="max-w-lg border border-gold/40 p-12 text-center">
              <Icon name="CheckCircle" size={40} className="text-gold mx-auto mb-6" />
              <h3 className="font-display text-navy text-3xl font-light mb-3">Заявка принята</h3>
              <p className="text-sm text-foreground/60 font-body font-light leading-relaxed">
                Олеся свяжется с вами в течение 2 часов для подтверждения записи на{" "}
                <strong className="text-navy font-light">
                  {selectedDay} {MONTHS[calMonth]}, {selectedTime}
                </strong>
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="bg-white border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="text-foreground/40 hover:text-navy transition-colors p-1">
                      <Icon name="ChevronLeft" size={18} />
                    </button>
                    <span className="font-display text-navy text-xl font-light">
                      {MONTHS[calMonth]} {calYear}
                    </span>
                    <button onClick={nextMonth} className="text-foreground/40 hover:text-navy transition-colors p-1">
                      <Icon name="ChevronRight" size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-2">
                    {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                      <div key={d} className="text-center text-xs text-foreground/30 tracking-widest uppercase py-2 font-body">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const past = isPast(day);
                      const isWeekend = (firstDay + i) % 7 >= 5;
                      const selected = selectedDay === day;
                      return (
                        <button key={day} disabled={past || isWeekend}
                          onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                          className={`aspect-square text-sm font-body font-light transition-all
                            ${selected ? "bg-navy text-white" : ""}
                            ${!selected && !past && !isWeekend ? "hover:bg-gold/10 text-navy" : ""}
                            ${past || isWeekend ? "text-foreground/20 cursor-not-allowed" : "cursor-pointer"}
                          `}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {selectedDay && (
                    <div className="mt-6 border-t border-border pt-6">
                      <p className="text-xs tracking-widest uppercase text-foreground/40 mb-3 font-body">
                        Выберите время
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {TIMES.map(t => (
                          <button key={t} onClick={() => setSelectedTime(t)}
                            className={`py-2 text-xs font-body font-light tracking-wide border transition-all
                              ${selectedTime === t
                                ? "bg-navy text-white border-navy"
                                : "border-border text-foreground/70 hover:border-gold hover:text-navy"
                              }`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-xs tracking-widest uppercase text-foreground/40 font-body block mb-2">
                    Ваше имя *
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Иван Иванов"
                    className="w-full border border-border bg-white px-4 py-3 text-sm font-body font-light outline-none focus:border-navy transition-colors placeholder:text-foreground/30"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-foreground/40 font-body block mb-2">
                    Телефон *
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    required
                    placeholder="+7 (___) ___-__-__"
                    className="w-full border border-border bg-white px-4 py-3 text-sm font-body font-light outline-none focus:border-navy transition-colors placeholder:text-foreground/30"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-foreground/40 font-body block mb-2">
                    Комментарий
                  </label>
                  <textarea
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    placeholder="Кратко опишите ваш запрос..."
                    className="w-full border border-border bg-white px-4 py-3 text-sm font-body font-light outline-none focus:border-navy transition-colors resize-none placeholder:text-foreground/30"
                  />
                </div>
                {(selectedDay && selectedTime) && (
                  <div className="bg-navy/5 border border-navy/10 px-4 py-3 text-sm font-body font-light text-navy flex items-center gap-2">
                    <Icon name="CalendarCheck" size={14} className="text-gold" />
                    {selectedDay} {MONTHS[calMonth]}, {selectedTime}
                  </div>
                )}
                <button type="submit"
                  disabled={!selectedDay || !selectedTime || !form.name || !form.phone}
                  className="bg-navy text-white text-xs tracking-widest uppercase px-8 py-4 hover:bg-gold transition-colors font-body font-light disabled:opacity-30 disabled:cursor-not-allowed mt-2">
                  Отправить заявку
                </button>
                <p className="text-xs text-foreground/30 font-body font-light">
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                </p>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-4">FAQ</p>
            <h2 className="font-display text-navy text-4xl md:text-5xl font-light gold-line">
              Частые вопросы
            </h2>
          </div>
          <div className="max-w-3xl border-t border-border">
            {faqs.map((item, i) => (
              <div key={i} className="border-b border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-6 flex items-center justify-between text-left group">
                  <span className="font-display text-navy text-lg md:text-xl font-light group-hover:text-gold transition-colors pr-6">
                    {item.q}
                  </span>
                  <Icon name={openFaq === i ? "Minus" : "Plus"} size={16} className="text-gold flex-shrink-0" />
                </button>
                {openFaq === i && (
                  <div className="pb-6 text-sm text-foreground/60 leading-relaxed font-body font-light">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(135deg, hsl(32 60% 18%) 0%, hsl(38 65% 28%) 50%, hsl(32 60% 18%) 100%)'}}>
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px)"}} />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-body font-light mb-6">Первый шаг</p>
          <h2 className="font-display text-white text-4xl md:text-6xl font-light mb-8 leading-tight">
            Готовы к переменам?
          </h2>
          <p className="text-white/50 text-sm font-body font-light max-w-lg mx-auto mb-10 leading-relaxed">
            Запишитесь на первую консультацию. Это безопасно, конфиденциально
            и может стать началом новой главы вашей жизни.
          </p>
          <button onClick={() => scrollTo("booking")}
            className="bg-gold text-white text-xs tracking-widest uppercase px-10 py-5 hover:bg-amber-600 transition-colors font-body font-light">
            Записаться на консультацию
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12" style={{background: 'hsl(30 55% 12%)'}}>

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div>
              <p className="font-display text-white text-xl font-light tracking-widest uppercase mb-3">
                Олеся Гудкова
              </p>
              <p className="text-white/30 text-xs font-body font-light leading-relaxed">
                Клинический психолог<br />
                Проводник энергии света
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-body">Контакты</p>
              <div className="space-y-2">
                <a href="tel:+79991234567" className="flex items-center gap-2 text-white/60 hover:text-gold text-sm font-body font-light transition-colors">
                  <Icon name="Phone" size={14} className="text-gold/60" />
                  +7 (999) 123-45-67
                </a>
                <a href="mailto:hello@olesyagoode.com" className="flex items-center gap-2 text-white/60 hover:text-gold text-sm font-body font-light transition-colors">
                  <Icon name="Mail" size={14} className="text-gold/60" />
                  hello@olesyagoode.com
                </a>
                <div className="flex items-center gap-2 text-white/60 text-sm font-body font-light">
                  <Icon name="Globe" size={14} className="text-gold/60" />
                  По всему миру — онлайн
                </div>
              </div>
            </div>
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-body">Социальные сети</p>
              <div className="flex gap-4">
                {[
                  { icon: "MessageCircle", label: "Telegram" },
                  { icon: "Instagram", label: "Instagram" },
                  { icon: "Youtube", label: "YouTube" },
                ].map(s => (
                  <button key={s.label}
                    className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold hover:text-gold transition-all">
                    <Icon name={s.icon} size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs font-body font-light">
              © 2024 Олеся Гудкова. Все права защищены.
            </p>
            <button onClick={() => scrollTo("booking")}
              className="text-white/20 hover:text-gold text-xs tracking-widest uppercase font-body transition-colors">
              Записаться на консультацию ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
"use client";

import React, {
  useCallback,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CalendarCheck, Table, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import BrandMarquee from "@/components/BrandMarquee";
import Hero from "@/components/Hero";

const PlanTimeline = dynamic(() => import("@/components/PlanTimeline"), {
  ssr: false,
});

const ServicesSection = dynamic(() => import("@/components/ServicesSection"), {
  ssr: false,
});

const accent = "#2254f6";
const danger = "#ef4444";
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cssVars: CSSProperties = {
  ["--accent" as `--${string}`]: accent,
  ["--danger" as `--${string}`]: danger,
};

const staggerVariants: Variants = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.08,
    },
  },
};

const fadeUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 36,
  },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: smoothEase,
    },
  },
};

const heroValues = [
  {
    title: "تیمی با بک‌گراند استارتاپ ، معتقدان به تست و بهبود مداوم",
    icon: (
      // آیکون اول: فلش دایره‌ای (Loop) - شبیه به 🔄
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2.5c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10zm0 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm1 10.5h-4v-2h4v2z" />
        <path d="M11.5 16.5l2-2-2-2" />
      </svg>
    ),
  },
  {
    title: "خالقانی با پیش زمینه‌های هنری ",
    icon: (
      // آیکون دوم: نماد جعبه شعبده بازی (برای خلاقیت) - بدون تغییر
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M5 7l5-5v4m0 0h6v4m-6-4h-6v10h6m4-4l5 5v-4m0 0h-6v-4m6 4h6M8 13h8M5 7h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7z"/>
        <path d="M12 17l-2-2 2-2 2 2-2 2z"/>
        <circle cx="12" cy="12" r="1"/>
      </svg>
    ),
  },
  {
    title: " مریدان کشف بازاری ",
    icon: (
      // آیکون سوم: نماد کشف (ذره‌بین) - بدون تغییر
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
];



const teamMembers = [
  {
    name: "حمید هاشمی",
    role: "برندچی",
    image: "/team/#",
    text: "حمید برندچی مجموعه‌اس خارجکیا میگن برند استراتژیست    . حمید بیش از ۵ سال سابقه‌ی استارتاپی داره ",
  },

  {
    name: "سارا محمدی",
    role: "محتوا‌چی",
    image: "/team/arian.jpg",
    text: "سارا عاشق خلق تولیدمحتوای ویدئوییه ، یه گوشی بهش بدین تا یه اثر سینمایی از اون روز براتون محتوا بسازه . سارا ۴ ساله که عاشقانه محتوا میسازه",
  },

];

const brands = [
  { name: "Balonet", src: "/brands/balonet.svg" },
  { name: "Entekhab", src: "/brands/entekhab.svg" },
  { name: "Magfa", src: "/brands/magfa.png" },
  { name: "Melak", src: "/brands/melak.png" },
];

function MainPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const openForm = useCallback(() => {
    setError(null);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      const form = e.currentTarget;
      const formData = new FormData(form);

      const data = {
        name: String(formData.get("name") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      };

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          setError("ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.");
          return;
        }

        form.reset();
        setFormOpen(false);
        router.push("/success");
      } catch (err) {
        console.error(err);
        setError("مشکلی در ارتباط با سرور پیش آمد. دوباره تلاش کنید.");
      } finally {
        setSubmitting(false);
      }
    },
    [router]
  );

  return (
    <main
      dir="rtl"
      style={cssVars}
      className="relative min-h-screen bg-[#252525] text-white"
    >

      {/* Hero */}

      <Hero
        badge="استودیو کسب‌وکار روماوا"
        titleLine1="این تیم "
        titleLine2="با تو کامل‌تر میشه"
        description= "اگه فرد خلاقی هستی و همیشه دوس داشتی استارتاپ خودت رو راه‌اندازی کنی ، این موقعیت برای توعه"
        image="/team/hero.jpg"
        values={heroValues}
        onConsultClick={() => console.log("consult")}
      />

      {/* RomavaMeaning */}
      <section className="relative overflow-hidden bg-[#fbf8f2] px-6 py-28 md:px-16">
        {/* عدد پس‌زمینه بزرگ */}
        <div className="pointer-events-none absolute left-[-5%] top-10 select-none text-[20rem] font-black text-slate-200/40 md:text-[15rem]">
          ۱
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: smoothEase }}
            className="mb-16"
          >
            
            {/* هدر */}
            <div className="border-b border-slate-300 pb-10">
              <div className="mb-4 flex items-center justify-start gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Job Title
                </span>
              </div>

              <h2 className="text-right text-4xl font-black text-[#1a1835] md:text-6xl">
                موقعیت شغلی{" "}
                <span className="relative inline-block">
                  هم‌بنیان گذاری
                  <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-blue-400/30 md:h-6"></span>
                </span>
              </h2>
            </div>

            {/* پاراگراف (زیر خط) */}
              <p className="mt-12 max-w-4xl text-right text-xl leading-relaxed text-slate-600 md:text-3xl">
                  من در حال ساختن یک استودیو کسب‌وکار به نام Romava هستم.
                
            </p>

          </motion.div>

          {/* بخش محتوای متنی */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            
          <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-right"
            >

              <p className="text-lg leading-loose text-slate-500">
                   ما قراره در استودیو کسب‌و‌کار روماوا ، با خلق محتواهایی مبتنی بر اصول استراتژی محتوا و تکنیک‌های داستان سرایی به کسب‌وکارها کمک کنیم برندشون دیده و ماندگار بشه
                    < br / > 
                  برای ساختن این مسیر، به دنبال یک هم‌بنیان‌گذار بلندپرواز ، خلاق و ماجراجو هستم.
              </p>
          </motion.div>  

          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="relative overflow-hidden bg-[#fbf8f2] px-6 py-28 md:px-16">
        {/* عدد پس‌زمینه */}
        <div className="pointer-events-none absolute left-[-5%] top-10 select-none text-[20rem] font-black text-slate-200/40 md:text-[30rem]">
          ۲
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: smoothEase }}
            className="mb-16"
          >

            {/* Header */}
            <div className="border-b border-slate-300 pb-10">
              <div className="mb-4 flex items-center justify-start gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Qualification
                </span>
              </div>

              <h2 className="text-right text-4xl font-black text-[#1a1835] md:text-6xl">
                <span className="relative inline-block">
                 شرایط 
                  <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-blue-400/30 md:h-6"></span>
                </span>{" "}
                  احراز
              </h2>
            </div>

            {/* پاراگراف (بعد از خط) */}
            <p className="mt-12 max-w-4xl text-right text-xl leading-relaxed text-slate-600 md:text-3xl">
             مناسب این موقعیت هستی اگه : 
            </p>

          </motion.div>

          <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-right"
            >


              <ul className="text-lg leading-loose text-slate-500 list-disc list-inside marker:text-blue-500 space-y-2">
                <li>                  
                  حداقل 2 سال سابقه فعالیت در حداقل یکی از این حوزه ها رو داشتی : هویت بصری / تولید محتوای ویدئویی ( فیلمبرداری ، نور پردازی و ... ) / بازاریابی حضوری یا پروموتینگ
                </li>
                <li>                  
                  روابط عمومی و مهارت ارتباطی بالایی داری.
                </li>
                <li>                  
                  از فضای استارتاپی و ساختن در شرایط چالش‌برانگیز لذت می‌بری.
                </li>
                <li>                  
                  مسئولیت‌پذیر، پیگیر و اهل یادگیری هستی.
                </li>
                <li>                  
                  دوست داری به‌جای اجرای ایده‌های دیگران، در ساختن یک کسب‌وکار شریک باشی.
                </li>
              </ul>
          </motion.div>  

        </div>
      </section>

            {/* TEAM */}
      <section className="relative overflow-hidden bg-[#fbf8f2] px-6 py-28 md:px-16">
        {/* عدد پس‌زمینه */}
        <div className="pointer-events-none absolute left-[-5%] top-10 select-none text-[20rem] font-black text-slate-200/40 md:text-[30rem]">
          ۲
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: smoothEase }}
            className="mb-16"
          >

            {/* Header */}
            <div className="border-b border-slate-300 pb-10">
              <div className="mb-4 flex items-center justify-start gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    About Job
                </span>
              </div>

              <h2 className="text-right text-4xl font-black text-[#1a1835] md:text-6xl">
                <span className="relative inline-block">
                 درباره 
                  <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-blue-400/30 md:h-6"></span>
                </span>{" "}
                  همکاری
              </h2>
            </div>

            {/* پاراگراف (بعد از خط) */}
            <p className="mt-12 max-w-4xl text-right text-xl leading-relaxed text-slate-600 md:text-3xl">
             
            </p>

          </motion.div>

          <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-right"
            >

              <ul className="text-lg leading-loose text-slate-500 list-disc list-inside marker:text-blue-500 space-y-2">
                <li>                  
                  نیازی به سرمایه‌گذاری مالی نیست و کاملاً استارتاپی جلو خواهیم رفت.
                </li>
                <li>                  
                  همکاری به‌صورت شراکت و هم‌بنیان‌گذاری خواهد بود و درآمد شما به صورت سهامی از پروژه‌ها خواهد بود
                </li>
                <li>                  
                  در مراحل اولیه تمرکز ما روی جذب پروژه، ساخت زیرساخت‌های کسب‌وکار و توسعه برند است.
                </li>
                <li>                  
                  هدف ما ساختن یک آژانس سنتی نیست؛ هدف، ایجاد یک استودیوی رشد است که بتواند تاثیر واقعی روی فروش و رشد کسب‌وکارها بگذارد.
                </li>
              </ul>

          </motion.div>  

        </div>
      </section>

      {/* Address */}
      <section className="relative overflow-hidden bg-[#fbf8f2] px-6 py-28 md:px-16">

        {/* عدد پس‌زمینه */}
        <div className="pointer-events-none absolute left-[-5%] top-10 select-none text-[20rem] font-black text-slate-200/40 md:text-[30rem]">
          ۳
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: smoothEase }}
            className="mb-16"
          >

            <div className="border-b border-slate-300 pb-10">

              <div className="mb-4 flex items-center justify-start gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Studio
                </span>
              </div>

              <h2 className="text-right text-4xl font-black text-[#1a1835] md:text-6xl">
                <span className="relative inline-block">
                  استودیو
                  <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-blue-400/30 md:h-6"></span>
                </span>{" "}
                روماوا
              </h2>

            </div>

            <p className="mt-12 max-w-4xl text-right text-xl leading-relaxed text-slate-600 md:text-3xl">
              جایی که استراتژی، خلاقیت و طراحی در کنار هم قرار می‌گیرند تا برندهایی ساخته شوند
              که در ذهن مخاطب ماندگار بمانند.
            </p>

          </motion.div>

          {/* FULL IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: smoothEase }}
            className="relative overflow-hidden rounded-[2.5rem] border border-slate-200"
          >
            <img
              src="/team/team.jpg"
              alt="Romava Team"
              className="h-[320px] w-full object-cover md:h-[560px]"
            />

            <div className="absolute inset-0 bg-black/35" />

            <div className="absolute bottom-8 right-8 md:bottom-14 md:right-14">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-6 py-5 backdrop-blur-xl text-right">
                <p className="text-sm tracking-[0.2em] text-white/40">
                  ROMAVA STUDIO
                </p>

                <h3 className="mt-3 text-2xl font-light md:text-4xl text-white">
                  ساخت برندهایی
                  <br />
                  که فراموش نمی‌شوند
                </h3>
              </div>
            </div>
          </motion.div>

          {/* ADDRESS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: smoothEase }}
            className="mt-8 rounded-[2rem] border border-slate-200 bg-white/60 p-8 md:p-10"
          >
            <div className="grid gap-10 md:grid-cols-2">

              <div className="text-right">
                <p className="mb-4 text-[11px] tracking-[0.25em] text-slate-400">
                  LOCATION
                </p>

                <h3 className="text-3xl font-light text-[#1a1835]">
                  استودیو کسب‌وکار روماوا
                </h3>

                <p className="mt-6 max-w-xl leading-8 text-slate-600">
                  اصفهان، فدک مال
                  <br />
                  برای هماهنگی جلسات حضوری، قبل از مراجعه با کلیک روی
                  دکمه «رزرو وقت مشاوره»، زمان جلسه خود را تنظیم کنید.
                </p>
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-6">

                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Business Studio
                    </span>

                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>

                  <div className="space-y-4 text-slate-600">

                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span>آدرس</span>
                      <span>ایران، اصفهان، فدک مال</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span>ایمیل</span>
                      <span>hello@romava.ir</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>اینستاگرام</span>
                      <span>@romava.studio</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* BRANDS */}
      <section className="relative overflow-hidden border-t border-white/5 py-28">
        <div className="absolute inset-0" />

        <div className="relative mx-auto max-w-[1800px]">
          <div className="mb-16 text-center">
            <p className="text-[11px] tracking-[0.35em] text-white/25">
              برندهایی که همراشون بودیم
            </p>
          </div>

          <BrandMarquee
            speed={16}
            className="px-4 md:px-8"
            itemClassName="h-[92px] min-w-[180px] md:h-[110px] md:min-w-[220px]"
            items={brands}
          />
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm"
            onClick={closeForm}
          >
            <motion.div
              initial={{
                y: 80,
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                y: 40,
                opacity: 0,
                scale: 0.96,
              }}
              transition={{
                duration: 0.45,
                ease: smoothEase,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0c0c0c]/95 p-8 backdrop-blur-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-light">رزرو جلسه</h3>

                <button
                  onClick={closeForm}
                  className="text-white/45 transition-colors hover:text-white"
                  type="button"
                  aria-label="بستن"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />

                <input
                  name="phone"
                  type="tel"
                  placeholder="شماره تماس"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />

                <textarea
                  name="message"
                  placeholder="توضیح کوتاه درباره پروژه"
                  rows={4}
                  required
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />

                {error && (
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[color:var(--accent)] py-3 font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {submitting ? "در حال ارسال..." : "ارسال درخواست"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 pb-16 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,84,246,0.08),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-8 md:px-16">
          <div className="grid gap-14 md:grid-cols-4">
            <div>
              <h3 className="text-xl font-light tracking-wide text-white/80">
                Romava
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/40">
                استودیو رشد و برندینگ
                <br />
                سیستم‌سازی برای رشد واقعی کسب‌وکارها
              </p>
            </div>

            <div>
              <p className="text-[11px] tracking-[0.3em] text-white/30">
                SERVICES
              </p>

              <ul className="mt-5 space-y-3 text-sm text-white/50">
                <li>
                  <a
                    href="/advertising"
                    className="transition-colors hover:text-white"
                  >
                    تبلیغات اصولی
                  </a>
                </li>
                <li>
                  <a
                    href="/contentCreation"
                    className="transition-colors hover:text-white"
                  >
                    تولید محتوای هدفمند
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="transition-colors hover:text-white"
                  >
                    طراحی سایت
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="transition-colors hover:text-white"
                  >
                    استراتژی برند
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] tracking-[0.3em] text-white/30">
                COMPANY
              </p>

              <ul className="mt-5 space-y-3 text-sm text-white/50">
                <li>
                  <a href="/about" className="transition-colors hover:text-white">
                    درباره ما
                  </a>
                </li>
                <li>
                  <a href="#plan" className="transition-colors hover:text-white">
                    مسیر همکاری
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+989374427894"
                    className="transition-colors hover:text-white"
                  >
                    تماس
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <p className="text-sm text-white/60">
                آماده شروع رشد برندت هستی؟
              </p>

              <button
                type="button"
                onClick={openForm}
                className="mt-6 block w-full rounded-full bg-[color:var(--accent)] px-5 py-3 text-center text-sm text-white transition-transform hover:scale-[1.03]"
              >
                رزرو جلسه
              </button>

              <p className="mt-4 text-[11px] text-white/30">
                پاسخ‌گویی در کمتر از ۲۴ ساعت
              </p>
            </div>
          </div>

          <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="text-[11px] tracking-[0.2em] text-white/30">
              © {new Date().getFullYear()} ROMAVA. ALL RIGHTS RESERVED.
            </p>

            <div className="flex gap-8 text-[11px] text-white/40">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                INSTAGRAM
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                LINKEDIN
              </a>

              <a
                href="mailto:hello@romava.com"
                className="transition-colors hover:text-white"
              >
                EMAIL
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default MainPage;
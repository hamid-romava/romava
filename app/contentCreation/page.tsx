"use client";

import React, { useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CalendarCheck, Table, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

const accent = "#00b893";
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cssVars: CSSProperties = {
  ["--accent" as `--${string}`]: accent,
};

const staggerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: smoothEase,
    },
  },
};

const services = [
  {
    title: "ثبت تبلیغ در سریع‌ترین زمان",
    text: "متناسب با هویت برند شما و تارگت فصلی، بهترین نوع محتوا را با توجه به بازار و سیکل انتخاب می‌کنیم تا تبلیغ به‌موقع ثبت و تایید شود.",
  },
  {
    title: "کپی رایتینگ اصولی",
    text: "ساخت صفحه و مسیر ارائه‌ای که مخاطب را تا اقدام نهایی همراه کند و نرخ تبدیل را بالا ببرد.",
  },
  {
    title: "اجرای بهینه",
    text: "بدون نیاز به اجاره یا خرید تجهیزات گران، متناسب با پروژه شما تجهیزات لازم را فراهم می‌کنیم.",
  },
] as const;

const steps = [
  {
    icon: <CalendarCheck size={28} strokeWidth={1.5} />,
    title: "۱. رزرو وقت مشاوره",
    text: "فهم دقیق جایگاه، مسئله و مزیت اصلی برند.",
  },
  {
    icon: <Table size={28} strokeWidth={1.5} />,
    title: "۲. جلسه‌ی هماهنگی",
    text: "طراحی پیام و ساختار ارائه بر اساس StoryBrand.",
  },
  {
    icon: <Rocket size={28} strokeWidth={1.5} />,
    title: "۳. شروع سفر تبلیغات اصولی",
    text: "پیاده‌سازی نهایی و آماده‌سازی برای جذب بهتر مشتری.",
  },
] as const;

const problems = [
  "ثبت تبلیغ و تایید محتوای تبلیغ معمولاً فرایند زمان‌بریه.",
  "نرخ تبدیل بازدیدکننده به دنبال‌کننده به دلیل استفاده نکردن از کپی رایتینگ اصولی خیلی پایینه.",
  "اجرای غلط تبلیغ معمولاً باعث دور ریخته شدن هزینه‌ی تبلیغ میشه.",
] as const;

function AdvertisingPage() {
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({} as { error?: string }));

      if (res.ok) {
        form.reset();
        setFormOpen(false);
        router.push("/success");
        return;
      }

      console.error("ارسال ناموفق:", result);
      alert("خطا در ارسال: " + (result.error || "لطفا دوباره تلاش کنید."));
    } catch (err) {
      console.error("خطای ارتباط:", err);
      alert("خطا در ارتباط با سرور، لطفا بعدا تلاش کنید.");
    }
  };

  return (
    <main dir="rtl" style={cssVars} className="min-h-screen bg-[#050505] text-white">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center px-8 md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(67,133,207,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(67,133,207,0.10),transparent_35%)]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <motion.div
            variants={staggerVariants}
            initial="initial"
            animate="animate"
            className="grid items-center gap-16 lg:grid-cols-2"
          >
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                <span className="h-2 w-2 rounded-full bg-[color:var(--accent)] shadow-[0_0_20px_rgba(67,133,207,0.8)]" />
                استودیو کسب‌و‌کار روماوا
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2.2, ease: smoothEase }}
                className="text-3xl font-light leading-[1.1] tracking-tight text-white/30 md:text-4xl lg:text-5xl"
              >
                کسب‌وکاری که
                <br />
                <span className="text-[color:var(--accent)]">تبلیغات اصولی </span>
                می‌کنه
                <br />
                <span className="text-white/70"> دیده میشه</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.8, ease: smoothEase, delay: 0.15 }}
                className="max-w-xl text-base leading-8 text-white/55 md:text-lg"
              >
                طراحی پلن کسب‌وکار شما طوری که فرایند معرفی، جذب و تبدیل مخاطب به
                مشتری، فروش و در نهایت برند شدن شما در سریع‌ترین و بهینه‌ترین
                حالت اتفاق بیفته.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col gap-4 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="group inline-flex items-center justify-center gap-4 rounded-full bg-[color:var(--accent)] px-8 py-4 font-medium text-white shadow-[0_0_40px_rgba(67,133,207,0.25)] transition-transform hover:scale-[1.02]"
                >
                  رزرو وقت مشاوره
                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    ←
                  </span>
                </button>

                <a
                  href="#problem"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-white/70 transition-colors hover:border-white/20 hover:text-white"
                >
                  اطلاعات بیشتر
                </a>
              </motion.div>
            </motion.div>

            {/* HERO VISUAL */}
            <motion.div variants={itemVariants} className="relative flex justify-center lg:justify-end">
              <div className="relative aspect-square w-full max-w-[560px]">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(67,133,207,0.20),transparent_60%)] blur-2xl" />
                <div className="absolute inset-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1.8, ease: smoothEase }}
                  className="absolute bottom-12 left-12 right-12 top-12 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#0b0b0b]/80 p-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/60">Smart Content</div>
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                  </div>

                  <img
                    src="/baleAdv.png"
                    alt="Advertising preview"
                    className="w-full flex-1 object-cover"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    {["جلب توجه", "کپی رایتینگ", "نرخ تبدیل"].map((label) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                          {label}
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: smoothEase }}
            className="space-y-12"
          >
            <h2 className="mx-auto text-center text-3xl font-light leading-[1.2] tracking-tight md:text-5xl lg:text-6xl">
              تبلیغات در بله، با بازدهی پایین و زمان‌بره
              <br />
              <span className="text-xl text-white/30 md:text-2xl lg:text-3xl">
                اگه تبلیغاتت رو اصولی اجرا نکنی
              </span>
            </h2>

            <ul className="grid grid-cols-1 justify-items-center gap-10 text-lg leading-8 text-white/80 md:grid-cols-3">
              {problems.map((problem) => (
                <li key={problem} className="flex max-w-[260px] items-start gap-4">
                  <span className="mt-1 h-3 w-3 rounded-full bg-[color:var(--accent)]" />
                  {problem}
                </li>
              ))}
            </ul>

            <p className="mx-auto max-w-3xl text-center text-lg leading-8 text-white/70">
              این وضعیت معمولاً به شب‌های بی‌خوابی و حس دائمی سردرگمی در رشد
              کسب‌وکار ختم می‌شود. ما نمی‌خواهیم برندت چنین تجربه‌ای داشته باشد.
              استودیو کسب‌وکار روماوا به کسب‌وکارها کمک می‌کند مسیر روشن و
              اصولی برای کپی رایتینگ و اجرای تبلیغ داشته باشند تا در نهایت با
              بازدهی قابل قبول، تبدیل مخاطب انجام شود.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-white/35">
                خدمات ما
              </p>
              <h2 className="text-3xl font-light md:text-5xl">
                یک فرایند روشن برای تبلیغ برندت
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 1.4,
                  delay: index * 0.18,
                  ease: smoothEase,
                }}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/[0.07]"
              >
                <div
                  className="mb-6 h-12 w-12 rounded-2xl"
                  style={{ backgroundColor: accent }}
                />
                <h3 className="mb-4 text-2xl font-medium">{card.title}</h3>
                <p className="leading-8 text-white/55">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN */}
      <section id="plan" className="py-20">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: smoothEase }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl md:p-12"
          >
            <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-white/35">
              نقشه راه
            </p>

            <h2 className="mb-10 text-3xl font-light md:text-5xl">
              ۳ قدم تا شروع سفر
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="flex flex-col items-start rounded-2xl border border-white/10 bg-[#050505] p-6"
                >
                  <div className="mb-4 text-[color:var(--accent)]">{step.icon}</div>
                  <h3 className="mb-3 text-2xl font-medium">{step.title}</h3>
                  <p className="leading-8 text-white/60">{step.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-12">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.6, ease: smoothEase }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center md:p-16"
          >
            <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-white/35">
              آماده‌ای؟
            </p>
            <h2 className="mb-6 text-3xl font-light md:text-5xl">
              برندت لایق شروع این سفره
            </h2>
            <p className="mx-auto mb-10 max-w-2xl leading-8 text-white/55">
              برای شروع، فقط کافی است یک جلسه کوتاه رزرو کنی تا مسیر مناسب
              برندت را بررسی کنیم.
            </p>

            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-10 py-4 font-medium text-white shadow-[0_0_40px_rgba(67,133,207,0.25)] transition-transform hover:scale-[1.02]"
            >
              رزرو وقت مشاوره
            </button>
          </motion.div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: smoothEase }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: smoothEase }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0c0c0c] p-8 shadow-2xl md:p-10"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-light">رزرو جلسه</h3>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-white/45 transition-colors hover:text-white"
                  type="button"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="شماره تماس"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />
                <textarea
                  name="message"
                  placeholder="توضیح کوتاه درباره برند یا پروژه"
                  rows={4}
                  required
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[color:var(--accent)] py-3 font-medium text-white transition-opacity hover:opacity-95"
                >
                  ارسال درخواست
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default AdvertisingPage;

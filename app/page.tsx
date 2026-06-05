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
    title: "افزایش بهره‌وری تبلیغات",
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 17l6-6 4 4 7-7" />
        <path d="M14 8h6v6" />
      </svg>
    ),
  },
  {
    title: "فروش بیشتر با محتوای هدفمند",
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 10h8" />
        <path d="M8 14h5" />
        <path d="M5 4h14v16l-3-2-4 2-4-2-3 2V4z" />
      </svg>
    ),
  },
  {
    title: "سایت اختصاصی در کمترین زمان",
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 20h8" />
        <path d="M12 18v2" />
      </svg>
    ),
  },
];


const problems = [
  "هزینه‌های زیاد بابت تبلیغات می‌کنی ولی تعداد خیلی کمی جذب می‌شن",
  "محتوا تولید می‌کنی، اما به فروش ختم نمی‌شه",
  "سایتت فرایندی برای تبدیل بازدیدکننده به مشتری نداره",
] as const;

const services = [
  {
    title: "تبلیغات اصولی",
    text: "توجه رو با رعایت ۳ اصل تبلیغات اصولی به سمت برندت جذب می‌کنیم.",
    image: "/services/ad.jpg",
    href: "/advertising",
    cta: "ایجاد تبلیغات اصولی",
  },
  {
    title: "محتوای هدفمند",
    text: "با تکنیک‌های استوری‌تلینگ محتواهایی تولید می‌کنیم که کار کنن؛ محتوایی کار می‌کنه که بفروشه.",
    image: "/services/content.jpg",
    href: "/contentCreation",
    cta: "ساخت محتوای هدفمند",
  },
  {
    title: "سایت بهینه",
    text: "سایتی که صرفاً در زیبایی خلاصه نمی‌شه و با اصول CRO بازدیدکننده رو به مشتری وفادار تبدیل می‌کنه.",
    image: "/services/web.jpg",
    href: "/services/performance-ads",
    cta: "ساخت سایت بهینه",
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

    <Hero
      badge="استودیو کسب‌وکار روماوا"
      titleLine1="بـرنـــدت لایق"
      titleLine2="لیدر بازار شدنه"
      description="ما در استودیو کسب‌وکار روماوا، محتوای خلاقانه و استراتژیک برات تولید می‌کنیم تا در ذهن‌ها برند و ماندگار بشی."
      image="/hero-bg.jpg"
      values={heroValues}
      onConsultClick={() => console.log("consult")}
    />


      {/* PROBLEM */}
      <section
        id="problem"
        className="relative overflow-hidden border-t border-slate-200/60 bg-[#f6f7ff] py-28"
      >
        {/* soft background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[12%] -top-[15%] h-[520px] w-[520px] rounded-full bg-violet-300/35 blur-[110px]" />
          <div className="absolute -right-[10%] top-[10%] h-[520px] w-[520px] rounded-full bg-sky-300/30 blur-[110px]" />
          <div className="absolute left-1/2 top-[70%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-200/25 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-8 md:px-16">
          <div className="grid items-start gap-10 md:grid-cols-[1fr_2fr]">
            {/* LEFT: image (1/3) */}
            <div className="order-2 md:order-1">
              <div className="relative mx-auto w-full max-w-sm md:max-w-none">
                <img
                  src="/problem.png"
                  alt="problem"
                  className="w-full select-none object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* RIGHT: heading + stacked cards (2/3) */}
            <motion.div
              variants={staggerVariants}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.2 }}
              className="order-1 space-y-10 md:order-2"
            >
              <motion.h2
                variants={fadeUpVariants}
                className="text-right text-3xl font-extralight leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-5xl"
              >
                بدون پلن مشخص
                <br />
                <span className="text-slate-500">
                  وقت، انرژی و بودجه‌ات تموم می‌شه
                </span>
              </motion.h2>

              {/* cards stacked vertically */}
              <div className="space-y-6">
                {problems.map((problem) => (
                  <motion.div
                    key={problem}
                    variants={fadeUpVariants}
                    // حذف whileHover، نگه داشتن transition و اضافه کردن hover:-translate-y-6
                    className="group relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/70 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-transform duration-300 ease-out hover:-translate-y-6"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10">
                      {/* dot + text inline */}
                      <div className="flex items-start gap-4">
                        <span className="mt-[0.45rem] h-5 w-5 shrink-0 rounded-full bg-rose-500" />
                        <p className="text-sm leading-7 text-slate-700 md:text-lg md:leading-8">
                          {problem}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <ServicesSection
        services={services}
        heading={"خدماتی برای\nبرندینگ هدفمند"}
        eyebrow="SERVICES"
        vhPerItem={70}
      />

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

      {/* Plan */}
      <section id="plan" className="relative bg-white py-32 text-[#2d2a4d]">
        <div className="mx-auto max-w-7xl px-6 md:px-16">
          <div className="mb-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold leading-tight tracking-tight md:text-5xl"
            >
              برند شدن لیاقتته،{" "}
              <span className="text-slate-300">
                فقط کافیه این مسیر رو شروع کنی
              </span>
            </motion.h2>
          </div>

          <PlanTimeline />
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-[#2254f6]" />

        <div className="relative mx-auto max-w-7xl px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              ease: smoothEase,
            }}
            className="relative overflow-hidden rounded-[1.5rem] p-10 text-center backdrop-blur-2xl md:p-16"
          >
            <motion.div
              animate={{
                opacity: [0.2, 0.45, 0.2],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className="absolute inset-0 "
            />

            <div className="relative z-10">
              <p className="mb-5 text-[11px] tracking-[0.3em] text-white/30">
                READY?
              </p>

              <h2 className="mb-6 text-3xl font-light md:text-5xl">
                با شروع
                <br />
                یک قدم فاصله داری
              </h2>

              <p className="mx-auto mb-10 max-w-2xl text-lg leading-9 text-white/55">
                برای شروع فقط کافیه یک جلسه کوتاه رزرو کنی تا مسیر مناسب رشد
                برندت را بررسی کنیم.
              </p>

              <button
                type="button"
                onClick={openForm}
                className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-black shadow-[0_0_40px_rgba(67,133,207,0.25)] transition-transform hover:scale-[1.03]"
              >
                رزرو وقت مشاوره
              </button>
            </div>
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
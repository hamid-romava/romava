"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const smoothEase: [number, number, number, number] = [0.23, 1, 0.32, 1];



  useEffect(() => {
  const openModal = () => setFormOpen(true);

  window.addEventListener("open-consult-modal", openModal);

  return () => {
    window.removeEventListener("open-consult-modal", openModal);
  };
}, []);

  const accent = "#2254f6";

  const framerEase: [number, number, number, number] = [0.23, 1, 0.32, 1];

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: framerEase,
      },
    },
  };

const openForm = () => {
  setError(null);
  setFormOpen(true);
};

const closeForm = () => {
  setFormOpen(false);
};

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    window.location.href = "/success";
  } catch {
    setError("مشکلی در ارتباط با سرور پیش آمد.");
  } finally {
    setSubmitting(false);
  }
};



  return (
    <html lang="fa" dir="rtl">
      <body
        style={{ "--accent": accent } as React.CSSProperties}
        className="bg-[#050505] text-white antialiased overflow-x-hidden"
      >

        

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0J0PJQKYNZ"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0J0PJQKYNZ');
          `}
        </Script>

        <Analytics />

        {/* GLOBAL SOFT GRADIENT */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-250px] right-[-150px] h-[700px] w-[700px] rounded-full bg-[#2254f6]/15 blur-[140px]" />
        </div>

        {/* NAVBAR */}
        <nav className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 rounded-full border border-slate-200/80 bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* RIGHT SIDE - Logo + Menu */}
            <div className="flex items-center gap-8">
              <Link href="/" className="shrink-0">
                <Image
                  src="/romava-logo.png"
                  alt="Romava"
                  width={110}
                  height={40}
                  className="object-contain"
                  priority
                />
              </Link>

              {/* Desktop menu */}
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
                <Link
                  href="/contentCreation"
                  className="transition-colors hover:text-[color:var(--accent)]"
                >
                  تولید محتوا در اینستا
                </Link>
                                <Link
                  href="/#"
                  className="transition-colors hover:text-[color:var(--accent)]"
                >
                 طراحی سایت 
                </Link>

              </div>
            </div>

            {/* LEFT SIDE - CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={openForm}
                className="hidden sm:inline-flex h-12 items-center gap-3 rounded-full bg-[color:var(--accent)] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                رزرو وقت مشاوره

                {/* icon on the LEFT (in RTL) */}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  ↖
                </span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                aria-label="باز کردن منو"
              >
                ☰
              </button>
            </div>
          </div>
        </nav>


        {/* MOBILE MENU */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 bg-[#311b92] z-[60] flex flex-col p-10 gap-8 text-lg"
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="self-end text-2xl text-white"
              >
                ✕
              </button>


              <Link
                href="/contentCreation"
                onClick={() => setMenuOpen(false)}
                className="text-white hover:text-white/70 transition"
              >
                تولید محتوا در اینستا
              </Link>

              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="text-white hover:text-white/70 transition"
              >
                درباره ما
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  openForm();
                }}
                className="mt-10 px-6 py-4 rounded-xl bg-[color:var(--accent)] text-white"
              >
                رزرو وقت مشاوره
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAGE CONTENT */}
        <main className="relative z-10">
          {children}
        </main>

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
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)] text-white placeholder:text-white/40"
                  />

                  <input
                    name="phone"
                    type="tel"
                    placeholder="شماره تماس"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)] text-white placeholder:text-white/40"
                  />

                  <textarea
                    name="message"
                    placeholder="توضیح کوتاه درباره پروژه"
                    rows={4}
                    required
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)] text-white placeholder:text-white/40"
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
      </body>
    </html>
  );
}
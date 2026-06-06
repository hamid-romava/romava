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

  const openForm = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

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

      if (res.ok) {
        e.currentTarget.reset();
        closeForm();
      } else {
        alert("خطا در ارسال فرم");
      }
    } catch {
      alert("خطا در ارتباط با سرور");
    }
  };


  return (
    <html lang="fa" dir="rtl">
      <body
        style={{ "--accent": accent } as React.CSSProperties}
        className="bg-[#050505] text-white antialiased overflow-x-hidden"
      >

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
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
              initial="initial"
              animate="animate"
              exit="initial"
              variants={containerVariants}
              onClick={closeForm}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-6"
            >
              <motion.div
                variants={fadeInUp}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] p-10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[color:var(--accent)] opacity-20" />

                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-light tracking-tight">
                    شروع گفتگو
                  </h3>

                  <button
                    onClick={closeForm}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  <input
                    name="name"
                    type="text"
                    placeholder="نام شما"
                    required
                    className="w-full rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 outline-none focus:border-[color:var(--accent)] transition-all font-light text-white"
                  />

                  <input
                    name="phone"
                    type="tel"
                    placeholder="شماره تماس"
                    required
                    className="w-full rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 outline-none focus:border-[color:var(--accent)] transition-all font-light text-white"
                  />

                  <textarea
                    name="message"
                    placeholder="چه خدماتی مد نظر شماست؟"
                    rows={3}
                    required
                    className="w-full rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 outline-none focus:border-[color:var(--accent)] transition-all font-light resize-none text-white"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[color:var(--accent)] text-white py-4 font-medium hover:brightness-110 transition-all shadow-lg shadow-[#2254f6]/20"
                  >
                    ارسال درخواست
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
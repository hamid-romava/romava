"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

type ServiceCard = {
  title: string;
  text: string;
  image: string;
  href: string;
  cta?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ServicesSticky({
  services,
  heading = "خدماتی برای\nبرندینگ هدفمند",
  eyebrow = "SERVICES",
  vhPerItem = 80, 
}: {
  services: ServiceCard[];
  heading?: string;
  eyebrow?: string;
  vhPerItem?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => services ?? [], [services]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // افکت محو شدن تیتر اصلی هنگام شروع اسکرول لیست
  // در ۲۰٪ اول اسکرول، تیتر محو می‌شود تا فضا برای خدمات باز شود
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.15], [0, -20]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      if (!items.length) return;
      const raw = p * (items.length - 1);
      const idx = clamp(Math.round(raw), 0, items.length - 1);
      setActiveIndex(idx);
    });
    return () => unsub();
  }, [scrollYProgress, items.length]);

  if (!items.length) return null;

  const active = items[activeIndex];

  return (
    <section ref={ref} className="relative border-t border-white/5">
      {/* Background Setup */}
      <div className="absolute inset-0 bg-[#311b92]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_55%)]" />

      <div className="relative" style={{ height: `${items.length * vhPerItem}vh` }}>
        {/* Progress Line */}
        <motion.div
          className="absolute left-0 top-0 z-50 h-[3px] bg-white/70"
          style={{ width: scrollYProgress }}
        />

        <div className="sticky top-0 z-10 flex h-screen flex-col items-center justify-center overflow-hidden">
          
          {/* Wave Background */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 -translate-y-1/2">
            <svg viewBox="0 0 1440 220" className="h-[180px] w-full opacity-20" preserveAspectRatio="none">
              <path d="M0,120 C240,70 480,170 720,120 C960,70 1200,170 1440,120" fill="none" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-8 md:px-16">
            
            {/* Main Section Heading - محو شونده و ثابت */}
            <motion.div 
              style={{ opacity: headerOpacity, y: headerY }}
              className="absolute left-0 right-0 top-[-10vh] text-center"
            >
              <p className="mb-4 text-[11px] tracking-[0.3em] text-white/40 uppercase">{eyebrow}</p>
              <h2 className="mx-auto max-w-3xl whitespace-pre-line text-3xl font-extralight tracking-[-0.03em] text-white md:text-5xl leading-[1.1]">
                {heading}
              </h2>
            </motion.div>

            <div className="grid items-center gap-12 lg:grid-cols-2 pt-20">
              {/* Left: Services Titles */}
              <div className="relative">
                <div className="space-y-6 md:space-y-8">
                  {items.map((s, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <div key={`${s.title}-${i}`} className="relative">
                        <motion.div
                          animate={{
                            opacity: isActive ? 1 : 0.15,
                            x: isActive ? 10 : 0,
                          }}
                          transition={{ duration: 0.4 }}
                          className="flex items-baseline gap-4"
                        >
                          <span className="hidden text-xs font-mono text-white/30 md:inline">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="cursor-default select-none text-[24px] font-light tracking-tight text-white md:text-[56px] lg:text-[48px]">
                            {s.title}
                          </h3>
                        </motion.div>

                        <AnimatePresence mode="wait">
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: 5 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -5 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 max-w-md border-r border-white/10 pr-6">
                                <p className="text-sm leading-relaxed text-white/60 md:text-base">
                                  {s.text}
                                </p>
                                <a href={s.href} className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
                                  <span>{s.cta ?? "مشاهده جزئیات"}</span>
                                  <span className="transition-transform group-hover:translate-x-1">→</span>
                                </a>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Floating Perspective Card */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[520px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                      animate={{ opacity: 1, scale: 1, rotateY: -10, rotateX: 5 }}
                      exit={{ opacity: 0, scale: 1.1, rotateY: 20 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/20 bg-white/5 shadow-2xl backdrop-blur-xl"
                    >
                      <img src={active.image} alt={active.title} className="h-full w-full object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Scroll Indicator Circle */}
                  <div className="pointer-events-none absolute -bottom-10 -left-10 hidden h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md md:flex">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/80">SCROLL</span>
                  </div>

                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

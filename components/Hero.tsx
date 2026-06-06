"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ValueItem = {
  title: string;
  icon: React.ReactNode;
};

type HeroProps = {
  badge?: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  image: string;
  values: ValueItem[];
  onConsultClick: () => void;
};

function ValueCard({ title, icon }: ValueItem) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div className="whitespace-nowrap text-sm font-semibold text-slate-600 lg:text-base">
        {title}
      </div>
    </div>
  );
}

function ValueMarquee({
  items,
  speed = 24,
}: {
  items: ValueItem[];
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [setWidth, setSetWidth] = useState(0);
  const xRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      if (!setRef.current) return;
      setSetWidth(setRef.current.scrollWidth);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (setRef.current) resizeObserver.observe(setRef.current);

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useAnimationFrame((_, delta) => {
    if (!trackRef.current || !setWidth) return;

    xRef.current += (speed * delta) / 1000;
    if (xRef.current >= setWidth) xRef.current -= setWidth;

    trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
  });

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={trackRef}
        className="flex w-max gap-3 will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <div ref={setRef} className="flex w-max gap-3">
          {items.map((item, index) => (
            <ValueCard
              key={`first-${index}`}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="flex w-max gap-3" aria-hidden="true">
          {items.map((item, index) => (
            <ValueCard
              key={`second-${index}`}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero({
  badge = "استودیو کسب‌وکار",
  titleLine1,
  titleLine2,
  description,
  image,
  values,
  onConsultClick,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#fbf8f2] md:min-h-screen md:bg-[#fdfaf4]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -right-[12%] top-[8%] h-[520px] w-[520px] rounded-full bg-[#f3dfb2]/45 blur-[120px]" />
        <div className="absolute right-[8%] bottom-[6%] h-[320px] w-[320px] rounded-full bg-[#f8ecd2]/55 blur-[110px]" />
        <div className="absolute -left-[8%] top-[12%] h-[420px] w-[420px] rounded-full bg-[#f7f1e3]/70 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-[calc(100%-2rem)] max-w-7xl pt-20 md:pt-28">
        <div className="relative md:grid md:grid-cols-2 md:items-center md:gap-10">

          {/* Mobile Image */}
          <div className="relative md:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: smoothEase }}
              className="relative h-[330px] w-full overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <img src={image} alt="Hero" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="relative z-10 -mt-24 px-2 md:order-1 md:mt-0 md:px-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: smoothEase }}
              className="rounded-[2.5rem] border border-white/60 bg-white/92 p-6 shadow-2xl backdrop-blur-2xl sm:p-7 md:border-none md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
            >
              <div className="w-full max-w-[56ch]">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 md:bg-slate-200/50">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 md:text-slate-500">
                    {badge}
                  </span>
                </div>

                <h1 className="text-[2rem] font-black leading-[1.08] tracking-tight text-[#1a1835] sm:text-[2.5rem] md:text-[4.2rem] lg:text-[5rem] md:leading-[1.05]">
                  <span className="block whitespace-nowrap">{titleLine1}</span>
                  <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {titleLine2}
                  </span>
                </h1>

                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600 md:mt-8 md:text-lg lg:text-xl">
                  {description}
                </p>

                <div className="mt-7 md:mt-10">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <button
                      onClick={() => window.dispatchEvent(new Event("open-consult-modal"))}
                      className="group flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#2254f6] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      رزرو وقت مشاوره
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                        ↖
                      </span>
                    </button>

                    <a
                      href="#problem"
                      className="flex h-12 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-[#2d2a4d] transition-colors hover:bg-slate-50"
                    >
                      اطلاعات بیشتر
                    </a>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Desktop Image */}
          <div className="relative hidden md:order-2 md:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: smoothEase }}
              className="relative h-[560px] w-full overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <img src={image} alt="Hero" className="h-full w-full object-cover" />
            </motion.div>
          </div>
        </div>

        {/* Value Stack */}
        <div className="mt-6 relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] border-t border-[#e8decb]/70 md:static md:mt-12 md:mx-0 md:w-auto md:rounded-[2rem] md:border md:border-[#e8decb]/70">

          {/* Desktop */}
          <div className="hidden md:flex">
            {values.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-center px-8 py-6 md:flex-1 md:border-l md:border-slate-200/50 last:border-l-0"
              >
                <ValueCard title={item.title} icon={item.icon} />
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="py-4 md:hidden">
            <div className="px-4">
              <ValueMarquee items={values} speed={20} />
            </div>
          </div>
        </div>
      </div>


    </section>




  );
}

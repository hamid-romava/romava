"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";

type Step = { title: string; text: string; badge?: string };

const STEPS: Step[] = [
  {
    title: "قدم اول ، رزرو جلسه",
    badge: "Call",
    text: "در قدم اول با کلیک بر روی دکمه 'رزرو وقت مشاوره' اطلاعاتت رو برامون ارسال کن ، در سریع ترین زمان ممکن باهات تماس می‌گیریم",
  },
  {
    title: "قدم دوم ، آشنایی و شروع همکاری",
    badge: "Meeting",
    text: "بعد از تماس و تمایل دو طرفه ، جلسه‌ای برای بررسی بیشتر برندت با هم خواهیم داشت و هماهنگی‌ها برای ساخت اولین محتوا رو با هم انجام می‌دیم . تو این مرحله اگه به توافق برسیم ابتدا ویدئو تولید میشه و صرفا اگه به نتیجه‌ای که توافق کرده بودیم رسید ، هزینه پرداخت می‌کنی ! " , 
  },
  {
    title: "قدم سوم ، لذت ادامه مسیر",
    badge: "Refinement",
    text: "چرخه کشف / خلق / بهینه‌سازی با فیدبک از مخاطب ادامه پیدا می‌کند. کیفیت خروجی‌ها مداما بهتر می‌شه و روند بدون توقف جلو می‌رود.",
  },
  {
    title: "طعم شیرین تکرار ",
    badge: "Always on",
    text: "این چرخه‌ی لذت بخش رو با هم تا رسیدن به هدف‌های بزرگ تر تکرار می‌کنیم  ",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function PlanTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const steps = useMemo(() => STEPS, []);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      // محاسبه ایندکس بر اساس درصد اسکرول
      // عدد 0.999 برای جلوگیری از پرش در انتهای اسکرول است
      const index = Math.min(
        Math.floor(p * steps.length),
        steps.length - 1
      );
      setActiveStep(index);
    });
    return () => unsub();
  }, [scrollYProgress, steps.length]);

  return (
    <div ref={wrapRef} className="relative">
      {/* 
          ارتفاع کل کانتینر اسکرول: 
          استفاده از 60vh باعث می‌شود با اسکرول بسیار کم، مراحل عوض شوند.
      */}
      <div className="relative" style={{ height: `${steps.length * 60}vh` }}>
        
        {/* بخش Sticky که محتوا را در مرکز صفحه ثابت نگه می‌دارد */}
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="grid w-full gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            
            {/* سمت چپ: کارت ضمانت (ثابت) */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[3rem] bg-[#311b92] shadow-[0_40px_100px_-20px_rgba(49,27,146,0.5)] lg:mx-0">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img
                  src="/guarantee-bg.jpg" // مطمئن شوید این فایل در public هست یا از آدرس دیگری استفاده کنید
                  alt="guarantee"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative flex h-full flex-col items-center justify-center p-10 text-center text-white">
                <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
                  Risk-free guarantee
                </div>
                <h3 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
                  ضمانت
                  <br />
                  بدون ریسک
                </h3>
                <p className="max-w-[280px] text-sm leading-7 text-purple-100/90 md:text-base">
                  نیازی به پرداخت اولیه نیس و صرفا به ازای نتیجه پرداخت خواهی کرد
                </p>
              </div>
            </div>

            {/* سمت راست: تایم‌لاین مراحل */}
            <div className="relative pr-8 md:pr-16">
              {/* خط عمودی اصلی */}
              <div className="absolute right-0 top-0 h-full w-[2px] bg-slate-100" />

              <div className="flex flex-col gap-8 md:gap-10">
                {steps.map((step, index) => {
                  const isActive = activeStep === index;

                  return (
                    <div key={step.title} className="relative">
                      {/* نقطه روی خط */}
                      <motion.div
                        animate={{
                          scale: isActive ? 1.5 : 1,
                          backgroundColor: isActive ? "#6366f1" : "#e2e8f0",
                          boxShadow: isActive ? "0 0 20px rgba(99, 102, 241, 0.6)" : "none"
                        }}
                        className="absolute right-[-5px] top-4 h-2.5 w-2.5 rounded-full border-2 border-white transition-colors duration-300"
                      />

                      <div className="pr-8">
                        <div className="mb-2 flex items-center gap-3">
                          <motion.h3
                            animate={{
                              color: isActive ? "#2d2a4d" : "#cbd5e1",
                              opacity: isActive ? 1 : 0.6
                            }}
                            className="text-2xl font-bold tracking-tight md:text-4xl"
                          >
                            {step.title}
                          </motion.h3>

                          {isActive && step.badge && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 uppercase"
                            >
                              {step.badge}
                            </motion.span>
                          )}
                        </div>

                        {/* متن توضیحات با انیمیشن باز و بسته شدن */}
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                              className="overflow-hidden"
                            >
                              <p className="max-w-lg py-2 text-base leading-relaxed text-slate-500 md:text-lg">
                                {step.text}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* نمایش پیشرفت در پایین (اختیاری) */}
              <div className="mt-12 flex items-center gap-3">
                <div className="h-[2px] w-12 bg-slate-100">
                  <motion.div 
                    className="h-full bg-indigo-600"
                    animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Step 0{activeStep + 1}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

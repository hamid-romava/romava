"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Table, Rocket } from "lucide-react";


const accent = "#bc29e9";

export default function Page() {
  const [formOpen, setFormOpen] = useState(false);

  const smoothEase = [0.22, 1, 0.36, 1];

  const fadeUp = {
    initial: { opacity: 0, y: 80 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 3, ease: "easeOut" },
  };


  const stagger = {
    initial: {},
    animate: {
      transition: {
        staggerChildren:0.5 ,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 2.5 , ease: "easeInOut" },
  };

  return (
      <main
        dir="rtl"
        style={{ "--accent": accent } as React.CSSProperties}
        className="min-h-screen bg-[#050505]"
      >

 
      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-8 md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(67,133,207,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(67,133,207,0.10),transparent_35%)]" />
        <div className="max-w-7xl mx-auto px-8 md:px-16 w-full relative z-10">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={item} className="space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] tracking-[0.2em] uppercase text-white/50">
                <span className="w-2 h-2 rounded-full bg-[color:var(--accent)] shadow-[0_0_20px_rgba(67,133,207,0.8)]" />
                استودیو کسب‌و‌کار روماوا
              </div>

              <motion.h1
                {...fadeUp}
                className="text-white/30 text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-light tracking-tight">
                کسب‌وکاری که
                <br />
                <span className="text-[color:var(--accent)]">محتوای هدفمند</span> میسازه
                <br />
                <span className="text-white/70"> فروش داره</span>
              </motion.h1>

              <motion.p
                {...fadeUp}
                transition={{ duration: 2, ease: "easeInOut" , delay: 0.15 }}
                className="max-w-xl text-base md:text-lg text-white/55 leading-8"
              >
                طراحی پلن کسب‌وکار شما طوری که
                 فرایند معرفی ، جذب و تبدیل مخاطب به مشتری ، فروش و در نهایت برند شدن شما در سریع‌ترین و بهینه ترین حالت اتفاق بیفته 
              </motion.p>

              <motion.div
                variants={item}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <button
                  onClick={() => setFormOpen(true)}
                  className="group inline-flex items-center justify-center gap-4 px-8 py-4 rounded-full bg-[color:var(--accent)] text-white font-medium shadow-[0_0_40px_rgba(67,133,207,0.25)] hover:scale-[1.02] transition-transform"
                >
                  رزرو وقت مشاوره
                  <span className="text-lg transition-transform group-hover:translate-x-1">←</span>
                </button>

                <a
                  href="#problem"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 transition-colors"
                >
                 اطلاعات بیشتر
                </a>
              </motion.div>
            </motion.div>

            {/* HERO VISUAL */}
            <motion.div
              variants={item}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[560px] aspect-square">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(67,133,207,0.20),transparent_60%)] blur-2xl" />
                <div className="absolute inset-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 2 , ease: "easeInOut" }}
                  className="absolute top-12 left-12 right-12 bottom-12 rounded-[2rem] border border-white/10 bg-[#0b0b0b]/80 p-8 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 text-sm">Smart Content</div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                  </div>

                <img
                  src="content.png"
                  alt="about"
                  className="w-full flex-1 object-cover"
                />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-[10px] text-white/45 uppercase tracking-[0.2em]">جلب توجه</div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-[10px] text-white/45 uppercase tracking-[0.2em]">اعتماد سازی</div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-[10px] text-white/45 uppercase tracking-[0.2em]">فروش</div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6 }}
            className="space-y-12"
          >

            {/* headline */}
            <h2 className=" mx-auto text-center text-3xl md:text-5xl lg:text-6xl font-light leading-[1.2] tracking-tight">
             فروش در اینستاگرام پیچیده و زمان بره
              <br />
              <p className="text-white/30 text-1xl md:text-2xl lg:text-3xl">
                اگه محتوای هدفمندی برای کسب‌وکارت نسازی
              </p>
            </h2>

            {/* bullet points */}
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-10 text-white/80 text-lg leading-8 justify-items-center">

              <li className="flex gap-4 items-start max-w-[260px]">
                <span className="mt-1 w-3 h-3 rounded-full bg-[color:var(--accent)]" />
              تکنیک‌های ترند هم به هویت کسب‌و‌کار آسیب میزنن و هم منجر به فروش نمیشن
              </li>

              <li className="flex gap-4 items-start max-w-[260px]">
                <span className=" mt-1 w-3 h-3 rounded-full bg-[color:var(--accent)]" />
              هزینه‌های زیاد تجهیزات برای خروجی‌ای میشه که بیشتر به تیزرهای عروسی شباهت دارن
              </li>

              <li className="flex gap-4 items-start max-w-[260px]">
                <span className="mt-1 w-3 h-3 rounded-full bg-[color:var(--accent)]" />
              معمولا قبل از تولید ، هدف مشخصی برای محتوا تعیین نمیشه 
              </li>

            </ul>


            <p className="text-white/70 text-lg max-w-3xl mx-auto text-center leading-8">
              این وضعیت معمولاً به شب‌های بی‌خوابی و حس دائمیِ سردرگمی در رشد کسب‌وکار ختم می‌شود. ما نمی‌خواهیم برندت چنین تجربه‌ای داشته باشد. استودیو کسب‌وکار "روماوا" به کسب‌وکارها کمک می‌کند یک مسیر روشن برای معرفی، جذب و تبدیل مخاطب بسازند؛ مسیری که برای برند تو هم جواب میدن.
            </p>

          </motion.div>
        </div>
      </section>


      {/* SERVICES */}
      <section id="services" className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/35 mb-4">
                خدمات ما
              </p>
              <h2 className="text-3xl md:text-5xl font-light">
                یک فرایند روشن برای محتوا‌های برندت
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "تدوین استراتژي محتوایی",
                text:  "در مرحله‌ی اول ، استراتژی محتوات رو اوکی می‌کنیم آرکتایپ برندت ، پرسونای مخاطب و ... مواردی هستن که در این مرحله مشخص می‌شن " , 

              },
              {
                title: "تعریف تکنیک و فرم محتوایی",
                text: "با توجه به خروجی استراتژی ، جایگاه برند و محصول‌ در فرایند بازاریابی ، بهترین تکنیک و فرم محتوایی رو برای پیج‌ات انتخاب می‌کنیم",
              },
              {
                title: " آماده سازی تجهیزات حرفه‌ای",
                text: "بدون نیاز به اجاره یا خرید بهترین تجهیزات ، متناسب با پروژه شما تجهیزات را تهیه و اقدام به ضبط می‌کنیم ",
              },
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 2, delay: index * 0.18, ease: "easeInOut" }}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:bg-white/[0.07] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-2xl mb-6"
                  style={{ backgroundColor: accent }}
                />
                <h3 className="text-2xl font-medium mb-4">{card.title}</h3>
                <p className="text-white/55 leading-8">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN */}
      <section id="plan" className="py-20">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: smoothEase }}
            className="rounded-[2rem] p-8 md:p-12 shadow-2xl"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/35 mb-4">
              نقشه راه
            </p>

            <h2 className="text-3xl md:text-5xl font-light mb-10">
              ۳ قدم تا شروع سفر
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
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
                  title: "۳. شروع سفر محتوای هدفمند",
                  text: "پیاده‌سازی نهایی و آماده‌سازی برای جذب بهتر مشتری.",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-black/10 p-6 flex flex-col items-start"
                >
                  <div className="mb-4 text-[color:var(--accent)]">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-medium mb-3">{step.title}</h3>
                  <p className="text-black/60 leading-8">{step.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


      {/* CTA */}
      <section id="contact" className="py-12">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2 , ease: "easeInOut" }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-10 md:p-16 text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/35 mb-4">
              آماده‌ای؟
            </p>
            <h2 className="text-3xl md:text-5xl font-light mb-6">
             برندت لایق شروع این سفره
            </h2>
            <p className="max-w-2xl mx-auto text-white/55 leading-8 mb-10">
              برای شروع، فقط کافی است یک جلسه کوتاه رزرو کنی تا مسیر مناسب برندت را
              بررسی کنیم.
            </p>

            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-[color:var(--accent)] text-white font-medium shadow-[0_0_40px_rgba(67,133,207,0.25)] hover:scale-[1.02] transition-transform"
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
            transition={{ duration: 2 , ease: smoothEase }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ duration: 1.5 , ease: smoothEase }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0c0c0c] p-8 md:p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-light">رزرو جلسه</h3>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-white/45 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  required
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[color:var(--accent)] transition-colors"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="شماره تماس"
                  required
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[color:var(--accent)] transition-colors"
                />
                <textarea
                  name="message"
                  placeholder="توضیح کوتاه درباره برند یا پروژه"
                  rows={4}
                  required
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[color:var(--accent)] transition-colors resize-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[color:var(--accent)] text-white py-3 font-medium hover:opacity-95 transition-opacity"
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


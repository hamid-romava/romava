"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Table, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

const accent = "#2254f6";
const framerEase = [0.23, 1, 0.32, 1];

export default function Page() {
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();

  // 1. اصلاح واریانت اصلی برای فعال‌سازی فرزندان
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15, 
        delayChildren: 0.2 
      }
    }
  };

  // 2. اصلاح fadeInUp برای هماهنگی با والد
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: framerEase } 
    }
  };

  // واریانت جداگانه برای بخش‌هایی که با اسکرول ظاهر می‌شوند
  const scrollReveal = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 1, ease: framerEase }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        if (e.currentTarget) e.currentTarget.reset();
        setFormOpen(false);
        router.push("success");
      }
    } catch (err) {
      alert("خطا در ارتباط با سرور.");
    }
  };

  return (
      <main
        dir="rtl"
        style={{ "--accent": accent } as React.CSSProperties}
        className="min-h-screen bg-[#050505]"
      >
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,84,246,0.1),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(34,84,246,0.05),transparent_40%)]" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            {/* Text Side - حالا کاملا نمایش داده می‌شود */}
            <div className="space-y-10">
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] tracking-[0.3em] uppercase text-white/50"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_12px_var(--accent)]" />
                استودیو روماوا
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-white"
              >
                کسب‌وکاری که <br />
                <span className="text-[color:var(--accent)]">پلن مشخص</span> داره <br />
                <span className="opacity-40">برند میشه</span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="max-w-lg text-lg text-white/50 leading-relaxed font-light"
              >
                طراحی پلن کسب‌وکار شما طوری که فرایند معرفی، جذب و تبدیل مخاطب به مشتری در سریع‌ترین و بهینه‌ترین حالت ممکن اتفاق بیفتد.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-5 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormOpen(true)}
                  className="px-10 py-4 rounded-full bg-[color:var(--accent)] text-white font-medium shadow-2xl shadow-blue-600/20"
                >
                  رزرو وقت مشاوره
                </motion.button>
                <motion.a
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  href="#problem"
                  className="px-10 py-4 rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors"
                >
                  اطلاعات بیشتر
                </motion.a>
              </motion.div>
            </div>

            {/* Visual Side */}
            <motion.div 
              variants={fadeInUp}
              className="relative hidden lg:block"
            >
              <div className="relative w-full max-w-[500px] aspect-[4/5] mx-auto">
                 <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden p-10 flex flex-col">
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-xs uppercase tracking-widest text-white/30">Business Framework</span>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[color:var(--accent)] animate-pulse" />
                            </div>
                        </div>
                        
                        <div className="space-y-8 flex-1">
                            {[0.8, 0.6, 0.4].map((width, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${width * 100}%` }}
                                    transition={{ duration: 2, delay: 1 + i * 0.2, ease: framerEase }}
                                    className="h-1.5 bg-white/10 rounded-full"
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-auto">
                            {['جذب', 'نگهداشت', 'رشد'].map((label, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                                    <div className="text-[10px] text-white/30 uppercase mb-2">{label}</div>
                                    <div className="h-1 w-full bg-[color:var(--accent)] opacity-30 rounded-full" />
                                </div>
                            ))}
                        </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section id="problem" className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-5xl font-light leading-tight mb-8">
              رشد کسب‌و‌کار و برند شدن فرسایشیه <br />
              <span className="text-white/20 italic">اگه پلن مشخصی نداشته باشی</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-12 mt-20 text-right">
              {[
                "زمان زیادی صرف ایده‌های بی‌نتیجه می‌شود.",
                "تیم حرفه‌ای درگیر آزمون و خطای بی‌پایان می‌شود.",
                "هزینه‌های گزافی صرف تبلیغات اشتباه می‌شود."
              ].map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className="space-y-4"
                >
                  <div className="w-10 h-[1px] bg-[color:var(--accent)]" />
                  <p className="text-white/50 font-light leading-relaxed">{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          
          {/* هدر بخش - استفاده از variants برای جلوگیری از پرش */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)] mb-4">
              Services
            </p>
            <h2 className="text-3xl md:text-5xl font-light">فرایند روشن محتوایی</h2>
          </motion.div>

          {/* کارت‌های سرویس - استفاده از viewport: { once: true } برای جلوگیری از ری‌تریگر شدن */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "تدوین استراتژي", text: "تعریف آرکتایپ برند و پرسونای مخاطب برای شروعی هدفمند." },
              { title: "تکنیک و فرم", text: "انتخاب بهترین فرمت محتوایی متناسب با جایگاه محصول شما." },
              { title: "تجهیزات حرفه‌ای", text: "تامین تمام ابزارهای ضبط حرفه‌ای بدون نیاز به هزینه اضافی." }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ 
                  delay: i * 0.15, 
                  duration: 1.0, 
                  ease: framerEase 
                }}
                className="group p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-[color:var(--accent)]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <div className="w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                </div>
                <h3 className="text-xl font-medium mb-4">{card.title}</h3>
                <p className="text-white/30 font-light leading-relaxed text-sm">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* 4. PLAN SECTION */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
                <motion.div {...fadeInUp} className="sticky top-32">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">The Roadmap</p>
                    <h2 className="text-4xl md:text-6xl font-light mb-8 italic">۳ قدم ساده <br /> برای شروع</h2>
                    <p className="text-white/40 font-light max-w-sm leading-loose">
                        مسیر برند شدن پیچیده نیست، به شرطی که قدم‌ها را درست و در زمان مناسب بردارید.
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {[
                        { icon: <CalendarCheck size={20} />, title: "رزرو مشاوره", text: "فهم دقیق جایگاه فعلی برند شما." },
                        { icon: <Table size={20} />, title: "جلسه هماهنگی", text: "طراحی پیام بر اساس متد StoryBrand." },
                        { icon: <Rocket size={20} />, title: "شروع سفر", text: "پیاده‌سازی نهایی و جذب مشتری." }
                    ].map((step, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 1, ease: framerEase }}
                            className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex gap-6 items-center group hover:border-white/10 transition-colors"
                        >
                            <div className="text-[color:var(--accent)] opacity-50 group-hover:opacity-100 transition-opacity">
                                {step.icon}
                            </div>
                            <div>
                                <h4 className="text-lg font-medium">{step.title}</h4>
                                <p className="text-sm text-white/30 font-light mt-1">{step.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-32 px-6">
        <motion.div 
            {...fadeInUp}
            className="max-w-4xl mx-auto p-16 rounded-[3rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 text-center relative overflow-hidden"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent" />
            <h2 className="text-3xl md:text-5xl font-light mb-8 leading-tight">برندت لایق شروع این سفره</h2>
            <button
                onClick={() => setFormOpen(true)}
                className="px-12 py-5 rounded-full bg-white text-black font-semibold hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                رزرو وقت مشاوره
            </button>
        </motion.div>
      </section>

      {/* MODAL - REFINED MOOTION */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-6"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.6, ease: framerEase }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[color:var(--accent)] opacity-20" />
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-light tracking-tight">شروع گفتگو</h3>
                <button onClick={() => setFormOpen(false)} className="text-white/20 hover:text-white transition-colors">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input name="name" type="text" placeholder="نام شما" required className="w-full rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 outline-none focus:border-[color:var(--accent)] transition-all font-light" />
                <input name="phone" type="tel" placeholder="شماره تماس" required className="w-full rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 outline-none focus:border-[color:var(--accent)] transition-all font-light" />
                <textarea name="message" placeholder="چه خدماتی مد نظر شماست؟" rows={3} required className="w-full rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 outline-none focus:border-[color:var(--accent)] transition-all font-light resize-none" />
                <button type="submit" className="w-full rounded-2xl bg-[color:var(--accent)] text-white py-4 font-medium hover:brightness-110 transition-all shadow-lg shadow-[#2254f6]/20">ارسال درخواست</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

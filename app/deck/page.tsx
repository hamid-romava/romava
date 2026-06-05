"use client";

import { motion } from "framer-motion";

type SectionType = {
  id: number;
  type: "problem" | "solution";
  title: string;
  desc: string;
  image: string;
};

const sections: SectionType[] = [
  {
    id: 1,
    type: "problem",
    title: "محتوای کسب‌وکار یا تیزر عروسی؟",
    desc: "خیلی وقت‌ها هزینه‌های سنگین برای تجهیزات و فیلم‌برداری پرداخت می‌شود، اما خروجی نهایی بیشتر شبیه یک ویدیوی احساسی و بی‌هدف است تا محتوایی که برای رشد کسب‌وکار طراحی شده باشد. مسئله فقط دوربین نیست؛ مسئله زاویه دید و استراتژی محتواست.",
    image: "/camera.jpg",
  },
  {
    id: 2,
    type: "solution",
    title: "محتواهای روماوا در خدمت فروشن",
    desc: "ما تیمی با سابقه‌ی استارتاپی هستیم. یعنی دغدغه‌ی رشد، جذب مخاطب، تبدیل و نتیجه را می‌فهمیم. برای ما محتوا فقط زیبا بودن نیست؛ محتوا باید کار کند، اثر بگذارد و بخشی از مسیر رشد برند باشد.",
    image: "/team.jpg",
  },
  {
    id: 3,
    type: "problem",
    title: "نگرانی برای هزینه‌کرد کاملاً طبیعی است",
    desc: "در شرایط فعلی، هیچ کسب‌وکاری دوست ندارد برای چیزی هزینه کند که بازگشت مشخصی ندارد. ما این نگرانی را می‌فهمیم، برای همین مدل همکاری‌مان را بر پایه‌ی خروجی، هدف و ارزش واقعی تعریف می‌کنیم؛ نه صرفاً تعداد تجهیزات یا روز فیلم‌برداری.",
    image: "/money.jpg",
  },
  {
    id: 4,
    type: "solution",
    title: "شروع همکاری با روماوا بدون ریسکه",
    desc: "برای شروع، لازم نیست با تردید وارد شوید. ما مسیر ابتدایی همکاری را طوری طراحی کرده‌ایم که بتوانید بدون فشار مالی، کیفیت فکر، نگاه و ساختار کار ما را بسنجید. شروع کار با ما می‌تواند از یک گفت‌وگوی رایگان و شفاف آغاز شود.",
    image: "/start.jpg",
  },
];

export default function DeckStudioPage() {
  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">

      {/* اسلاید معرفی */}
      <section
        className="h-screen w-full snap-start flex items-center justify-center"
        style={{ backgroundColor: "#070B14" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl text-center px-8"
        >
          <div className="w-24 h-1.5 mx-auto mb-8 rounded-full bg-violet-500" />

          <h1 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight">
            ما چیکار می‌کنیم؟
          </h1>

          <p className="text-lg md:text-xl text-white/70 leading-9">
            صاحبان کسب‌وکار بیشتر زمانشون رو برای خدمات و محصولاتشون میزارن
            و زمانی بابت تبلیغات و برندینگ اصولی کسب‌وکارشون اختصاص نمیدن
            <br />
            ما در استودیو کسب‌و‌کار روماوا، با خلق محتواهایی مبتنی بر اصول استراتژی محتوا
            و تکنیک‌های داستان‌سرایی به کسب‌وکارها کمک می‌کنیم برندشون دیده و ماندگار بشه
            <br />
            تا در نهایت صف طولانی‌تری از مشتری‌ها برای بیزینسشون بسازن و رشد پایداری رو تجربه کنن
          </p>
        </motion.div>
      </section>

      {sections.map((section, index) => {
        const isReversed = index % 2 !== 0;

        const theme =
          section.type === "problem"
            ? {
                bg: "#140A0A",
                accent: "#EF4444",
                glow: "rgba(239,68,68,0.18)",
              }
            : {
                bg: "#07140F",
                accent: "#22C55E",
                glow: "rgba(34,197,94,0.18)",
              };

        return (
          <section
            key={section.id}
            className="h-screen w-full snap-start"
            style={{ backgroundColor: theme.bg }}
          >
            <div
              className={`mx-auto flex h-full max-w-7xl flex-col md:flex-row ${
                isReversed ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Text */}
              <div className="flex w-full items-center justify-center px-8 py-12 md:w-1/2 md:px-16 lg:px-24">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.35 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-xl text-right"
                >
                  <div
                    className="mb-6 h-1.5 w-16 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />

                  <h2
                    className="mb-6 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl"
                    style={{
                      textShadow:
                        section.type === "problem"
                          ? "0 0 30px rgba(239,68,68,0.35)"
                          : "0 0 30px rgba(34,197,94,0.25)",
                    }}
                  >
                    {section.title}
                  </h2>

                  <p className="text-base leading-8 text-white/75 md:text-lg">
                    {section.desc}
                  </p>
                </motion.div>
              </div>

              {/* Image */}
              <div className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-10 lg:p-14">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.35 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="relative h-[320px] w-full overflow-hidden rounded-[28px] border border-white/10 shadow-2xl md:h-[480px] lg:h-[560px]"
                  style={{
                    background: `linear-gradient(135deg, ${theme.glow}, rgba(255,255,255,0.04))`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/10" />

                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-center">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                        Visual
                      </p>
                      <p className="mt-3 text-lg text-white/70">
                        {section.image}
                      </p>
                    </div>
                  </div>

                  <div
                    className="absolute bottom-6 left-6 h-3 w-24 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}

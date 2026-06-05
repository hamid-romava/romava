"use client";

export default function RomavaPresentationPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#050505] text-white overflow-hidden"
    >
      {/* background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[#2254f6]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#2254f6]/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 py-20 md:px-12 lg:px-20">

        {/* SLIDE 02 */}
        <section className="flex min-h-screen flex-col justify-center border-b border-white/5 py-24">
          <div className="mb-8 text-sm tracking-[0.25em] text-red-400/60">
            02
          </div>

          <h2 className="max-w-4xl text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
            استخدام همیشه
            <br />
            <span className="text-red-300/90">راه حل نیست</span>
          </h2>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-red-500/10 bg-red-500/[0.05] p-8 backdrop-blur-xl">
              <p className="text-xl leading-10 text-white/75">
                هزینه‌های تجهیزات و سیستم برای کارمندها زیاد شده
              </p>
            </div>

            <div className="rounded-[2rem] border border-red-500/10 bg-red-500/[0.05] p-8 backdrop-blur-xl">
              <p className="text-xl leading-10 text-white/75">
                حقوقی که پرداخت می‌کنی معمولا بابت حضور کارمنده نه خروجی مشخص
              </p>
            </div>

            <div className="rounded-[2rem] border border-red-500/10 bg-red-500/[0.05] p-8 backdrop-blur-xl">
              <p className="text-xl leading-10 text-white/75">
                آدم‌های خیلی حرفه‌ای سخت پیدا میشن و معمولا حقوق‌های بالایی دارن
              </p>
            </div>
          </div>
        </section>

        {/* SLIDE 03 */}
        <section className="flex min-h-screen flex-col justify-center border-b border-white/5 py-24">
          <div className="mb-8 text-sm tracking-[0.25em] text-green-400/60">
            03
          </div>

          <h2 className="max-w-5xl text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
            ما به صورت پروژه‌ای
            <br />
            <span className="text-green-300/90">عضوی از تیمت میشیم</span>
          </h2>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-green-500/10 bg-green-500/[0.04] p-8">
              <div className="mb-6 text-4xl">✓</div>

              <p className="text-xl leading-10 text-white/75">
                دیگه نیازی به پرداخت هزینه بابت تجهیزات نداری
              </p>
            </div>

            <div className="rounded-[2rem] border border-green-500/10 bg-green-500/[0.04] p-8">
              <div className="mb-6 text-4xl">✓</div>

              <p className="text-xl leading-10 text-white/75">
                به ازای خروجی پول پرداخت می‌کنی و نیازی نیس نگران چک کردن
                مداوم کارمندت بشی
              </p>
            </div>

            <div className="rounded-[2rem] border border-green-500/10 bg-green-500/[0.04] p-8">
              <div className="mb-6 text-4xl">✓</div>

              <p className="text-xl leading-10 text-white/75">
                حرفه‌ای‌ترین‌ها بسته به نیاز پروژه‌ات برات زمان میذارن
              </p>
            </div>
          </div>
        </section>

        {/* SLIDE 04 */}
        <section className="flex min-h-screen flex-col justify-center border-b border-white/5 py-24">
          <div className="mb-8 text-sm tracking-[0.25em] text-white/30">
            04
          </div>

          <h2 className="max-w-5xl text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
            برای شروع
            <br />
            <span className="text-[#2254f6]">۳ قدم کافیه</span>
          </h2>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mb-6 text-5xl">🌐</div>

              <p className="text-xl leading-10 text-white/75">
                اول سایت و نمونه‌کارهای روماوا را ببین
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mb-6 text-5xl">📞</div>

              <p className="text-xl leading-10 text-white/75">
                بعد با ما تماس بگیر
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mb-6 text-5xl">🚀</div>

              <p className="text-xl leading-10 text-white/75">
                و همکاری را شروع کنیم
              </p>
            </div>
          </div>
        </section>

        {/* SLIDE 05 */}
        <section className="flex min-h-screen flex-col justify-center border-b border-white/5 py-24">
          <div className="mb-8 text-sm tracking-[0.25em] text-white/30">
            05
          </div>

          <h2 className="max-w-5xl text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
            استخدام سنتی
            <span className="mx-4 text-white/20">/</span>
            همکاری پروژه‌ای
          </h2>

          <div className="mt-20 grid gap-6 md:grid-cols-2">

            {/* left */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-red-500/10 bg-red-500/[0.04] p-8">
                هزینه زیاد تجهیزات
              </div>

              <div className="rounded-[2rem] border border-red-500/10 bg-red-500/[0.04] p-8">
                حقوق ماهانه
              </div>

              <div className="rounded-[2rem] border border-red-500/10 bg-red-500/[0.04] p-8">
                جست‌وجوی بی‌انتها برای استخدام افراد حرفه‌ای
              </div>

              <div className="rounded-[2rem] border border-red-500/10 bg-red-500/[0.04] p-8">
                نیاز به مدیریت روزانه
              </div>
            </div>

            {/* right */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-green-500/10 bg-green-500/[0.04] p-8">
                بدون نیاز به پرداخت هزینه برای تجهیزات
              </div>

              <div className="rounded-[2rem] border border-green-500/10 bg-green-500/[0.04] p-8">
                پرداخت به ازای نتیجه
              </div>

              <div className="rounded-[2rem] border border-green-500/10 bg-green-500/[0.04] p-8">
                بهترین‌ها به صورت خروجی‌محور کنارتن
              </div>

              <div className="rounded-[2rem] border border-green-500/10 bg-green-500/[0.04] p-8">
                بدون دغدغه روزها قهوه‌ات را میل کن :)
              </div>
            </div>
          </div>
        </section>

        {/* FINAL SLIDE */}
        <section className="flex min-h-screen flex-col justify-center py-24">
          <div className="mb-8 text-sm tracking-[0.25em] text-white/30">
            ROMAVA
          </div>

          <h1 className="max-w-6xl text-5xl font-light leading-[1.05] tracking-tight text-white/25 md:text-7xl lg:text-8xl">
            قبل از استخدام
            <br />
            <span className="text-[#2254f6]">
              شاید به سیستم بهتری
            </span>
            <br />
            نیاز داری
          </h1>

          <p className="mt-10 max-w-2xl text-xl leading-10 text-white/55">
            روماوا به برندها کمک می‌کند بدون ساختن تیم داخلی سنگین،
            محتوای حرفه‌ای، تبلیغات هدفمند و وب‌سایت‌های تبدیل‌محور داشته
            باشند.
          </p>

          <div className="mt-14 flex items-center gap-4">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-sm tracking-[0.2em] text-white/60">
              ROMAVA.CO
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
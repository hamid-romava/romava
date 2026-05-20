import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-black text-white">

        {/* NAVBAR */}
        <nav className="fixed top-0 w-full backdrop-blur-md border-b border-white/10 z-50">
          <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between">
            

            <div className="flex gap-8 text-sm text-white/60">
              <Link href="/advertising">تبلیغات در بله </Link>
              <Link href="/contentCreation"> تولید محتوا در اینستا</Link>

              <Link href="/about">درباره ما</Link>
            </div>

            <Link href="/" className="text-2xl text-white font-light tracking-[0.2em] uppercase" > ‌ROMAVA</Link>
          </div>
        </nav>

        <div className="pt-5 border-t border-transparent" style={{borderTopWidth: '1px', borderTopColor:'transparent'}}>
          {children}
        </div>

      </body>
    </html>
  );
}

"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1,
          }}
          className="flex justify-center mb-6"
        >
          <CheckCircle size={90} className="text-[color:#2254f6]" />
        </motion.div>

        <h1 className="text-3xl md:text-2xl font-light mb-4">
         به شروع این سفر خوش اومدی ... 🎉
        </h1>

        <p className="text-white/60 leading-relaxed text-lg">
         درخواستت ثبت شد
          <br />
          کارشناسان ما به زودی باهات  تماس میگیرن 🤍
        </p>

        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="inline-block mt-8 px-10 py-3 rounded-full bg-[color:#2254f6] text-white shadow-lg shadow-blue-900/30"
        >
          بازگشت به صفحه اصلی
        </motion.a>
      </motion.div>
    </main>
  );
}

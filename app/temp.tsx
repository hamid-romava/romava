

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


    const openForm = useCallback(() => {
    setError(null);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      const form = e.currentTarget;
      const formData = new FormData(form);

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

        if (!res.ok) {
          setError("ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.");
          return;
        }

        form.reset();
        setFormOpen(false);
        router.push("/success");
      } catch (err) {
        console.error(err);
        setError("مشکلی در ارتباط با سرور پیش آمد. دوباره تلاش کنید.");
      } finally {
        setSubmitting(false);
      }
    },
    [router]
  );

        {/* MODAL */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm"
            onClick={closeForm}
          >
            <motion.div
              initial={{
                y: 80,
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                y: 40,
                opacity: 0,
                scale: 0.96,
              }}
              transition={{
                duration: 0.45,
                ease: smoothEase,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0c0c0c]/95 p-8 backdrop-blur-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-light">رزرو جلسه</h3>

                <button
                  onClick={closeForm}
                  className="text-white/45 transition-colors hover:text-white"
                  type="button"
                  aria-label="بستن"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />

                <input
                  name="phone"
                  type="tel"
                  placeholder="شماره تماس"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />

                <textarea
                  name="message"
                  placeholder="توضیح کوتاه درباره پروژه"
                  rows={4}
                  required
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition-colors focus:border-[color:var(--accent)]"
                />

                {error && (
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[color:var(--accent)] py-3 font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {submitting ? "در حال ارسال..." : "ارسال درخواست"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
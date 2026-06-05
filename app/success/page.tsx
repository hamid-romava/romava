export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 1px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          border: "1px solid rgba(0,0,0,.08)",
          borderRadius: 20,
          padding: "28px 24px",
          boxShadow: "0 18px 50px rgba(0,0,0,.08)",
          textAlign: "center",
        }}
      >
        {/* icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(16,185,129,0.12)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 14px",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 7L10.5 16.5L4 10"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: -0.3, color: "#0a0a0a" }}>
         درخواستت ثبت شد ✌️
        </h1>

        <p style={{ margin: "10px 0 18px", color: "rgba(10,10,10,.65)", lineHeight: 1.7 }}>
          تیم ما به زودی باهات تماس می‌گیره 
        </p>

        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.10)",
            textDecoration: "none",
            color: "#0a0a0a",
            fontSize: 14,
          }}
        >
          بازگشت <span style={{ opacity: 0.5 }}>→</span>
        </a>
      </section>
    </main>
  );
}

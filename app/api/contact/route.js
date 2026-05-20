export async function POST(req) {
  try {
    // 1- گرفتن توکن و chat_id از env
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken) {
      return Response.json({ error: "توکن بات تلگرام تنظیم نشده است." }, { status: 500 });
    }
    if (!chatId) {
      return Response.json({ error: "شناسه چت تلگرام تنظیم نشده است." }, { status: 500 });
    }

    // 2- گرفتن داده‌ها از درخواست
    const { name, phone, message } = await req.json();

    if (!name || !phone || !message) {
      return Response.json({ error: "لطفا همه فیلدهای فرم را پر کنید." }, { status: 400 });
    }

    // 3- ساخت متن پیام
    const text = `
📩 *درخواست جدید*
👤 نام: ${name}
📞 تلفن: ${phone}
📝 پیام: ${message}
    `;

    // 4- URL تلگرام
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // 5- ارسال پیام به تلگرام
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    // 6- خواندن پاسخ تلگرام
    const result = await response.json();

    if (!result.ok) {
      console.error("[Telegram Error]", result);
      return Response.json({
        error: "خطا در ارسال به تلگرام",
        details: result.description || JSON.stringify(result),
      }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Server Error]", error);
    return Response.json({ error: "خطای سرور" }, { status: 500 });
  }
}

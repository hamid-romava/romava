import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

const collaborations = new Set([
  "بامبو", "سرو", "بذر", "مشاوره برای انتخاب طرح", "همکاری سفارشی",
]);

const clean = value => typeof value === "string" ? value.trim() : "";
const invalid = error => Response.json({ error }, { status: 400 });
const normalizeDigits = value => value.replace(/[۰-۹٠-٩]/g, digit =>
  String(digit.charCodeAt(0) & 15)
);

export async function POST(request) {
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") return invalid("اطلاعات فرم معتبر نیست.");

  const name = clean(input.name);
  const phone = normalizeDigits(clean(input.phone));
  const message = clean(input.message);
  const instagram = clean(input.instagram);
  const collaboration = clean(input.collaboration);
  const studio = input.source === "studio" || "instagram" in input || "collaboration" in input;

  if (!name || !phone || !message || name.length > 100 || phone.length > 30 || message.length > 3000) {
    return invalid("اسم و فامیل، شماره تماس و توضیحات رو بررسی کن.");
  }

  if (studio) {
    if (!/^\+?[0-9]{8,15}$/.test(phone.replace(/[\s()-]/g, ""))) {
      return invalid("شماره تماس واتساپ رو درست وارد کن.");
    }
    if (!/^(?:(?:https?:\/\/)?(?:www\.)?instagram\.com\/|@)?[a-z0-9._]{1,30}\/?$/i.test(instagram)) {
      return invalid("آدرس یا نام کاربری پیج اینستاگرام رو درست وارد کن.");
    }
    if (!collaborations.has(collaboration)) return invalid("مدل همکاری رو انتخاب کن.");
  }

  try {
    const client = await clientPromise;
    if (!client) return Response.json({ error: "ثبت درخواست فعلاً در دسترس نیست." }, { status: 503 });

    await client.db("mydb").collection("contacts").insertOne({
      name,
      phone,
      message,
      ...(studio ? { instagram, collaboration, source: "studio" } : {}),
      createdAt: new Date(),
    });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "درخواست ثبت نشد." }, { status: 500 });
  }
}

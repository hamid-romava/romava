import { Binary } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

const maxResumeBytes = 4_000_000;
const maxRequestBytes = maxResumeBytes + 32_000;
const failure = (error, status) => Response.json({ error }, { status });

export async function POST(request) {
  const length = Number(request.headers.get("content-length"));
  if (length > maxRequestBytes) return failure("حجم رزومه باید حداکثر ۴ مگابایت باشه.", 413);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) {
    return failure("رزومه رو از طریق فرم بفرست.", 415);
  }
  const form = await request.formData().catch(() => null);
  const name = form?.get("name");
  const resume = form?.get("resume");
  const phone = typeof form?.get("phone") === "string"
    ? form.get("phone")
      .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
      .replace(/[\s()-]/g, "")
    : "";
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    return failure("اسم و فامیل رو وارد کن.", 400);
  }
  if (!/^\+?[0-9]{8,15}$/.test(phone)) {
    return failure("شماره تلفن معتبر وارد کن.", 400);
  }
  if (!(resume instanceof File) || !resume.size) return failure("فایل رزومه رو انتخاب کن.", 400);
  if (resume.size > maxResumeBytes) return failure("حجم رزومه باید حداکثر ۴ مگابایت باشه.", 413);

  const content = Buffer.from(await resume.arrayBuffer());
  if (!resume.name.toLowerCase().endsWith(".pdf") || content.subarray(0, 5).toString() !== "%PDF-") {
    return failure("رزومه باید فایل PDF باشه.", 400);
  }

  try {
    const client = await clientPromise;
    if (!client) return failure("ثبت درخواست فعلاً در دسترس نیست.", 503);
    await client.db("mydb").collection("careerApplications").insertOne({
      name: name.trim(),
      phone,
      role: "video-editor",
      resume: { filename: resume.name.slice(0, 200), contentType: "application/pdf", content: new Binary(content) },
      createdAt: new Date(),
    });
    return Response.json({ success: true }, { status: 201 });
  } catch {
    return failure("درخواست ثبت نشد. دوباره امتحان کن.", 503);
  }
}

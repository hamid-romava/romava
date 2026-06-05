import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // چک env
    if (!process.env.MONGODB_URI) {
      return Response.json(
        { error: "MONGODB_URI تنظیم نشده" },
        { status: 500 }
      );
    }

    const { name, phone, message } = await req.json();

    if (!name || !phone || !message) {
      return Response.json(
        { error: "همه فیلدها الزامی هستند" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    if (!client) {
      return Response.json(
        { error: "اتصال به دیتابیس برقرار نشد" },
        { status: 500 }
      );
    }

    const db = client.db("mydb");

    await db.collection("contacts").insertOne({
      name,
      phone,
      message,
      createdAt: new Date(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
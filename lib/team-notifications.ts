import type { MongoClient } from "mongodb";

const sources = [
  { collection: "contacts", date: "createdAt", name: "name", label: "درخواست جدید", view: "requests" },
  { collection: "meeting_answers", date: "updatedAt", name: "doctorName", label: "پاسخ جلسه", view: "meetings" },
  { collection: "client_feedback", date: "createdAt", name: "clientName", label: "بازخورد مشتری", view: "feedback" },
] as const;

export async function teamNotifications() {
  const { default: connection } = await import("@/lib/mongodb") as { default: Promise<MongoClient> | null };
  if (!connection) throw new Error("Team notification storage unavailable");
  const db = (await connection).db("mydb");
  const limit = 30;
  const results = await Promise.all(sources.map(async source => {
    const rows = await db.collection(source.collection)
      .find({ [source.date]: { $type: "date" } }, { projection: { [source.date]: 1, [source.name]: 1 } })
      .sort({ [source.date]: -1, _id: -1 }).limit(limit).toArray();
    return rows.flatMap(row => {
      const date = row[source.date];
      if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return [];
      const name = row[source.name];
      return [{
        id: `${source.view}:${String(row._id)}`,
        label: source.label,
        view: source.view,
        name: typeof name === "string" ? name : "",
        time: date.getTime(),
      }];
    });
  }));
  return results.flat().sort((a, b) => b.time - a.time).slice(0, limit);
}

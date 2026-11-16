import type { MongoClient } from "mongodb";

const clients = { abdi: "عبدی", reza: "رضا خوانی" } as const;
const clientPrefixes = { abdi: "drAbdi", reza: "drRezaKhani" } as const;
const arrivalItems = [
  ["lighting", "شات پلن"],
  ["script", "چک کردن سناریو با سوژه"],
  ["noise", "بررسی صداهای مزاحم"],
  ["background", "بررسی پس‌زمینه و حذف عناصر مزاحم از کادر"],
  ["presenter-appearance", "گریم و لباس مجری"],
  ["phones", "تحویل گرفتن گوشی‌ها و درخواست برای سایلنت کردن گوشی‌ها"],
  ["water", "قرار دادن آب ولرم کنار مجری"],
  ["clickup", "چک کردن کلیک‌اپ"],
] as const;
const departureItems = [["packing", "چک کردن چک‌لیست وسایل"]] as const;
const recordingItems = [
  ["framing", "کادربندی · تنفس یک‌پنجم بالایی"],
  ["safe-area", "کادربندی · رعایت Safe Zone اینستاگرام"],
  ["script-framing", "کادربندی بر اساس فرم اسکریپت"],
  ["presenter-lighting", "نورپردازی بر اساس مجری"],
  ["camera", "تنظیمات دوربین (رزولوشن و فوکوس)"],
  ["microphone", "تست میکروفون"],
  ["subject", "چک کردن مجری (لباس، آراستگی صورت، نحوهٔ نشستن و ایستادن)"],
  ["cover", "عکس کاور"],
  ["doctor-frame", "تأیید قاب (نشون دادن عکس کاور)"],
] as const;

type Checklist = { checked: string[]; revision: number };
type GeneralChecklist = Checklist & { arrivalTime?: string; departureTime?: string; departureNote?: string };
type Recording = Checklist & { id: string; name: string };
type Shoot = {
  _id: string; name: string; client: keyof typeof clients; contract: string; number: string;
  createdAt: Date; closedAt?: Date; general: GeneralChecklist; recordings: Recording[];
};

const allChecked = (items: ReadonlyArray<readonly [string, string]>, checked: readonly string[]) =>
  items.every(([id]) => checked.includes(id));
const arrivalComplete = (shoot: Shoot) => Boolean(shoot.general.arrivalTime) && allChecked(arrivalItems, shoot.general.checked);
const firstIncompleteRecording = (shoot: Shoot) => shoot.recordings.find(row => !allChecked(recordingItems, row.checked));
const canLeave = (shoot: Shoot) => arrivalComplete(shoot) && shoot.recordings.length > 0 && !firstIncompleteRecording(shoot);

const path = "/team/meetings?view=shoots";
const validId = (id: unknown): id is string => typeof id === "string" && /^[a-f0-9]{24}$/.test(id);
const validTime = (time: string) => time === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
const format = new Intl.NumberFormat("fa-IR");
const normalizeDigits = (value: string) => value.replace(/[۰-۹٠-٩]/g, digit =>
  String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10),
);
const shootName = (client: keyof typeof clients, contract: string, number: string) =>
  `${clientPrefixes[client]}C${normalizeDigits(contract)}P${normalizeDigits(number)}`;
const blank = (): Checklist => ({ checked: [], revision: 0 });

async function shoots() {
  const { default: connection } = await import("@/lib/mongodb") as { default: Promise<MongoClient> | null };
  const client = await connection;
  if (!client) throw new Error("Shoot checklist storage unavailable");
  return client.db("mydb").collection<Shoot>("shootChecklists");
}

type Render = { escape: (value: unknown) => string; csrf: string; newId: string };
const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const hidden = (name: string, value: string | number) => `<input type="hidden" name="${name}" value="${value}">`;
const link = (id: string, recording?: string) => `${path}&shoot=${id}${recording ? `&recording=${recording}` : ""}`;

function identity(shoot: Shoot, escape: Render["escape"]) {
  return `${clients[shoot.client]} · قرارداد ${escape(shoot.contract)} · آفیش ${escape(shoot.number)}`;
}

export async function renderShootChecklists(url: URL, { escape, csrf, newId }: Render) {
  const collection = await shoots();
  const form = (action: string, body: string) => `<form method="post" action="/team/meetings">${hidden("action", action)}${hidden("csrf", csrf)}${body}</form>`;
  const shootId = url.searchParams.get("shoot");
  if (url.searchParams.has("new")) return `<p><a href="${path}">← برگشت به آفیش‌ها</a></p><h1>آفیش جدید</h1><section class="card">${form("shoot-create", `
    ${hidden("shoot", newId)}
    <label>کلاینت<select name="client" required><option value="">انتخاب کن</option>
      ${Object.entries(clients).map(([id, name]) => `<option value="${id}">${name}</option>`).join("")}
    </select></label>
    <label>شماره قرارداد<input name="contract" required maxlength="40" dir="auto"></label>
    <label>شماره آفیش<input name="number" required maxlength="12" inputmode="numeric"></label>
    <p>اسم آفیش از اسم انگلیسی کلاینت، شمارهٔ قرارداد و شمارهٔ آفیش ساخته می‌شه. مثلاً <bdi dir="ltr">drAbdiC1P2</bdi>.</p>
    <button>ایجاد آفیش</button>`)}</section>`;

  if (validId(shootId)) {
    const shoot = await collection.findOne({ _id: shootId });
    if (!shoot) return `<h1>آفیش پیدا نشد</h1><a href="${path}">برگشت به آفیش‌ها</a>`;
    const arrivalDone = arrivalComplete(shoot);
    const pendingRecording = firstIncompleteRecording(shoot);
    const pendingIndex = pendingRecording ? shoot.recordings.indexOf(pendingRecording) : shoot.recordings.length;
    const requestedRecording = url.searchParams.get("recording");
    const requestedIndex = shoot.recordings.findIndex(row => row.id === requestedRecording);
    const wantsNew = requestedRecording === "new";
    const wantsDeparture = url.searchParams.get("checklist") === "departure";
    const locked = (requestedIndex >= 0 && (!arrivalDone || requestedIndex > pendingIndex))
      || (wantsNew && (Boolean(shoot.closedAt) || !arrivalDone || Boolean(pendingRecording)))
      || (wantsDeparture && !canLeave(shoot));
    const selected = locked && arrivalDone ? pendingRecording : !locked ? shoot.recordings[requestedIndex] : undefined;
    const checklist: Checklist = selected ?? shoot.general;
    const newRecording = !locked && wantsNew;
    const departure = !locked && !selected && wantsDeparture;
    const section = departure ? "departure" : "arrival";
    const items = selected ? recordingItems : departure ? departureItems : arrivalItems;
    const title = departure ? "چک‌لیست خروج" : "چک‌لیست ورود";
    const checked = new Set(checklist.checked);
    const status = url.searchParams.get("status");
    const renderItems = (group: ReadonlyArray<readonly [string, string]>) =>
      group.map(([id, label]) => `<label><input type="checkbox" name="checked"${shoot.closedAt ? " disabled" : " required"} value="${id}"${checked.has(id) ? " checked" : ""}> ${label}</label>`).join("");
    const timeField = departure ? "departureTime" : "arrivalTime";
    const timeInput = selected ? "" : `<label>${departure ? "ساعت خروج" : "ساعت ورود"}<input type="time" name="${timeField}"${shoot.closedAt ? " disabled" : " required"} value="${escape(shoot.general[timeField])}"></label>`;
    const noteInput = departure ? `<label>یادداشت (اختیاری)<textarea name="departureNote" rows="4" maxlength="2000"${shoot.closedAt ? " readonly" : ""}>${escape(shoot.general.departureNote)}</textarea></label>` : "";
    const sectionFields = selected ? "" : hidden("section", section);
    const completed = items.filter(([id]) => checked.has(id)).length;

    const progress = `${format.format(completed)} از ${format.format(items.length)} مورد ثبت شده`;
    const feedback = locked || status === "locked"
      ? '<p class="notice" role="alert">اول چک‌لیست مرحلهٔ قبلی رو کامل و ذخیره کن.</p>'
      : status === "incomplete"
        ? '<p class="notice" role="alert">برای ذخیره، همهٔ موارد این مرحله رو تکمیل کن.</p>'
        : status === "saved"
      ? '<p role="status">چک‌لیست ذخیره شد.</p>'
      : status === "conflict"
        ? '<p class="notice" role="alert">این چک‌لیست هم‌زمان تغییر کرده. آخرین تیک‌ها رو چک کن و دوباره ذخیره کن.</p>'
        : "";
    const checklistForm = form("shoot-save", `${hidden("shoot", shoot._id)}${hidden("recording", selected?.id ?? "")}${hidden("revision", checklist.revision)}
      ${sectionFields}${timeInput}<div class="shoot-items">${renderItems(items)}</div>${noteInput}
      ${shoot.closedAt ? "" : "<button>ذخیرهٔ چک‌لیست</button>"}`);
    const checklistCard = `<section class="card">
      <h2>${selected ? escape(selected.name || `ضبط ${format.format(shoot.recordings.indexOf(selected) + 1)}`) : title}</h2>
      <p>${progress}</p>
      ${feedback}${checklistForm}
    </section>`;

    const departureDone = Boolean(shoot.general.departureTime) && departureItems.every(([id]) => shoot.general.checked.includes(id));
    const recordings = shoot.recordings.map((row, index) => ({
      url: link(shoot._id, row.id),
      label: row.name || `ضبط ${format.format(index + 1)}`,
      active: selected?.id === row.id,
      done: allChecked(recordingItems, row.checked),
      locked: !arrivalDone || index > pendingIndex,
    }));
    const arrival = { url: link(shoot._id), label: "چک‌لیست ورود", active: !selected && !departure && !newRecording, done: arrivalDone, locked: false };
    const exit = { url: link(shoot._id) + "&checklist=departure", label: "چک‌لیست خروج", active: departure && !newRecording, done: departureDone, locked: !canLeave(shoot) };
    const stages = [arrival, ...recordings, exit];
    const finished = stages.filter(stage => stage.done).length;
    const focusAdd = newRecording && (status === "arrival-saved" || status === "recording-saved");
    const disabledStage = (label: string) => `<span class="stage-locked" aria-disabled="true">${escape(label)}<span class="sr-only">، مرحله قفل است</span></span>`;
    const stageLink = (stage: typeof arrival) => stage.locked ? disabledStage(stage.label) :
      `<a href="${escape(stage.url)}"${stage.active ? ' aria-current="step"' : ""}${stage.done ? ' class="stage-complete"' : ""}${(status === "arrival-saved" && stage.active) ? " autofocus" : ""}>
        <span class="stage-mark" aria-hidden="true">${stage.done ? "✓" : "○"}</span>${escape(stage.label)}
        ${stage.done ? '<span class="sr-only">، تکمیل شده</span>' : ""}
      </a>`;

    return `<p><a href="${path}">← برگشت به آفیش‌ها</a></p><h1><bdi dir="ltr">${escape(shootName(shoot.client, shoot.contract, shoot.number))}</bdi></h1>
      <p>${identity(shoot, escape)}${shoot.closedAt ? " · آفیش بسته‌شده" : ""}</p>
      <section class="shoot-progress" aria-label="پیشرفت آفیش">
        <div class="shoot-progress-label"><strong>پیشرفت آفیش</strong><span>${format.format(finished)} از ${format.format(stages.length)} مرحله تکمیل شده</span></div>
        <progress aria-label="پیشرفت آفیش" value="${finished}" max="${stages.length}"></progress>
        <nav class="team-nav shoot-stages" aria-label="چک‌لیست‌های آفیش">
          ${stageLink(arrival)}
          ${recordings.map(stageLink).join("")}
          ${shoot.closedAt ? "" : arrivalDone && !pendingRecording ? `<a class="stage-add" href="${escape(link(shoot._id, "new"))}"${newRecording ? ' aria-current="step"' : ""}${focusAdd ? " autofocus" : ""}>ضبط جدید +</a>` : disabledStage("ضبط جدید +")}
          ${stageLink(exit)}
        </nav>
      </section>
      ${status === "recording-saved" ? '<p role="status">ضبط ذخیره شد. می‌تونی ضبط جدید بسازی یا بری سراغ چک‌لیست خروج.</p>' : ""}
      ${status === "closed" && shoot.closedAt ? '<p role="status">آفیش بسته شد.</p>' : ""}
      ${status === "arrival-saved" ? '<p role="status">چک‌لیست ورود ذخیره شد.</p>' : ""}
      ${newRecording ? `<section class="card"><h2>ضبط جدید</h2>${form("shoot-recording", `${hidden("shoot", shoot._id)}${hidden("recording", newId)}
        <label>اسم ضبط (اختیاری)<input name="name" maxlength="100" placeholder="مثلاً معرفی خدمات"></label><button>اضافه کردن ضبط</button>`)}</section>` : checklistCard}`;
  }
  const rows = await collection.find({}, { projection: { general: 0 } }).sort({ createdAt: -1, _id: -1 }).toArray();
  return `<h1>چک‌لیست آفیش</h1>
    ${url.searchParams.get("status") === "closed" ? '<p role="status">آفیش بسته شد.</p>' : ""}
    <nav class="team-nav"><a href="${path}&amp;new=1">آفیش جدید +</a></nav>
    ${rows.length ? rows.map(shoot => `<article class="card"><h2><a href="${link(shoot._id)}"><bdi dir="ltr">${escape(shootName(shoot.client, shoot.contract, shoot.number))}</bdi></a></h2><p>${identity(shoot, escape)} · ${format.format(shoot.recordings.length)} ضبط · ${shoot.closedAt ? "بسته‌شده" : "باز"}</p></article>`).join("") : '<p>هنوز آفیشی ثبت نشده.</p>'}`;
}

export async function changeShootChecklist(action: string, form: FormData) {
  const shoot = field(form, "shoot");
  const recording = field(form, "recording");
  const name = field(form, "name");
  if (!validId(shoot) || (recording && !validId(recording)) || name.length > 100) return null;
  if (action === "shoot-create") {
    const client = field(form, "client");
    const contract = normalizeDigits(field(form, "contract"));
    const number = normalizeDigits(field(form, "number"));
    if (!Object.hasOwn(clients, client) || !contract || contract.length > 40 || !/^\d{1,12}$/.test(number)) return null;
    const collection = await shoots();
    await collection.updateOne({ _id: shoot }, { $setOnInsert: {
      name: shootName(client as keyof typeof clients, contract, number), client: client as keyof typeof clients, contract, number, createdAt: new Date(), general: blank(), recordings: [],
    } }, { upsert: true });
    return link(shoot);
  }
  if (action === "shoot-recording" && validId(recording)) {
    const collection = await shoots();
    const current = await collection.findOne({ _id: shoot });
    if (!current) return null;
    if (current.recordings.some(row => row.id === recording)) return link(shoot, recording);
    if (current.closedAt) return link(shoot) + "&status=closed";
    const pending = firstIncompleteRecording(current);
    if (!arrivalComplete(current) || pending) return `${link(shoot, pending?.id)}&status=locked`;
    const result = await collection.updateOne({
      _id: shoot, closedAt: { $exists: false }, "general.revision": current.general.revision,
      recordings: { $size: current.recordings.length }, "recordings.id": { $ne: recording },
    }, { $push: { recordings: { id: recording, name, ...blank() } } });
    return result.matchedCount ? link(shoot, recording) : link(shoot, "new") + "&status=conflict";
  }
  if (action !== "shoot-save" || !/^\d{1,10}$/.test(field(form, "revision"))) return null;
  const revision = Number(field(form, "revision"));
  const requested = new Set(form.getAll("checked"));
  if (recording) {
    const checked = recordingItems.map(([id]) => id).filter(id => requested.has(id));
    if (!allChecked(recordingItems, checked)) return link(shoot, recording) + "&status=incomplete";
    const collection = await shoots();
    const current = await collection.findOne({ _id: shoot });
    if (!current) return null;
    if (current.closedAt) return link(shoot, recording) + "&status=closed";
    const index = current.recordings.findIndex(row => row.id === recording);
    if (index < 0) return null;
    if (!arrivalComplete(current) || current.recordings.slice(0, index).some(row => !allChecked(recordingItems, row.checked))) {
      return link(shoot, recording) + "&status=locked";
    }
    const result = await collection.updateOne({ _id: shoot, closedAt: { $exists: false }, "general.revision": current.general.revision, recordings: { $elemMatch: { id: recording, revision } } }, {
      $set: { "recordings.$.checked": checked }, $inc: { "recordings.$.revision": 1 },
    });
    if (!result.matchedCount) return link(shoot, recording) + "&status=conflict";
    const next = current.recordings.slice(index + 1).find(row => !allChecked(recordingItems, row.checked));
    return link(shoot, next?.id ?? "new") + "&status=recording-saved";
  }
  const section = field(form, "section");
  if (section !== "arrival" && section !== "departure") return null;
  const departure = section === "departure";
  const timeField = departure ? "departureTime" : "arrivalTime";
  const time = field(form, timeField);
  const departureNote = departure ? field(form, "departureNote") : "";
  if (!validTime(time) || departureNote.length > 2000) return null;
  const collection = await shoots();
  const current = await collection.findOne({ _id: shoot });
  const sectionUrl = link(shoot) + (departure ? "&checklist=departure" : "");
  if (current?.closedAt) return sectionUrl + "&status=closed";
  if (!current || current.general.revision !== revision) return sectionUrl + "&status=conflict";
  if (departure && !canLeave(current)) return sectionUrl + "&status=locked";
  const own = new Set<string>((departure ? departureItems : arrivalItems).map(([id]) => id));
  if (!time || [...own].some(id => !requested.has(id))) return sectionUrl + "&status=incomplete";
  const checked = current.general.checked.filter(id => !own.has(id));
  checked.push(...[...own].filter(id => requested.has(id)));
  const result = await collection.updateOne({
    _id: shoot, closedAt: { $exists: false }, "general.revision": revision,
    ...(departure ? { recordings: { $size: current.recordings.length } } : {}),
  }, {
    $set: { "general.checked": checked, [`general.${timeField}`]: time, ...(departure ? { closedAt: new Date(), "general.departureNote": departureNote } : {}) },
    $inc: { "general.revision": 1 },
  });
  if (result.matchedCount && departure) return path + "&status=closed";
  if (result.matchedCount && !departure) {
    const next = firstIncompleteRecording(current);
    return `${link(shoot, next?.id ?? "new")}&status=arrival-saved`;
  }
  return `${sectionUrl}&status=${result.matchedCount ? "saved" : "conflict"}`;
}

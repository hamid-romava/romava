import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// ❌ هیچ throw ای در top-level نباید داشته باشیم

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri || "");
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let clientPromise = null;

// فقط وقتی env وجود دارد connect کن
if (uri) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
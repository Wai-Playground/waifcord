// author = shokkunn

import { MongoClient} from "mongodb";

if (!Bun.env.MONGO_URI) throw new Error("MONGO_URI not found in environment variables");
const Mango = new MongoClient(Bun.env.MONGO_URI) as MongoClient;
await Mango.connect();

export default Mango;
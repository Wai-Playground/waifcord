// author = shokkunn
/** 
@todo Redis integration for vss ltm
import { createClient } from "redis";

if (!Bun.env.REDIS_URI) throw new Error("REDIS_URI not found in environment variables");
const Square = createClient({"url": Bun.env.REDIS_URI});
await Square.connect();

export default Square;
*/


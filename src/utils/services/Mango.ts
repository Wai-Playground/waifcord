// author = shokkunn

import { MongoClient} from "mongodb";
import { DatabaseNamespaces } from "../Constants";
import { ActorType } from "../../structs/stage/actors/Actor";
import { UserType } from "../../structs/stage/users/User";
import { RelationshipType } from "../../structs/stage/relationships/Model";

if (!Bun.env.MONGO_URI) throw new Error("MONGO_URI not found in environment variables");
const Mango = (await new MongoClient(Bun.env.MONGO_URI).connect())
const Db = Mango.db(Bun.env.MONGO_DB_NAME || "waifcord")
export default Mango;

// Constant collections
export const ActorsCol = Db.collection<ActorType>(DatabaseNamespaces.actors);
export const RelationshipsCol = Db.collection<RelationshipType>(DatabaseNamespaces.relationships);
export const UsersCol = Db.collection<UserType>(DatabaseNamespaces.users);
export const StagesCol = Db.collection(DatabaseNamespaces.stages);

// author = shokkunn

import { MongoClient} from "mongodb";
import { DatabaseNamespaces } from "../Constants";
import { ActorType } from "../../structs/stage/actors/Actor";
import { RelationshipType } from "../../structs/stage/relationships/Model";
import winston from "winston";

if (!Bun.env.MONGO_URI) throw new Error("MONGO_URI not found in environment variables");
const Mango = (await new MongoClient(Bun.env.MONGO_URI, {monitorCommands: Bun.env.LOG_LEVEL?.toLocaleLowerCase() == "debug"}).connect())
const Db = Mango.db(Bun.env.MONGO_DB_NAME || "waifcord")

// debugs

Mango.on('commandStarted', (event) => {
    winston.debug(`Command Started: ${event.commandName}` + JSON.stringify(event, null, 2));
});

/*
Mango.on('commandSucceeded', (event) => {
    winston.debug(`Command Succeeded: ${event.commandName}` + JSON.stringify(event, null, 2));
});
*/
Mango.on('commandFailed', (event) => {
    winston.debug(`Command Failed: ${event.commandName}` + JSON.stringify(event, null, 2));
});

export default Mango;

// Constant collections
export const ActorsCol = Db.collection<ActorType>(DatabaseNamespaces.actors);
export const RelationshipsCol = Db.collection<RelationshipType>(DatabaseNamespaces.relationships);
export const StagesCol = Db.collection(DatabaseNamespaces.stages);

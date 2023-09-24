// author = shokkunn

import { Database } from "bun:sqlite";
const db = new Database(":memory:");
const db2 = new Database("./assets/database.db");

export async function test() {
    console.time("sqlite");
    const query = db.query("select 'Hello, World!' as greeting;");
    let result = query.get() as { greeting: string };
    console.timeEnd("sqlite");
}

export async function testTwo() {
    console.time("sqlite2");
    const query = db2.query("select 'Hello, World!' as greeting;");
    let result = query.get() as { greeting: string };
    console.timeEnd("sqlite2");
}

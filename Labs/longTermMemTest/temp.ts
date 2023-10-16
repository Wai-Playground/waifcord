// This example demonstrates how to use RediSearch to index and query data
// stored in Redis hashes using vector similarity search.
//
// Inspired by RediSearch Python tests:
// https://github.com/RediSearch/RediSearch/blob/06e36d48946ea08bd0d8b76394a4e82eeb919d78/tests/pytests/test_vecsim.py#L96

import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';

const client = createClient();

await client.connect();


import OpenAI from "openai";

const oC = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});

// Create an index...
try {
    // Documentation: https://redis.io/docs/stack/search/reference/vectors/
    await client.ft.create('idx:knn-example', {
        v: {
            type: SchemaFieldTypes.VECTOR,
            ALGORITHM: VectorAlgorithms.HNSW,
            TYPE: 'FLOAT32',
            DIM: 1536,
            DISTANCE_METRIC: 'COSINE'
        }
    }, {
        ON: 'HASH',
        PREFIX: 'noderedis:knn'
    });
} catch (e: any) {
    if (e.message === 'Index already exists') {
        console.log('Index exists already, skipped creation.');
    } else {
        // Something went wrong, perhaps RediSearch isn't installed...
        console.error(e);
        process.exit(1);
    }
}

function float32Buffer(arr: number[]) {
    return Buffer.from(new Float32Array(arr).buffer);
}

async function embed(str: string) {
    return (await oC.embeddings.create({
        "input": str,
        "model": 'text-embedding-ada-002'
    })).data[0].embedding;
}

// Add some sample data...
// https://redis.io/commands/hset/
await Promise.all([
    client.hSet('noderedis:knn:hello_world', { v: float32Buffer(await embed("hello world")) }),
    client.hSet('noderedis:knn:suck_hahah', { v: float32Buffer(await embed("I suck hahaha")) }),
    client.hSet('noderedis:knn:bike_ride', { v: float32Buffer(await embed("User requested bike ride")) }),
]);
// Perform a K-Nearest Neighbors vector similarity search
// Documentation: https://redis.io/docs/stack/search/reference/vectors/#pure-knn-queries
const results = await client.ft.search('idx:knn-example', '*=>[KNN 9 @v $BLOB AS dist]', {
    PARAMS: {
        BLOB: float32Buffer(await embed("MONKEY MONKEY"))
    },
    SORTBY: 'dist',
    DIALECT: 2,
    RETURN: ['dist']
});
console.log(JSON.stringify(results, null, 2));
// results:
// {
//   "total": 4,
//   "documents": [
//     {
//       "id": "noderedis:knn:a",
//       "value": {
//         "dist": "5.96046447754e-08"
//       }
//     },
//     {
//       "id": "noderedis:knn:b",
//       "value": {
//         "dist": "0.0513167381287"
//       }
//     },
//     {
//       "id": "noderedis:knn:c",
//       "value": {
//         "dist": "0.10557281971"
//       }
//     },
//     {
//       "id": "noderedis:knn:d",
//       "value": {
//         "dist": "0.142507016659"
//       }
//     }
//   ]
// }
await client.quit();
import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';
import data from "./temp.json"
const client = createClient();

await client.connect();

// Create an index...
try {
    // Documentation: https://redis.io/docs/stack/search/reference/vectors/
    await client.ft.create('idx:knn-example', {
        sesh: {
            type: SchemaFieldTypes.TEXT,
            WEIGHT: 1,
            NOSTEM: true
        },
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

// Add some sample data...
// https://redis.io/commands/hset/
await Promise.all([
    client.hSet('noderedis:knn:truth', { v: float32Buffer(data.truthy) }),
    client.hSet('noderedis:knn:dummy', { v: float32Buffer(data.dummy) }),
    client.hSet('noderedis:knn:dummyTwo', { v: float32Buffer(data.dummyTwo) }),
]);
// Perform a K-Nearest Neighbors vector similarity search
// Documentation: https://redis.io/docs/stack/search/reference/vectors/#pure-knn-queries
const results = await client.ft.search('idx:knn-example', '*=>[KNN 4 @v $BLOB AS dist]', {
    PARAMS: {
        BLOB: float32Buffer(data.search)
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
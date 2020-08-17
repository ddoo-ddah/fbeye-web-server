const mongodb = require('mongodb');

const objectId = mongodb.ObjectId;
const timestamp = mongodb.Timestamp;

async function getClient() {
    const mongoClient = await mongodb.MongoClient.connect("mongodb://localhost:27017/fbeye");
    return new Promise((resolve, reject) => {
        if (mongoClient) {
            resolve(mongoClient);
        } else {
            reject(new Error('Could not connect to the database.'));
        }
    });
};

module.exports = {
    objectId, timestamp, getClient
};

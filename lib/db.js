const mongodb = require('mongodb');

const objectId = mongodb.ObjectId;
const timestamp = mongodb.Timestamp;

function connect() {
    return new Promise(async (resolve, reject) => {
        const mongoClient = await mongodb.MongoClient.connect('mongodb://localhost:27017/fbeye');
        if (mongoClient) {
            resolve(mongoClient);
        } else {
            reject(new Error('Could not connect to the database.'));
        }
    });
};

module.exports = {
    objectId, timestamp, connect
};

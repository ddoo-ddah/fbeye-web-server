const db = require('../lib/db');
const crypto = require('../lib/crypto');

function signIn(email, password) {
    return new Promise(async (resolve, reject) => {
        if (email && password) {
            const client = await db.connect();
            const doc = await client.db().collection('admin').findOne({
                email
            }, {
                projection: {
                    _id: false,
                    email: true,
                    password: true
                }
            });
            await client.close();

            const digest = await crypto.scrypt(password, 'my salt', 32);
            resolve(doc && (digest.compare(doc.password.buffer) === 0));
        } else {
            reject(new Error('Failed to sign in'));
        }
    });
}

module.exports = {
    signIn
};

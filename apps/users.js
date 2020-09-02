const db = require('../lib/db');
const crypto = require('../lib/crypto');

function signIn(email, password) { // 로그인
    return new Promise(async (resolve, reject) => {
        if (email && password) {
            email = email.toLowerCase();
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

function signUp(user) { // 회원가입
    return new Promise(async (resolve, reject) => {
        if (user && user.email && user.password) {
            user.email = user.email.toLowerCase();
            const client = await db.connect();
            if (!await client.db().collection('admin').findOne({
                email: user.email
            }, {
                projection: {
                    _id: false,
                    email: true
                }
            })) {
                user.password = await crypto.scrypt(user.password, 'my salt', 32);
                const result = await client.db().collection('admin').insertOne(user);
                await client.close();
                resolve(true);
            } else {
                await client.close();
                resolve(false);
            }
        } else {
            reject(new Error('Failed to sign up.'));
        }
    });
}

function escape(email, password) { // 회원탈퇴
    return new Promise(async (resolve, reject) => {
        if (email && password) {
            email = email.toLowerCase();
            if (await signIn(email, password)) {
                const client = await db.connect();
                const result = await client.db().collection('admin').deleteOne({
                    email
                });
                await client.close();
                resolve(result.deletedCount === 1);
            } else {
                resolve(false);
            }
        } else {
            reject(new Error('Failed to escape.'));
        }
    });
}

module.exports = {
    signIn, signUp, escape
};

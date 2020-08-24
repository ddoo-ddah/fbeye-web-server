const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

function createKey(password) {
    return new Promise(async (resolve, reject) => {
        const key = await scrypt(password, salt, 32);
        if (key) {
            resolve(key);
        } else {
            reject('Failed to create key.');
        }
    });
}

function encrypt(data, key, encoding) {
    return new Promise((resolve, reject) => {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
        let encrypted = cipher.update(data, encoding, 'binary');
        encrypted += cipher.final('binary');
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt data.'));
        }
    });
}

function decrypt(encrypted, key, encoding) {
    return new Promise((resolve, reject) => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
        let decrypted = decipher.update(encrypted, 'binary', encoding);
        decrypted += decipher.final(encoding);
        if (decrypted) {
            resolve(decrypted);
        } else {
            reject(new Error('Failed to decrypt data.'));
        }
    });
}

module.exports = {
    randomBytes, scrypt, createKey, encrypt, decrypt
};

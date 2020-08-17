const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

async function createKey(password) {
    const key = await scrypt(password, salt, 32);
    return new Promise((resolve, reject) => {
        if (key) {
            resolve(key);
        } else {
            reject('Failed to create key.');
        }
    });
}

function encrypt(data, key, encoding) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, encoding, 'binary');
    encrypted += cipher.final('binary');
    return new Promise((resolve, reject) => {
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt data.'));
        }
    });
}

function decrypt(encrypted, key, encoding) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(encrypted, 'binary', encoding);
    decrypted += decipher.final(encoding);
    return new Promise((resolve, reject) => {
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

const crypto = require('crypto');

const ENCRYPTION_KEY = 'bMLRbYH3agueJyUchqN9zW8Uch8tZYku';
const SALT = 'v749FLmFzUekad7y';
const IV_LENGTH = 16;

const NONCE_LENGTH = 1; // Gives us 8-character Base64 output. The higher this number, the better

function encrypt(key, text) {
    const nonce = crypto.randomBytes(NONCE_LENGTH);
    const iv = Buffer.alloc(IV_LENGTH);
    nonce.copy(iv);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = cipher.update(text.toString());
    const message = Buffer.concat([nonce, encrypted, cipher.final()]);
    return message.toString('base64');
}

function decrypt(key, text) {
    const message = Buffer.from(text, 'base64');
    const iv = Buffer.alloc(IV_LENGTH);
    message.copy(iv, 0, 0, NONCE_LENGTH);
    const encryptedText = message.slice(NONCE_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
    let decrypted = decipher.update(encryptedText);
    try {
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (Err) {
        return 'NULL';
    }
}

// You could do this one time and record the result. Or you could just
// generate a random 32-byte key and record that. But you should never
// pass an ASCII string to the encryption function.
const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, SALT, 10000, 32, 'sha512');

exports.encryptThis = string => {
    return encrypt(key, string);
};
// console.log(encrypted + ' : ' + encrypted.length);

exports.decryptThis = string => {
    return decrypt(key, string);
};
// console.log(decrypted);

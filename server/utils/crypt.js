const crypto = require('crypto');

const ENCRYPTION_KEY = 'ajl3232ASDasd1214GbASd'; // Must be 256 bits (32 characters)
const IV_LENGTH = 32; // For AES, this is always 16

const encrypt = text => {
    var cipher = crypto.createCipheriv(
        'aes-256-cbc',
        new Buffer('passwordpasswordpasswordpassword'),
        new Buffer('vectorvector1234')
    );
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

const decrypt = text => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

exports.encrypt = encrypt;
exports.decrypt = decrypt;

// const hw = encrypt("hello world")
// outputs hello world
// console.log(decrypt(hw));

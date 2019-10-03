const fetch = require('./fetch');

module.exports = options =>
    new Promise((resolve, reject) => {
        fetch(options, resolve, reject);
    });

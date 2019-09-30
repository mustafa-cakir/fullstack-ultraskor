const fetch = require('./fetch');

module.exports = query =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            uri: `https://www.sofascore.com${query}?_=${Math.floor(Math.random() * 10e8)}`,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.sofascore.com',
                referer: 'https://www.sofascore.com/',
                'x-requested-with': 'XMLHttpRequest'
            },
            timeout: 10000
        };
        fetch(options, resolve, reject);
    });

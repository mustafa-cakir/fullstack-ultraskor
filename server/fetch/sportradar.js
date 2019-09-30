const moment = require('moment');
const fetch = require('./fetch');

module.exports = date =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://ls.betradar.com',
                Referer: 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page'
            },
            uri: `https://ls.fn.sportradar.com/tempobet/tr/Europe:Istanbul/gismo/sport_matches/1/${date}/1`,
            json: true,
            timeout: 10000
        };
        fetch(options, resolve, reject);
    });

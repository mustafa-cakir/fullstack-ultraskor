const fetch = require('./fetch');

const fetchSportRadar = query =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://ls.betradar.com',
                Referer: 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page'
            },
            uri: `https://ls.fn.sportradar.com/tempobet${query}`,
            json: true,
            timeout: 10000
        };
        fetch(options, resolve, reject);
    });

exports.fetchSportRadar = fetchSportRadar;

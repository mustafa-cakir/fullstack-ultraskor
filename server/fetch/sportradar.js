const fetch = require('./fetch');

const fetchSportRadar = (query, cacheDuration) =>
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
        const cache = cacheDuration
            ? {
                  cacheKey: query,
                  cacheDuration
              }
            : null;

        fetch(options, resolve, reject, cache);
    });

exports.fetchSportRadar = fetchSportRadar;

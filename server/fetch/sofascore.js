const fetch = require('./fetch');

const fetchSofaScore = (query, cacheDuration) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            uri: `https://www.sofascore.com${query}?_=${String(new Date().getTime()).substring(0, 9)}`,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.sofascore.com',
                referer: 'https://www.sofascore.com/',
                'x-requested-with': 'XMLHttpRequest'
            },
            timeout: 10000
        };
        const cache = cacheDuration
            ? {
                  cacheKey: `cache-${query}`,
                  cacheDuration
              }
            : null;

        fetch(options, resolve, reject, cache);
    });
};

exports.fetchSofaScore = fetchSofaScore;

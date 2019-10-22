const fetch = require('./fetch');

const fetchSofaScore = (query, cacheDuration, isTor) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            uri: `https://www.sofascore.com${query}?_=${String(new Date().getTime()).substring(0, 9)}`,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.sofascore.com',
                referer: 'https://www.sofascore.com/',
                'x-requested-with': 'XMLHttpRequest',
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
            },
            timeout: 10000
        };
        const cache = cacheDuration
            ? {
                  cacheKey: `cache-${query}`,
                  cacheDuration
              }
            : null;

        fetch(options, resolve, reject, cache, isTor);
    });
};

exports.fetchSofaScore = fetchSofaScore;

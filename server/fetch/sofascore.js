const fetch = require('./fetch');

const fetchSofaScore = (query, cacheDuration, isTor = false) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            json: true,
            uri: `https://www.sofascore.com${query}?_=${String(new Date().getTime()).substring(0, 9)}`,
            header: {
                referer: 'https://www.sofascore.com/',
                Origin: 'https://www.sofascore.com/',
                userAgent:
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
            }
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

const fetch = require('./fetch');

const fetchSofaScore = (query, cacheDuration, isTor = true) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            json: true,
            uri: `https://www.sofascore.com${query}?_=${String(new Date().getTime()).substring(0, 9)}`
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

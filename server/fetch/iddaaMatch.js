const fetch = require('./fetch');

const fetchIddaaMatch = (query, cacheDuration, isTor) =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            uri: `https://api.iddaa.com.tr/sportsprogram/${query}`,
            json: true,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.iddaa.com.tr',
                referer: 'https://www.iddaa.com.tr/canli-futbol-programi',
                'x-requested-with': 'XMLHttpRequest'
            }
        };
        const cache = cacheDuration
            ? {
                  cacheKey: query,
                  cacheDuration
              }
            : null;

        fetch(options, resolve, reject, cache, isTor);
    });

exports.fetchIddaaMatch = fetchIddaaMatch;

const fetch = require('./fetch');
const { generateSlug } = require('../utils');

const fetchSportRadar = (query, cacheDuration, isTor) =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://ls.betradar.com',
                Referer: 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page'
            },
            // uri: `https://ls.fn.sportradar.com/tempobet${query}`,
            uri: `https://lsc.fn.sportradar.com/betradar${query}`,
            json: true,
            timeout: 10000
        };
        const cache = cacheDuration
            ? {
                  cacheKey: generateSlug(query),
                  cacheDuration
              }
            : null;

        fetch(options, resolve, reject, cache, isTor);
    });

exports.fetchSportRadar = fetchSportRadar;

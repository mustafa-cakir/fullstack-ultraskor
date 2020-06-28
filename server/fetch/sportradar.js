const fetch = require('./fetch');
const { generateSlug } = require('../utils');

const fetchSportRadar = (query, cacheDuration, isTor) =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://ls.betradar.com',
                Referer: 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page',
            },
            // uri: `https://ls.fn.sportradar.com/tempobet${query}`,
            uri: `https://lsc.fn.sportradar.com/betradar${query}`,
            json: true,
            timeout: 10000,
        };
        const cache = cacheDuration
            ? {
                  cacheKey: generateSlug(query),
                  cacheDuration,
              }
            : null;

        fetch(options, resolve, reject, cache, isTor);
    });

const fetchSportRadarS5 = (language, query, cacheDuration, isTor) =>
    new Promise((resolve, reject) => {
        console.log('query => ', query);
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://s5.sir.sportradar.com',
                Referer: 'https://s5.sir.sportradar.com/tempobet',
            },
            // uri: `https://ls.fn.sportradar.com/tempobet${query}`,
            uri: `https://stats.fn.sportradar.com/tempobet/${language}/Europe:Berlin/gismo/${query}`,
            json: true,
            timeout: 10000,
        };

        const cache = cacheDuration
            ? {
                  cacheKey: generateSlug(`${language}-${query}`),
                  cacheDuration,
              }
            : null;
        console.log('URI => ', options.uri);
        fetch(options, resolve, reject, cache, isTor);
    });

exports.fetchSportRadar = fetchSportRadar;
exports.fetchSportRadarS5 = fetchSportRadarS5;

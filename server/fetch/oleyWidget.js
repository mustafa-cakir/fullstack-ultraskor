const fetch = require('./fetch');

const fetchOleyWidget = (query, cacheDuration) =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            uri: `https://widget.oley.com/match/${query}`,
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

exports.fetchOleyWidget = fetchOleyWidget;

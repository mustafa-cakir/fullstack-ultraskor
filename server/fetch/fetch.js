const tor = require('tor-request');
const cloudscraper = require('cloudscraper');
const Agent = require('socks5-https-client/lib/Agent');
const cacheService = require('../services/cache.service');
const { isDev } = require('../utils');

tor.TorControlPort.password = 'muztafultra';
let maxRetry = 20;

module.exports = (options, resolve, reject, cache, isTor = false) => {
    const onSuccess = response => {
        if (cache && response) {
            cacheService.instance().set(cache.cacheKey, response, cache.cacheDuration);
            if (isDev) console.log(`## Cached: ${cache.cacheKey}`);
        }
        resolve(response);
    };
    const onError = () => {
        reject('Error - 500');
    };

    const remoteRequest = () => {
        cloudscraper(options)
            .then(onSuccess)
            .catch(onError);
    };

    const remoteRequestUsingTor = () => {
        tor.request(options, (err, status, response) => {
            if (!err && status.statusCode === 200) {
                maxRetry = 20;
                onSuccess(response);
            } else if (maxRetry > 0) {
                setTimeout(() => {
                    maxRetry -= 1;
                    console.log(`## Failed on Request, TOR is refreshing! maxRetry is currently: ${maxRetry} `);
                    tor.newTorSession((torError, torResponse) => {
                        if (!torError && torResponse) {
                            console.log(`## TOR refreshed! New IP: `, torResponse);
                            remoteRequestUsingTor();
                        } else {
                            onError();
                        }
                    });
                }, 2000);
            } else {
                onError();
            }
        });
    };

    const cachedData = cache ? cacheService.instance().get(cache.cacheKey) : null;
    if (cachedData) {
        if (isDev) console.log(`<-- Served from cache: ${cache.cacheKey}`);
        resolve(cachedData);
    } else if (isTor) {
        remoteRequestUsingTor();
    } else {
        remoteRequest();
    }
};

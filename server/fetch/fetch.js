const tor = require('tor-request');
const request = require('request-promise-native');
const Agent = require('socks5-https-client/lib/Agent');
const cacheService = require('../services/cache.service');
const { isDev } = require('../utils');

tor.TorControlPort.password = 'muztafultra';
let maxRetry = 100;
let isIdle = true;

module.exports = (options, resolve, reject, cache, isTor = false) => {
    const onSuccess = (response) => {
        if (cache && response) {
            const duration =
                response.doc && response.doc[0] && response.doc[0]._maxage
                    ? response.doc[0]._maxage
                    : cache.cacheDuration;
            cacheService.instance().set(cache.cacheKey, response, duration);
            if (isDev) console.log(`## ${cache.cacheKey} is cached for: ${duration} seconds`);
        }
        resolve(response);
    };
    const onError = (err) => {
        if (isDev) console.log(`## Error on ${cache.cacheKey}: ${err}`);
        reject('Error - 500');
    };

    const remoteRequest = () => {
        request(options).then(onSuccess).catch(onError);
    };

    const remoteRequestUsingTor = () => {
        tor.request(options, (err, status, response) => {
            if (!err && status.statusCode === 200) {
                onSuccess(response);
            } else if (maxRetry > 0 && isIdle) {
                maxRetry -= 1;
                console.log(`## Failed on Request, TOR is refreshing! maxRetry is currently: ${maxRetry} `);
                isIdle = false;
                tor.newTorSession((torError, torResponse) => {
                    isIdle = true;
                    if (!torError && torResponse) {
                        maxRetry = 100;
                        console.log(`## TOR refreshed! New IP: `, torResponse);
                        remoteRequestUsingTor();
                    } else {
                        onError();
                    }
                });
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

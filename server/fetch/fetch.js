const tor = require('tor-request');
const request = require('request-promise-native');
const cacheService = require('../cache.service');
const { isDev } = require('../helper');
const { isTorDisabled } = require('../helper');

tor.TorControlPort.password = 'muztafultra';

module.exports = (options, resolve, reject, cache) => {
    const onSuccess = response => {
        if (cache && response) {
            cacheService.instance().set(cache.cacheKey, response, cache.cacheDuration);
            console.log(`${cache.cacheKey} is cached!`);
        }

        resolve(response);
    };
    const onError = () => reject(Error('501'));

    const remoteRequest = () => {
        console.log('## fetch sofaScore: ', options.uri);
        if (isTorDisabled) {
            request(options)
                .then(onSuccess)
                .catch(onError);
        } else {
            tor.request(options, (err, status, res) => {
                if (!err && status.statusCode === 200) {
                    onSuccess(res);
                } else {
                    onError(err);
                }
            });
        }
    };

    const cachedData = cache ? cacheService.instance().get(cache.cacheKey) : null;
    if (cachedData) {
        if (isDev) console.log(`--> ${cache.cacheKey} data is served from cached!`);
        resolve(cachedData);
    } else {
        remoteRequest();
    }
};

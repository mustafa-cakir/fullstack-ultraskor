const tor = require('tor-request');
const request = require('request-promise-native');
const cacheService = require('../cache.service');
const { isDev } = require('../helper');
const { isTorDisabled } = require('../helper');
const Agent = require('socks5-https-client/lib/Agent');

tor.TorControlPort.password = 'muztafultra';

module.exports = (options, resolve, reject, cache, isTor) => {
    const onSuccess = response => {
        if (cache && response) {
            cacheService.instance().set(cache.cacheKey, response, cache.cacheDuration);
            if (isDev) console.log(`${cache.cacheKey} is cached!`);
        }

        resolve(response);
    };
    const onError = () => reject(Error('501'));

    const remoteRequest = () => {
        if (isDev) console.log('## fetch init: ', options.uri);

        options.agentClass = Agent;
        options.agentOptions = {
            socksHost: 'localhost',
            socksPort: 9050
        };

        request(options)
            .then(onSuccess)
            .catch(onError);

        // if (!isTorDisabled && isTor) {
        //     tor.request(options, (err, status, res) => {
        //         if (!err && status.statusCode === 200) {
        //             onSuccess(res);
        //         } else {
        //             onError(err);
        //         }
        //     });
        // } else {
        //     request(options)
        //         .then(onSuccess)
        //         .catch(onError);
        // }
    };

    const cachedData = cache ? cacheService.instance().get(cache.cacheKey) : null;
    if (cachedData) {
        if (isDev) console.log(`--> ${cache.cacheKey} data is served from cached!`);
        resolve(cachedData);
    } else {
        remoteRequest();
    }
};

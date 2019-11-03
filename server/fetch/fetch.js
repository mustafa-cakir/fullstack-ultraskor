const tor = require("tor-request");
const cloudscraper = require("cloudscraper");
const Agent = require("socks5-https-client/lib/Agent");
const cacheService = require("../services/cache.service");
const { isDev } = require("../utils");

tor.TorControlPort.password = "muztafultra";

module.exports = (options, resolve, reject, cache, isTor = false) => {
    const onSuccess = response => {
        if (cache && response) {
            cacheService.instance().set(cache.cacheKey, response, cache.cacheDuration);
            if (isDev) console.log(`## Cached: ${cache.cacheKey}`);
        }
        resolve(response);
    };
    const onError = err => {
        reject(Error(isDev ? err : "501"));
    };

    const remoteRequest = () => {
        if (isDev) console.log("--> Fetch init: ", options.uri);
        if (isTor) {
            if (isDev) console.log("cloudscraper request using tor");
            options.agentClass = Agent;
            options.agentOptions = {
                socksHost: "localhost",
                socksPort: 9050
            };
        }
        cloudscraper(options)
            .then(onSuccess)
            .catch(onError);
    };

    const cachedData = cache ? cacheService.instance().get(cache.cacheKey) : null;
    if (cachedData) {
        if (isDev) console.log(`<-- Served from cache: ${cache.cacheKey}`);
        resolve(cachedData);
    } else {
        remoteRequest();
    }
};

const fetch = require("./fetch");
const { cacheDuration } = require("../utils");

const fetchIddaaMatch = (isLive, iddaaId, isTor) =>
    new Promise((resolve, reject) => {
        const options = {
            method: "GET",
            uri: `https://api.iddaa.com.tr/sportsprogram/${isLive ? "live/" : ""}markets/1/${iddaaId}`,
            json: true,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
                Origin: "https://www.iddaa.com.tr",
                referer: "https://www.iddaa.com.tr/canli-futbol-programi",
                "x-requested-with": "XMLHttpRequest"
            }
        };
        const cache = {
            cacheKey: `iddaa-match-${isLive ? "live" : ""}-${iddaaId}`,
            cacheDuration: isLive ? cacheDuration.sec15 : cacheDuration.day7
        };

        fetch(options, resolve, reject, cache, isTor);
    });

exports.fetchIddaaMatch = fetchIddaaMatch;

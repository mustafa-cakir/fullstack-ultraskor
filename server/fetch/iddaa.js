const fetch = require("./fetch");

const fetchIddaaFull = (date, cacheDuration, isTor) =>
    new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            uri: `https://api.iddaa.com.tr/sportsprogram/1`,
            body: ["1_1", "2_87", "2_101_2.5", "2_89"],
            json: true,
            headers: {
                "Content-Type": "application/json",
                Origin: "https://www.iddaa.com.tr",
                Referer: "https://www.iddaa.com.tr/futbol-programi",
                "Sec-Fetch-Mode": "cors"
            }
        };
        const cache = cacheDuration
            ? {
                  cacheKey: `iddaa-full-${date}`,
                  cacheDuration
              }
            : null;
        fetch(options, resolve, reject, cache, isTor);
    });

exports.fetchIddaaFull = fetchIddaaFull;

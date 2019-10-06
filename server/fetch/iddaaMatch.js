const fetch = require('./fetch');

const fetchIddaaMatch = query =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            uri: `https://api.iddaa.com.tr/sportsprogram/${query}`,
            json: true,
            timeout: 10000,
            headers: {
                Origin: 'https://www.iddaa.com.tr',
                Referer: 'https://www.iddaa.com.tr/canli-futbol-programi'
            }
        };
        fetch(options, resolve, reject);
    });

exports.fetchIddaaMatch = fetchIddaaMatch;

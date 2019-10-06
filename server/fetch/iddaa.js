const fetch = require('./fetch');

const fetchIddaaMatch = query =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            uri: `https://api.iddaa.com.tr/sportsprogram/1`,
            body: ['1_1', '2_87', '2_101_2.5', '2_89'],
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.iddaa.com.tr',
                Referer: 'https://www.iddaa.com.tr/futbol-programi',
                'Sec-Fetch-Mode': 'cors'
            }
        };
        fetch(options, resolve, reject);
    });

exports.fetchIddaaMatch = fetchIddaaMatch;

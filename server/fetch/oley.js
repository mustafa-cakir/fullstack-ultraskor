const moment = require('moment');
const fetch = require('./fetch');

const fetchOley = date =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            // uri: 'https://brdg-c1884f68-d545-4103-bee0-fbcf3d58c850.azureedge.net/livescore/matchlist', // oley
            uri: 'https://brdg-d2d66d21-7796-4d6c-a6d5-7fee80f9d915.azureedge.net/livescore/matchlist', // ntvspor
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.ntvspor.net',
                Referer: 'https://www.ntvspor.net/canli-skorlar'
            },
            body: JSON.stringify({
                // coverageId: '6bf0cf44-e13a-44e1-8008-ff17ba6c2128', // oley
                coverageId: 'ab1450da-9d77-479c-8ab7-f46b2533b2dc', // ntvspor
                options: {
                    lang: 'tr-TR',
                    betCode: true,
                    sportId: 1,
                    day: moment(date, 'YYYY-MM-DD').format('MM/DD/YYYY'),
                    origin: 'ntvspor.net',
                    timeZone: 3
                }
            }),
            json: true,
            timeout: 10000
        };
        fetch(options, resolve, reject);
    });

exports.fetchOley = fetchOley;

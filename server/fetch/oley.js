const moment = require('moment');
const fetch = require('./fetch');

const fetchOley = date =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            uri: 'https://brdg-c1884f68-d545-4103-bee0-fbcf3d58c850.azureedge.net/livescore/matchlist',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.broadage.com'
            },
            body: JSON.stringify({
                coverageId: '6bf0cf44-e13a-44e1-8008-ff17ba6c2128',
                options: {
                    sportId: 1,
                    day: moment(date, 'YYYY-MM-DD').format('MM/DD/YYYY'),
                    origin: 'broadage.com',
                    timeZone: 3
                }
            }),
            json: true,
            timeout: 10000
        };
        fetch(options, resolve, reject);
    });

exports.fetchOley = fetchOley;

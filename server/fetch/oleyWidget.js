const fetch = require('./fetch');

const fetchOleyWidget = query =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            uri: `https://widget.oley.com/match/${query}`,
            json: true,
            timeout: 10000
        };
        fetch(options, resolve, reject);
    });

exports.fetchOleyWidget = fetchOleyWidget;

const express = require('express');
const request = require('request');
// create express app
const app = express();

// define a simple route
app.get('*', (req, res) => {

    // let path = req.originalUrl;
	// path = path.substring(11, path.length);
	// console.log(path);

	let options = {
        url: 'https://widgets.sir.sportradar.com/' + path,
        headers: {
            'Referer': 'https://www.aspor.com.tr',
            'Origin': 'https://www.aspor.com.tr',
            'Access-Control-Allow-Origin': '*'
        }
    };

    if (path.indexOf('common_widgets') > -1) {
        options.url = 'https://www.ultraskor.com/static/live-match/common_widgets.js';
    }

    //console.log(options.url);
    request(options, function (error, response, body) {
        res.header('Access-Control-Allow-Origin', '*');

        if (path.indexOf('translations') > -1) {
            res.header("Content-Type", "application/json; charset=utf-8");
        } else if (path.indexOf('licensing') > -1) {
            res.header("Content-Type", "text/plain; charset=utf-8");
        } else {
            res.header("Content-Type", "application/javascript; charset=utf-8");
        }
        res.send(body);
    });

});

// listen for requests
app.listen(5002, () => {
    console.log("Server is listening on port 5002");
});



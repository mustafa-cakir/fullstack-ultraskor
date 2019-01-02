const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const request = require('request');
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const whitelist = [
    'http://localhost:3000',
    'https://www.canliskor.io',
    'http://www.canliskor.io',
    'https://canliskor.io',
    'http://canliskor.io'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};

app.use(cors(corsOptions));

// API calls
app.get('/api/ba/:sportId/:date', (req, res) => {

    const headers = {
        'Content-Type': 'application/json',
        'Origin': 'https://oley.com',
    };

    const resources = {
        "coverageId": "6bf0cf44-e13a-44e1-8008-ff17ba6c2128",
        "options": {
            "lang": "tr-TR",
            "grouping": "date",
            "betCode": true,
            "sportId": 1,
            "day": req.params.date.replace(/\./g, "/"),
            "origin": "https://mobil.oley.com",
            "timeZone": 3
        }
    };

    const options = {
        method: 'POST',
        url: 'https://brdg-ae03a315-b8e3-454d-8985-0f59b1c8f86b.azureedge.net/livescore/matchlist',
        headers: headers,
        body: JSON.stringify(resources)
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
        }
    });

});

// API calls
app.get('/api/sr/:sportId/:date', (req, res) => {
    request(`http://www.hurriyet.com.tr/api/spor/sporlivescorejsonlist/?sportId=${req.params.sportId}&date=${req.params.date}`, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
        }
    });
});

app.get('/api/', (req, res) => {
    request(`https://www.sofascore.com${req.query.api}?_=${Math.floor(Math.random() * 10e8)}`, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
        }
    });
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}
app.listen(port, () => console.log(`Listening on port ${port}`));

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const _ = require('lodash');

const request = require('request');
const requestPromise = require('request-promise-native');
const port = process.env.PORT || 5000;
const MongoClient = require('mongodb').MongoClient;
const cacheService = require('./cache.service');
const cacheDuration = 60 * 60 * 24; // Cache duration, 24 hours

let db;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const whitelist = [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://www.ultraskor.com',
    'http://www.ultraskor.com',
    'https://ultraskor.com',
    'http://ultraskor.com',
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

cacheService.start(function (err) {
    if (err) console.error('cache service failed to start', err);
});

const {MONGO_USER, MONGO_PASSWORD, MONGO_IP} = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    keepAlive: 1,
    connectTimeoutMS: 1000,
    socketTimeoutMS: 1000,
};

const replaceDotWithUnderscore  = (obj) => {
    _.forOwn(obj, (value, key) => {

        // if key has a period, replace all occurences with an underscore
        if (_.includes(key, '.')) {
            const cleanKey = _.replace(key, /\./g, '_');
            obj[cleanKey] = value;
            delete obj[key];
        }

        // continue recursively looping through if we have an object or array
        if (_.isObject(value)) {
            return replaceDotWithUnderscore(value);
        }
    });
    return obj;
};

// Initialize connection once
MongoClient.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:27017`, mongoOptions, function (err, client) {
    if (!err) {
        db = client.db('ultraskor');
    }
    // Start the application after the database connection is ready
    app.listen(port, () => console.log(`Listening on port ${port}`));
});



app.get('/api/', (req, res) => {
    const sofaScoreOptions = {
        method: 'GET',
        uri: `https://www.sofascore.com${req.query.api}?_=${Math.floor(Math.random() * 10e8)}`,
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://www.sofascore.com',
            'referer': 'https://www.sofascore.com/',
            'x-requested-with': 'XMLHttpRequest'
        }
    };

    let cacheKey = `cacheKey-${req.query.api}`;

    cacheService.instance().get(cacheKey, (err, value) => {
        if (err) console.error(err);

        if (typeof value !== "undefined") { // Cache is found, serve the data from cache
            res.send(value);
            //console.log('checkpoint 2');
        } else { // Cache is not found
            requestPromise(sofaScoreOptions)
                .then(body => {
                    cacheService.instance().set(cacheKey, body, cacheDuration);
                    res.send(body);
                })
                .catch(err => {
                    res.status(500).send({
                        status: "error",
                        message: 'Error while retrieving information from server' + err.message
                    })
                });
        }
    });


});

app.get('/api/helper/:date1/:date2', (req, res) => {
    let cacheKey = 'helperData-' + req.params.date1;

    const initRemoteRequests = () => {
        const provider1options = {
            method: 'GET',
            uri: `http://www.hurriyet.com.tr/api/spor/sporlivescorejsonlist/?sportId=1&date=${req.params.date1}`,
            json: true,
            timeout: 1500
        };
        const provider2options = {
            method: 'POST',
            uri: 'https://brdg-c1884f68-d545-4103-bee0-fbcf3d58c850.azureedge.net/livescore/matchlist',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://www.broadage.com',
            },
            body: JSON.stringify({
                "coverageId": "6bf0cf44-e13a-44e1-8008-ff17ba6c2128",
                "options": {
                    "sportId": 1,
                    "day": req.params.date2.replace(/\./g, "/"),
                    "origin": "broadage.com",
                    "timeZone": 3
                }
            }),
            json: true,
            timeout: 1500
        };
        const provider3options = {
            method: 'GET',
            uri: `https://www.tuttur.com/draw/events/type/football`,
            json: true,
            timeout: 1500
        };

        let jsonData = {};

        requestPromise(provider1options)
            .then(body => {
                jsonData.provider1 = (body && body.data) ? body.data : null;
            })
            .catch(err => {
                // do nothing, just proceed
            })
            .then(() => {
                return requestPromise(provider2options)
                    .then(body => {
                        jsonData.provider2 = (body && body.initialData) ? body.initialData : null;
                    })
                    .catch(() => {
                        // do nothing, just proceed
                    })
            })
            .then(() => {
                return requestPromise(provider3options)
                    .then(body => {
                        if (body) {
                            jsonData.provider3 = replaceDotWithUnderscore(body.events);
                        }
                    })
                    .catch(() => {
                        // do nothing just proceed
                    })
            })
            .then(() => {
                if (jsonData.provider1 || jsonData.provider2 || jsonData.provider3) { // check if any provider return anything
                    if (jsonData.provider1 && jsonData.provider2) { // check if all providers return data
                        cacheService.instance().set(cacheKey, jsonData, cacheDuration); // cache the data!
                        if (db) {  // insert into db!
                            let dbData = {};
                            dbData["date"] = req.params.date1;
                            dbData["data"] = jsonData;
                            let collection = db.collection('matchlistbydate');
                            try {
                                collection.insertOne(dbData, (error, result) => {
                                    //console.log(error);
                                    res.send(jsonData); // serve the data
                                })
                            } catch (e) {
                                //console.log('errorr');
                            }
                        } else {
                            //console.log('can not connected to db, but serve it anyway');
                            res.send(jsonData);
                        }
                    }
                } else {
                    res.status(500).send({ // none of them return anything, so serve 500 error message
                        status: "error",
                        message: 'Error while retrieving information from servers',
                        reason: 'Both data Providers (No.1 and No.2) are broken',
                    })
                }
            });
    };

    cacheService.instance().get(cacheKey, (err, value) => {
        if (err) console.error(err);

        if (typeof value !== "undefined") { // Cache is found, serve the data from cache
            res.send(value);
            //console.log('checkpoint 2');
        } else { // Cache is not found
            if (db) {
                let collection = db.collection('matchlistbydate');
                collection
                    .findOne({"date": req.params.date1})
                    .then(result => {
                        if (result && result.data) {
                            cacheService.instance().set(cacheKey, result.data, cacheDuration, () => {
                                res.send(result.data); // Data is found in the db, now caching and serving!
                                //console.log('checkpoint 4');
                            });
                        } else {
                            //console.log('checkpoint 3');
                            initRemoteRequests(); // data can't be found in db, get it from remote servers
                        }
                    })
            } else {
                initRemoteRequests();  // db is not initalized, get data from remote servers
                //console.log('checkpoint 5');
            }
        }
    });

});

// API calls
app.get('/api/ol/match/:type/1/:id', (req, res) => {
    const options = {
        method: 'GET',
        url: `https://widget.oley.com/match/${req.params.type}/1/${req.params.id}`,
        headers: {
            'Host': 'widget.oley.com',
            'Origin': 'https://oley.com'
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
        }
    });
});

// Log Errors
app.post('/api/logerrors', (req, res) => {
    if (db) {
        let collection = db.collection('console_errors');
        try {
            collection.insertOne(req.body, () => {
                res.send('OK!');
            });
        } catch (e) {
            // do nothing
        }
    }
});

// //if (process.env.NODE_ENV === 'production') {
// app.use(express.static(path.join(__dirname, 'client/build')));
// app.get('*', function (req, res) {
// 	res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });
// //}

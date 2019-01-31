const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const MongoClient = require('mongodb').MongoClient;
const request = require('request-promise-native');
const diff = require('deep-diff');
const _ = require('lodash');
const moment = require('moment');
const cacheService = require('./cache.service');
const cacheDuration = {
    provider1: 60 * 60 * 24, // 24 hours
    provider2: 60 * 60 * 24, // 24 hours
    provider3: 60 * 60 * 24, // 24 hours
    missing: 60 * 60 * 24, // 24 hours
    main: {
        homepage: 5, // 5 seconds
        eventdetails: 5, // 5 seconds
        lineup: 60 * 30, // 30 min
        standing: 60, // 1 min.
    }
};

// our localhost port
const port = 5001;
const app = express();

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server, {
	pingInterval: 25000,
	pingTimeout: 120000,
});

const replaceDotWithUnderscore = (obj) => {
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

let db = null,
    matchlistbydateCollection = null;

const mongoOptions = {
    useNewUrlParser: true,
    keepAlive: 1,
    connectTimeoutMS: 1000,
    socketTimeoutMS: 1000,
};

const {MONGO_USER, MONGO_PASSWORD, MONGO_IP, NODE_ENV} = process.env;

// This is what the socket.socket syntax is like, we will work this later
io.on('connection', socket => {
	if (NODE_ENV !== "dev") {
		MongoClient.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:27017`, mongoOptions, function (err, client) {
			if (err) {
				// do nothing, just proceed
			} else {
				try {
					db = client.db('ultraskor');
					matchlistbydateCollection = db.collection('helperdata_bydate');
				} catch (err) {
					// do nothing, just proceed
				}
			}
		});
	}

    cacheService.start(function (err) {
        if (err) console.error('cache service failed to start', err);
    });

    let currentPage = null,
	    isFlashScoreActive = false,
	    isHomepageGetUpdates = false,
        intervalUpdates = null;

    socket.on('is-flashscore-active', status => {
	    isFlashScoreActive = status;
	    console.log('isFlashScoreActive', status);
    });

	socket.on('is-homepage-getupdates', status => {
		isHomepageGetUpdates = status;
		console.log('isHomepageActive', status);
	});


    socket.on('current-page', (page) => {
        currentPage = page;
    });

    socket.once('get-updates', params => {
        const sofaOptions = {
            method: 'GET',
            uri: `https://www.sofascore.com/football//${moment().format('YYYY-MM-DD')}/json?_=${Math.floor(Math.random() * 10e8)}`,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://www.sofascore.com',
                'referer': 'https://www.sofascore.com/',
                'x-requested-with': 'XMLHttpRequest'
            }
        };
        let previousData;
        const getUpdatesHandler = () => {
            if (!isFlashScoreActive) return false;
            request(sofaOptions)
                .then(res => {
	                if (isHomepageGetUpdates) socket.emit('return-updates-homepage', res);
					console.log('triggered 1');
	                const resFlash = _.clone(res, true);
	                let events = [];
                    const neededProperties = [
                        'awayRedCards',
                        'awayScore',
                        'homeRedCards',
                        'homeScore',
                        'id',
                        'status',
                        'statusDescription',
                        'awayTeam',
                        'homeTeam'
                    ];

	                resFlash.sportItem.tournaments.forEach(tournament => {
                        tournament.events = tournament.events.filter(event => {
                            return event.status.type !== "finished"
                        });
                        tournament.events.forEach(event => {
                            let newEvents = {};
                            neededProperties.forEach(property => {
                                newEvents[property] = event[property]
                            });
                            events.push(newEvents)
                        });
                    });

                    //test case away Score
                    // setTimeout(() => {
                    // 	socket.emit('return-flashcore-changes', [[
                    // 		{
                    // 			kind: "E",
                    // 			lhs: "1",
                    // 			rhs: "2",
                    // 			path: [
                    // 				"awayScore",
                    // 				"current"
                    // 			],
                    // 			event: {
                    // 				awayRedCards: 0,
                    // 				awayScore: {current: 2},
                    // 				awayTeam: {name: "Malmö FF", id: 1892, subTeams: Array(0)},
                    // 				homeRedCards: 0,
                    // 				homeScore: {current: 0},
                    // 				homeTeam: {name: "Lyngby BK", id: 1756, subTeams: Array(0)},
                    // 				id: 8114504,
                    // 				status: {code: 6, type: "inprogress"},
                    // 				statusDescription: "30"
                    // 			}
                    // 		}
                    // 	]]);
                    // }, 1000);
                    // setTimeout(() => {
                    // 	socket.emit('return-flashcore-changes', [[
                    // 		{
                    // 			kind: "E",
                    // 			lhs: "0",
                    // 			rhs: "1",
                    // 			path: [
                    // 				"homeRedCards",
                    // 			],
                    // 			event: {
                    // 				awayRedCards: 0,
                    // 				awayScore: {current: 1},
                    // 				awayTeam: {name: "BB Erzurumspor", id: 55603, subTeams: Array(0)},
                    // 				homeRedCards: 1,
                    // 				homeScore: {current: 2},
                    // 				homeTeam: {name: "Beşiktaş", id: 3050, subTeams: Array(0)},
                    // 				id: 7870231,
                    // 				status: {code: 6, type: "inprogress"},
                    // 				statusDescription: "89"
                    // 			}
                    // 		}
                    // 	]]);
                    // }, 6000);
                    //test case

                    if (previousData && previousData.length > 0) {
                        let diffArr = [];

                        previousData.forEach(eventPrev => {
                            let eventNew = events.filter(item => item.id === eventPrev.id)[0];
                            let eventDiff = diff(eventPrev, eventNew);
                            if (eventDiff) {
                                eventDiff.forEach(x => {
                                    x.event = eventNew;
                                });
                                diffArr.push(eventDiff);
                            }
                        });

                        if (diffArr.length > 0) socket.emit('return-flashcore-changes', diffArr);
                    }
                    previousData = events;
                })
                .catch((err) => {
                    console.log(`Error returning differences. Error: ${err}`);
                    socket.emit('return-error-homepage', "Error while retrieving information from server")
                });
        };
	    //getUpdatesHandler();
	    intervalUpdates = setInterval(() => {
            getUpdatesHandler(); // start the 1st check after 5 seconds.
        }, 15000);
    });

    socket.on('get-main', (params) => {
        const cacheKey = `mainData-${params.api}`;

        const initRemoteRequests = () => {
            const sofaOptions = {
                method: 'GET',
                uri: `https://www.sofascore.com${params.api}?_=${Math.floor(Math.random() * 10e8)}`,
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://www.sofascore.com',
                    'referer': 'https://www.sofascore.com/',
                    'x-requested-with': 'XMLHttpRequest'
                }
            };

            request(sofaOptions)
                .then(res => {
                    cacheService.instance().set(cacheKey, res, cacheDuration.main[params.page] || 5, () => {
                        socket.emit(`return-main-${params.page}`, res);  // return-main-homepage, return-main-eventdetails
                    });
                })
                .catch(() => {
                    console.log(`error returning data from main for ${params.page}`);
                    socket.emit(`return-error-${params.page}`, 'Error while retrieving information from server');
                });
        };

        cacheService.instance().get(cacheKey, (err, cachedData) => {
            if (err) {
                initRemoteRequests()
            } else {
                if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
                    socket.emit(`return-main-${params.page}`, cachedData);
                } else {
                    initRemoteRequests();

                }
            }
        });

    });

    socket.on('get-eventdetails-helper-1', date => {
        const cacheKey = `helperData-${date}-provider1`;

        const initRemoteRequests = () => {
            const provider1options = {
                method: 'GET',
                uri: `http://www.hurriyet.com.tr/api/spor/sporlivescorejsonlist/?sportId=1&date=${date}`,
                json: true,
                timeout: 1500
            };
            request(provider1options)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        cacheService.instance().set(cacheKey, res, cacheDuration.provider1, () => {
                            if (matchlistbydateCollection) {
                                matchlistbydateCollection.insertOne({
                                    date: date,
                                    provider: "provider1",
                                    data: res
                                });
                            }
                        });
                    }
                    socket.emit('return-eventdetails-prodiver1', res); // return provider1
                })
                .catch(() => {
                    console.log(`error returning data from main for provider1`);
                    //socket.emit('my-error', 'Error while retrieving information from server');
                });
        };

        cacheService.instance().get(cacheKey, (err, cachedData) => {
            if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
                socket.emit('return-eventdetails-prodiver1', cachedData);
            } else { // Cache is not found
                if (matchlistbydateCollection) {
                    matchlistbydateCollection
                        .findOne({"date": date, "provider": "provider1"})
                        .then(result => {
                            if (result) {
                                cacheService.instance().set(cacheKey, result.data, cacheDuration.provider1, () => {
                                    socket.emit('return-eventdetails-prodiver1', result.data); // Data is found in the db, now caching and serving!
                                });
                            } else {
                                initRemoteRequests(); // data can't be found in db, get it from remote servers
                            }
                        })
                } else {
                    initRemoteRequests();  // db is not initalized, get data from remote servers
                }
            }
        });
    });

    socket.on('get-eventdetails-helper-2', date => {
        const cacheKey = `helperData-${date}-provider2`;

        const initRemoteRequests = () => {
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
                        "day": date,
                        "origin": "broadage.com",
                        "timeZone": 3
                    }
                }),
                json: true,
                timeout: 1500
            };
            request(provider2options)
                .then(res => {
                    if (res.initialData && res.initialData.length > 0) {
                        cacheService.instance().set(cacheKey, res, cacheDuration.provider2, () => {
                            if (matchlistbydateCollection) {
                                matchlistbydateCollection.insertOne({
                                    date: date,
                                    provider: "provider2",
                                    data: res
                                });
                            }
                        });
                    }
                    socket.emit('return-eventdetails-prodiver2', res); // return provider2
                })
                .catch(() => {
                    console.log(`error returning data from main for provider2`);
                    //socket.emit('my-error', 'Error while retrieving information from server');
                });
        };

        cacheService.instance().get(cacheKey, (err, cachedData) => {
            if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
                socket.emit('return-eventdetails-prodiver2', cachedData);
            } else { // Cache is not found
                if (matchlistbydateCollection) {
                    matchlistbydateCollection
                        .findOne({"date": date, "provider": "provider2"})
                        .then(result => {
                            if (result) {
                                cacheService.instance().set(cacheKey, result.data, cacheDuration.provider2, () => {
                                    socket.emit('return-eventdetails-prodiver2', result.data); // Data is found in the db, now caching and serving!
                                });
                            } else {
                                initRemoteRequests(); // data can't be found in db, get it from remote servers
                            }
                        })
                } else {
                    initRemoteRequests();  // db is not initalized, get data from remote servers
                }
            }
        });
    });

    socket.on('get-eventdetails-helper-3', params => {
        const cacheKey = `helperData-${params.date}-provider3`;

        const initRemoteRequests = () => {
            const provider3options = {
                method: 'GET',
                uri: `https://www.tuttur.com/draw/events/type/football`,
                json: true,
                timeout: 1500
            };

            request(provider3options)
                .then(res => {
                    res = replaceDotWithUnderscore(res.events);
	                console.log('checkpoint 3', params.code);
                    if (res && res[params.code] && params.date === moment(res[params.code].startDate * 1e3).format('DD.MM.YYYY')) {
	                    console.log('checkpoint 4', params.date);
                        cacheService.instance().set(cacheKey, res, cacheDuration.provider3, () => {
                            if (matchlistbydateCollection) {
                                matchlistbydateCollection.insertOne({
                                    date: params.date,
                                    provider: "provider3",
                                    data: res
                                });
                            }
                        });
	                    socket.emit('return-eventdetails-prodiver3', res); // return provider3
                    }
                })
                .catch(() => {
                    console.log(`error returning data from main for provider3`);
                    //socket.emit('my-error', 'Error while retrieving information from server');
                });
        };

        cacheService.instance().get(cacheKey, (err, cachedData) => {
            if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
                console.log('checkpoint 1');
            	socket.emit('return-eventdetails-prodiver3', cachedData);
            } else { // Cache is not found
                if (matchlistbydateCollection) {
                    matchlistbydateCollection
                        .findOne({"date": params.date, "provider": "provider3"})
                        .then(result => {
                            if (result) {
	                            console.log('checkpoint 2');
                                cacheService.instance().set(cacheKey, result.data, cacheDuration.provider3, () => {
                                    socket.emit('return-eventdetails-prodiver3', result.data); // Data is found in the db, now caching and serving!
                                });
                            } else {
                                initRemoteRequests(); // data can't be found in db, get it from remote servers
                            }
                        })
                } else {
                    initRemoteRequests();  // db is not initalized, get data from remote servers
                }
            }
        });
    });

    socket.on('get-eventdetails-missing', matchid => {
        const cacheKey = `helperData-${matchid}-missing`;
        const initRemoteRequests = () => {
            const missingOptions = {
                method: 'GET',
                uri: `https://widget.oley.com/match/missings/1/${matchid}`,
                json: true,
                timeout: 1500
            };
            request(missingOptions)
                .then(res => {
                    if (res) {
                        cacheService.instance().set(cacheKey, res, cacheDuration.missing, () => {
                            if (matchlistbydateCollection) {
                                matchlistbydateCollection.insertOne({
                                    matchid: matchid,
                                    type: "missing",
                                    data: res
                                });
                            }
                        });
                    }
                    socket.emit('return-eventdetails-missing', res); // return missings
                })
                .catch(() => {
                    console.log(`error returning data for missing`);
                    socket.emit('return-error-missing', 'Error while retrieving information from server');
                });
        };

        cacheService.instance().get(cacheKey, (err, cachedData) => {
            if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
                socket.emit('return-eventdetails-missing', cachedData);
            } else { // Cache is not found
                if (matchlistbydateCollection) {
                    matchlistbydateCollection
                        .findOne({matchid: matchid, type: "missing"})
                        .then(result => {
                            if (result) {
                                cacheService.instance().set(cacheKey, result.data, cacheDuration.missing, () => {
                                    socket.emit('return-eventdetails-missing', result.data); // Data is found in the db, now caching and serving!
                                });
                            } else {
                                initRemoteRequests(); // data can't be found in db, get it from remote servers
                            }
                        })
                } else {
                    initRemoteRequests();  // db is not initalized, get data from remote servers
                }
            }
        });
    });

    socket.on('disconnect', () => {
    	console.log('user disconnected');
        clearInterval(intervalUpdates);
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

server.listen(port, () => console.log(`Listening on port ${port}`));

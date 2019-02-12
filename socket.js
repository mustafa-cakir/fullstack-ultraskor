const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const MongoClient = require('mongodb').MongoClient;
const request = require('request-promise-native');
const diff = require('deep-diff');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const _ = require('lodash');
const moment = require('moment');
const firebaseAdmin = require('firebase-admin');
const cacheService = require('./cache.service');
const cacheDuration = {
	provider1: 60 * 60 * 24, // 24 hours
	provider2: 60 * 60 * 24, // 24 hours
	provider3: 60 * 60 * 24, // 24 hours
	missings: 60 * 60 * 24, // 7 days
	teamstats: 60 * 60 * 24, // 7 days
	main: {
		default: 60, // 1 min.
		homepage: 15, // 5 seconds
		eventdetails: 5, // 5 seconds
		lineup: 60 * 30, // 30 min,
		h2h: 60 * 30, // 30 min
		standing: 60, // 1 min.
	}
};

// our localhost port
const port = 5001;
const app = express();

// our server instance
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const whitelist = [
	'http://localhost:5000',
	'http://localhost:5001',
	'http://localhost:3000',
	'https://www.ultraskor.com',
];
const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true)
		} else {
			console.log(origin);
			callback(new Error('Not allowed by CORS'));
		}
	}
};

app.use(cors(corsOptions));

const FireBaseServiceAccount = require("./livescores-firebase-adminsdk-l00mx-232f16f146");

firebaseAdmin.initializeApp({
	credential: firebaseAdmin.credential.cert(FireBaseServiceAccount),
	databaseURL: "https://livescores-54cdf.firebaseio.com"
});

cacheService.start(function (err) {
	if (err) console.error('cache service failed to start', err);
});

// This creates our socket using the instance of the server
// const io = socketIO(server, {
// 	pingInterval: 25000,
// 	pingTimeout: 120000,
// });

const server = http.createServer(app);
const io = socketIO(server);

const replaceDotWithUnderscore = obj => {
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

const simplifyHomeData = res => {
	if (res && res.sportItem && res.sportItem.tournaments) {
		let eventIgnoredProperties = [
			'changes', 'confirmedLineups', 'customId', 'hasAggregatedScore', 'hasDraw', 'hasEventPlayerHeatMap',
			'hasEventPlayerStatistics', 'hasFirstToServe', 'hasOdds', 'hasGlobalHighlights', 'hasHighlights',
			'hasHighlightsStream', 'hasLineups', 'hasLineupsList', 'hasLiveForm', 'hasLiveOdds', 'hasStatistics',
			'hasSubScore', 'hasTime', 'isAwarded', 'isSyncable', 'roundInfo', 'sport', 'votingEnabled', 'winnerCode', 'odds'];

		res.sportItem.tournaments.forEach(tournament => {
			tournament.events.map(event => {
				for (let i = 0; i < eventIgnoredProperties.length; i++) {
					delete event[eventIgnoredProperties[i]]
				}
				return event
			});
		});
	}
	return res;
};

let db = null,
	helperDataCollection = null;

const mongoOptions = {
	useNewUrlParser: true,
	keepAlive: 1,
	connectTimeoutMS: 1000,
	socketTimeoutMS: 1000,
};

const {MONGO_USER, MONGO_PASSWORD, MONGO_IP, NODE_ENV} = process.env;

MongoClient.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:27017`, mongoOptions, function (err, client) {
	if (err) {
		// do nothing, just proceed
	} else {
		try {
			db = client.db('ultraskor');
			helperDataCollection = db.collection('helperdata_bydate');
		} catch (err) {
			// do nothing, just proceed
		}
	}
	server.listen(port, () => console.log(`Listening on port ${port}`));

});

app.get('/api/', (req, res) => {
	const cacheKey = `mainData-${req.query.query}`;
	req.query.page = req.query.page || "default";
	const initRemoteRequests = () => {
		const sofaOptions = {
			method: 'GET',
			uri: `https://www.sofascore.com${req.query.query}?_=${Math.floor(Math.random() * 10e8)}`,
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://www.sofascore.com',
				'referer': 'https://www.sofascore.com/',
				'x-requested-with': 'XMLHttpRequest'
			}
		};

		request(sofaOptions)
			.then(response => {
				if (req.query.page === "homepage") response = simplifyHomeData(response);
				if (response) {
					cacheService.instance().set(cacheKey, response, cacheDuration.main[req.query.page] || 5, () => {
						res.send(response);
					});
				}
			})
			.catch(() => {
				console.log(`error returning data from main for ${req.query.page}`);
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server'
				})
			});
	};

	cacheService.instance().get(cacheKey, (err, cachedData) => {
		if (err) {
			initRemoteRequests();
			console.log('cache server is broken');
		} else {
			if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
				res.send(cachedData);
				console.log('served from cache');
			} else {
				initRemoteRequests();
				console.log('cache not exist, get from remote');
			}
		}
	});
});

app.get('/api/helper1/:date', (req, res) => {
	const date = req.params.date;
	const cacheKey = `helperData-${req.params.date}-provider1`;

	const initRemoteRequests = () => {
		const provider1options = {
			method: 'GET',
			uri: `http://www.hurriyet.com.tr/api/spor/sporlivescorejsonlist/?sportId=1&date=${date}`,
			json: true,
			timeout: 1500
		};
		request(provider1options)
			.then(response => {
				if (response.data && response.data.length > 0) {
					cacheService.instance().set(cacheKey, response, cacheDuration.provider1, () => {
						if (helperDataCollection) {
							try {
								helperDataCollection.insertOne({
									date: date,
									provider: "provider1",
									data: response
								});
							} catch (err) {
								// do nothing just proceed
							}
						}
						res.send(response.data);
					});
				} else {
					res.send('');
				}
			})
			.catch(() => {
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server'
				})
			});
	};

	cacheService.instance().get(cacheKey, (err, cachedData) => {
		if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
			res.send(cachedData);
		} else { // Cache is not found
			if (helperDataCollection) {
				helperDataCollection
					.findOne({"date": date, "provider": "provider1"})
					.then(result => {
						if (result) {
							cacheService.instance().set(cacheKey, result.data, cacheDuration.provider1, () => {
								res.send(result.data); // Data is found in the db, now caching and serving!
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

app.get('/api/helper2/:date', (req, res) => {
	const date = req.params.date.replace(/\./g, '/');
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
						if (helperDataCollection) {
							try {
								helperDataCollection.insertOne({
									date: date,
									provider: "provider2",
									data: res
								});
							} catch (err) {
								// do nothing
							}
						}
						res.send(res); // return anyway if collection not exist
					});
				} else {
					res.send('');
				}

			})
			.catch(() => {
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server'
				})
			});
	};

	cacheService.instance().get(cacheKey, (err, cachedData) => {
		if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
			res.send(cachedData);
		} else { // Cache is not found
			if (helperDataCollection) {
				helperDataCollection
					.findOne({"date": date, "provider": "provider2"})
					.then(result => {
						if (result) {
							cacheService.instance().set(cacheKey, result.data, cacheDuration.provider2, () => {
								res.send(result.data); // Data is found in the db, now caching and serving!
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

app.get('/api/helper3/:date/:code', (req, res) => {
	const date = req.params.date;
	const code = req.params.code;

	const cacheKey = `helperData-${date}-provider3`;

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
				if (res && res[code] && date === moment(res[code].startDate * 1e3).format('DD.MM.YYYY')) {
					cacheService.instance().set(cacheKey, res, cacheDuration.provider3, () => {
						if (helperDataCollection) {
							helperDataCollection.insertOne({
								date: date,
								provider: "provider3",
								data: res
							});
						}
					});
					res.send(res); // return provider3
				} else {
					res.send('');
				}
			})
			.catch(() => {
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server'
				})
			});
	};

	cacheService.instance().get(cacheKey, (err, cachedData) => {
		if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
			res.send(cachedData);
		} else { // Cache is not found
			if (helperDataCollection) {
				helperDataCollection
					.findOne({"date": date, "provider": "provider3"})
					.then(result => {
						if (result) {
							cacheService.instance().set(cacheKey, result.data, cacheDuration.provider3, () => {
								res.send(result.data); // Data is found in the db, now caching and serving!
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

app.get('/api/helper2/widget/:type/:matchid', (req, res) => {
	const type = req.params.type;
	const matchid = req.params.matchid;

	const cacheKey = `helperData-${matchid}-${type}`;
	const initRemoteRequests = () => {
		const oleyOptions = {
			method: 'GET',
			uri: `https://widget.oley.com/match/${type}/1/${matchid}`,
			json: true,
			timeout: 1500
		};
		request(oleyOptions)
			.then(response => {
				if (response) {
					cacheService.instance().set(cacheKey, response, cacheDuration[type], () => {
						if (helperDataCollection) {
							helperDataCollection.insertOne({
								matchid: matchid,
								type: type,
								data: response
							});
						}
					});
				} else {
					res.status(500).send({
						status: "error",
						message: 'Error while retrieving information from server'
					})
				}
				res.send(response); // return
			})
			.catch(() => {
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server'
				})
			});
	};

	cacheService.instance().get(cacheKey, (err, cachedData) => {
		if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
			res.send(cachedData);
		} else { // Cache is not found
			if (helperDataCollection) {
				helperDataCollection
					.findOne({matchid: matchid, type: type})
					.then(result => {
						if (result) {
							cacheService.instance().set(cacheKey, result.data, cacheDuration[type], () => {
								res.send(result.data); // Data is found in the db, now caching and serving!
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


// This is what the socket.socket syntax is like, we will work this later
io.on('connection', socket => {

	let currentPage = null,
		isFlashScoreActive = false,
		isHomepageGetUpdates = false,
		intervalUpdates = null;

	socket.on('is-flashscore-active', status => {
		isFlashScoreActive = status;
	});

	socket.on('is-homepage-getupdates', status => {
		isHomepageGetUpdates = status;
	});

	function initWebPush(res) {
		res.forEach(x => {
			x.forEach(change => {
				if (change.kind === "E" && change.event && change.event.id) {
					let message = {
						webpush: {
							notification: {
								title: '',
								body: '',
								icon: '',
								click_action: ''
							}
						},
						topic: `match_${change.event.id}`
					};

					if ((change.path[0] === "homeScore" || change.path[0] === "awayScore") && change.path[1] === "current") { // home or away scored!!
						if (parseInt(change.rhs) > parseInt(change.lhs)) {
							message.webpush.notification.title = `GOL ${change.event.statusDescription}' ${change.path[0] === "homeScore" ? change.event.homeTeam.name : change.event.awayTeam.name}`;
							message.webpush.notification.body = `${change.event.homeTeam.name} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${change.event.awayTeam.name}`;
							message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${change.path[0] === "homeScore" ? change.event.homeTeam.id : change.event.awayTeam.id}`;
							message.webpush.notification.click_action = `http://ultraskor.com/eventdetails/${change.event.id}`;
						} else {
							message.webpush.notification.title = `GOL İPTAL ${change.path[0] === "homeScore" ? change.event.homeTeam.name : change.event.awayTeam.name}`;
							message.webpush.notification.body = `${change.event.homeTeam.name} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${change.event.awayTeam.name}`;
							message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${change.path[0] === "homeScore" ? change.event.homeTeam.id : change.event.awayTeam.id}`;
							message.webpush.notification.click_action = `https://www.ultraskor.com/eventdetails/${change.event.id}`;
						}
					} else if (change.path[0] === "homeRedCards" || change.path[0] === "awayRedCards") {
						message.webpush.notification.title = `Kırmızı Kart ${change.event.statusDescription}' ${change.path[0] === "homeRedCards" ? change.event.homeTeam.name : change.event.awayTeam.name}`;
						message.webpush.notification.body = `${change.event.homeTeam.name} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${change.event.awayTeam.name}`;
						message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${change.path[0] === "homeRedCards" ? change.event.homeTeam.id : change.event.awayTeam.id}`;
						message.webpush.notification.click_action = `https://www.ultraskor.com/eventdetails/${change.event.id}`;
					} else if (change.path[0] === "status" && change.path[1] === "code") {
						if (change.lhs === 0 && change.rhs === 6) { // game started
							message.webpush.notification.title = `Maç Başladı`;
							message.webpush.notification.body = `${change.event.homeTeam.name} - ${change.event.awayTeam.name}`;
						} else if (change.lhs === 6 && change.rhs === 31) { // half time
							message.webpush.notification.title = `İlk Yarı Sonucu`;
							message.webpush.notification.body = `${change.event.homeTeam.name} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${change.event.awayTeam.name}`;
						} else if (change.lhs === 31 && change.rhs === 6) { // 2nd half started
							message.webpush.notification.title = `İkinci Yarı Başladı`;
							message.webpush.notification.body = `${change.event.homeTeam.name} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${change.event.awayTeam.name}`;
						} else if (change.rhs === 100) { // full time
							message.webpush.notification.title = `Maç Sonucu`;
							message.webpush.notification.body = `${change.event.homeTeam.name} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${change.event.awayTeam.name}`;
						}
						message.webpush.notification.icon = `https://www.ultraskor.com/apple-touch-icon.png`;
						message.webpush.notification.click_action = `https://www.ultraskor.com/eventdetails/${change.event.id}`;
					}

					if (message.webpush.notification.title) {
						firebaseAdmin.messaging().send(message)
							.then((response) => {
								// Response is a message ID string.
								console.log('Successfully sent message:', response);
							})
							.catch((error) => {
								console.log('Error sending message:', error);
							});
					}
				}
			});
		});


	}

	socket.once('get-updates', () => {
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
					if (isHomepageGetUpdates) {
						res = simplifyHomeData(res);
						socket.emit('return-updates-homepage', res);
					}
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
						// tournament.events = tournament.events.filter(event => {
						//     return event.status.type !== "finished"
						// });
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
					// 			lhs: "1",
					// 			rhs: "2",
					// 			path: [
					// 				"awayRedCards",
					// 			],
					// 			event: {
					// 				awayRedCards: 2,
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

						if (diffArr.length > 0) {
							initWebPush(diffArr);
							socket.emit('return-flashcore-changes', diffArr);
						}
					}
					previousData = events;
				})
				.catch((err) => {
					console.log(`Error returning differences. Error: ${err}`);
					socket.emit('return-error-updates', "Error while retrieving information from server")
				});
		};
		getUpdatesHandler();
		intervalUpdates = setInterval(() => {
			getUpdatesHandler(); // check in every 15 seconds
		}, 15000);
	});

	/* socket.on('get-main', (params) => {
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
					if (params.page === "homepage") res = simplifyHomeData(res);
					if (res) {
						cacheService.instance().set(cacheKey, res, cacheDuration.main[params.page] || 5, () => {
							socket.emit(`return-main-${params.page}`, res);  // return-main-homepage, return-main-eventdetails
						});
					}
				})
				.catch(() => {
					console.log(`error returning data from main for ${params.page}`);
					socket.emit(`return-error-${params.page}`, 'Error while retrieving information from server');
				});
		};

		cacheService.instance().get(cacheKey, (err, cachedData) => {
			if (err) {
				initRemoteRequests();
				console.log('cache server is broken');
			} else {
				if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
					socket.emit(`return-main-${params.page}`, cachedData);
					console.log('served from cache');
				} else {
					initRemoteRequests();
					console.log('cache not exist, get from remote');
				}
			}
		});

	}); */

	/* socket.on('get-eventdetails-helper-1', date => {
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
							if (helperDataCollection) {
								helperDataCollection.insertOne({
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
				if (helperDataCollection) {
					helperDataCollection
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
	}); */

	/* socket.on('get-eventdetails-helper-2', date => {
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
							if (helperDataCollection) {
								helperDataCollection.insertOne({
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
				if (helperDataCollection) {
					helperDataCollection
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
	}); */

	/* socket.on('get-eventdetails-helper-3', params => {
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
					if (res && res[params.code] && params.date === moment(res[params.code].startDate * 1e3).format('DD.MM.YYYY')) {
						cacheService.instance().set(cacheKey, res, cacheDuration.provider3, () => {
							if (helperDataCollection) {
								helperDataCollection.insertOne({
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
				socket.emit('return-eventdetails-prodiver3', cachedData);
			} else { // Cache is not found
				if (helperDataCollection) {
					helperDataCollection
						.findOne({"date": params.date, "provider": "provider3"})
						.then(result => {
							if (result) {
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
	}); */

	/* socket.on('get-oley', params => {
		const cacheKey = `helperData-${params.matchid}-${params.type}`;
		const initRemoteRequests = () => {
			const oleyOptions = {
				method: 'GET',
				uri: `https://widget.oley.com/match/${params.type}/1/${params.matchid}`,
				json: true,
				timeout: 1500
			};
			request(oleyOptions)
				.then(res => {
					if (res) {
						cacheService.instance().set(cacheKey, res, cacheDuration[params.type], () => {
							if (helperDataCollection) {
								helperDataCollection.insertOne({
									matchid: params.matchid,
									type: params.type,
									data: res
								});
							}
						});
					}
					socket.emit(`return-oley-${params.type}`, res); // return
				})
				.catch(() => {
					console.log(`error returning data for ${params.type}`);
					socket.emit(`return-oley-error-${params.type}`, 'Error while retrieving information from server');
				});
		};

		cacheService.instance().get(cacheKey, (err, cachedData) => {
			if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
				socket.emit(`return-oley-${params.type}`, cachedData);
			} else { // Cache is not found
				if (helperDataCollection) {
					helperDataCollection
						.findOne({matchid: params.matchid, type: params.type})
						.then(result => {
							if (result) {
								cacheService.instance().set(cacheKey, result.data, cacheDuration[params.type], () => {
									socket.emit(`return-oley-${params.type}`, result.data); // Data is found in the db, now caching and serving!
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
	}); */

	socket.on('web-push-subscription', options => {
		firebaseAdmin.messaging()[options.method](options.token, options.topic)
			.then(() => {
				socket.emit('web-push-subscription-return', {
					success: true,
					message: `Successfully ${options.method} to topic`
				});
			})
			.catch(() => {
				socket.emit('web-push-subscription-return', {
					status: false,
					message: `An error occurred while processing your request`
				});
			});
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
		clearInterval(intervalUpdates);
	});
});


app.get('/sitemap/:lang/:sport/:type/:by/:date', function (req, res) {
	const {lang, sport, type, by, date} = req.params;

	if (type === "index") {
		res.header('Content-Type', 'application/xml');
		let xmlString = '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

		if (by === "year") {
			for (let i = 1; i <= 12; i++) {
				xmlString += `<sitemap><loc>https://www.ultraskor.com/sitemap/${lang}/${sport}/index/month/${date}-${i < 10 ? `0${i}` : i}</loc></sitemap>`;
			}
		} else if (by === "month") {
			let daysInMonth = moment(date, "YYYY-MM").daysInMonth();
			for (let i = 1; i <= daysInMonth; i++) {
				xmlString += `<sitemap><loc>https://www.ultraskor.com/sitemap/${lang}/${sport}/list/day/${date}-${i < 10 ? `0${i}` : i}</loc></sitemap>`;
			}
		}
		xmlString += '</sitemapindex>';
		res.send(xmlString);

	} else if (type === "list" && by === "day") {
		const sofaOptionsGetToday = {
			method: 'GET',
			uri: `https://www.sofascore.com/${sport}//${date}/json`,
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://www.sofascore.com',
				'referer': 'https://www.sofascore.com/',
				'x-requested-with': 'XMLHttpRequest'
			}
		};
		res.header('Content-Type', 'text/plain');

		function generateSlug(text) {
			const a = 'çıüğöşàáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
			const b = 'ciugosaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
			const p = new RegExp(a.split('').join('|'), 'g');

			return text.toString().toLowerCase()
				.replace(/\s+/g, '-')           // Replace spaces with -
				.replace(p, c =>
					b.charAt(a.indexOf(c)))     // Replace special chars
				.replace(/&/g, '-and-')         // Replace & with 'and'
				.replace(/[^\w-]+/g, '')       // Remove all non-word chars
				.replace(/--+/g, '-')         // Replace multiple - with single -
				.replace(/^-+/, '')             // Trim - from start of text
				.replace(/-+$/, '')             // Trim - from end of text
		}

		request(sofaOptionsGetToday)
			.then(mainData => {
				if (mainData && mainData.sportItem && mainData.sportItem.tournaments.length > 0) {
					let tournaments = mainData.sportItem.tournaments.reduce(function (whole, tournament) {
						tournament.events = tournament.events.filter((event) => {
							return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === date;
						});
						tournament.events.forEach(() => {
							if (whole.indexOf(tournament) < 0) whole.push(tournament);
						});
						return whole;
					}, []);

					let urls = [];
					tournaments.forEach(tournament => {
						tournament.events.forEach(event => {
							urls.push(`https://www.ultraskor.com${lang === "tr" ? "/mac/" : "/match/"}${generateSlug(event.name)}-${lang === "tr" ? "canli-skor" : "live-score"}-${event.id}`)
						});
					});
					res.send(urls.join('\r'));
				} else {
					res.status(500).send('Error')
				}
			})
			.catch(() => {
				res.status(500).send('Error')
			});
	}
});

app.get('/sitemap/:lang/football-todaysmatches.txt', function (req, res) {
	res.redirect(`/sitemap/${req.params.lang}/football/list/day/${moment().format('YYYY-MM-DD')}`)
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



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
const helper = require('./helper');
const cacheDuration = {
	provider1: 60 * 60 * 24, // 24 hours
	provider2: 60 * 60 * 24, // 24 hours
	provider3: 60 * 60 * 24, // 24 hours
	missings: 60 * 60 * 24, // 7 days
	teamstats: 60 * 60 * 24, // 7 days
	webpushtopic: 60 * 60 * 24 * 7, // 7 days
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
			//console.log('cache server is broken');
		} else {
			if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
				res.send(cachedData);
				//console.log('served from cache');
			} else {
				initRemoteRequests();
				//console.log('cache not exist, get from remote');
			}
		}
	});
});

app.post('/api/webpush', (req, res) => {
	const {method, token, topic} = req.body;
	const cacheKey = topic;
	firebaseAdmin.messaging()[method](token, topic)
		.then(() => {
			cacheService.instance().set(cacheKey, "true", cacheDuration.webpushtopic, () => {
				res.send(`Successfully ${method} to topic`);
			});
		})
		.catch(err => {
			res.status(500).send(`An error occurred while processing your request, err: ${err}`);
		});
});

app.get('/api/helper1/:date', (req, res) => {
	const date = req.params.date;
	const cacheKey = `helperData-${date}-provider1`;

	let now = moment(moment().format('YYYY-MM-DD')); //todays date
	let end = moment(date, "DD.MM.YYYY"); // another date
	let duration = moment.duration(end.diff(now));
	let offset = duration.asDays();
	// https://lsc.fn.sportradar.com/tempobet/en/Europe:Istanbul/gismo/event_fullfeed/1
	const initRemoteRequests = () => {
		const provider1options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://ls.betradar.com',
				'Referer': 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page'
			},
			uri: `https://lsc.fn.sportradar.com/betradar/en/Europe:Istanbul/gismo/event_fullfeed/${offset}`,
			json: true,
			timeout: 1500
		};
		request(provider1options)
			.then(response => {
				let matchList = helper.preProcessHelper1Data(response);
				if (matchList && matchList.length > 0) {
					cacheService.instance().set(cacheKey, matchList, cacheDuration.provider1, () => {
						if (helperDataCollection) {
							try {
								helperDataCollection.insertOne({
									date: date,
									provider: "provider1",
									data: matchList
								});
							} catch (err) {
								// do nothing just proceed
							}
						}
						res.send(matchList);
					});
				} else {
					res.send({
						status: "empty",
						message: 'Error while retrieving information from server'
					})
				}
			})
			.catch(err => {
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server. Error: ' + err.toString()
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
					.catch(() => {
						console.log('findOne returned err, connection to db is lost. initRemoteRequests() is triggered');
						initRemoteRequests();
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
					.catch(() => {
						console.log('findOne returned err, connection to db is lost. initRemoteRequests() is triggered');
						initRemoteRequests();
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
					.catch(() => {
						console.log('findOne returned err, connection to db is lost. initRemoteRequests() is triggered');
						initRemoteRequests();
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
					.catch(() => {
						console.log('findOne returned err, connection to db is lost. initRemoteRequests() is triggered');
						initRemoteRequests();
					})
			} else {
				initRemoteRequests();  // db is not initalized, get data from remote servers
			}
		}
	});
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
					const cacheKey = `/topics/match_${change.event.id}`;
					cacheService.instance().get(cacheKey, (err, cachedData) => {
						if (typeof cachedData !== "undefined") { // subscription found for this topic, send notification
							console.log('subscription found, send the push for ', change.event.id);
							firebaseAdmin.messaging().send(message)
								.then((response) => {
									// Response is a message ID string.
									console.log('Successfully sent message:', response);
								})
								.catch((error) => {
									console.log('Error sending message:', error);
								});
						} else { // Cache is not found, no one is subscribe to this topic.
							console.log('subscription not found, dont send any push for ', change.event.id);
						}
					});
				}
			}
		});
	});
}

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
let previousData = null;
let changes = null;
let fullData = null;

cron.schedule('*/15 * * * * *', () => {
	// console.log('cron job', new Date());
	request(sofaOptions)
		.then(res => {
			// console.log('triggered 1');
			fullData = res;
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
				tournament.events.forEach(event => {
					let newEvents = {};
					neededProperties.forEach(property => {
						newEvents[property] = event[property]
					});
					events.push(newEvents)
				});
			});

			if (previousData && previousData.length > 0) {
				changes = [];

				previousData.forEach(eventPrev => {
					let eventNew = events.filter(item => item.id === eventPrev.id)[0];
					let eventDiff = diff(eventPrev, eventNew);
					if (eventDiff) {
						eventDiff.forEach(x => {
							x.event = eventNew;
						});
						changes.push(eventDiff);
					}
				});

				if (changes.length > 0) {
					initWebPush(changes);
				}
			}
			previousData = events;
		})
		.catch((err) => {
			console.log(`Error returning differences. Error: ${err}`);
		});
});

io.on('connection', socket => {
	let isFlashScoreActive = false,
		isHomepageGetUpdates = false,
		intervalUpdates = null;

	socket.on('is-flashscore-active', status => {
		isFlashScoreActive = status;
	});

	socket.on('is-homepage-getupdates', status => {
		isHomepageGetUpdates = status;
	});

	socket.once('get-updates', () => {
		const getUpdatesHandler = () => {
			if (isFlashScoreActive) {
				socket.emit('return-flashcore-changes', changes);
			}
			if (isHomepageGetUpdates) {
				fullData = simplifyHomeData(fullData);
				socket.emit('return-updates-homepage', fullData);
			}
		};
		getUpdatesHandler();
		intervalUpdates = setInterval(() => {
			getUpdatesHandler(); // check in every 15 seconds
		}, 15000);
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



const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
//const WebSocket = require('ws');
const MongoClient = require('mongodb').MongoClient;
const request = require('request-promise-native');
const bodyParser = require('body-parser');
const moment = require('moment');
const firebaseAdmin = require('firebase-admin');
const cacheService = require('./cache.service');
const helper = require('./helper');
const webpushHelper = require('./webpush');
const cronjob = require('./cronjob');
const cacheDuration = helper.cacheDuration();


const port = 5001;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(helper.initCors());

cacheService.start(function (err) {
	if (err) console.error('cache service failed to start', err);
});

webpushHelper.init();
cronjob.start();

const server = http.createServer(app);
const io = socketIO(server);


let db = null,
	helperDataCollection = null;

const {MONGO_USER, MONGO_PASSWORD, MONGO_IP, NODE_ENV} = process.env;
MongoClient.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:27017`, helper.mongoOptions(), function (err, client) {
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

// Connect to an external socket for gathering the changes
// let swTimeout = null;
// const ws = new WebSocket('wss://ws.sofascore.com:10014/ServicePush', {
// 	handshakeTimeout: 1000000
// });
//
// ws.on('open', () => {
// 	console.log('ws connected');
// 	ws.send(`{"type":0,"data":["subscribe",{"id":"event","events":["sport_football"]}]}`);
// 	swTimeout = setInterval(()=>{
// 		ws.send('primus::ping::1550278364585');
// 	}, 45000);
// });
// ws.on('close', (err) => {
// 	console.log('ws disconnected. ', err);
// 	clearInterval(swTimeout);
// });


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

	// socket.on('get-updates-2', () => {
	// 	ws.on('message', (data) => {
	// 		socket.emit('return-updates-homepage-2', JSON.parse(data));
	// 	});
	// });

	socket.once('get-updates', () => {
		const getUpdatesHandler = () => {
			if (isFlashScoreActive && cronjob.changes()) {
				socket.emit('return-flashcore-changes', cronjob.changes());
			}
			if (isHomepageGetUpdates && cronjob.fullData()) {
				let mainData = helper.simplifyHomeData(cronjob.fullData());
				socket.emit('return-updates-homepage', mainData);
			}
		};
		getUpdatesHandler();
		intervalUpdates = setInterval(() => {
			getUpdatesHandler(); // check in every 15 seconds
		}, 15000);
	});

	socket.on('get-updates-details', api => {
		const cacheKey = `mainData-${api}-eventdetails`;
		const initRemoteRequests = () => {
			const sofaOptions = {
				method: 'GET',
				uri: `https://www.sofascore.com${api}?_=${Math.floor(Math.random() * 10e8)}`,
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
					if (response) {
						cacheService.instance().set(cacheKey, response, cacheDuration.main.eventdetails || 5, () => {
							socket.emit('return-updates-details', response);
						});
					}
				})
				.catch(() => {
					socket.emit('return-error-updates', "Error while retrieving information from server");
				});
		};

		cacheService.instance().get(cacheKey, (err, cachedData) => {
			if (err) {
				initRemoteRequests();
			} else {
				if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
					socket.emit('return-updates-details', cachedData);
				} else {
					initRemoteRequests();
				}
			}
		});
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
		clearInterval(intervalUpdates);
	});
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
				if (req.query.page === "homepage") response = helper.simplifyHomeData(response);
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
				res = helper.replaceDotWithUnderscore(res.events);
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



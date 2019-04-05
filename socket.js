const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
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
const tr = require('tor-request');
tr.TorControlPort.password = 'muztafultra';
//const WebSocket = require('ws');

const port = 5001;
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(helper.initCors());


cacheService.start(err => {
	if (err) console.error('Error: Cache service failed to start', err);
});


// refresh TOR session
setInterval(() => {
    tr.newTorSession((err, success) => {
        if (err) {
            console.log(err, new Date());
        } else {
            console.log(success, new Date());
        }
    });
}, 1000 * 60 * 60 * 6); // 6 hours

webpushHelper.init();
cronjob.start();

const server = http.createServer(app);
const io = socketIO(server);


let db = null,
	helperDataCollection = null,
	sportradarCollection = null,
	forumCollection = null,
	oleyCollection = null,
	consoleErrorsCollection = null;

const {MONGO_USER, MONGO_PASSWORD, MONGO_IP, NODE_ENV} = process.env;
if (NODE_ENV !== "dev2") {
	MongoClient.connect(`mongodb://bY4b8HC:6X8gBwY@${MONGO_IP}:27017`, helper.mongoOptions(), (err, client) => {
		if (err) {
			console.log('DB Error: Can not connected to db. Error: ' + err);

		} else {
			try {
				db = client.db('ultraskor');
				consoleErrorsCollection = db.collection('console_errors');
				helperDataCollection = db.collection('helperdata_bydate');
				oleyCollection = db.collection('helperdata_oley');
				sportradarCollection = db.collection('sportradardata');
				forumCollection = db.collection('forum');

				console.log('MongoDB connected');
			} catch (err) {
				console.log('DB Error: Can not connected to db');
			}
		}
	});
} else {
	console.log('Working on dev. No MongoDB connection!');
}

server.listen(port, () => console.log(`Listening on port ${port}`));

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
    helper.userConnected();
    // console.log('User connected. Active user: ', helper.userCount());
	// socket.on('get-updates-2', () => {
	// 	ws.on('message', (data) => {
	// 		socket.emit('return-updates-homepage-2', JSON.parse(data));
	// 	});
	// });

	socket.on('get-updates-homepage', () => {
		let cachedData = cacheService.instance().get("fullData");
		if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
			socket.emit('return-updates-homepage', cachedData);
		}
	});

	socket.on('get-flashcore-changes', () => {
		let cachedData = cacheService.instance().get("changes");
		if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
			socket.emit('return-flashcore-changes', cachedData);
		}
	});


	socket.on('forum-post-new', data => {
		if (forumCollection) {
			forumCollection.insertOne({
				topicId: data.topicId,
				message: data.message,
				date: data.date,
				userName: data.userName
			}).then(() => {
				io.sockets.emit('forum-new-submission', data)
			}).catch(err => {
				console.log('DB Error: Can not inserted to db ' + err);
				//socket.emit('post-forum-topic-result', "error");
			});
		} else {
			console.log('DB Error: Db is not connected');
			//socket.emit('post-forum-topic-result', "error");
		}
	});

	socket.on('forum-get-all-by-id', topicId => {
		if (forumCollection) {
			forumCollection.find({topicId: topicId}).toArray(function (err, messages) {
				socket.emit('forum-get-all-by-id-result', messages);
			});
		} else {
			console.log('DB Error: Db is not connected');
			socket.emit('forum-get-all-by-id-result', null);
		}
	});

	socket.on('get-updates-details', api => {
		const cacheKey = `mainData-${api}-eventdetails`;
		const initRemoteRequests = () => {
			let sofaOptions = {
				method: 'GET',
				uri: `https://www.sofascore.com${api}?_=${Math.floor(Math.random() * 10e8)}`,
				json: true,
				headers: {
					'Content-Type': 'application/json',
					'Origin': 'https://www.sofascore.com',
					'referer': 'https://www.sofascore.com/',
					'x-requested-with': 'XMLHttpRequest'
				},
				timeout: 10000
			};

			// if (process.env.NODE_ENV === "dev") {
			//     sofaOptions.uri = `https://www.ultraskor.com/api/?query=${api}`;
			//     sofaOptions.headers = {}
			// }

			tr.request(sofaOptions, function (err, status, res) {
				if (!err && status.statusCode === 200) {
					cacheService.instance().set(cacheKey, res, cacheDuration.main.eventdetails || 5);
					socket.emit('return-updates-details', res);
				} else {
					socket.emit('return-error-updates', "Error while retrieving information from server");
				}
			});
		};

		let cachedData = cacheService.instance().get(cacheKey);
		if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
			socket.emit('return-updates-details', cachedData);
		} else {
			initRemoteRequests();
		}
	});

	socket.on('disconnect', () => {
        helper.userDisconnected();
		// console.log('User disconnected. Active user: ', helper.userCount());
	});
});

app.get('/api/', (req, res) => {
	const cacheKey = `mainData-${req.query.query}`;
	req.query.page = req.query.page || "default";
	const initRemoteRequests = () => {
		let sofaOptions = {
			method: 'GET',
			uri: `https://www.sofascore.com${req.query.query}?_=${Math.floor(Math.random() * 10e8)}`,
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://www.sofascore.com',
				'referer': 'https://www.sofascore.com/',
				'x-requested-with': 'XMLHttpRequest'
			},
			timeout: 10000
		};

		// if (process.env.NODE_ENV === "dev") {
		// 	sofaOptions.uri = `https://www.ultraskor.com/api/?query=${req.query.query}`;
		// 	sofaOptions.headers = {}
		// }

		tr.request(sofaOptions, function (err, status, response) {
			if (!err && status.statusCode === 200) {
				if (req.query.page === "homepage") response = helper.simplifyHomeData(response);
				if (response) {
					cacheService.instance().set(cacheKey, response, cacheDuration.main[req.query.page] || 5);
					res.send(response);
				}
			} else {
				console.log(`error returning data from main for ${req.query.page}`);
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server',
					err: err
				})
			}
		});
	};

	let cachedData = cacheService.instance().get((req.query.page === "homepage" && req.query.today === "1") ? "fullData" : cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		initRemoteRequests();
	}
});

app.post('/api/webpush', (req, res) => {
	const {method, token, topic} = req.body;
	const cacheKey = topic;
	firebaseAdmin.messaging()[method](token, topic)
		.then(() => {
			cacheService.instance().set(cacheKey, "true", cacheDuration.webpushtopic);
			res.send(`Successfully ${method} to topic`);
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
			timeout: 10000
		};
		request(provider1options)
			.then(response => {
				let matchList = helper.preProcessHelper1Data(response);
				if (matchList && matchList.length > 0) {
					cacheService.instance().set(cacheKey, matchList, cacheDuration.provider1);
					if (helperDataCollection) {
						helperDataCollection.insertOne({
							date: date,
							provider: "provider1",
							data: matchList
						}).then(() => {
							res.send(matchList);
						}).catch(err => {
							console.log('DB Error: Can not inserted to db ' + err);
							res.send(matchList);
						});
					} else {
						res.send(matchList);
					}
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
					message: 'Error while retrieving information from server.',
					rr: err
				})
			});
	};


	let cachedData = cacheService.instance().get(cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		if (helperDataCollection) {
			helperDataCollection
				.findOne({"date": date, "provider": "provider1"})
				.then(result => {
					if (result) {
						cacheService.instance().set(cacheKey, result.data, cacheDuration.provider1);
						res.send(result.data); // Data is found in the db, now caching and serving!
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
			timeout: 10000
		};

		request(provider2options)
			.then(response => {
				if (response.initialData && response.initialData.length > 0) {
					if (moment(date, 'MM/DD/YYYY').isSame(moment(), 'day')) { // if it is today
						cacheService.instance().set(cacheKey, response, cacheDuration.provider2);
						if (helperDataCollection) {
							helperDataCollection.insertOne({
								date: date,
								provider: "provider2",
								data: response
							}).then(() => {
								res.send(response);
							}).catch(err => {
								console.log('DB Error: Can not inserted to db ' + err);
								res.send(response);
							});
						} else {
							res.send(response);
						}

					} else {
						res.send(response);
					}
				} else {
					res.send('');
				}
			})
			.catch(err => {
				res.send({
					status: "error",
					message: 'Error while retrieving information from server',
					err: err
				})
			});
	};

	let cachedData = cacheService.instance().get(cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		if (helperDataCollection) {
			helperDataCollection
				.findOne({"date": date, "provider": "provider2"})
				.then(result => {
					if (result) {
						cacheService.instance().set(cacheKey, result.data, cacheDuration.provider2);
						res.send(result.data); // Data is found in the db, now caching and serving!
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

app.get('/api/helper3/:date/:code', (req, res) => {
	const {date, code} = req.params;

	const cacheKey = `helperData-${date}-${code}-provider3`;

	const initRemoteRequests = () => {
		const provider3options = {
			method: 'GET',
			uri: `https://www.tuttur.com/draw/events/type/football`,
			json: true,
			timeout: 10000
		};

		request(provider3options)
			.then(response => {
				let matchList = helper.replaceDotWithUnderscore(response.events);
				if (matchList && matchList[code] && date === moment(matchList[code].startDate * 1e3).format('DD.MM.YYYY')) {
					cacheService.instance().set(cacheKey, matchList, cacheDuration.provider3);
					if (helperDataCollection) {
						helperDataCollection.insertOne({
							date: date,
							provider: "provider3",
							data: matchList
						}).then(() => {
							res.send(matchList);
						}).catch(err => {
							console.log('DB Error: Can not inserted to db ' + err);
							res.send(matchList);
						});
					} else {
						res.send(matchList);
					}
				} else {
					res.send(null);
				}
			})
			.catch(err => {
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server',
					err: err
				})
			});
	};

	let cachedData = cacheService.instance().get(cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		if (helperDataCollection) {
			helperDataCollection
				.findOne({"date": date, "provider": "provider3"})
				.then(result => {
					if (result) {
						cacheService.instance().set(cacheKey, result.data, cacheDuration.provider3);
						res.send(result.data); // Data is found in the db, now caching and serving!
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


app.get('/api/helper4/:lang/:type/:id', (req, res) => {
	const {type, id, lang} = req.params;

	const cacheKey = `helperData-${type}-${lang}-${id}-provider4`,
		api_key = [
			"wshgqxxcvr7uptt3yetu3b8s", // sporarena
			"3a97ydredjbxvjghxjbzqz2g", // https://github.com/willisgram/master_thesis
			"j9xerbvc24veacrq3hpby6dk", // https://github.com/kberkeland/soccer-glance
		];

	let path = null;

	if (type === "teams")
		path = `teams/sr:competitor:${id}/profile.json`;
	else if (type === "players")
		path = `players/sr:player:${id}/profile.json`;

	const initRemoteRequests = (keyIndex = 0) => {
		const provider4options = {
			method: 'GET',
			uri: `https://api.sportradar.us/soccer-xt3/eu/${lang}/${path}?api_key=${api_key[keyIndex]}`,
			json: true,
			timeout: 10000
		};

		request(provider4options)
			.then(response => {
				if (response) {
					if (response.generated_at) delete response.generated_at;
					if (response.schema) delete response.schema;

					cacheService.instance().set(cacheKey, response, cacheDuration.provider4[type] || 60);
					if (sportradarCollection) {
						sportradarCollection.insertOne({
							type: type,
							id: id,
							lang: lang,
							data: response
						}).then(() => {
							res.send(response);
						}).catch(err => {
							console.log('DB Error: Can not inserted to db ' + err);
							res.send(response);
						});
					} else {
						res.send(response);
					}
				} else {
					throw Error('response is empty')
				}
			})
			.catch(() => {
				if (keyIndex + 1 <= api_key.length) {
					initRemoteRequests(keyIndex + 1)
				} else {
					res.status(404).send({
						status: "error",
						message: 'Error while retrieving information from server',
					})
				}
			});
	};

	let cachedData = cacheService.instance().get(cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		if (sportradarCollection) {
			sportradarCollection.findOne({
				type: type,
				id: id,
				lang: lang
			}).then(result => {
				if (result) {
					cacheService.instance().set(cacheKey, result.data, cacheDuration.provider4[type] || 60);
					res.send(result.data); // Data is found in the db, now caching and serving!
				} else {
					initRemoteRequests(); // data can't be found in db, get it from remote servers
				}
			}).catch(() => {
				console.log('findOne returned err, connection to db is lost. initRemoteRequests() is triggered');
				initRemoteRequests();
			})
		} else {
			initRemoteRequests();  // db is not initalized, get data from remote servers
		}
	}
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
			timeout: 10000
		};
		request(oleyOptions)
			.then(response => {
				if (response) {
					cacheService.instance().set(cacheKey, response, cacheDuration.oley[type] || 60);
					if (oleyCollection) {
						oleyCollection.insertOne({
							matchid: matchid,
							type: type,
							data: response
						}).then(() => {
							// console.log('checkpoint');
							res.send(response);
						}).catch(err => {
							console.log('DB Error: Can not inserted to db ' + err);
							res.send(response);
						});
					} else {
						res.send(response);
					}
				} else {
					res.status(500).send({
						status: "error",
						message: 'Error while retrieving information from server'
					})
				}
			})
			.catch(err => {
				res.status(500).send({
					status: "error",
					message: 'Error while retrieving information from server',
					err: err
				})
			});
	};

	let cachedData = cacheService.instance().get(cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		if (oleyCollection) {
			oleyCollection
				.findOne({matchid: matchid, type: type})
				.then(result => {
					if (result) {
						cacheService.instance().set(cacheKey, result.data, cacheDuration.oley[type] || 60);
						res.send(result.data); // Data is found in the db, now caching and serving!
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

app.get('/sitemap/:lang/:sport/:type/:by/:date', (req, res) => {
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
	} else if (type === "daily") {  // Sample: /sitemap/tr/football/daily/day/2019-03
		res.header('Content-Type', 'text/plain');
		let days = [];
		let daysInMonth = moment(date, "YYYY-MM").daysInMonth();
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(`https://www.ultraskor.com${lang === "tr" ? '/maclar/tarih' : '/en/matches/date'}-${date}-${i < 10 ? `0${i}` : i}`);
		}
		res.send(days.join('\r'));
	} else if (type === "list" && by === "day") {
		const configUltraSkorGetByDate = {
			method: 'GET',
			uri: `https://www.ultraskor.com/api/?query=/${sport}//${date}/json`,
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://www.ultraskor.com',
				'referer': 'https://www.ultraskor.com/',
				'x-requested-with': 'XMLHttpRequest'
			},
			timeout: 10000
		};
		res.header('Content-Type', 'text/plain');

		request(configUltraSkorGetByDate)
			.then(mainData => {
				if (mainData && mainData.sportItem && mainData.sportItem.tournaments.length > 0) {
					let tournaments = mainData.sportItem.tournaments.reduce((whole, tournament) => {
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
							urls.push(`https://www.ultraskor.com${lang === "tr" ? "/mac/" : "/en/match/"}${helper.generateSlug(helper.t(event.homeTeam.name) + '-' + helper.t(event.awayTeam.name))}-${lang === "tr" ? "canli-skor" : "live-score"}-${event.id}`)
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


app.get('/sitemap/:lang/football-todaysmatches.txt', (req, res) => {
	res.redirect(`/sitemap/${req.params.lang}/football/list/day/${moment().format('YYYY-MM-DD')}`)
});

// Log Console Errors
app.post('/api/logerrors', (req, res) => {
	if (NODE_ENV !== "dev") {
		if (consoleErrorsCollection) {
			consoleErrorsCollection.insertOne(req.body, () => {
				res.send('OK');
			}).catch(() => {
				res.status(500).send('Error');
			});
		} else res.status(500).send('Error');
	} else res.send('Console logging is not activated on dev env');
});

app.get('/api/tor', (req, res) => {
	tr.request('https://api.ipify.org', function (err, status, response) {
		if (!err && status.statusCode === 200) {
			res.send(response);
		}
	});
});

app.get('/api/tor/new', (req, res) => {
    tr.newTorSession((err, response) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(response);
        }
    });
});



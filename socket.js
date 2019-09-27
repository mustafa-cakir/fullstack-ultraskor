const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
// const MongoClient = require('mongodb').MongoClient;
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
const WebSocket = require('ws');
const SocksProxyAgent = require('socks-proxy-agent');

const AWS = require("aws-sdk");

AWS.config.update({
	region: "eu-central-1",
	endpoint: "https://dynamodb.eu-central-1.amazonaws.com",
	accessKeyId: "AKIA6RK5WADCQXEQOSCI",
	secretAccessKey: "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"
});

const dynamoDB = helper.isDev ? null : new AWS.DynamoDB.DocumentClient();

const port = 5001;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(helper.initCors());

console.log('gCloud active!');

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


let wsMaxRetry = 25;
const initWebSocket = () => {
	let swTimeout = null;
	let pushServiceUri =
		[
			"wss:\/\/ws.sofascore.com:10017",
			"wss:\/\/ws.sofascore.com:10011",
			"wss:\/\/ws.sofascore.com:10012",
			"wss:\/\/ws.sofascore.com:10014",
			"wss:\/\/ws.sofascore.com:10013",
			"wss:\/\/ws.sofascore.com:10016",
			"wss:\/\/ws.sofascore.com:10015",
			"wss:\/\/ws.sofascore.com:10010"
		];

	let getPushServiceUri = pushServiceUri.sort(function () {
		return 0.5 - Math.random()
	})[0];
	console.log(getPushServiceUri);

	let ws = new WebSocket(getPushServiceUri + '/ServicePush', {
		origin: 'https://www.sofascore.com',
		rejectUnauthorized: false,
		...(!helper.isTorDisabled && {agent: new SocksProxyAgent('socks://127.0.0.1:9050')})
	});

	ws.on('error', (err) => {
		console.log('errored', err);
	});

	ws.on('open', () => {
		console.log('ws connected');
		ws.send(JSON.stringify({
			"type": 0,
			"data": ["subscribe", {"id": "event", "events": ["sport_football"]}]
		}), undefined, undefined);
		swTimeout = setInterval(() => {
			ws.send(JSON.stringify("primus::ping::" + new Date().getTime()), undefined, undefined);
			// console.log('## ping sent')
		}, 20000);
		wsMaxRetry = 25;
	});

	ws.on('close', (err) => {
		console.log('ws disconnected. ', err);
		if (wsMaxRetry > 0) initWebSocket();
		clearInterval(swTimeout);
		wsMaxRetry--;
	});

	ws.on('pong', (data) => {
		// console.log('Ws pong ', data);
	});

	ws.on('message', res => {
		if (res.substr(0, 15).match('pong')) {
			// console.log('## pong recived', res);
		} else {
			if (!res) return false;
			res = helper.simplifyWebSocketData(res);
			cronjob.pushServiceChangesForWebPush(res);
			io.sockets.emit('push-service', res);
		}
		// console.log('## message ', data);
	});
};


initWebSocket();

server.listen(port, () => console.log(`Listening on port ${port}`));

// Connect to an external socket for gathering the changes


io.on('connection', socket => {
	socket.emit('heyooo', "mesg heyoo");

	helper.userConnected();
	// console.log('User connected. Active user: ', helper.userCount());
	// socket.on('get-updates-2', () => {
	// 	ws.on('message', (data) => {
	// 		socket.emit('return-updates-homepage-2', JSON.parse(data));
	// 	});
	// });


	socket.on('get-updates-homepage', () => {
		let cachedData = cacheService.instance().get("fullData");
		socket.emit('return-updates-homepage', cachedData || null);
	});

	socket.on('get-flashcore-changes', () => {
		let cachedData = cacheService.instance().get("changes");
		socket.emit('return-flashcore-changes', cachedData || null);
	});


	socket.on('forum-post-new', data => {
		if (!dynamoDB) return false;
		const params = {
			TableName: "ultraskor_forum",
			Item: {
				topicId: data.topicId,
				message: data.message,
				date: data.date,
				userName: data.userName
			}
		};
		dynamoDB.put(params, err => {
			if (!err) {
				io.sockets.emit('forum-new-submission', data)
			}
		});
	});


	socket.on('forum-get-all-by-id', topicId => {
		if (dynamoDB) {
			const params = {
				TableName: "ultraskor_forum",
				KeyConditionExpression: "#topicid = :id",
				ExpressionAttributeNames: {
					"#topicid": "topicId"
				},
				ExpressionAttributeValues: {
					":id": topicId
				}
			};
			dynamoDB.query(params, (err, result) => {
				if (err) {
					if (helper.isDev) console.log(err);
					if (helper.isDev) console.log('DB Error: Db is not connected');
					socket.emit('forum-get-all-by-id-result', []);
				} else if (result && result.Count > 0) {
					if (helper.isDev) console.log("check1", result);
					socket.emit('forum-get-all-by-id-result', result.Items)
				} else {
					if (helper.isDev) console.log("check2", result);
					socket.emit('forum-get-all-by-id-result', []);
				}
			});
		} else {
			if (helper.isDev) console.log('DB Error: Db is not connected');
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

			function onSuccess(res) {
				cacheService.instance().set(cacheKey, res, cacheDuration.main.eventdetails || 10);
				socket.emit('return-updates-details', res);
			}

			function onError() {
				socket.emit('return-error-updates', "Error while retrieving information from server");
			}

			if (helper.isTorDisabled) {
				request(sofaOptions)
					.then(onSuccess)
					.catch(onError);
			} else {
				tr.request(sofaOptions, function (err, status, res) {
					if (!err && status.statusCode === 200) {
						onSuccess(res);
					} else {
						onError(err);
					}
				});
			}
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

		request(sofaOptions)
			.then(onSuccess)
			.catch(onError);

		function onSuccess(response) {
			if (req.query.page === "homepage") response = helper.simplifyHomeData(response);
			if (response) {
				cacheService.instance().set(cacheKey, response, cacheDuration.main[req.query.page] || 5);
				res.send(response);
			}
		}

		function onError() {
			console.log(`Error returning data from main for ${req.query.page}. Trying TOR...`);
			requestUsingTor();
		}

		function requestUsingTor() {
			tr.request(sofaOptions, function (err, status, response) {
				if (!err && status.statusCode === 200) {
					onSuccess(response);
				} else {
					onErrorUsingTor(err);
				}
			});
		}

		function onErrorUsingTor(err) {
			res.status(500).send({
				status: "error",
				message: 'Error while retrieving information from server',
				err: err
			});
		}
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
	let targetDate = moment(date, "DD.MM.YYYY").format('YYYY-MM-DD'); // another date
	const cacheKey = `helperData-${targetDate}-provider1`;
	let isToday = moment(date, "DD.MM.YYYY").isSame(moment(), 'day');
	const initRemoteRequests = () => {
		const provider1options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://ls.betradar.com',
				'Referer': 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page'
			},
			uri: `https://ls.fn.sportradar.com/tempobet/tr/Europe:Istanbul/gismo/sport_matches/1/${targetDate}/1`,
			//uri: `https://lsc.fn.sportradar.com/betradar/en/Europe:Istanbul/gismo/event_fullfeed/${offset}`,
			json: true,
			timeout: 10000
		};


		request(provider1options)
			.then(response => {
				let matchList = helper.preProcessHelper1Data(response);
				if (matchList && matchList.length > 0) {
					if (isToday) cacheService.instance().set(cacheKey, matchList, cacheDuration.provider1);

					if (dynamoDB && isToday) {
						const params = {
							TableName: "ultraskor_helper1",
							Item: {
								date: targetDate,
								data: JSON.stringify(matchList)
							}
						};

						dynamoDB.put(params, err => {
							if (err) {
								console.error("Unable to add item. Check. Error JSON:", JSON.stringify(err, null, 2));
								res.send(matchList);
							} else {
								if (helper.isDev) console.log("Helper1: DynamoDB write completed, now serving...");
								res.send(matchList);
							}
						});
					} else {
						if (!dynamoDB) console.log('dynamoDB is missing, nothing is backed up');
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
	} else if (dynamoDB) {
		const params = {
			TableName: "ultraskor_helper1",
			Key: {
				date: targetDate,
			}
		};

		dynamoDB.get(params, (err, result) => {
			if (err) {
				console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
				initRemoteRequests();
			} else if (result && result.Item) {
				if (helper.isDev) console.log("Helper1: DynamoDB read completed, now serving...");
				cacheService.instance().set(cacheKey, result.Item.data, cacheDuration.provider1);
				res.send(result.Item.data); // Data is found in the db, now caching and serving!
			} else {
				initRemoteRequests();
			}
		});
	} else {
		initRemoteRequests();  // db is not initalized, get data from remote servers
	}
});

app.get('/api/helper2/:date', (req, res) => {
	const date = req.params.date;
	const cacheKey = `helperData-${date}-provider2`;
	let argumentDate = moment(date, 'MM.DD.YYYY').format('MM/DD/YYYY');
	let targetDate = moment(date, 'MM.DD.YYYY').format('YYYY-MM-DD');

	let isToday = moment(date, 'MM.DD.YYYY').isSame(moment(), 'day');

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
					"day": argumentDate,
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
					if (isToday) cacheService.instance().set(cacheKey, response, cacheDuration.provider2);
					if (dynamoDB && isToday) {
						const params = {
							TableName: "ultraskor_helper2",
							Item: {
								date: targetDate,
								data: JSON.stringify(response)
							}
						};

						dynamoDB.put(params, err => {
							if (err) {
								console.error("Unable to add item. Check. Error JSON:", JSON.stringify(err, null, 2));
								res.send(response);
							} else {
								if (helper.isDev) console.log("Helper2: DynamoDB write completed, now serving...");
								res.send(response);
							}
						});
					} else {
						if (!dynamoDB) console.log('dynamoDB is missing, nothing is backed up');
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
	} else if (dynamoDB) {
		const params = {
			TableName: "ultraskor_helper2",
			Key: {
				date: targetDate,
			}
		};


		dynamoDB.get(params, (err, result) => {
			if (err) {
				console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
				initRemoteRequests();
			} else if (result && result.Item) {
				if (helper.isDev) console.log("Helper2: DynamoDB read completed, now serving...");
				cacheService.instance().set(cacheKey, result.Item.data, cacheDuration.provider2);
				res.send(result.Item.data); // Data is found in the db, now caching and serving!
			} else {
				initRemoteRequests();
			}
		});
	} else {
		initRemoteRequests();  // db is not initalized, get data from remote servers
	}
});


app.get('/api/iddaaHelper/:date', (req, res) => {
	const date = req.params.date;
	const cacheKey = `helperData-${date}-iddaahelper`;

	const initRemoteRequests = () => {
		const idaaHelperOptions = {
			method: 'POST',
			uri: `https://api.iddaa.com.tr/sportsprogram/1`,
			body: ["1_1", "2_87", "2_101_2.5", "2_89"],
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://www.iddaa.com.tr',
				'Referer': 'https://www.iddaa.com.tr/futbol-programi',
				'Sec-Fetch-Mode': 'cors',
			},
		};

		const onSuccess = response => {
			const responseData = helper.simplifyIddaaHelperData(response);

			const shouldCached = responseData.length > 200;
			let isToday = moment(date, 'DD.MM.YYYY').isSame(moment(), 'day');

			console.log('cache? the date: ', shouldCached, isToday);

			if (responseData) {
				if (shouldCached) {
					cacheService.instance().set(cacheKey, responseData, cacheDuration.iddaaHelper);
				}
				if (dynamoDB && isToday && shouldCached) {
					console.log('cache the date');
					const params = {
						TableName: "ultraskor_iddaahelper",
						Item: {
							date: date,
							data: JSON.stringify(responseData)
						}
					};

					dynamoDB.put(params, err => {
						if (err) {
							console.error("Unable to add item. Check. Error JSON:", JSON.stringify(err, null, 2));
							res.send(responseData);
						} else {
							if (helper.isDev) console.log("Helper2: DynamoDB write completed, now serving...");
							res.send(responseData);
						}
					});
				} else {
					if (!dynamoDB) console.log('dynamoDB is missing, nothing is backed up');
					res.send(responseData);
				}
			} else {
				res.send('nothing found!');
			}
		};

		const onError = () => {
			if (helper.isDev) console.log('error getting iddaaHelper');
			res.status(403).send({
				status: "error",
				message: 'Error while retrieving information from server',
			})
		};

		request(idaaHelperOptions)
			.then(onSuccess)
			.catch(onError);
	};

	let cachedData = cacheService.instance().get(cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else if (dynamoDB) {
		const params = {
			TableName: "ultraskor_iddaahelper",
			Key: {
				date: date,
			}
		};
		dynamoDB.get(params, (err, result) => {
			if (err) {
				console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
				initRemoteRequests();
			} else if (result && result.Item) {
				if (helper.isDev) console.log("Helper2: DynamoDB read completed, now serving...");
				cacheService.instance().set(cacheKey, result.Item.data, cacheDuration.iddaaHelper);
				res.send(result.Item.data); // Data is found in the db, now caching and serving!
			} else {
				initRemoteRequests();
			}
		});
	} else {
		initRemoteRequests();  // db is not initalized, get data from remote servers
	}
});

app.get('/api/iddaaOdds/:id/:live?', (req, res) => {
	const id = req.params.id;
	const isLive = req.params.live;
	const cacheKey = `helperData-iddaaOdds-${id}`;

	const initRemoteRequests = () => {
		const idaaOddsOptions = {
			method: 'GET',
			uri: `https://api.iddaa.com.tr/sportsprogram/${isLive ? "live/" : ""}markets/1/${id}`,
			json: true,
			timeout: 10000,
			headers: {
				'Origin': 'https://www.iddaa.com.tr',
				'Referer': 'https://www.iddaa.com.tr/canli-futbol-programi',
			},
		};

		const onSuccess = response => {
			const {data} = response;

			if (data) {
				cacheService.instance().set(cacheKey, data, cacheDuration.iddaaOdds);
				res.send(data);
			} else {
				res.sendStatus(404)
			}
		};

		const onError = () => {
			res.status(403).send({
				status: "error",
				message: 'Error while retrieving information from server'
			})
		};


		if (helper.isTorDisabled) {
			request(idaaOddsOptions)
				.then(onSuccess)
				.catch(onError);
		} else {
			tr.request(idaaOddsOptions, function (err, status, res) {
				if (!err && status.statusCode === 200) {
					onSuccess(res);
				} else {
					onError(err);
				}
			});
		}
	};

	let cachedData = cacheService.instance().get(cacheKey);
	if (typeof cachedData !== "undefined") { // Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		initRemoteRequests();  // db is not initalized, get data from remote servers
	}
});


app.get('/api/helper4/:lang/:type/:id', (req, res) => {
	const {type, id, lang} = req.params;

	const cacheKey = `helperData-${type}-${lang}-${id}-provider4`,
		api_key = [
			{
				region: "eu",
				key: "wshgqxxcvr7uptt3yetu3b8s" // sporarena - Europe
			},
			{
				region: "intl",
				key: "efrefsb22mebrc54gbu78ves" // sporarena - Intl
			},
			{
				region: "other",
				key: "v4j6ksqubsne2ur9aexuawt7" // sporarena - Other
			},
			{
				region: "eu",
				key: "3a97ydredjbxvjghxjbzqz2g" // https://github.com/willisgram/master_thesis
			},
			{
				region: "eu",
				key: "j9xerbvc24veacrq3hpby6dk" // https://github.com/kberkeland/soccer-glance
			},
			{
				region: "eu",
				key: "a4nbj7zwu8r7dzgeaw8yr23t" // https://github.com/antoine-lizee/sportcal
			},
			{
				region: "eu",
				key: "ha3v5v65eexxag3av2hnuhwq" // https://github.com/salman90/Live_Scores
			}
		];

	let path = null;

	if (type === "teams")
		path = `teams/sr:competitor:${id}/profile.json`;
	else if (type === "players")
		path = `players/sr:player:${id}/profile.json`;

	const initRemoteRequests = (keyIndex = 0) => {
		const provider4options = {
			method: 'GET',
			uri: `https://api.sportradar.us/soccer-xt3/${api_key[keyIndex].region}/${lang}/${path}?api_key=${api_key[keyIndex].key}`,
			json: true,
			timeout: 10000
		};
		request(provider4options)
			.then(response => {
				if (response) {
					if (response.generated_at) delete response.generated_at;
					if (response.schema) delete response.schema;

					cacheService.instance().set(cacheKey, response, cacheDuration.provider4[type] || 60);

					if (dynamoDB) {
						const params = {
							TableName: "ultraskor_sportradar",
							Item: {
								id: parseInt(id),
								type_lang: `${type}_${lang}`,
								data: JSON.stringify(response)
							}
						};

						dynamoDB.put(params, err => {
							if (err) {
								console.error("Unable to add item. Check. Error JSON:", JSON.stringify(err, null, 2));
								res.send(response);
							} else {
								if (helper.isDev) console.log("DynamoDB write completed, now serving...");
								res.send(response);
							}
						});
					} else {
						console.log('dynamoDB is missing, nothing is backed up');
						res.send(response);
					}

				} else {
					res.status(500).send({
						status: "error",
						message: 'Error while retrieving information from server'
					})
				}
			})
			.catch(() => {
				if (keyIndex + 1 < api_key.length) {
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
	} else if (dynamoDB) {
		const params = {
			TableName: "ultraskor_sportradar",
			Key: {
				id: parseInt(id),
				type_lang: `${type}_${lang}`
			}
		};

		dynamoDB.get(params, (err, result) => {
			if (err) {
				console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
				initRemoteRequests();
			} else if (result && result.Item) {
				if (helper.isDev) console.log("DynamoDB read completed, now serving...");
				cacheService.instance().set(cacheKey, result.Item.data, cacheDuration.provider4[type] || 60);
				res.send(result.Item.data); // Data is found in the db, now caching and serving!
			} else {
				initRemoteRequests();
			}
		});
	} else {
		initRemoteRequests();  // db is not initalized, get data from remote servers
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

					if (dynamoDB) {
						const params = {
							TableName: "ultraskor_oley",
							Item: {
								matchid: parseInt(matchid),
								type: type,
								data: JSON.stringify(response)
							}
						};

						dynamoDB.put(params, err => {
							if (err) {
								console.error("Unable to add item. Check. Error JSON:", JSON.stringify(err, null, 2));
								res.send(response);
							} else {
								res.send(response);
							}
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
	} else if (dynamoDB) {
		const params = {
			TableName: "ultraskor_oley",
			Key: {
				matchid: parseInt(matchid),
				type: type
			}
		};

		dynamoDB.get(params, (err, result) => {
			if (err) {
				console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
				initRemoteRequests();
			} else if (result && result.Item) {
				cacheService.instance().set(cacheKey, result.Item.data, cacheDuration.oley[type] || 60);
				res.send(result.Item.data); // Data is found in the db, now caching and serving!
			} else {
				initRemoteRequests();
			}
		});
	} else {
		initRemoteRequests();  // db is not initalized, get data from remote servers
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


app.get('/sitemap/matches/:year', (req, res) => {
	const {year} = req.params;

	res.header('Content-Type', 'application/xml');
	let xmlString = '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	let thisMonth = parseInt(moment().format('MM'));

	for (let month = 12; month > 0; month--) {
		if (year === "2019" && month > 4 && month <= thisMonth) {
			let day = moment(year + '-' + month, 'YYYY-MM').add(1, 'months').subtract(1, 'days').format('DD');
			let modifiedDate = moment(year + '-' + month + '-' + day + ' 23:59').utcOffset('+0300').format();
			if (month === thisMonth) {
				day = moment().format('DD');
				modifiedDate = moment().utcOffset('+0300').format();
			}
			xmlString += `
				<sitemap>
					<loc>https://www.ultraskor.com/sitemap/matches/${year}/${month < 10 ? `0${month}` : month}</loc>
					<lastmod>${modifiedDate}</lastmod>
				</sitemap>
			`;
		}
	}
	xmlString += '</sitemapindex>';
	res.send(xmlString);
	//}
});

app.get('/sitemap/matches/:year/:month', (req, res) => {
	const {year, month} = req.params;
	res.header('Content-Type', 'application/xml');
	let xmlString = '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
	let thisMonth = parseInt(moment().format('MM'));
	let toDay = parseInt(moment().format('D'));
	let daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

	for (let day = daysInMonth; day > 0; day--) {
		if (parseInt(month) === thisMonth && day > toDay) {
			// do nothing...
		} else {
			//let day = moment(year + '-' + month, 'YYYY-MM').add(1, 'months').subtract(1, 'days').format('DD');
			let modifiedDate = moment(`${year}-${month}-${day < 10 ? `0${day}` : day} 23:59`).utcOffset('+0300').format();

			if (parseInt(month) === thisMonth && day === toDay) {
				modifiedDate = moment().utcOffset('+0300').format();
			}

			xmlString += `
				<sitemap>
					<loc>https://www.ultraskor.com/sitemap/matches/${year}/${month}/${day < 10 ? `0${day}` : day}</loc>
					<lastmod>${modifiedDate}</lastmod>
				</sitemap>
			`;
		}
	}
	xmlString += '</sitemapindex>';
	res.send(xmlString);
	//}
});

app.get('/sitemap/matches/:year/:month/:day', (req, res) => {
	const {year, month, day} = req.params;

	let lang = "tr";

	res.header('Content-Type', 'application/xml');

	let xmlString = '<?xml version="1.0" encoding="UTF-8"?> <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

	let thisMonth = parseInt(moment().format('MM'));
	let toDay = parseInt(moment().format('D'));
	let daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

	const configUltraSkorGetByDate = {
		method: 'GET',
		uri: `https://www.ultraskor.com/api/?query=/football//${year}-${month}-${day}/json`,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'Origin': 'https://www.ultraskor.com',
			'referer': 'https://www.ultraskor.com/',
			'x-requested-with': 'XMLHttpRequest'
		},
		timeout: 10000
	};

	request(configUltraSkorGetByDate)
		.then(mainData => {
			if (mainData && mainData.sportItem && mainData.sportItem.tournaments.length > 0) {
				let tournaments = mainData.sportItem.tournaments.reduce((whole, tournament) => {
					tournament.events = tournament.events.filter((event) => {
						return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === `${year}-${month}-${day}`;
					});
					tournament.events.forEach(() => {
						if (whole.indexOf(tournament) < 0) whole.push(tournament);
					});
					return whole;
				}, []);

				//let urls = [];
				tournaments.forEach(tournament => {
					tournament.events.forEach(event => {
						// let startTime = moment.unix(event.startTimestamp).utc().utcOffset('+0300').format();
						let finishTimeUTC = moment.unix(event.startTimestamp).utc().utcOffset('+0300').add(90, 'minutes').format();

						let notStartedYet = event.startTimestamp > moment().unix();
						let differenceDays = Math.abs(moment(moment().unix(), "X").diff(moment(event.startTimestamp, "X"), 'days'));

						let stringChangeFreq = '';
						let stringPriority = '';

						if (differenceDays < 3) { // within + or - 10 days
							stringPriority = '<priority>1.0</priority>';
							stringChangeFreq = '<changefreq>always</changefreq>';
						} else if (differenceDays < 7) {
							stringChangeFreq = '<changefreq>hourly</changefreq>';
							stringPriority = '<priority>0.9</priority>';
						} else if (differenceDays < 14) {
							stringChangeFreq = '<changefreq>daily</changefreq>';
							stringPriority = '<priority>0.8</priority>';
						} else if (differenceDays < 20) {
							stringChangeFreq = '<changefreq>weekly</changefreq>';
							stringPriority = '<priority>0.7</priority>';
						} else if (differenceDays < 30) {
							stringChangeFreq = '<changefreq>monthly</changefreq>';
							stringPriority = '<priority>0.6</priority>';
						} else {
							stringChangeFreq = '<changefreq>yearly</changefreq>';
							stringPriority = '<priority>0.5</priority>';
						}

						let stringLastModified = `<lastmod>${finishTimeUTC}</lastmod>`;
						if (notStartedYet) {
							stringLastModified = `<lastmod>${moment().utcOffset('+0300').format()}</lastmod>`;
						}

						xmlString += `
								<url>
									<loc>${`https://www.ultraskor.com/mac/${helper.generateSlug(helper.t(event.homeTeam.name) + '-' + helper.t(event.awayTeam.name))}-canli-skor-${event.id}`}</loc>
									${stringLastModified}
									${stringChangeFreq}
									${stringPriority}
									<xhtml:link rel="alternate" hreflang="tr" href="${`https://www.ultraskor.com/mac/${helper.generateSlug(helper.t(event.homeTeam.name) + '-' + helper.t(event.awayTeam.name))}-canli-skor-${event.id}`}"/>
						            <xhtml:link rel="alternate" hreflang="en" href="${`https://www.ultraskor.com/en/match/${helper.generateSlug(event.homeTeam.name + '-' + event.awayTeam.name)}-live-score-${event.id}`}"/>   
								</url>
								<url>
									<loc>${`https://www.ultraskor.com/en/match/${helper.generateSlug(event.homeTeam.name + '-' + event.awayTeam.name)}-live-score-${event.id}`}</loc>
									${stringLastModified}
									${stringChangeFreq}
									${stringPriority}
									<xhtml:link rel="alternate" hreflang="tr" href="${`https://www.ultraskor.com/mac/${helper.generateSlug(helper.t(event.homeTeam.name) + '-' + helper.t(event.awayTeam.name))}-canli-skor-${event.id}`}"/>
						            <xhtml:link rel="alternate" hreflang="en" href="${`https://www.ultraskor.com/en/match/${helper.generateSlug(event.homeTeam.name + '-' + event.awayTeam.name)}-live-score-${event.id}`}"/>   
								</url>`;
					});
				});
				xmlString += '</urlset>';
				res.send(xmlString);
			} else {
				res.status(500).send('Error 2')
			}
		})
		.catch(err => {
			res.status(500).send('Error 1' + err,)
		});
});


app.get('/sitemap/:lang/football-todaysmatches.txt', (req, res) => {
	res.redirect(`/sitemap/${req.params.lang}/football/list/day/${moment().format('YYYY-MM-DD')}`)
});

// Log Console Errors
app.post('/api/logerrors', (req, res) => {
	if (helper.isProd) {
		if (dynamoDB) {
			const params = {
				TableName: "ultraskor_errors",
				Item: {
					type: "console_error",
					data: JSON.stringify(req.body)
				}
			};
			dynamoDB.put(params, err => {
				if (err) {
					res.status(500).send('Error saving console error');
				} else {
					res.send('OK');
				}
			});
		} else {
			res.status(500).send('Error');
		}
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



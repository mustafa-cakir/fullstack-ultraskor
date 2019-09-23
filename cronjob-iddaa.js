const CronJob = require('cron').CronJob;
const moment = require('moment');
const request = require('request-promise-native');
const helper = require('./helper');
const cacheDuration = helper.cacheDuration();
const cacheService = require('./cache.service');
const tr = require('tor-request');
tr.TorControlPort.password = 'muztafultra';


const cronHandler = (dynamoDB) => {
	console.log('cronjob run');
	const date = moment().format('DD.MM.YYYY');
	const cacheKey = `helperData-${date}-iddaahelper`;
	let retry = 25;

	const initRemoteRequests = () => {
		retry -= 1;
		const idaaHelperOptions = {
			method: 'GET',
			uri: 'https://mobile-bulletin.oley.com/iddia-ws/api/events/getEventsBySport?sportId=1',
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://mobil.oley.com',
				'Referer': 'https://mobil.oley.com/iddaa/',
				'Sec-Fetch-Mode': 'no-cors',
			},
		};
		request(idaaHelperOptions)
			.then(response => {
				const responseData = response
				&& response.bulletin
				&& response.bulletin.Soccer
				&& response.bulletin.Soccer.eventList
				&& response.bulletin.Soccer.eventList.length > 0 ? response.bulletin.Soccer.eventList : null;

				if (responseData) {
					cacheService.instance().set(cacheKey, responseData, cacheDuration.iddaaHelper);
					if (dynamoDB) {
						const params = {
							TableName: "ultraskor_iddaahelper",
							Item: {
								date: date,
								data: JSON.stringify(responseData)
							}
						};

						dynamoDB.put(params, err => {
							if (err) {
								console.log("Unable to add item. Check. Error JSON:", JSON.stringify(err, null, 2));
							} else {
								if (helper.isDev) console.log("Helper2: DynamoDB write completed, now serving...");
							}
						});
					} else {
						if (!dynamoDB) console.log('dynamoDB is missing, nothing is backed up' + date);
					}
				} else {
					console.log('nothing found!' + date);
				}
			})
			.catch(err => {
				if (helper.isDev) console.log('## error, retry: ', retry, err);
				if (retry > 0) {
					setTimeout(() => {
						initRemoteRequests();
					}, 50000);
				} else {
					console.log('error after retry' + date);
				}
			});
	};

	initRemoteRequests();  // db is not initalized, get data from remote servers
};

cronHandler(); // run manually for the first time;

// const cron = new CronJob('*/5 * * * * *', cronHandler); // every 30 minutes
// const cron = new CronJob('*/30 * * * *', cronHandler); // every 30 minutes


exports.start = (dynamoDB) => {
	// cron.start();
	setTimeout(() => {
		cronHandler(dynamoDB)
	}, 2000);
};

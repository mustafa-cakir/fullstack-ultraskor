const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
tor.TorControlPort.password = 'muztafultra';
const cacheService = require('../../cache.service');
const {simplifyHomeData, cacheDuration} = require('../../helper');
const auth = require('../auth');

router.get('/', auth.optional, (req, res) => {
	const cacheKey = `mainData-${req.query.query}`;
	req.query.page = req.query.page || 'default';
	const initRemoteRequests = () => {
		const sofaOptions = {
			method: 'GET',
			uri: `https://www.sofascore.com${req.query.query}?_=${Math.floor(Math.random() * 10e8)}`,
			json: true,
			headers: {
				'Content-Type': 'application/json',
				Origin: 'https://www.sofascore.com',
				referer: 'https://www.sofascore.com/',
				'x-requested-with': 'XMLHttpRequest'
			},
			timeout: 10000
		};

		const onErrorUsingTor = () => {
			res.statusCode(500);
		};

		const onSuccess = response => {
			if (req.query.page === 'homepage') response = simplifyHomeData(response);
			if (response) {
				cacheService.instance().set(cacheKey, response, cacheDuration.main[req.query.page] || 5);
				res.send(response);
			}
		};

		const requestUsingTor = () => {
			tor.request(sofaOptions, (err, status, response) => {
				if (!err && status.statusCode === 200) {
					onSuccess(response);
				} else {
					onErrorUsingTor(err);
				}
			});
		};

		const onError = () => {
			console.log(`Error returning data from main for ${req.query.page}. Trying TOR...`);
			requestUsingTor();
		};

		request(sofaOptions)
			.then(onSuccess)
			.catch(onError);
	};

	const cachedData = cacheService
		.instance()
		.get(req.query.page === 'homepage' && req.query.today === '1' ? 'fullData' : cacheKey);
	if (typeof cachedData !== 'undefined') {
		// Cache is found, serve the data from cache
		res.send(cachedData);
	} else {
		initRemoteRequests();
	}
});

module.exports = router;

const CronJob = require('cron').CronJob;
const moment = require('moment');
const request = require('request-promise-native');
const webpushHelper = require('./webpush');
const helper = require('./helper');
const cacheService = require('./cache.service');
const tr = require('tor-request');
tr.TorControlPort.password = 'muztafultra';

const options = moment => {
	let sofaOptions = {
		method: 'GET',
		uri: `https://www.sofascore.com/football//${moment.format('YYYY-MM-DD')}/json?_=${Math.floor(Math.random() * 10e8)}`,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'Origin': 'https://www.sofascore.com',
			'referer': 'https://www.sofascore.com/',
			'x-requested-with': 'XMLHttpRequest'
		}
	};
	return sofaOptions;
};
if (helper.isTorDisabled) {
	console.log("Tor Disabled");
} else {
	tr.request('https://api.ipify.org', function (err, status, response) {
		if (!err && status.statusCode === 200) {
			console.log("Your public (through Tor) IP is: " + response);
		}
	});
}



exports.pushServiceChangesForWebPush = (res) => {
	let fullData = cacheService.instance().get("fullData");
	if (typeof fullData === "undefined") {
		console.log('fullData can not be gathered from cache');
		return false;
	}

	let redScoreBarType = null;
	let redScoreBarIncident = {};

	let getTournament = fullData.sportItem.tournaments.filter(x => x.tournament.id === res.info.tournament)[0];
	if (!getTournament) return;
	let event = getTournament.events.filter(x => x.id === res.info.id)[0];
	if (!event) return;
	if (res.changesData && res.changesData.status && res.status.code !== event.status.code) {
		//console.log(event.status, res.status);
		event.status = res.status;
		redScoreBarType = "status_update";
	}
	if (res.homeRedCards && res.homeRedCards !== event.homeRedCards) {
		event.homeRedCards = res.homeRedCards; // home Team Red Card
		redScoreBarType = "home_redcard";
	}

	if (res.awayRedCards && res.awayRedCards !== event.awayRedCards) {
		event.awayRedCards = res.awayRedCards; // home Team Red Card
		redScoreBarType = "away_redcard";
	}

	if (res.changesData && res.changesData.score) {
		if (res.changesData.home.score) {
			let oldScore = event.homeScore.current || 0,
				newScore = res.homeScore.current;

			if (typeof newScore === "number" && typeof newScore === "number" && newScore !== oldScore) {
				if (newScore > oldScore) {
					if (helper.isDev) console.log(`${res.homeTeam.name} Home Team Scored. ${oldScore} -> ${newScore}`);
					redScoreBarType = "home_scored";
				} else if (newScore < oldScore) {// away team scored!!
					if (helper.isDev) console.log(`${res.homeTeam.name} Home Team Score Cancelled. ${oldScore} -> ${newScore}`);
					redScoreBarType = "home_scored_cancel";
				}
				event.homeScore = res.homeScore; // update score Object
			}

		} else if (res.changesData.away.score) {
			let oldScore = event.awayScore.current || 0,
				newScore = res.awayScore.current;

			if (typeof newScore === "number" && typeof newScore === "number" && newScore !== oldScore) {
				if (newScore > oldScore) {
					if (helper.isDev) console.log(`${res.awayTeam.name} Away Team Scored. ${oldScore} -> ${newScore}`);
					redScoreBarType = "away_scored";
				} else if (newScore < oldScore) {// away team scored!!
					if (helper.isDev) console.log(`${res.awayTeam.name} Away Team Score Cancelled. ${oldScore} -> ${newScore}`);
					redScoreBarType = "away_scored_cancel";
				}
				event.awayScore = res.awayScore;  // update score Object
			}
		}
	}

	// update statusDescription in all situations
	if (event.statusDescription !== res.statusDescription) {
		event.statusDescription = res.statusDescription
	}

	if (redScoreBarType) {
		redScoreBarIncident = {
			type: redScoreBarType,
			event: event
		};
		webpushHelper.initWebPushByWebSocket(redScoreBarIncident);
	}

	cacheService.instance().set('fullData', fullData, 60 * 30); // cache the new fullData for 30 min.
};

const customRequest = (options, cb) => {
	if (helper.isTorDisabled) {
		request(options, cb)
	} else {
		tr.request(options, cb);
	}
};

const cronHandler = () => {
	customRequest(options(moment()), function (err, status, res) {
		if (!err && status.statusCode === 200 && res.sportItem && res.sportItem.tournaments.length > 0) {
			let fullData = helper.simplifyHomeData(res);
			cacheService.instance().set('fullData', fullData, 60 * 30); // cache the homepage full data for 30 min
		} else { // error
			console.log(`Error returning differences within cronJob. Time: ${ new Date()}`);
		}
	});
};

cronHandler(); // run manually for the first time;

const cron = new CronJob('*/30 * * * *', cronHandler); // every 30 minutes

exports.start = () => {
	cron.start();
};

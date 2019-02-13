const cron = require('node-cron');
const diff = require('deep-diff');
const moment = require('moment');
const request = require('request-promise-native');
const webpushHeler = require('./webpush');
const _ = require('lodash');

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

exports.init = () => {
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
						webpushHeler.initWebPush(changes);
					}
				}
				previousData = events;
			})
			.catch((err) => {
				console.log(`Error returning differences. Error: ${err}`);
			});
	});
};

exports.fullData = () => {
	return fullData;
};

exports.changes = () => {
	return changes;
};

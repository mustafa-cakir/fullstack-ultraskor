const CronJob = require('cron').CronJob;
const diff = require('deep-diff');
const moment = require('moment');
const request = require('request-promise-native');
const webpushHelper = require('./webpush');
const _ = require('lodash');
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
    // if (process.env.NODE_ENV === "dev") {
    //     sofaOptions.uri = `https://www.ultraskor.com/api/?query=/football//${moment.format('YYYY-MM-DD')}/json?_=${Math.floor(Math.random() * 10e8)}`;
    //     sofaOptions.headers = {}
    // }
    return sofaOptions;
};
let previousData = null;
let changes = null;
let fullData = null;

console.log("TOR_DISABLED: ", process.env.TOR_DISABLED);
tr.request('https://api.ipify.org', function (err, status, response) {
	if (!err && status.statusCode === 200) {
		console.log("Your public (through Tor) IP is: " + response);
	}
});

const customRequest = (options, cb) => {
	if (process.env.TOR_DISABLED === "true") {
		request(options, cb)
	} else {
		tr.request(options, cb);
	}
};

const cron = new CronJob('*/20 * * * * *', function () {
	//if (helper.userCount() < 1) return false; // if there is no active user, disable cropjob
    //console.log('cronjob init', helper.userCount());
	customRequest(options(moment()), function (err, status, res) {
		if (!err && status.statusCode === 200 && res.sportItem && res.sportItem.tournaments.length > 0) {
			fullData = helper.simplifyHomeData(res);
			cacheService.instance().set('fullData', fullData, 20); // cache the homepage full data for 20 seconds
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

						if (eventDiff[0].path && eventDiff[0].path.length > 0 && eventDiff[0].path[0] === "statusDescription") {
							// do nothing
						} else {
							changes.push(eventDiff);
						}
					}
				});

				if (changes.length > 0) {
					cacheService.instance().set('changes', changes, 20); // cache the changes for 10 seconds
					// console.log('Changes found via Cronjob ', new Date());
					webpushHelper.initWebPush(changes);
				}
			}
			previousData = events;
		} else { // error
			console.log(`Error returning differences within cronJob. Time: ${ new Date()}`);
		}

	});
    /*request(options(moment()))
        .then(res => {
            // console.log('triggered 1');
            fullData = helper.simplifyHomeData(res);
            cacheService.instance().set('fullData', fullData, 10); // cache the homepage full data for 10 seconds
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
                    cacheService.instance().set('changes', changes, 10); // cache the changes for 10 seconds
                    console.log('Changes found via Cronjob ', new Date());
                    webpushHelper.initWebPush(changes);
                }
            }
            previousData = events;
        })
        .catch((err) => {
            //console.log(`Error returning differences within cronJob. Error: ${err}. Time: ${ new Date()}`);
        });
        */
});

exports.start = () => {
    cron.start();
};

// exports.fullData = () => {
// 	return fullData;
// };
//
// exports.changes = () => {
// 	return changes;
// };

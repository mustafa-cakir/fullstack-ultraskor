const { CronJob } = require('cron');
const moment = require('moment');
const update = require('immutability-helper');
const { fetchHomepage } = require('../fetch/homepage');
const cacheService = require('./cache.service');
const { isEmpty } = require('../utils');
const { isDev, cacheDuration } = require('../utils');
const { initWebPushByWebSocket } = require('./webpush.service');

const cronHandler = () => {
    if (isDev) console.log('## cron start!');
    fetchHomepage(moment().format('YYYY-MM-DD'))
        .then(response => {
            if (!isEmpty(response)) {
                if (isDev) console.log('homepageListData is cached!');
                const cacheKey = `homepageListData-${moment().format('YYYY-MM-DD')}`;
                cacheService.instance().set(cacheKey, response, cacheDuration.homepageListToday);
            }
        })
        .catch(err => {
            if (isDev) console.log('500 - fetchHomepage', err);
            console.log(`Error returning differences within cronJob. Time: ${new Date()}`);
        });
};

exports.pushServiceChangesForWebPush = res => {
    const cacheKey = `homepageListData-${moment().format('YYYY-MM-DD')}`;
    const homepageListData = cacheService.instance().get(cacheKey);
    if (!homepageListData || !homepageListData.tournaments) return false;

    const { tournament: tournamentId, event: eventId } = res.ids;
    const tournamentIndex = homepageListData.tournaments.findIndex(x => x.tournament.id === tournamentId);
    if (tournamentIndex < 0) return false;

    const eventIndex = homepageListData.tournaments[tournamentIndex].events.findIndex(x => x.id === eventId);
    if (eventIndex < 0) return false;

    const oldEvent = homepageListData.tournaments[tournamentIndex].events[eventIndex];
    const newEvent = { ...oldEvent, ...res.event };

    const newHomepageListData = update(homepageListData, {
        tournaments: {
            [tournamentIndex]: {
                events: {
                    [eventIndex]: {
                        $set: newEvent
                    }
                }
            }
        }
    });

    cacheService.instance().set(cacheKey, newHomepageListData, cacheDuration.homepageListToday); // cache the new homepageListData for 30 min.
    initWebPushByWebSocket(oldEvent, newEvent);
    return false;
};

setTimeout(() => {
    cronHandler(); // run manually for the first time;
}, 5000);

const cron = new CronJob('*/30 * * * *', cronHandler); // every 30 minutes

exports.init = () => {
    cron.start();
};

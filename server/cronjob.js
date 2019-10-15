const { CronJob } = require('cron');
const moment = require('moment');
const { fetchHomepage } = require('./fetch/homepage');
const cacheService = require('./cache.service');
const { isDev, cacheDuration } = require('./helper');
const { initWebPushByWebSocket } = require('./utils/webpush');

const cronHandler = () => {
    fetchHomepage(moment().format('YYYY-MM-DD'))
        .then(response => {
            const cacheKey = `homepageListData-${moment().format('YYYY-MM-DD')}`;
            cacheService.instance().set(cacheKey, response, cacheDuration.homepageListToday);
        })
        .catch(() => {
            console.log(`Error returning differences within cronJob. Time: ${new Date()}`);
        });
};

exports.pushServiceChangesForWebPush = res => {
    const cacheKey = `homepageListData-${moment().format('YYYY-MM-DD')}`;
    const homepageListData = cacheService.instance().get(cacheKey);
    if (!homepageListData || !homepageListData.tournaments) {
        console.log('homepageListData can not be gathered from cache');
        cronHandler();
        return false;
    }

    let redScoreBarType = null;
    let redScoreBarIncident = {};

    const getTournament = homepageListData.tournaments.filter(x => x.tournament.id === res.tournament.id)[0];
    if (!getTournament) return false;
    const event = getTournament.events.filter(x => x.id === res.event.id)[0];
    if (!event) return false;
    if (res.updated.status && res.event.status.code !== event.status.code) {
        // console.log(event.status, res.status);
        event.status = res.event.status;
        event.scores = res.event.scores;
        event.scores = res.event.scores;
        redScoreBarType = 'status_update';
    }
    if (res.event.redCards.home && res.event.redCards.home > event.redCards.home) {
        event.redCards.home = res.redCards.home; // home Team Red Card
        redScoreBarType = 'home_redcard';
    }

    if (res.event.redCards.away && res.event.redCards.away > event.redCards.away) {
        event.redCards.away = res.event.redCards.away; // home Team Red Card
        redScoreBarType = 'away_redcard';
    }

    if (res.updated.score) {
        if (res.updated.scores.home) {
            const oldScore = event.scores.home || 0;
            const newScore = res.event.scores.home;

            if (typeof newScore === 'number' && typeof newScore === 'number' && newScore !== oldScore) {
                if (newScore > oldScore) {
                    if (isDev) console.log(`${event.teams.home.name} Home Team Scored. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'home_scored';
                } else if (newScore < oldScore) {
                    if (isDev)
                        console.log(`${event.teams.away.name} Home Team Score Cancelled. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'home_scored_cancel';
                }
                event.scores = res.event.scores; // update score Object
            }
        } else if (res.updated.scores.scoawayre) {
            const oldScore = event.scores.away || 0;
            const newScore = res.event.scores.away;

            if (typeof newScore === 'number' && typeof newScore === 'number' && newScore !== oldScore) {
                if (newScore > oldScore) {
                    if (isDev) console.log(`${event.teams.away.name} Away Team Scored. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'away_scored';
                } else if (newScore < oldScore) {
                    if (isDev)
                        console.log(`${event.teams.away.name} Away Team Score Cancelled. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'away_scored_cancel';
                }
                event.scores = res.event.scores; // update score Object
            }
        }
    }

    // update statusDescription in all situations
    event.statusBoxContent = res.event.statusBoxContent;
    event.startTimestamp = res.event.startTimestamp;
    event.winner = res.event.winner;

    cacheService.instance().set(cacheKey, homepageListData, cacheDuration.homepageListToday); // cache the new homepageListData for 30 min.

    if (redScoreBarType) {
        redScoreBarIncident = {
            type: redScoreBarType,
            event
        };
        if (isDev) console.log(`webPush fn triggered for ${event.id}, for ${redScoreBarType},time: ${new Date()}`);
        initWebPushByWebSocket(redScoreBarIncident);
    }
    return false;
};

cronHandler(); // run manually for the first time;

const cron = new CronJob('*/30 * * * *', cronHandler); // every 30 minutes

exports.cronStart = () => {
    cron.start();
};

const { CronJob } = require('cron');
const moment = require('moment');
const helper = require('./helper');
const fetchHomepage = require('./fetch/homepage');
const cacheService = require('./cache.service');
const { initWebPushByWebSocket } = require('./utils/webpush');

exports.pushServiceChangesForWebPush = res => {
    const homepageListData = cacheService.instance().get('homepageListData');
    if (typeof homepageListData === 'undefined') {
        console.log('homepageListData can not be gathered from cache');
        return false;
    }

    let redScoreBarType = null;
    let redScoreBarIncident = {};

    const getTournament = homepageListData.filter(x => x.tournament.id === res.info.tournament)[0];
    if (!getTournament) return false;
    const event = getTournament.events.filter(x => x.id === res.info.id)[0];
    if (!event) return false;
    if (res.changesData && res.changesData.status && res.status.code !== event.status.code) {
        // console.log(event.status, res.status);
        event.status = res.status;
        event.homeScore = res.homeScore;
        event.awayScore = res.awayScore;
        redScoreBarType = 'status_update';
    }
    if (res.homeRedCards && res.homeRedCards !== event.homeRedCards) {
        event.homeRedCards = res.homeRedCards; // home Team Red Card
        redScoreBarType = 'home_redcard';
    }

    if (res.awayRedCards && res.awayRedCards !== event.awayRedCards) {
        event.awayRedCards = res.awayRedCards; // home Team Red Card
        redScoreBarType = 'away_redcard';
    }

    if (res.changesData && res.changesData.score) {
        if (res.changesData.home.score) {
            const oldScore = event.homeScore.current || 0;
            const newScore = res.homeScore.current;

            if (typeof newScore === 'number' && newScore !== oldScore) {
                if (newScore > oldScore) {
                    if (helper.isDev) console.log(`${res.homeTeam.name} Home Team Scored. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'home_scored';
                } else if (newScore < oldScore) {
                    // away team scored!!
                    if (helper.isDev)
                        console.log(`${res.homeTeam.name} Home Team Score Cancelled. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'home_scored_cancel';
                }
                event.homeScore = res.homeScore; // update score Object
            }
        } else if (res.changesData.away.score) {
            const oldScore = event.awayScore.current || 0;
            const newScore = res.awayScore.current;

            if (typeof newScore === 'number' && typeof newScore === 'number' && newScore !== oldScore) {
                if (newScore > oldScore) {
                    if (helper.isDev) console.log(`${res.awayTeam.name} Away Team Scored. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'away_scored';
                } else if (newScore < oldScore) {
                    // away team scored!!
                    if (helper.isDev)
                        console.log(`${res.awayTeam.name} Away Team Score Cancelled. ${oldScore} -> ${newScore}`);
                    redScoreBarType = 'away_scored_cancel';
                }
                event.awayScore = res.awayScore; // update score Object
            }
        }
    }

    // update statusDescription in all situations
    if (event.statusDescription !== res.statusDescription) {
        event.statusDescription = res.statusDescription;
    }

    cacheService.instance().set('homepageListData', homepageListData, 60 * 30); // cache the new homepageListData for 30 min.

    if (redScoreBarType) {
        redScoreBarIncident = {
            type: redScoreBarType,
            event
        };
        if (helper.isDev)
            console.log(`webPush fn triggered for ${event.id}, for ${redScoreBarType},time: ${new Date()}`);
        initWebPushByWebSocket(redScoreBarIncident);
    }
    return false;
};

const cronHandler = () => {
    fetchHomepage(moment().format('YYYY-MM-DD'))
        .then(response => {
            cacheService.instance().set('homepageListData', response, 60 * 30);
        })
        .catch(() => {
            console.log(`Error returning differences within cronJob. Time: ${new Date()}`);
        });
};

cronHandler(); // run manually for the first time;

const cron = new CronJob('*/30 * * * *', cronHandler); // every 30 minutes

exports.start = () => {
    cron.start();
};

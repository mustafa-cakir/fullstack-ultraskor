const moment = require('moment');
const _ = require('lodash');
const cors = require('cors');
const languageJson = require('./../client/src/languages/tr.json');

exports.preProcessSportRadarData = data => {
    let result = null;
    if (data.doc && data.doc.length > 0 && data.doc[0].data && data.doc[0].data) {
        result = data.doc[0].data.sport.realcategories.reduce((all, current) => {
            if (current.tournaments && current.tournaments.length > 0) {
                current.tournaments.forEach(tournament => {
                    if (tournament.matches && tournament.matches.length > 0) {
                        tournament.matches.forEach(match => {
                            const tempMatch = {};
                            tempMatch.id = match._id || null;
                            tempMatch.homeTeam = match.teams.home || null;
                            tempMatch.awayTeam = match.teams.away || null;
                            tempMatch.date = match._dt.date || null;
                            tempMatch.startTime = match._dt.time || null;
                            tempMatch.startTimestamp = match._dt.uts || null;
                            all.push(tempMatch);
                        });
                    }
                });
            }
            return all;
        }, []);
    }
    return result;
};

exports.replaceDotWithUnderscore = obj => {
    _.forOwn(obj, (value, key) => {
        // if key has a period, replace all occurences with an underscore
        if (_.includes(key, '.')) {
            const cleanKey = _.replace(key, /\./g, '_');
            obj[cleanKey] = value;
            delete obj[key];
        }

        // continue recursively looping through if we have an object or array
        if (_.isObject(value)) {
            return this.replaceDotWithUnderscore(value);
        }
        return false;
    });
    return obj;
};

exports.simplifyIddaaHelperData = response => {
    return response && response.data && response.data.events && response.data.events.length > 0
        ? response.data.events
        : null;
};

exports.simplifyHomeData = res => {
    if (res && res.sportItem && res.sportItem.tournaments) {
        const eventIgnoredProperties = [
            'changes',
            'confirmedLineups',
            'customId',
            'hasAggregatedScore',
            'hasDraw',
            'hasEventPlayerHeatMap',
            'hasEventPlayerStatistics',
            'hasFirstToServe',
            'hasOdds',
            'hasGlobalHighlights',
            'hasHighlights',
            'hasHighlightsStream',
            'hasLineups',
            'hasLineupsList',
            'hasLiveForm',
            'hasLiveOdds',
            'hasStatistics',
            'hasSubScore',
            'hasTime',
            'isAwarded',
            'isSyncable',
            'roundInfo',
            'sport',
            'votingEnabled',
            'odds'
        ];

        res.sportItem.tournaments = res.sportItem.tournaments.reduce((whole, item) => {
            item.events.map(event => {
                for (let i = 0; i < eventIgnoredProperties.length; i += 1) {
                    delete event[eventIgnoredProperties[i]];
                }
                return event;
            });
            whole.push(item);
            return whole;
        }, []);

        // res.sportItem.tournaments = res.sportItem.tournaments.filter(tournament => {
        //     return !(tournament.tournament.name.indexOf('Friendly') > -1 || tournament.tournament.name.indexOf('Women') > -1);
        // });
        //
        // res.sportItem.tournaments.forEach((tournament, index) => {
        // 	// if (tournament.tournament.name.indexOf('Friendly') > -1 || tournament.tournament.name.indexOf('Women') > -1) {
        //     //     console.log('deleted, index:', index);
        // 	// 	res.sportItem.tournaments.splice(index, 1);
        //     // } else {
        //         tournament.events.map(event => {
        // 	        for (let i = 0; i < eventIgnoredProperties.length; i++) {
        // 		        delete event[eventIgnoredProperties[i]]
        // 	        }
        // 	        return event
        //         });
        //     //}
        // });
    }
    return res;
};

exports.cacheDuration = {
    provider1: 60 * 60 * 24, // 24 hours
    provider2: 60 * 60 * 24, // 24 hours
    provider3: 60 * 60 * 24, // 24 hours
    iddaaHelper: 60 * 60 * 24, // 24 hours
    iddaaOdds: 15, // 15 seconds
    webpushtopic: 60 * 60 * 24 * 7, // 7 days
    oley: {
        missings: 60 * 60 * 6, // 6 hours
        teamstats: 60 * 60 * 24 // 24 hours
    },
    provider4: {
        teams: 60 * 60 * 24 // 24 hours
        // funfacts:  60 * 60 * 24, // 24 hours
    },
    main: {
        default: 60, // 1 min.
        homepage: 20, // 20 seconds
        eventdetails: 10, // 10 seconds
        lineup: 60 * 5, // 5 min,
        h2h: 60 * 30, // 30 min
        standing: 60 * 3, // 3 min.
        teamoftheweek: 60 * 60 * 24, // 24 hours
        leaguedetails: 60 * 3, // 3 min
        leaguedetailsFixture: 60 * 60 * 24, // 24 hours
        popularevents: 60 * 60 * 6 // 6 hours
    }
};

exports.generateSlug = text => {
    const a = 'çıüğöşàáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
    const b = 'ciugosaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special chars
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};

exports.t = text => {
    if (languageJson[text]) {
        return languageJson[text];
    }
    return text;
};

exports.mongoOptions = () => {
    return {
        useNewUrlParser: true,
        keepAlive: 1,
        connectTimeoutMS: 1000,
        socketTimeoutMS: 1000
    };
};

const whitelist = [
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:3000',
    'https://www.ultraskor.com'
];

const corsOptions = {
    origin(origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log(origin);
            callback(new Error('Not allowed by CORS'));
        }
    }
};
let activeUser = 0;
exports.userConnected = () => {
    activeUser += 1;
};

exports.userDisconnected = () => {
    activeUser -= 1;
};

exports.isDev = process.env.NODE_ENV === 'dev';
exports.isProd = process.env.NODE_ENV !== 'dev';
exports.isTorDisabled = process.env.TOR_DISABLED === 'true';
// exports.isTorDisabled = false

exports.userCount = () => {
    return activeUser;
};

exports.initCors = () => {
    return cors(corsOptions);
};

exports.simplifyWebSocketData = res => {
    let result = {};
    res = JSON.parse(res);
    if (res.data.length > 0 && res.data[1]) {
        const resData = res.data[1];
        result = {
            info: {
                id: parseFloat(resData.emits[0].split('_')[1]),
                type: resData.emits[1].split('_')[1],
                tournament: parseFloat(resData.emits[2].split('_')[1]),
                homeTeam: parseFloat(resData.emits[3].split('_')[1]),
                awayTeam: parseFloat(resData.emits[4].split('_')[1])
            },
            ...(resData.data.changesData && { changesData: resData.data.changesData }),
            awayScore: resData.data.awayScore,
            homeScore: resData.data.homeScore,
            homeTeam: resData.data.homeTeam,
            awayTeam: resData.data.awayTeam,
            status: resData.data.status,
            statusDescription: resData.data.statusDescription,
            ...(resData.data.homeRedCards && { homeRedCards: resData.data.homeRedCards }),
            ...(resData.data.awayRedCards && { awayRedCards: resData.data.awayRedCards })
        };
    }

    return result;
};

exports.mergeSofaAndRadar = (sofa, radar) => {
    if (!radar || !sofa) return null;

    const result = {};
    const radarTournaments = radar.doc[0].data.sport.realcategories.reduce((total, item) => {
        return total.concat(item.tournaments);
    }, []);
    // result.radar = radarTournaments;
    result.date = sofa.params.date;
    result.tournaments = [];
    sofa.sportItem.tournaments.forEach(tournament => {
        const events = [];
        const tournamentRadar = radarTournaments.filter(x => x._id === tournament.tournament.id)[0] || {};
        tournament.events.forEach(event => {
            if (moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === sofa.params.date) {
                let eventRadar = {};
                if (tournamentRadar.matches && tournamentRadar.matches.length > 0) {
                    eventRadar =
                        tournamentRadar.matches.filter(x => {
                            return x.teams.home.uid === event.homeTeam.id || x.teams.away.uid === event.homeTeam.id;
                        })[0] || {};
                }

                events.push({
                    teams: {
                        home: {
                            id: event.homeTeam.id,
                            name: event.homeTeam.name,
                            fullname: eventRadar.teams ? eventRadar.teams.home.mediumname : event.homeTeam.name
                        },
                        away: {
                            id: event.awayTeam.id,
                            name: event.awayTeam.name,
                            fullname: eventRadar.teams ? eventRadar.teams.away.mediumname : event.awayTeam.name
                        }
                    },
                    scores: {
                        home: event.homeScore.current || 0,
                        away: event.awayScore.current || 0,
                        ht: {
                            home: event.homeScore.period1 || 0,
                            away: event.awayScore.period1 || 0
                        }
                    },
                    redCards: {
                        home: event.homeRedCards || 0,
                        away: event.awayRedCards || 0
                    },
                    id: event.id,
                    id_: eventRadar._id,
                    id_t: eventRadar._tid,
                    id_ut: eventRadar._utid,
                    id_rc: eventRadar._rcid,
                    startTimestamp: event.startTimestamp * 1000,
                    status: event.status,
                    statusBoxContent: event.statusDescription,
                    winner: event.winnerCode
                });
            }
        });
        if (events.length > 0) {
            result.tournaments.push({
                category: {
                    icon: tournament.category.flag,
                    name: tournament.category.name,
                    id: tournament.category.id
                },
                events,
                season: {
                    ...(tournament.season && { id: tournament.season.id }),
                    name: {
                        ...(tournament.season && { en: tournament.season.name }),
                        ...(tournament.season && { tr: tournament.season.name }),
                        ...(tournamentRadar.name && { tr: `${tournamentRadar.name} ${tournamentRadar.year}` })
                    },
                    id_: tournamentRadar.seasonid
                },
                tournament: {
                    ...(tournament.tournament && { id: tournament.tournament.id }),
                    ...(tournament.tournament && { uniqueId: tournament.tournament.uniqueId }),
                    id_: tournamentRadar._id,
                    id_t: tournamentRadar._tid,
                    id_ut: tournamentRadar._utid,
                    id_rc: tournamentRadar._rcid,
                    name: {
                        ...(tournament.tournament && { en: tournament.tournament.name }),
                        ...(tournament.tournament && { tr: tournament.tournament.name }),
                        ...(tournamentRadar.name && { tr: tournamentRadar.name })
                    }
                }
            });
        }
    });
    return result;
};

const moment = require('moment');
const _ = require('lodash');
const cors = require('cors');
const languageJson = require('./../client/src/languages/tr.json');
const { db } = require('./utils/firebase/db');

const generateSlug = text => {
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
const preProcessSportRadarData = data => {
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

const replaceDotWithUnderscore = obj => {
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

const simplifyIddaaHelperData = response => {
    return response && response.data && response.data.events && response.data.events.length > 0
        ? response.data.events
        : null;
};

const simplifyHomeData = res => {
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

const cacheDuration = {
    homepageListToday: 60 * 30, // 30 min
    homepageList: 60 * 60 * 24, // 24 hours
    eventDetails: 60 * 60 * 24, // 24 hours
    getEventIdFromDB: 60 * 60 * 24, // 24 hours
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
const userConnected = () => {
    activeUser += 1;
};

const userDisconnected = () => {
    activeUser -= 1;
};

const isDev = process.env.NODE_ENV === 'dev';
const isProd = process.env.NODE_ENV !== 'dev';
const isTorDisabled = process.env.TOR_DISABLED === 'true';
// exports.isTorDisabled = false

const userCount = () => {
    return activeUser;
};

const initCors = () => {
    return cors(corsOptions);
};

const simplifyWebSocketData = res => {
    res = JSON.parse(res);
    if (res.data.length === 0 && !res.data[1] && res.data[0] !== 'service-push') return null;
    const resData = res.data[1];
    return {
        ids: {
            even: parseFloat(resData.emits[0].split('_')[1]),
            type: resData.emits[1].split('_')[1],
            tournament: parseFloat(resData.emits[2].split('_')[1]),
            homeTeam: parseFloat(resData.emits[3].split('_')[1]),
            awayTeam: parseFloat(resData.emits[4].split('_')[1])
        },
        tournament: {
            id: parseFloat(resData.emits[2].split('_')[1])
        },
        event: {
            id: parseFloat(resData.emits[0].split('_')[1]),
            scores: {
                home: resData.data.homeScore.current,
                away: resData.data.awayScore.current,
                ht: {
                    home: resData.data.homeScore.period1,
                    away: resData.data.awayScore.period1
                }
            },
            redCards: {
                home: resData.data.homeRedCards,
                away: resData.data.awayRedCards
            },
            statusBoxContent: resData.data.statusDescription,
            startTimestamp: resData.data.startTimestamp * 1000,
            status: resData.data.status,
            winner: resData.data.winnerCode
        },
        updated: {
            scores: {
                home: resData.data.changesData ? resData.data.changesData.home.score : null,
                away: resData.data.changesData ? resData.data.changesData.away.score : null
            },
            teams: {
                home: resData.data.changesData ? resData.data.changesData.home.team : null,
                away: resData.data.changesData ? resData.data.changesData.away.team : null
            },
            score: resData.data.changesData ? resData.data.changesData.score : null,
            status: resData.data.changesData ? resData.data.changesData.status : null,
            first: resData.data.changesData ? resData.data.changesData.firstToServe : null,
            notify: resData.data.changesData ? resData.data.changesData.notify : null
        }
    };
};

const getOleyEvent = (sofaEvent, eventRadar, oleyTournaments) => {
    const jsonDataTeamNames = [sofaEvent.homeTeam.name.toLowerCase(), sofaEvent.awayTeam.name.toLowerCase()];

    if (eventRadar) {
        jsonDataTeamNames.push(
            eventRadar.teams.home.mediumname.toLowerCase(),
            eventRadar.teams.away.mediumname.toLowerCase()
        );
    }
    let eventOley = null;
    oleyTournaments.forEach(tournament => {
        const found = tournament.matches.filter(match => {
            const homeName11 = match.homeTeam.middleName.toLowerCase();
            const homeName12 = match.homeTeam.name.toLowerCase();
            const awayName11 = match.awayTeam.middleName.toLowerCase();
            const awayName12 = match.awayTeam.name.toLowerCase();

            return (
                jsonDataTeamNames.indexOf(homeName11) > -1 ||
                jsonDataTeamNames.indexOf(homeName12) > -1 ||
                jsonDataTeamNames.indexOf(awayName11) > -1 ||
                jsonDataTeamNames.indexOf(awayName12) > -1
            );
        })[0];
        if (found) eventOley = found;
    });
    return eventOley;
};

const convertToUltraSkorId = id => {
    return `us${String(id)
        .split('')
        .reverse()
        .join('')}`;
};

const convertToSofaScoreID = id => {
    if (typeof id !== 'string') return false;
    if (id.indexOf('us') === -1) return false;
    return parseFloat(
        id
            .substr(2)
            .split('')
            .reverse()
            .join('')
    );
};

const mergeEventDetailsData = (sofa, radar, oley, ids) => {
    // return [sofa, radar, oley, iddaa];
    const result = {};
    const { event } = sofa;
    result.ids = { ...ids };
    result.funfacts = radar && radar.doc[0] && radar.doc[0].data ? radar.doc[0].data.funfacts : null;
    result.textList = oley ? oley.textList : null;
    result.event = {
        incidents: sofa.incidents,
        liveForm: sofa.liveForm,
        bestAwayTeamPlayer: event.bestAwayTeamPlayer,
        bestHomeTeamPlayer: event.bestHomeTeamPlayer,
        category: event.category,
        confirmedLineups: event.confirmedLineups,
        id: convertToUltraSkorId(event.id),
        name: event.name,
        slug: generateSlug(event.name),
        referee: event.referee,
        season: event.season,
        startTimestamp: event.startTimestamp * 1000,
        status: event.status,
        statusBoxContent: event.statusDescription,
        tournament: event.tournament,
        venue: event.venue,
        managerDuel: sofa.managerDuel,
        teams: {
            home: {
                id: event.homeTeam.id,
                name: event.homeTeam.name,
                slug: generateSlug(event.homeTeam.name)
            },
            away: {
                id: event.awayTeam.id,
                name: event.awayTeam.name,
                slug: generateSlug(event.awayTeam.name)
            }
        },
        hasHalfTimeScore: event.hasHalfTimeScore,
        scores: {
            home: event.homeScore.current,
            away: event.awayScore.current,
            ht: {
                home: event.homeScore.period1,
                away: event.awayScore.period1
            }
        },
        redCards: {
            home: event.homeRedCards,
            away: event.awayRedCards
        }
    };
    return result;
};

const mergeHomepageData = (sofa, radar, broad) => {
    return new Promise((resolve, reject) => {
        // if (!radar || !sofa || !oley) return null;
        const result = {};
        const shortIds = [];
        const radarTournaments =
            radar && radar.doc[0] && radar.doc[0].data && radar.doc[0].data.sport
                ? radar.doc[0].data.sport.realcategories.reduce((total, item) => {
                      return total.concat(item.tournaments);
                  }, [])
                : null;
        const broadTournaments = broad && broad.initialData ? broad.initialData : null;
        result.date = sofa.params.date;
        result.tournaments = [];
        sofa.sportItem.tournaments.forEach(tournament => {
            const events = [];
            const tournamentRadar = radarTournaments
                ? radarTournaments.filter(x => x._id === tournament.tournament.id)[0]
                : null;
            tournament.events.forEach(event => {
                if (moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === sofa.params.date) {
                    const eventRadar =
                        tournamentRadar && tournamentRadar.matches && tournamentRadar.matches.length > 0
                            ? tournamentRadar.matches.filter(x => {
                                  return (
                                      x.teams.home.uid === event.homeTeam.id || x.teams.away.uid === event.homeTeam.id
                                  );
                              })[0]
                            : null;

                    const eventBroad = broadTournaments ? getOleyEvent(event, eventRadar, broadTournaments) : null;
                    const ultraskorid = convertToUltraSkorId(event.id);
                    shortIds.push({
                        id: ultraskorid,
                        data: {
                            id_so: event.id,
                            ...(eventBroad && eventBroad.code && { id_i: eventBroad.code }),
                            ...(eventBroad && { id_br: eventBroad.id }),
                            ...(eventRadar && { id_sp: eventRadar._id }),
                            ...(eventRadar && { id_sp_t: eventRadar._tid }),
                            ...(eventRadar && { id_sp_ut: eventRadar._utid }),
                            ...(eventRadar && { id_sp_rc: eventRadar._rcid })
                        }
                    });
                    events.push({
                        teams: {
                            home: {
                                id: event.homeTeam.id,
                                name: event.homeTeam.name,
                                fullname: eventRadar ? eventRadar.teams.home.mediumname : event.homeTeam.name,
                                ...(eventBroad && { id_o: eventBroad.homeTeam.id }),
                                ...(eventBroad && { shortName: eventBroad.homeTeam.shortName }),
                                ...(eventBroad && { middlename: eventBroad.homeTeam.name })
                            },
                            away: {
                                id: event.awayTeam.id,
                                name: event.awayTeam.name,
                                fullname: eventRadar ? eventRadar.teams.away.mediumname : event.awayTeam.name,
                                ...(eventBroad && { id_o: eventBroad.awayTeam.id }),
                                ...(eventBroad && { shortName: eventBroad.awayTeam.shortName }),
                                ...(eventBroad && { middlename: eventBroad.awayTeam.name })
                            }
                        },
                        scores: {
                            home: event.homeScore.current,
                            away: event.awayScore.current,
                            ht: {
                                home: event.homeScore.period1,
                                away: event.awayScore.period1
                            }
                        },
                        redCards: {
                            home: event.homeRedCards,
                            away: event.awayRedCards
                        },
                        id: ultraskorid,
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
                            ...(tournamentRadar && { tr: `${tournamentRadar.name} ${tournamentRadar.year}` })
                        },
                        ...(tournamentRadar && { id_: tournamentRadar.seasonid })
                    },
                    tournament: {
                        ...(tournament.tournament && { id: tournament.tournament.id }),
                        ...(tournament.tournament && { uniqueId: tournament.tournament.uniqueId }),
                        ...(tournamentRadar && { id_: tournamentRadar._id }),
                        ...(tournamentRadar && { id_t: tournamentRadar._tid }),
                        ...(tournamentRadar && { id_ut: tournamentRadar._utid }),
                        ...(tournamentRadar && { id_rc: tournamentRadar._rcid }),
                        name: {
                            ...(tournament.tournament && { en: tournament.tournament.name }),
                            ...(tournament.tournament && { tr: tournament.tournament.name }),
                            ...(tournamentRadar && { tr: tournamentRadar.name })
                        }
                    }
                });
            }
        });

        const batch = db.batch();
        const ref = db.collection('ultraskor_eventIds_by_date').doc(shortIds[0].id);
        ref.get().then(doc => {
            if (doc.exists) {
                console.log('these ids are already exist. Don not write: ', shortIds[0].id);
                resolve(result);
            } else {
                console.log('these ids do not exist. Write them to db');
                shortIds.forEach(item => {
                    const docRef = db.collection('ultraskor_eventIds_by_date').doc(item.id);
                    batch.set(docRef, item.data, { merge: true });
                });
                batch
                    .commit()
                    .then(() => {
                        if (isDev) console.log(`batch write completed, total of ${shortIds.length} ids`);
                        resolve(result);
                    })
                    .catch(err => {
                        if (isDev)
                            console.log(`batch operation failed, total of ${shortIds.length} ids. Error Msg:`, err);
                        reject(err);
                    });
            }
        });
    });
};

exports.generateSlug = generateSlug;
exports.cacheDuration = cacheDuration;
exports.userConnected = userConnected;
exports.isDev = isDev;
exports.isProd = isProd;
exports.isTorDisabled = isTorDisabled;
exports.userDisconnected = userDisconnected;
exports.userCount = userCount;
exports.simplifyHomeData = simplifyHomeData;
exports.preProcessSportRadarData = preProcessSportRadarData;
exports.replaceDotWithUnderscore = replaceDotWithUnderscore;
exports.simplifyIddaaHelperData = simplifyIddaaHelperData;
exports.simplifyWebSocketData = simplifyWebSocketData;
exports.initCors = initCors;
exports.convertToUltraSkorId = convertToUltraSkorId;
exports.convertToSofaScoreID = convertToSofaScoreID;
exports.mergeEventDetailsData = mergeEventDetailsData;
exports.mergeHomepageData = mergeHomepageData;

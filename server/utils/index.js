const moment = require("moment");
const languageJson = require("../../client/src/languages/tr.json");
const { db } = require("../services/firebase.service");

const generateSlug = text => {
    const a = "çıüğöşàáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
    const b = "ciugosaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
    const p = new RegExp(a.split("").join("|"), "g");

    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special chars
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
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

const simplifyIddaaHelperData = response => {
    return response && response.data && response.data.events && response.data.events.length > 0
        ? response.data.events
        : null;
};

const simplifyHomeData = res => {
    if (res && res.sportItem && res.sportItem.tournaments) {
        const eventIgnoredProperties = [
            "changes",
            "confirmedLineups",
            "customId",
            "hasAggregatedScore",
            "hasDraw",
            "hasEventPlayerHeatMap",
            "hasEventPlayerStatistics",
            "hasFirstToServe",
            "hasOdds",
            "hasGlobalHighlights",
            "hasHighlights",
            "hasHighlightsStream",
            "hasLineups",
            "hasLineupsList",
            "hasLiveForm",
            "hasLiveOdds",
            "hasStatistics",
            "hasSubScore",
            "hasTime",
            "isAwarded",
            "isSyncable",
            "roundInfo",
            "sport",
            "votingEnabled",
            "odds"
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
    }
    return res;
};

const cacheDuration = {
    sec15: 15,
    sec30: 30,
    min5: 60 * 5,
    min10: 60 * 10,
    min15: 60 * 15,
    min30: 60 * 10,
    min45: 60 * 15,
    hour1: 60 * 60,
    hour3: 60 * 60 * 3,
    hour6: 60 * 60 * 6,
    hour12: 60 * 60 * 12,
    hour24: 60 * 60 * 12,
    day1: 60 * 60 * 24,
    day3: 60 * 60 * 24 * 3,
    day7: 60 * 60 * 24 * 7,
    sportRadarFunFacts: 60 * 60 * 24 * 7, // 7 days
    oleyInjuries: 60 * 60 * 24, // 7 days
    oleyTextList: 60 * 60 * 24 * 7, // 7 days
    sofaLineups: 60 * 5, // 5 minutes
    sofaMatches: 60 * 5, // 5 minutes
    sofaEventdetails: 10, // 10 seconds
    homepageListToday: 60 * 30, // 30 min
    homepageList: 60 * 60 * 24, // 24 hours
    eventDetails: 10, // 10 seconds
    tournamentStandings: 10, // 10 seconds
    uTournamentStandings: 10, // 10 seconds
    uTournamentStandingsRounds: 60 * 60 * 24, // 24 hours
    getEventIdFromDB: 60 * 60 * 24, // 24 hours
    popularFooterEvents: 60 * 60 * 24, // 24 hours
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

const t = text => {
    if (languageJson[text]) {
        return languageJson[text];
    }
    return text;
};

const isDev = process.env.NODE_ENV === "dev";
const isProd = process.env.NODE_ENV !== "dev";
const isTorDisabled = process.env.TOR_DISABLED === "true";
// exports.isTorDisabled = false

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
        .split("")
        .reverse()
        .join("")}`;
};

const convertToSofaScoreID = id => {
    if (typeof id !== "string") return false;
    if (id.indexOf("us") === -1) return false;
    return parseFloat(
        id
            .substr(2)
            .split("")
            .reverse()
            .join("")
    );
};

const simplifyWebSocketData = res => {
    res = JSON.parse(res);
    if (res.data.length === 0 && !res.data[1] && res.data[0] !== "service-push") return null;
    const resData = res.data[1];
    const eventid = convertToUltraSkorId(parseFloat(resData.emits[0].split("_")[1]));
    return {
        ids: {
            event: eventid,
            type: resData.emits[1].split("_")[1],
            tournament: parseFloat(resData.emits[2].split("_")[1]),
            homeTeam: parseFloat(resData.emits[3].split("_")[1]),
            awayTeam: parseFloat(resData.emits[4].split("_")[1])
        },
        tournament: {
            id: parseFloat(resData.emits[2].split("_")[1])
        },
        event: {
            id: eventid,
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

const preprocessEvents = (events, includeNotStartedEvents = false) => {
    const result = [];
    events.forEach(event => {
        if (event.sport.id !== 1) return false;
        if (!includeNotStartedEvents && event.status.type !== "finished") return false;
        result.push({
            teams: {
                home: {
                    id: event.homeTeam.id,
                    name: event.homeTeam.name
                },
                away: {
                    id: event.awayTeam.id,
                    name: event.awayTeam.name
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
            id: convertToUltraSkorId(event.id),
            startTimestamp: event.startTimestamp * 1000,
            status: event.status,
            statusBoxContent: event.statusDescription,
            winner: event.winnerCode
        });
        return false;
    });
    return result;
};

const preprocessTournaments = (tournaments, includeNotStartedEvents = false) => {
    const result = [];
    tournaments.forEach(tournament => {
        const tempTournament = {};
        tempTournament.category = {
            icon: tournament.category.flag,
            id: tournament.category.id,
            name: tournament.category.name
        };
        tempTournament.season = tournament.season
            ? {
                  id: tournament.season.id
              }
            : null;
        tempTournament.tournament = {
            id: tournament.tournament.id,
            uniqueId: tournament.tournament.uniqueId,
            name: {
                en: tournament.tournament.name,
                tr: tournament.tournament.name
            }
        };
        tempTournament.events = preprocessEvents(tournament.events, includeNotStartedEvents);
        if (tempTournament.events.length > 0) result.push(tempTournament);
    });
    return result;
};

const getH2hByDates = data => {
    const result = {};
    const homeTournaments = [];
    if (data.home.recent) homeTournaments.push(...preprocessTournaments(data.home.recent.tournaments));

    const awayTournaments = [];
    if (data.away.recent) awayTournaments.push(...preprocessTournaments(data.away.recent.tournaments));

    const h2hTournaments = [];
    if (data.h2h.events) h2hTournaments.push(...preprocessTournaments(data.h2h.events.tournaments));

    result.home = homeTournaments;
    result.away = awayTournaments;
    result.h2h = h2hTournaments;
    return result;
};

const reorderTournamentsByTournament = tournaments => {
    const tempTournaments = [];

    tournaments.forEach(tournament => {
        const index = tempTournaments.findIndex(x => x.tournament.uniqueId === tournament.tournament.uniqueId);
        if (index > -1) {
            tournament.events.forEach(event => {
                const eventIndex = tempTournaments[index].events.findIndex(x => x.id === event.id);
                if (eventIndex === -1) tempTournaments[index].events.push(event);
            });
        } else {
            tempTournaments.push(tournament);
        }
    });
    return tempTournaments;
};

const getH2hByTournaments = data => {
    const result = {};
    const tempHomeTournaments = [];
    if (data.home.recent) tempHomeTournaments.push(...preprocessTournaments(data.home.recent.tournaments));
    if (data.home.playedAt) tempHomeTournaments.push(...preprocessTournaments(data.home.playedAt.tournaments));
    if (data.home.playedAtThisTournament)
        tempHomeTournaments.push(...preprocessTournaments(data.home.playedAtThisTournament.tournaments));
    if (data.home.thisTournament)
        tempHomeTournaments.push(...preprocessTournaments(data.home.thisTournament.tournaments));
    const homeTournaments = reorderTournamentsByTournament(tempHomeTournaments);

    const tempAwayTournaments = [];
    if (data.away.recent) tempAwayTournaments.push(...preprocessTournaments(data.away.recent.tournaments));
    if (data.away.playedAt) tempAwayTournaments.push(...preprocessTournaments(data.away.playedAt.tournaments));
    if (data.away.playedAtThisTournament)
        tempAwayTournaments.push(...preprocessTournaments(data.away.playedAtThisTournament.tournaments));
    if (data.away.thisTournament)
        tempAwayTournaments.push(...preprocessTournaments(data.away.thisTournament.tournaments));
    const awayTournaments = reorderTournamentsByTournament(tempAwayTournaments);

    const tempH2hTournaments = [];
    if (data.h2h.events) tempH2hTournaments.push(...preprocessTournaments(data.h2h.events.tournaments));
    const h2hTournaments = reorderTournamentsByTournament(tempH2hTournaments);

    result.home = homeTournaments;
    result.away = awayTournaments;
    result.h2h = h2hTournaments;
    return result;
};

const processSofaH2hData = data => {
    return {
        byDates: data ? getH2hByDates(data) : null,
        byTournaments: data ? getH2hByTournaments(data) : null
    };
};

const mergeEventDetailsData = (sofa, radar, oley, injuries, ids) => {
    if (!sofa) {
        if (isDev) console.log("data can not be gathered from sofa");
        throw Error("Whoops!");
    }
    const result = {};
    const { event } = sofa;
    // result.radar = radar;
    // result.oley = oley;
    result.ids = { ...ids };
    result.funfacts = radar && radar.doc[0] && radar.doc[0].data ? radar.doc[0].data.funfacts : null;
    result.textList = oley ? oley.textList : null;

    result.event = {
        ...(injuries && { injuries }),
        isStanding: sofa.standingsAvailable,
        isLineups: event.hasLineups,
        isLineupsList: event.hasLineupsList,
        incidents: sofa.incidents,
        liveForm: sofa.liveForm,
        bestAwayTeamPlayer: event.bestAwayTeamPlayer,
        bestHomeTeamPlayer: event.bestHomeTeamPlayer,
        category: event.category,
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
        // lineups: sofaLineup,
        stats: sofa.statistics,
        managerDuel: sofa.managerDuel,
        ...(sofa.teamsForm && {
            teamsForm: {
                teams: {
                    home: {
                        form: sofa.teamsForm.homeTeam.form,
                        rating: sofa.teamsForm.homeTeam.avgRating
                    },
                    away: {
                        form: sofa.teamsForm.awayTeam.form,
                        rating: sofa.teamsForm.awayTeam.avgRating
                    }
                }
            }
        }),
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
        scores: {
            home: event.homeScore.current,
            away: event.awayScore.current,
            ...(event.hasHalfTimeScore && {
                ht: {
                    home: event.homeScore.period1,
                    away: event.awayScore.period1
                }
            })
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
        if (!sofa) {
            if (isDev) console.log("data can not be gathered from sofa");
            resolve(Error("Whoops!"));
        }
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
                if (moment(event.startTimestamp * 1000).format("YYYY-MM-DD") === sofa.params.date) {
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
                            ...(event.hasHalfTimeScore && {
                                ht: {
                                    home: event.homeScore.period1,
                                    away: event.awayScore.period1
                                }
                            })
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

        const dayDiff = Math.abs(moment(sofa.params.date, "YYYY-MM-DD").diff(moment(), "days"));
        if (sofa && radar && broad && dayDiff < 5) {
            const batch = db.batch();
            const ref = db.collection("ultraskor_eventIds_by_date").doc(shortIds[0].id);
            ref.get().then(doc => {
                if (doc.exists) {
                    if (isDev) console.log("these ids are already exist. Don not write: ", shortIds[0].id);
                    resolve(result);
                } else {
                    if (isDev) console.log("these ids do not exist. Write them to db");
                    shortIds.forEach(item => {
                        const docRef = db.collection("ultraskor_eventIds_by_date").doc(item.id);
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
                                if (isDev)
                                    console.log(
                                        `batch operation failed, total of ${shortIds.length} ids. Error Msg:`,
                                        err
                                    );
                            reject(err);
                        });
                }
            });
        }
    });
};

const mergeUTournamentData = data => {
    const result = { ...data };
    delete result.teamEvents;
    result.events.roundMatches.tournaments = preprocessTournaments(result.events.roundMatches.tournaments, true);
    return result;
};

const mergeUTournamentRoundsData = data => {
    const result = { ...data.roundMatches };
    delete result.sport;
    result.tournaments = preprocessTournaments(result.tournaments, true);
    return result;
};

const mergeTeamData = tournaments => {
    const newTournaments = preprocessTournaments(tournaments, true);
    return {
        byDates: newTournaments,
        byTournaments: reorderTournamentsByTournament(preprocessTournaments(tournaments, true))
    };
};
const isEmpty = obj => {
    return Object.keys(obj).length === 0;
};

exports.generateSlug = generateSlug;
exports.cacheDuration = cacheDuration;
exports.isDev = isDev;
exports.isProd = isProd;
exports.isTorDisabled = isTorDisabled;
exports.t = t;
exports.simplifyHomeData = simplifyHomeData;
exports.preProcessSportRadarData = preProcessSportRadarData;
exports.simplifyIddaaHelperData = simplifyIddaaHelperData;
exports.simplifyWebSocketData = simplifyWebSocketData;
exports.convertToUltraSkorId = convertToUltraSkorId;
exports.convertToSofaScoreID = convertToSofaScoreID;
exports.mergeEventDetailsData = mergeEventDetailsData;
exports.mergeHomepageData = mergeHomepageData;
exports.mergeUTournamentData = mergeUTournamentData;
exports.mergeUTournamentRoundsData = mergeUTournamentRoundsData;
exports.isEmpty = isEmpty;
exports.preprocessEvents = preprocessEvents;
exports.processSofaH2hData = processSofaH2hData;
exports.mergeTeamData = mergeTeamData;
exports.preprocessTournaments = preprocessTournaments;

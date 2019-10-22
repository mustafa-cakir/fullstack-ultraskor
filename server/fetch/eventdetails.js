const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchOleyWidget } = require('./oleyWidget');
const { mergeEventDetailsData } = require('../helper');
const cacheService = require('../cache.service');
const { getEventIds } = require('./getEventIds');
const { cacheDuration } = require('../helper');

const fetchEventDetails = (eventId, language, cacheKey) => {
    return getEventIds(eventId).then(ids => {
        const isTor = true;
        return new Promise((resolve, reject) => {
            fetchSofaScore(`/event/${ids.id_so}/json`, cacheDuration.sofaEventdetails, isTor)
                .then(sofa => {
                    fetchSportRadar(
                        `/${language}/Europe:Istanbul/gismo/match_funfacts/${ids.id_sp}`,
                        cacheDuration.sportRadarFunFacts,
                        isTor
                    )
                        .then(radar => {
                            fetchOleyWidget(`teamstats/1/${ids.id_br}`, cacheDuration.oleyTextList, isTor)
                                .then(oley => {
                                    fetchOleyWidget(`missings/1/${ids.id_br}`, cacheDuration.oleyInjuries, isTor)
                                        .then(injuries => {
                                            // fetchSofaScore(
                                            //     `/event/${ids.id_so}/lineups/json`,
                                            //     cacheDuration.sofaLineups,
                                            //     isTor
                                            // )
                                            //     .then(sofaLineup => {
                                            //         fetchSofaScore(
                                            //             `/event/${ids.id_so}/matches/json`,
                                            //             cacheDuration.sofaMatches,
                                            //             isTor
                                            //         )
                                            //             .then(sofaMatches => {
                                            const merged = mergeEventDetailsData(
                                                sofa,
                                                radar,
                                                oley,
                                                null, // sofaLineup,
                                                injuries,
                                                null // sofaMatches,
                                            );
                                            if (merged) {
                                                cacheService
                                                    .instance()
                                                    .set(cacheKey, merged, cacheDuration.eventDetails);
                                                resolve(merged);
                                            } else {
                                                reject();
                                            }
                                            //         })
                                            //         .catch(err => {
                                            //             reject(err);
                                            //         });
                                            // })
                                            // .catch(err => {
                                            //     reject(err);
                                            // });
                                        })
                                        .catch(err => {
                                            reject(err);
                                        });
                                })
                                .catch(err => {
                                    reject(err);
                                });
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    });
};

exports.fetchEventDetails = fetchEventDetails;

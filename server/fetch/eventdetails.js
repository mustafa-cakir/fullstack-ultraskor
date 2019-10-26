const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchOleyWidget } = require('./oleyWidget');
const { mergeEventDetailsData } = require('../utils');
const cacheService = require('../services/cache.service');
const { getEventIds } = require('./getEventIds');
const { cacheDuration } = require('../utils');

const fetchEventDetails = (eventId, language, cacheKey) => {
    return getEventIds(eventId).then(ids => {
        const { min30, hour24 } = cacheDuration;
        return new Promise((resolve, reject) => {
            fetchSofaScore(`/event/${ids.id_so}/json`, min30)
                .then(sofa => {
                    fetchSportRadar(`/${language}/Europe:Istanbul/gismo/match_funfacts/${ids.id_sp}`, hour24)
                        .then(radar => {
                            fetchOleyWidget(`teamstats/1/${ids.id_br}`, hour24)
                                .then(oley => {
                                    fetchOleyWidget(`missings/1/${ids.id_br}`, hour24)
                                        .then(injuries => {
                                            fetchSofaScore(`/event/${ids.id_so}/lineups/json`, min30)
                                                .then(sofaLineup => {
                                                    fetchSofaScore(`/event/${ids.id_so}/matches/json`, min30)
                                                        .then(sofaMatches => {
                                                            const merged = mergeEventDetailsData(
                                                                sofa,
                                                                radar,
                                                                oley,
                                                                sofaLineup,
                                                                injuries,
                                                                sofaMatches
                                                            );
                                                            if (merged) {
                                                                cacheService.instance().set(cacheKey, merged, min30);
                                                                resolve(merged);
                                                            } else {
                                                                reject();
                                                            }
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

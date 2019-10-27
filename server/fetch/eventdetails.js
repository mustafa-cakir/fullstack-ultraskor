const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchOleyWidget } = require('./oleyWidget');
const { mergeEventDetailsData } = require('../utils');
const { getEventIds } = require('./getEventIds');
const { cacheDuration } = require('../utils');

const fetchEventDetails = (eventId, language) => {
    return getEventIds(eventId).then(ids => {
        const { min30, hour24 } = cacheDuration;
        return new Promise((resolve, reject) => {
            const pAll = [
                fetchSofaScore(`/event/${ids.id_so}/json`, min30).catch(err => console.log(err)),
                fetchSportRadar(`/${language}/Europe:Istanbul/gismo/match_funfacts/${ids.id_sp}`, hour24).catch(() => null),
                fetchOleyWidget(`teamstats/1/${ids.id_br}`, hour24).catch(() => null),
                // fetchSofaScore(`/event/${ids.id_so}/lineups/json`, min30).catch(() => null),
                fetchOleyWidget(`missings/1/${ids.id_br}`, hour24).catch(() => null),
                // fetchSofaScore(`/event/${ids.id_so}/matches/json`, min30).catch(() => null)
            ];


            Promise.all(pAll)
                .then(responses => {
                    const merged = mergeEventDetailsData(
                        responses[0], // sofa
                        responses[1], // radar
                        responses[2], // oley
                        responses[3], // sofaLineup
                        // responses[4], // injuries
                        // responses[5], // sofaMatches
                        ids
                    );
                    if (merged) {
                        resolve(merged);
                    } else {
                        reject();
                    }
                })
                .catch(err => reject(err));
        });
    });
};

exports.fetchEventDetails = fetchEventDetails;

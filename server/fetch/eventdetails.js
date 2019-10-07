const { fetchIddaaMatch } = require('./iddaaMatch');
const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchOleyWidget } = require('./oleyWidget');
const { mergeEventDetailsData } = require('../helper');
const cacheService = require('../cache.service');
const { getEventIds } = require('./getEventIds');
const { cacheDuration } = require('../helper');

const fetchEventDetails = (eventId, language) => {
    // const idArr = ids.split('-');
    // idArr[0] // sofascore
    // idArr[1] // sportradar
    // idArr[2] // oley
    // idArr[3] // iddaaCode
    // idArr[4] // iddaa isLive 1 or 0

    return getEventIds(eventId).then(ids => {
        console.log(ids);
        return new Promise((resolve, reject) => {
            const pAll = [];

            pAll.push(
                fetchSofaScore(`/event/${ids.id_so}/json`).catch(() => {
                    return null;
                })
            );

            if (ids.id_sp)
                pAll.push(
                    fetchSportRadar(`/${language}/Europe:Istanbul/gismo/match_funfacts/${ids.id_sp}`).catch(() => {
                        return null;
                    })
                );
            if (ids.id_br)
                pAll.push(
                    fetchOleyWidget(`teamstats/1/${ids.id_br}`).catch(() => {
                        return null;
                    })
                );
            Promise.all(pAll)
                .then(values => {
                    const merged = mergeEventDetailsData(values[0], values[1], values[2], ids);
                    if (!merged) throw Error('error');
                    if (values[0] && values[1] && values[2] && values[3]) {
                        const cacheKey = `eventdetails-${ids}-${language}`;
                        cacheService.instance().set(cacheKey, merged, cacheDuration.eventDetails);
                    }
                    resolve(merged);

                    resolve(values);
                })
                .catch(err => {
                    console.log(err);
                });
        });
    });
};

exports.fetchEventDetails = fetchEventDetails;

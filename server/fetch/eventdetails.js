const { fetchIddaaMatch } = require('./iddaaMatch');
const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchOleyWidget } = require('./oleyWidget');
const { mergeEventDetailsData } = require('../helper');
const cacheService = require('../cache.service');
const { cacheDuration } = require('../helper');

const fetchEventDetails = (ids, language) => {
    const idArr = ids.split('-');
    // idArr[0] // sofascore
    // idArr[1] // sportradar
    // idArr[2] // oley
    // idArr[3] // iddaaCode
    // idArr[4] // iddaa isLive 1 or 0

    return new Promise((resolve, reject) => {
        const pAll = [];
        const p1 = fetchSofaScore(`/event/${idArr[0]}/json`).catch(() => {
            return null;
        });
        const p2 = fetchSportRadar(`/${language}/Europe:Istanbul/gismo/match_funfacts/${idArr[1]}`).catch(() => {
            return null;
        });
        const p3 = fetchOleyWidget(`teamstats/1/${idArr[2]}`).catch(() => {
            return null;
        });
        const p4 = fetchIddaaMatch(`${idArr[4] ? 'live/' : ''}markets/1/${idArr[3]}`).catch(() => {
            return null;
        });

        pAll.push(p1, p2, p3, p4);

        Promise.all(pAll)
            .then(values => {
                const merged = mergeEventDetailsData(values[0], values[1], values[2], values[3]);
                if (!merged) throw Error('error');
                console.log(values[1]);
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

        //
        //     .then(sofa => {
        //         fetchSportRadar(`/stats_match_form/18807726/${idArr[1]}`)
        //             .then(radar => {
        //                 fetchOleyWidget(`teamstats/1/${idArr[2]}`)
        //                     .then(oley => {
        //                         const merged = mergeEventDetailsData(sofa, radar, oley);
        //                         if (!merged) throw Error('error');
        //                         resolve(merged);
        //                     })
        //                     .catch(err => {
        //                         console.log(err);
        //                         reject(Error('502'));
        //                     });
        //             })
        //             .catch(err => {
        //                 console.log(err);
        //                 reject(Error('501'));
        //             });
        //     })
        //     .catch(() => {
        //         reject(Error('500'));
        //     });
    });
};

exports.fetchEventDetails = fetchEventDetails;

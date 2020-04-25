const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchOleyWidget } = require('./oleyWidget');
const { mergeEventDetailsData } = require('../utils');
const { getEventIds } = require('./getEventIds');
const { cacheDuration } = require('../utils');

const fetchEventDetails = (eventId, language) => {
    return getEventIds(eventId).then(ids => {
        if (!ids.id_so) {
            ids.id_so = eventId;
        }
        const { sec15, hour24 } = cacheDuration;
        return new Promise((resolve, reject) => {
            const pAll = [fetchSofaScore(`/event/${ids.id_so}/json`, sec15).catch(err => console.log(err))];

            if (ids.id_sp) {
                pAll.push(
                    fetchSportRadar(`/${language}/Europe:Istanbul/gismo/match_funfacts/${ids.id_sp}`, hour24).catch(
                        () => null
                    )
                );
            }
            if (ids.id_br) {
                pAll.push(fetchOleyWidget(`teamstats/1/${ids.id_br}`, hour24).catch(() => null));
            }
            if (ids.id_br) {
                pAll.push(fetchOleyWidget(`missings/1/${ids.id_br}`, hour24).catch(() => null));
            }

            Promise.all(pAll)
                .then(responses => {
                    const sofa = responses[0];
                    const radar = ids.id_sp ? responses[1] : null;
                    const oley = ids.id_br ? responses[2] : null;
                    const injuries = ids.id_br ? responses[3] : null;

                    const merged = mergeEventDetailsData(sofa, radar, oley, injuries, ids);
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

const { fetchSportRadarS5 } = require('./sportradar');
const { simplifyRadarHomepage } = require('../utils');

const fetchHomepage = (date, language) =>
    new Promise((resolve, reject) => {
        fetchSportRadarS5(language, `sport_matches/1/${date}/1`, 20, false)
            .then((res) => {
                // resolve(result);
                const result = simplifyRadarHomepage(res);
                resolve(result);
            })
            .catch((err) => reject(err));
    });
exports.fetchHomepage = fetchHomepage;

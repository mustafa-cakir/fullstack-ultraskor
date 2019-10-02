const fetchSofaScore = require('./sofascore');
const fetchSportRadar = require('./sportradar');
const { mergeSofaAndRadar } = require('../helper');


module.exports = date => new Promise((resolve, reject) => {
	fetchSofaScore(`/football//${date}/json`)
		.then(sofa => {
			fetchSportRadar(date)
				.then(radar => {
					const merged = mergeSofaAndRadar(sofa, radar);
					if (!merged) throw Error('error');
					resolve(merged);
				})
				.catch(err => {
					console.log(err);
					reject(501);
				});
		})
		.catch(() => {
			reject(500);
		});
});

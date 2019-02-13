const _ = require('lodash');
const cors = require('cors');

exports.preProcessHelper1Data = data => {
	let result = null;
	if (data.doc && data.doc.length > 0 && data.doc[0].data && data.doc[0].data.length > 0) {
		result = data.doc[0].data[0].realcategories.reduce((all, current) => {
			if (current.tournaments && current.tournaments.length > 0) {
				current.tournaments.forEach(tournament => {
					if (tournament.matches && tournament.matches.length > 0) {
						tournament.matches.forEach(match => {
							let tempMatch = {};
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

exports.replaceDotWithUnderscore = obj => {
	_.forOwn(obj, (value, key) => {

		// if key has a period, replace all occurences with an underscore
		if (_.includes(key, '.')) {
			const cleanKey = _.replace(key, /\./g, '_');
			obj[cleanKey] = value;
			delete obj[key];
		}

		// continue recursively looping through if we have an object or array
		if (_.isObject(value)) {
			return replaceDotWithUnderscore(value);
		}
	});
	return obj;
};

exports.simplifyHomeData = res => {
	if (res && res.sportItem && res.sportItem.tournaments) {
		let eventIgnoredProperties = [
			'changes', 'confirmedLineups', 'customId', 'hasAggregatedScore', 'hasDraw', 'hasEventPlayerHeatMap',
			'hasEventPlayerStatistics', 'hasFirstToServe', 'hasOdds', 'hasGlobalHighlights', 'hasHighlights',
			'hasHighlightsStream', 'hasLineups', 'hasLineupsList', 'hasLiveForm', 'hasLiveOdds', 'hasStatistics',
			'hasSubScore', 'hasTime', 'isAwarded', 'isSyncable', 'roundInfo', 'sport', 'votingEnabled', 'winnerCode', 'odds'];

		res.sportItem.tournaments.forEach(tournament => {
			tournament.events.map(event => {
				for (let i = 0; i < eventIgnoredProperties.length; i++) {
					delete event[eventIgnoredProperties[i]]
				}
				return event
			});
		});
	}
	return res;
};

exports.cacheDuration = () => {
	return {
		provider1: 60 * 60 * 24, // 24 hours
		provider2: 60 * 60 * 24, // 24 hours
		provider3: 60 * 60 * 24, // 24 hours
		missings: 60 * 60 * 24, // 7 days
		teamstats: 60 * 60 * 24, // 7 days
		webpushtopic: 60 * 60 * 24 * 7, // 7 days
		main: {
			default: 60, // 1 min.
			homepage: 15, // 5 seconds
			eventdetails: 5, // 5 seconds
			lineup: 60 * 30, // 30 min,
			h2h: 60 * 30, // 30 min
			standing: 60, // 1 min.
		}
	}
};

exports.mongoOptions = () => {
	return {
		useNewUrlParser: true,
		keepAlive: 1,
		connectTimeoutMS: 1000,
		socketTimeoutMS: 1000,
	}
};

const whitelist = [
	'http://localhost:5000',
	'http://localhost:5001',
	'http://localhost:3000',
	'https://www.ultraskor.com',
];

const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true)
		} else {
			console.log(origin);
			callback(new Error('Not allowed by CORS'));
		}
	}
};

exports.initCors = () => {
	return cors(corsOptions)
};

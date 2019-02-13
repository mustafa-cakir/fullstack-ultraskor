exports.preProcessHelper1Data = (data) => {
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

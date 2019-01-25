const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const request = require('request-promise-native');
const diff = require('deep-diff');

// our localhost port
const port = process.env.PORT || 5000;
const app = express();

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server);


// This is what the socket.socket syntax is like, we will work this later
io.on('connection', socket => {
	let currentPage = null,
		IntervalUpdatesHomepage = null;

	socket.on('current-page', (page) => {
		currentPage = page;
		clearTimeout(IntervalUpdatesHomepage);
	});

	socket.on('get-updates-homepage', params => {
		const sofaOptions = {
			method: 'GET',
			uri: `https://www.sofascore.com${params.api}?_=${Math.floor(Math.random() * 10e8)}`,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://www.sofascore.com',
				'referer': 'https://www.sofascore.com/',
				'x-requested-with': 'XMLHttpRequest'
			}
		};
		let previousData;
		const getUpdatesHandler = () => {
			if (currentPage !== "homepage") return false;
			request(sofaOptions)
				.then(res => JSON.parse(res))
				.then(res => {
					let events = [];
					const neededProperties = [
						'awayRedCards',
						'awayScore',
						'homeRedCards',
						'homeScore',
						'id',
						'status',
						'statusDescription',
						'awayTeam',
						'homeTeam'
					];
					res.sportItem.tournaments.forEach(tournament => {
						tournament.events = tournament.events.filter(event => {
							return event.status.type !== "finished"
						});
						tournament.events.forEach(event => {
							let newEvents = {};
							neededProperties.forEach(property => {
								newEvents[property] = event[property]
							});
							events.push(newEvents)
						});
					});

					//test case away Score
					setTimeout(() => {
						socket.emit('return-updates-homepage', [[
							{
								kind: "E",
								lhs: "1",
								rhs: "2",
								path: [
									"awayScore",
									"current"
								],
								event: {
									awayRedCards: 0,
									awayScore: {current: 2},
									awayTeam: {name: "Malmö FF", id: 1892, subTeams: Array(0)},
									homeRedCards: 0,
									homeScore: {current: 0},
									homeTeam: {name: "Lyngby BK", id: 1756, subTeams: Array(0)},
									id: 8114504,
									status: {code: 6, type: "inprogress"},
									statusDescription: "30"
								}
							}
						]]);
					}, 1000);
					setTimeout(() => {
						socket.emit('return-updates-homepage', [[
							{
								kind: "E",
								lhs: "2",
								rhs: "3",
								path: [
									"awayScore",
									"current"
								],
								event: {
									awayRedCards: 0,
									awayScore: {current: 3},
									awayTeam: {name: "Malmö FF", id: 1892, subTeams: Array(0)},
									homeRedCards: 0,
									homeScore: {current: 0},
									homeTeam: {name: "Lyngby BK", id: 1756, subTeams: Array(0)},
									id: 8114504,
									status: {code: 6, type: "inprogress"},
									statusDescription: "30"
								}
							}
						]]);
					}, 2000);
					//test case

					if (previousData && previousData.length > 0 && false) {
						let diffArr = [];

						previousData.forEach(eventPrev => {
							let eventNew = events.filter(item => item.id === eventPrev.id)[0];
							let eventDiff = diff(eventPrev, eventNew);
							if (eventDiff) {
								eventDiff.forEach(x => {
									x.event = eventNew;
								});
								diffArr.push(eventDiff);
							}
						});

						if (diffArr.length > 0) {
							socket.emit('return-updates-homepage', diffArr);
						}

						// let differences = diff(previousData, events);
						// if (differences && differences.length > 0) {
						// 	differences.forEach((item, index) => {
						// 		if (item.path && item.path.length > 0) differences[index].event = events[item.path[0]]
						// 	});
						// 	//socket.emit('return-updates-homepage', differences);
						// }
					}
					previousData = events;
					IntervalUpdatesHomepage = setTimeout(() => {
						getUpdatesHandler(); // keep checking in every 15 seconds
					}, 10000);
				})
				.catch((err) => {
					console.log('error returning differences on ' + params.page + ' Error: ' + err);
				});
		};
		setTimeout(() => {
			getUpdatesHandler(); // start the 1st check after 5 seconds.
		}, 1000)
	});

	socket.on('get-main', (params) => {
		const sofaOptions = {
			method: 'GET',
			uri: `https://www.sofascore.com${params.api}?_=${Math.floor(Math.random() * 10e8)}`,
			headers: {
				'Content-Type': 'application/json',
				'Origin': 'https://www.sofascore.com',
				'referer': 'https://www.sofascore.com/',
				'x-requested-with': 'XMLHttpRequest'
			}
		};
		request(sofaOptions)
			.then(res => {
				socket.emit('return-main-' + params.page, res);  // return-main-homepage, return-main-eventdetails
			})
			.catch(() => {
				console.log('error returning data from main for ' + params.page);
				socket.emit('my-error', 'Error while retrieving information from server');
			});
	});

	socket.on('disconnect', () => {
		clearTimeout(IntervalUpdatesHomepage);
	})
});

server.listen(port, () => console.log(`Listening on port ${port}`));

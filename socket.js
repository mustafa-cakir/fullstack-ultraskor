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
	console.log('User connected');
	let currentPage = null;

	socket.on('current page', (page) => {
		currentPage = page;
		console.log('current page: ' + page);
	});

	let homepageChangesIntervalHandeler = null;

	socket.on('check for updates on homepage', (params) => {
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
		clearInterval(homepageChangesIntervalHandeler);
		homepageChangesIntervalHandeler = setInterval(() => {
			if (currentPage !== "homepage") {
				clearInterval(homepageChangesIntervalHandeler);
				return false;
			}
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
					console.log('triggered');
					if (previousData) {
						const differences = diff(previousData, events);
						if (differences && differences.length > 0) {
							differences.forEach((item,index) => {
								differences[index].event = events[item.path[0]]
							});
							socket.emit('return differences on homepage', differences);
						}
					}
					previousData = events;
				})
				.catch(() => {
					console.log('error returning data from main for ' + params.page);
				});
		}, 5000);
	});

	socket.on('get data from main', (params) => {
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
				console.log('return data from main for ' + params.page);
				socket.emit('return data from main for ' + params.page, res);
			})
			.catch(() => {
				console.log('error returning data from main for ' + params.page);
				socket.emit('my error', 'Error while retrieving information from server');
			});
	});

	socket.on('disconnect', () => {
		console.log('user disconnected')
	})
});

server.listen(port, () => console.log(`Listening on port ${port}`));

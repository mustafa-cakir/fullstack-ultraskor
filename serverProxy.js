const express = require('express');
const request = require('request');
const Agent = require('socks5-https-client/lib/Agent');
const fs = require('fs');

const app = express();


app.get('/images/:type/:filename', (req, res) => {
	let {type, filename} = req.params;
	// console.log(type, filename);
	const sendFileOptions = {
		root: __dirname + `/client/public/static/images/${type}/`,
		dotfiles: 'deny',
		headers: {
			'X-Powered-By': "ultraskor.com",
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};

	if (!fs.existsSync(sendFileOptions.root)) {
		fs.mkdirSync(sendFileOptions.root);
	}


	res.sendFile(filename, sendFileOptions, (err) => {
		if (err) { // file not exist
			let pathname = `/images/${type}/${filename}`;

			if (type === "u-tournament") {
				pathname = `/u-tournament/${filename.slice(0, -4)}/logo`
			} else if (type === "manager") {
				pathname = `/api/v1/manager/${filename.slice(0, -4)}/image`
			}

			const requestOptions = {
				url: 'https://www.sofascore.com' + pathname,
				strictSSL: true,
				agentClass: Agent,
				timeout: 1000,
				agentOptions: {
					socksHost: 'localhost',
					socksPort: 9050,
				}
			};

			// console.log(requestOptions.url);
			const stream = request(requestOptions);

			stream.on('error', (err) => {
				console.log('Error on request: ' + err);
				res.sendStatus(404);
			});

			stream.on('response', (response) => {
				if (response.headers['content-type'].indexOf('image') > -1) {
					stream.pipe(fs.createWriteStream(sendFileOptions.root + filename));
					stream.pipe(res);
				} else {
					console.log('Error on response: ' + err);
					res.sendStatus(404);
				}
			});

			// stream.on('close', () => {
			// 	console.log('checkpoint5');
			// 	res.sendFile(filename, sendFileOptions, (err) => {
			// 		if (err) {
			// 			console.log('Error on sendFile: ' + err);
			// 			res.sendStatus(404);
			// 		}
			// 	});
			// });
		}
	});


	// ************
	// request({
	// 	url: `https://www.sofascore.com${(req.query && req.query.url) ? req.query.url : (req.originalUrl + '.png')}`,
	// 	strictSSL: true,
	// 	agentClass: Agent,
	// 	agentOptions: {
	// 		socksHost: 'localhost', // Defaults to 'localhost'.
	// 		socksPort: 9050, // Defaults to 1080.
	// 		// Optional credentials
	// 	}
	// }).pipe(res);
});


function pushDomain(body) {
	return body.replace("if(!1===i)u", 'i[0].domains.push("ultraskor.com",);if(!1===i)u');
}

// define a simple route
app.get('*', (req, res) => {
	let path = req.originalUrl;
	// path = path.substring(11, path.length);
	// console.log(path);

	let options = {
		url: 'https://widgets.sir.sportradar.com/' + path,
		headers: {
			'Referer': 'https://www.aspor.com.tr',
			'Origin': 'https://www.aspor.com.tr',
			'Access-Control-Allow-Origin': '*',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
		},
		timeout: 1500
	};

	// if (path.indexOf('common_widgets') > -1) {
	//     options.url = 'https://www.ultraskor.com/static/live-match/common_widgets.js?v=2.0.1';
	// }

	//console.log(options.url);
	request(options, function (error, response, body) {
		res.header('Access-Control-Allow-Origin', '*');
		if (path.indexOf('translations') > -1) {
			res.header("Content-Type", "application/json; charset=utf-8");
		} else if (path.indexOf('licensing') > -1) {
			res.header("Content-Type", "text/plain; charset=utf-8");
		} else {
			res.header("Content-Type", "application/javascript; charset=utf-8");
		}
		if (path.indexOf('common_widgets') > -1) {
			body = pushDomain(body);
		}
		res.send(body);
	});

});

// listen for requests
app.listen(5002, () => {
	console.log("Server is listening on port 5002");
});



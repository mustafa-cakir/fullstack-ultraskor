const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const request = require('request');
const port = process.env.PORT || 5000;
const MongoClient = require('mongodb').MongoClient;
let db;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const whitelist = [
	'http://localhost:5000',
	'http://localhost:3000',
	'https://www.canliskor.io',
	'http://www.canliskor.io',
	'https://canliskor.io',
	'http://canliskor.io'
];
const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	}
};

app.use(cors(corsOptions));

const {MONGO_USER, MONGO_PASSWORD, MONGO_IP} = process.env;

const mongoOptions = {
	useNewUrlParser: true,
	keepAlive: 1,
	connectTimeoutMS: 1000,
	socketTimeoutMS: 1000,
};

// Initialize connection once
MongoClient.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:27017`, mongoOptions, function (err, client) {
	if (!err) {
		db = client.db('canliskor');
	}
	// Start the application after the database connection is ready
	app.listen(port, () => console.log(`Listening on port ${port}`));
});

// API calls
app.get('/api/ba/:sportId/:date', (req, res) => {

	const headers = {
		'Content-Type': 'application/json',
		'Origin': 'https://oley.com',
	};

	const resources = {
		"coverageId": "6bf0cf44-e13a-44e1-8008-ff17ba6c2128",
		"options": {
			"lang": "tr-TR",
			"grouping": "date",
			"betCode": true,
			"sportId": 1,
			"day": req.params.date.replace(/\./g, "/"),
			"origin": "https://mobil.oley.com",
			"timeZone": 3
		}
	};

	const options = {
		method: 'POST',
		url: 'https://brdg-ae03a315-b8e3-454d-8985-0f59b1c8f86b.azureedge.net/livescore/matchlist',
		headers: headers,
		body: JSON.stringify(resources)
	};

	request(options, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		} else {
			res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
		}
	});

});

// API calls
app.get('/api/sr/:sportId/:date', (req, res) => {
	request(`http://www.hurriyet.com.tr/api/spor/sporlivescorejsonlist/?sportId=${req.params.sportId}&date=${req.params.date}`, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);

			if (db) {
				// db.collection('test').insertOne(body, function (err, result) {
				//     console.log('err: ' + err, 'result: ' + result );
				// });
				var collection = db.collection('test');
				collection.insertOne(JSON.parse(body), function (err, docs) {
					console.log('Inserted');

					// collection.find(findKey).toArray(function(err, results) {
					//     console.log('Found results:', results);
					//
					//     collection.remove(findKey, function(err, results) {
					//         console.log('Deleted person');
					//
					//         db.close();
					//     });
					// });
				});
			}

		} else {
			res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
		}
	});
});

// API calls
app.get('/api/ol/match/:type/1/:id', (req, res) => {
	const options = {
		method: 'GET',
		url: `https://widget.oley.com/match/${req.params.type}/1/${req.params.id}`,
		headers: {
			'Host': 'widget.oley.com',
			'Origin': 'https://oley.com'
		}
	};
	request(options, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		} else {
			res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
		}
	});
});

app.get('/api/', (req, res) => {
	request(`https://www.sofascore.com${req.query.api}?_=${Math.floor(Math.random() * 10e8)}`, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		} else {
			res.status(500).send({status: "error", message: 'Error while retrieving information from server'})
		}
	});
});

// //if (process.env.NODE_ENV === 'production') {
// app.use(express.static(path.join(__dirname, 'client/build')));
// app.get('*', function (req, res) {
// 	res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });
// //}

const express = require('express');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const webpush = require('web-push');
const Q = require('q');
const port = 5003;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const {MONGO_USER, MONGO_PASSWORD, MONGO_IP} = process.env;

const mongoOptions = {
	useNewUrlParser: true,
	keepAlive: 1,
	connectTimeoutMS: 1000,
	socketTimeoutMS: 1000,
};

const keys = {
	mongoURI: `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:27017`,
	privateKey: 'TnKF0H2m521XxxKuZg9MNvDxmD5h4CBve1dLOVAjjB4',
	publicKey: 'BIhIZ3T0UvDZZ7Zj5rI76h25LpdRbJT1lG_uZipK9Oojw362JOKv9l8WB8_umr_p2UAChZA0y_Icb0zaCsIbBi8'
};

let db, collection;

// Mongoose Connect
MongoClient.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:27017`, mongoOptions, function (err, client) {
	if (!err) {
		db = client.db('ultraskor');
		collection = db.collection('webpush');
		console.log('MongoDB connected!');
	}
	// Start the application after the database connection is ready
	app.listen(port, () => console.log(`Listening on port ${port}`));
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.post('/webpush/subscribe', (req, res) => {
	if (db && collection) {
		req.body.subscription = JSON.parse(req.body.subscription);
		console.log(req.body);
		try {
			let data = {
				topic: req.body.topic,
				endpoint: req.body.subscription.endpoint,
				expirationTime: req.body.subscription.expirationTime,
				keys: {
					auth: req.body.subscription.keys.auth,
					p256dh: req.body.subscription.keys.p256dh
				}
			};
			collection.insertOne(data, (err, result) => {
				if (err) console.log('Error saving to DB.', err);
				res.send({success: 'Subscription saved.'});
			})
		} catch (err) {
			console.log('Error saving to DB.', err);
		}
	}
});

app.post('/webpush/push', (req, res) => {
	//console.log(req.body);
	const payload = {
		title: req.body.title,
		message: req.body.message,
		url: req.body.url,
		ttl: req.body.ttl,
		icon: req.body.icon,
		image: req.body.image,
		badge: req.body.badge,
		tag: req.body.tag
	};

	collection.find({topic: 'matchid_123123'}).toArray(function(err, subscriptions) {
		let parallelSubscriptionCalls = subscriptions.map(function (subscription) {
			console.log('heyoooo: ', subscription);
			return new Promise((resolve, reject) => {
				const pushSubscription = {
					endpoint: subscription.endpoint,
					keys: {
						p256dh: subscription.keys.p256dh,
						auth: subscription.keys.auth
					}
				};

				const pushPayload = JSON.stringify(payload);
				const pushOptions = {
					vapidDetails: {
						subject: 'http://example.com',
						privateKey: keys.privateKey,
						publicKey: keys.publicKey
					},
					TTL: payload.ttl,
					headers: {}
				};
				webpush.sendNotification(
					pushSubscription,
					pushPayload,
					pushOptions
				).then((value) => {
					resolve({
						status: true,
						endpoint: subscription.endpoint,
						data: value
					});
				}).catch((err) => {
					reject({
						status: false,
						endpoint: subscription.endpoint,
						data: err
					});
				});
			});
		});

		Q.allSettled(parallelSubscriptionCalls).then((pushResults) => {
			res.json({
				data: 'Push triggered'
			});
		});
	});
});

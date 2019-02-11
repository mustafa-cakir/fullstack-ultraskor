let isSubscribed = false;
let swRegistration = null;
let applicationKey = "BIhIZ3T0UvDZZ7Zj5rI76h25LpdRbJT1lG_uZipK9Oojw362JOKv9l8WB8_umr_p2UAChZA0y_Icb0zaCsIbBi8";

// Url Encription
function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

// Send request to database for add new subscriber
function subscribeHandler(subscription) {
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", (window.location.hostname === 'localhost' ? "http://localhost:5003" : "") + "/webpush/subscribe");
	xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState != 4) return;
		if (xmlHttp.status != 200 && xmlHttp.status != 304) {
			console.log('HTTP error ' + xmlHttp.status, null);
		} else {
			console.log("User subscribed to server");
		}
	};

	let data = {
		topic: "matchid_123123",
		subscription: JSON.stringify(subscription)
	};

	xmlHttp.send(JSON.stringify(data));
}

function unsubscribeHandler(subscription) {
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", (window.location.hostname === 'localhost' ? "http://localhost:5003" : "") + "/webpush/unsubscribe");
	xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState != 4) return;
		if (xmlHttp.status != 200 && xmlHttp.status != 304) {
			console.log('HTTP error ' + xmlHttp.status, null);
		} else {
			console.log("User subscribed to server");
		}
	};

	let data = {
		topic: "matchid_123123",
		subscription: JSON.stringify(subscription)
	};

	xmlHttp.send(JSON.stringify(data));
}

function registrationHandler(swRegistration) {
	swRegistration.pushManager.getSubscription()
		.then(function (subscription) {
			if (subscription) {
				console.log('User is subscribed already', subscription);
			} else {

				let options = {
					userVisibleOnly: true,
					applicationServerKey: urlB64ToUint8Array(applicationKey)
				};

				swRegistration.pushManager.subscribe(options)
					.then(function (subscription) {
						console.log(subscription);
						console.log('User is subscribed');
						subscribeHandler(subscription);
					})
					.catch(function (err) {
						console.log('Failed to subscribe user: ', err);
					})
			}
		})
}



// Installing service worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
	console.log('Service Worker and Push is supported');



	navigator.serviceWorker.register('sw.js')
		.then(function (swRegistration) {
			console.log('service worker registered');
			var btns = document.querySelectorAll('.btn');
			btns.forEach(btn => {
				btn.addEventListener('click', () => {
					if (btn.classList.contains('subscribe')) {
						registrationHandler(swRegistration);
						console.log('subscribe btn clicked', swRegistration);
					} else if (this.classList.contains('unsubscribe')) {
						console.log('unsubscribe btn clicked');
					}
				})
			});

		})
		.catch(function (error) {
			console.error('Service Worker Error', error);
		});
} else {
	console.warn('Push messaging is not supported');

}
console.log(window.PushManager, navigator.serviceWorker);

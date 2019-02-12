importScripts('https://www.gstatic.com/firebasejs/5.8.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.2/firebase-messaging.js');

firebase.initializeApp({
	messagingSenderId: '966467312594'
});

const messaging = firebase.messaging();


messaging.setBackgroundMessageHandler(function(payload) {
	console.log('[firebase-messaging-sw.js] Received background message ', payload);
	// Customize notification here
	// var notificationTitle = 'Background Message Title';
	// var notificationOptions = {
	// 	body: 'Background Message body.',
	// 	icon: '/firebase-logo.png'
	// };
	//
	// return self.registration.showNotification(notificationTitle,
	// 	notificationOptions);
});

messaging.onMessage(function(payload) {
	console.log("[firebase-messaging-sw.js] Received message ", payload);
});

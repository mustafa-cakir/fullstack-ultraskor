importScripts('https://www.gstatic.com/firebasejs/5.8.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.2/firebase-messaging.js');

var config = {
	apiKey: "AIzaSyB2l5VSMWR5zasnrWdPJFycWKYybsiDi9g",
	authDomain: "livescores-54cdf.firebaseapp.com",
	databaseURL: "https://livescores-54cdf.firebaseio.com",
	projectId: "livescores",
	storageBucket: "livescores.appspot.com",
	messagingSenderId: "966467312594"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.

 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': 'YOUR-SENDER-ID'
 });

 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
// messaging.setBackgroundMessageHandler(function(payload) {
// 	console.log('[firebase-messaging-sw.js] Received background message ', payload);
// 	// Customize notification here
// 	const notificationTitle = 'Background Message Title';
// 	const notificationOptions = {
// 		body: 'Background Message body.',
// 		icon: '/firebase-logo.png'
// 	};
//
// 	return self.registration.showNotification(notificationTitle,
// 		notificationOptions);
// });
// [END background_handler]

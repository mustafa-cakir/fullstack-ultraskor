import * as firebase from 'firebase/app';
import 'firebase/messaging'

export const initFirebaseWebPush = () => {
	var config = {
		apiKey: "AIzaSyB2l5VSMWR5zasnrWdPJFycWKYybsiDi9g",
		authDomain: "livescores-54cdf.firebaseapp.com",
		databaseURL: "https://livescores-54cdf.firebaseio.com",
		projectId: "livescores",
		storageBucket: "livescores.appspot.com",
		messagingSenderId: "966467312594"
	};
	firebase.initializeApp(config);

	// use other service worker
	// navigator.serviceWorker
	//   .register('/my-sw.js')
	//   .then((registration) => {
	//     firebase.messaging().useServiceWorker(registration);
	//   });
};

export const askForPermissioToReceiveNotifications = async () => {
	try {
		const messaging = firebase.messaging();
		await messaging.requestPermission();
		const token = await messaging.getToken();
		console.log('token: ', token);
		return token;
	} catch (error) {
		console.error(error);
	}
};

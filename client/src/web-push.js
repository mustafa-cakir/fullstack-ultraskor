import * as firebase from 'firebase/app';
import 'firebase/messaging'

export const initFirebaseWebPush = () => {
	firebase.initializeApp({
		messagingSenderId: '966467312594' // troque pelo seu sender id
	});

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
		//console.log('token: ', token);
		return token;
	} catch (error) {
		console.error(error);
	}
};

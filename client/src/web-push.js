import firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/analytics';

export const initFirebaseWebPush = () => {
	const firebaseConfig = {
		apiKey: "AIzaSyA_I1ukPyAbn0CiPnWTx4QTGUy3r9zRwH0",
		authDomain: "corded-reality-254218.firebaseapp.com",
		databaseURL: "https://corded-reality-254218.firebaseio.com",
		projectId: "corded-reality-254218",
		storageBucket: "corded-reality-254218.appspot.com",
		messagingSenderId: "755901264997",
		appId: "1:755901264997:web:f3aef78d77be8fd77a028c",
		measurementId: "G-H2HSZS1CGG"
	};
	firebase.initializeApp(firebaseConfig);
	firebase.analytics();
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

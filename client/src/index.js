//import 'babel-polyfill';
import 'react-app-polyfill/jsdom';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import './translations';
import i18n from 'i18next';
import { initFirebaseWebPush } from './web-push';

const basename = i18n.language === 'en' ? '/en' : '/';

window.ImageServer = window.location.hostname === 'localhost' ? 'http://localhost:5002' : 'https://www.ultraskor.com';

ReactDOM.render(
    <BrowserRouter basename={basename}>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);
serviceWorker.unregister();
initFirebaseWebPush();

import 'react-app-polyfill/jsdom';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import i18n from 'i18next';
import moment from 'moment';
//import 'moment/locale/tr';
import * as serviceWorker from './serviceWorker';
import './core/utils/translations';
import { initFirebaseWebPush } from './core/utils/web-push';
import Root from './core/Root';

moment.locale(i18n.language);

const basename = i18n.language === 'en' ? '/en' : '/';

window.ImageServer = window.location.hostname === 'localhost' ? 'http://localhost:5002' : 'https://www.ultraskor.com';

ReactDOM.render(
    <BrowserRouter basename={basename}>
        <Root />
    </BrowserRouter>,
    document.getElementById('root')
);
serviceWorker.unregister();
initFirebaseWebPush();

//import 'babel-polyfill';
import 'react-app-polyfill/jsdom';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from 'react-router-dom';
import './translations';
import i18n from "i18next";

const basename = (i18n.language === "en") ? "/en" : "/";

ReactDOM.render((
	<BrowserRouter basename={basename}>
		<App/>
	</BrowserRouter>
), document.getElementById('root'));

serviceWorker.unregister();

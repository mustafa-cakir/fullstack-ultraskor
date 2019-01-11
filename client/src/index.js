import 'react-app-polyfill/jsdom';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';
import './translations';

ReactDOM.render((
        <BrowserRouter basename='/'>
            <App />
        </BrowserRouter>
), document.getElementById('root'));
registerServiceWorker();

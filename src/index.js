import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';
import './translations';

ReactDOM.render((
        <BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/livescore' : '/'}>
            <App />
        </BrowserRouter>
), document.getElementById('root'));
registerServiceWorker();

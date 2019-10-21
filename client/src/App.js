import React, { Component } from 'react';
import './assets/style/app.scss';
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';
import { Route, Switch, withRouter } from 'react-router-dom';
import Eventdetails from './components/Eventdetails';
import Errors from './components/common/Errors';
import ReactGA from 'react-ga';
import TestComp from './components/TestComp';
import socketIOClient from 'socket.io-client';
import Leaguedetails from './components/leaguedetails/Leaguedetails';
import Mp3Goal from './assets/sound/goal.mp3';
import Mp3Cancel from './assets/sound/cancel.mp3';
import Mp3Finish from './assets/sound/finish.mp3';
import Mp3RedCard from './assets/sound/red-card.mp3';
import Mp3HalfTime from './assets/sound/half-time.mp3';
import Mp3Start from './assets/sound/start.mp3';
import Teamdetails from './components/teamdetails/Teamdetails';
import PullToRefresh from './components/common/PullToRefresh';
import ErrorBoundary from './ErrorBoundary';
import Leageue from './components/League';

ReactGA.initialize('UA-132328627-1');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: socketIOClient.connect(window.location.origin.replace('3000', '5001'), {
                reconnection: false,
                autoConnect: false
            })
        };
        this.audioFiles = {
            goal: new Audio(Mp3Goal),
            cancel: new Audio(Mp3Cancel),
            finish: new Audio(Mp3Finish),
            redcard: new Audio(Mp3RedCard),
            halftime: new Audio(Mp3HalfTime),
            start: new Audio(Mp3Start)
        };
    }

    componentDidMount() {
        if (('WebSocket' in window && window.WebSocket !== undefined) || 'MozWebSocket' in window) {
            setTimeout(() => {
                this.initSocket();
            }, 2000);
        }
        PullToRefresh.init();
    }

    initSocket() {
        this.state.socket.open();
        this.state.socket.on('connect_error', function(data) {
            console.log('connection_error', data);
        });
        this.pageVisibilityAPI();
    }

    pageVisibilityAPI() {
        let hidden, visibilityChange;
        if (typeof document.hidden !== 'undefined') {
            // Opera 12.10 and Firefox 18 and later
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        } else if (typeof document.msHidden !== 'undefined') {
            hidden = 'msHidden';
            visibilityChange = 'msvisibilitychange';
        } else if (typeof document.webkitHidden !== 'undefined') {
            hidden = 'webkitHidden';
            visibilityChange = 'webkitvisibilitychange';
        }

        const handleVisibilityChange = () => {
            if (document[hidden]) {
                // page inactive do nothing
            } else {
                if (!this.state.socket.connected) this.state.socket.open(); // page active again, connect socket if disconnected
            }
        };

        if (typeof document.addEventListener !== 'undefined' || hidden !== undefined) {
            document.addEventListener(visibilityChange, handleVisibilityChange, false);
        }
    }

    render() {
        const { socket } = this.state;
        return (
            <div className="App">
                <Navbar />
                <main className="main">
                    <Switch>
                        <Route
                            exact
                            path="/"
                            render={() => (
                                <ErrorBoundary>
                                    <Homepage {...this.props} {...this.state} audioFiles={this.audioFiles} />
                                </ErrorBoundary>
                            )}
                        />

                        <Route
                            exact
                            path="/(maclar|matches)/(tarih|date)-:date"
                            render={props => (
                                <ErrorBoundary>
                                    <Homepage {...this.props} {...props} {...this.state} audioFiles={this.audioFiles} />
                                </ErrorBoundary>
                            )}
                        />

                        <Route
                            exact
                            path="/(mac|match)/:slug-(canli-skor|live-score)-:eventid"
                            render={props => (
                                <ErrorBoundary>
                                    <Eventdetails socket={socket} {...props} />
                                </ErrorBoundary>
                            )}
                        />

                        <Route
                            exact
                            path="/(lig|league)/:slug-(puan-durumu|standing)-:leagueid-(sezon|season)-:seasonid/:activeTab?"
                            render={() => (
                                <ErrorBoundary>
                                    <Leageue />
                                </ErrorBoundary>
                            )}
                        />

                        <Route
                            exact
                            path="/(takim|team)/:slug-:teamId(\d+)"
                            render={props => (
                                <ErrorBoundary>
                                    <Teamdetails socket={socket} {...props} />
                                </ErrorBoundary>
                            )}
                        />

                        <Route exact path="/test" component={TestComp} />

                        <Route
                            exact
                            path="/eventdetails/:eventid"
                            socket={socket}
                            render={props => (
                                <ErrorBoundary>
                                    <Eventdetails socket={socket} {...props} />
                                </ErrorBoundary>
                            )}
                        />

                        <Route render={() => <Errors type="page-not-found" />} />
                    </Switch>
                </main>
            </div>
        );
    }
}

export default withRouter(App);

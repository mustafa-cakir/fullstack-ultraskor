import React, {Component} from 'react';
import './assets/style/app.scss';
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import {Route, Switch, withRouter} from "react-router-dom";
import Eventdetails from "./components/eventdetails/Eventdetails";
import Errors from "./components/Errors";
import ReactGA from 'react-ga';
import TestComp from "./components/TestComp";
import socketIOClient from 'socket.io-client';
import Leaguedetails from "./components/leaguedetails/Leaguedetails";

ReactGA.initialize('UA-132328627-1');

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			socket: socketIOClient.connect(window.location.origin.replace("3000", "5001"), {
				reconnection: false,
				autoConnect: false
			})
		};
		this.reconnectSocket = this.reconnectSocket.bind(this);
	}

	componentDidMount() {
		this.state.socket.open();
		this.state.socket.on('connect', () => {
			this.state.socket.emit('get-updates');
		});

		setTimeout(() => {
			this.state.socket.open()
		}, 1000);

		setTimeout(() => {
			this.state.socket.open()
		}, 5000);

		// setTimeout(() => {
		// 	this.state.socket.open();
		// 	console.log('reconnection triggered now');
		// }, 5000);
		this.state.socket.on('disconnect', () => {
			setTimeout(() => {
				this.state.socket.open()
			}, 1000);
		});

		this.state.socket.on('connect_error', function (data) {
			console.log('connection_error', data);
		});
	}

	reconnectSocket() {
		this.setState({
			socket: this.state.socket.open()
		});
	}

	updateParentState = (state) => {
		return new Promise((resolve) => {
			this.setState(state, () => {
				resolve()
			});
		});
	};

	render() {
		const {socket} = this.state;
		return (
			<div className="App">
				<Navbar getData={this.getData}/>
				<main className="main">
					<Switch>
						<Route exact path='/'
						       render={() => <Homepage socket={socket} reconnectSocket={this.reconnectSocket} {...this.props}/>}/>

						<Route path='/(mac|match)/:slug-(canli-skor|live-score)-:eventid'
						       render={props => <Eventdetails socket={socket} {...props}/>}/>

						<Route path='/(lig|league)/:slug-(puan-durumu|standing)-:leagueid-(sezon|season)-:seasonid'
						       render={props => <Leaguedetails socket={socket} {...props}/>}/>

						<Route exact path='/test' component={TestComp}/>

						<Route path="/eventdetails/:eventid" socket={socket}
						       render={props => <Eventdetails socket={socket} {...props}/>}/>

						<Route render={() => <Errors type="page-not-found"/>}/>
					</Switch>
				</main>
			</div>
		);
	}
}

export default withRouter(App);

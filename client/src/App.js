import React, {Component} from 'react';
import './assets/style/app.scss';
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import {Route, Switch, withRouter} from "react-router-dom";
import Eventdetails from "./components/eventdetails/Eventdetails";
import Errors from "./components/Errors";
import ReactGA from 'react-ga';
import TestComp from "./components/TestComp";
import i18n from "i18next";
ReactGA.initialize('UA-132328627-1');

class App extends Component {
	updateParentState = (state) => {
		return new Promise((resolve) => {
			this.setState(state, () => {
				resolve()
			});
		});
	};
	render() {
		if (i18n.language === "en") document.documentElement.lang = "en";
		return (
			<div className="App">
				<Navbar getData={this.getData}/>
				<main className="main">
					<Switch>
						<Route exact path='/' component={Homepage}/>
						<Route path='/(mac|match)/:slug-(canli-skor|live-score)-:eventid'
						       component={Eventdetails}/>
						<Route exact path='/test' component={TestComp}/>
						<Route path="/eventdetails/:eventid" component={Eventdetails}/>
						<Route render={() => <Errors type="page-not-found"/>}/>
					</Switch>
				</main>
			</div>
		);
	}
}

export default withRouter(App);

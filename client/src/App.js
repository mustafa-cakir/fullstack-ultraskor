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
import MetaTags from "react-meta-tags";

ReactGA.initialize('UA-132328627-1');

class App extends Component {
	updateParentState = (state) => {
		return new Promise((resolve) => {
			this.setState(state, () => {
				resolve()
			});
		});
	};

	componentDidMount() {

	}

	render() {
		if (i18n.language === "en") document.documentElement.lang = "en";
		// let metaAlternateEl = document.querySelector('link[rel="alternate"]');
		// metaAlternateEl.href = (i18n.language === "en" ? "https://www.ultraskor.com" : "https://www.ultraskor.com/tr");
		// metaAlternateEl.hreflang = (i18n.language === "en" ? "tr" : "en");

		return (
			<div className="App">
				{i18n.language === "en" ? (
					<MetaTags>
						<title>UltraSkor - (No Ads) Live Score, Match Results and League Fixtures</title>
						<link rel="canonical" href="https://www.ultraskor.com/en"/>
						<meta name="description"
						      content="No Ads. Get the live football scores update, see football match results & match fixtures from across the world"/>
						<meta name="keywords"
						      content="live scores, live football results, match results, football fixtures, eufa champions league results"/>
					</MetaTags>
				) : ""}
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

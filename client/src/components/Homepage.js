import React, {Component} from 'react';
import Tournament from "./Tournament";
import Errors from "./Errors";
import Loading from "./Loading";
import moment from "moment";
import Headertabs from "./Headertabs";
import Footer from "./Footer";
import Event from "./Event";
import Icon from "./Icon";
import {withNamespaces} from "react-i18next";
import ReactGA from "react-ga";
import RefreshBtn from "./RefreshBtn";
import i18n from "i18next";
import {HelperUpdateMeta} from "../Helper";

class Homepage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mainData: null,
			loading: false,
			orjData: null,
			favEvents: [],
			favEventsList: [],
			refreshBtn: false,
			flashData: null
		};
		this.updateParentState = this.updateParentState.bind(this);
		this.getData = this.getData.bind(this);
		this.todaysDate = null;
	};

	componentDidMount() {
		this.todaysDate = moment().subtract(3, "hours").format('YYYY-MM-DD');
		this.analyzeSessionStorage();

		this.getData({
			api: '/football//' + this.todaysDate + '/json',
			loading: true,
			page: "homepage"
		});

		const page = this.props.location.pathname;
		this.trackPage(page);
	}

	analyzeSessionStorage() {
		let storageHeadertabsState = JSON.parse(sessionStorage.getItem('HeadertabsState')),
			storageFavEvents = JSON.parse(localStorage.getItem('FavEvents'));

		if (storageHeadertabsState && storageHeadertabsState.selectedDay) {
			this.todaysDate = storageHeadertabsState.selectedDay;
		}

		if (storageFavEvents) {
			this.setState({
				favEvents: storageFavEvents
			});
		}
	}

	trackPage(page) {
		ReactGA.set({
			page
		});
		ReactGA.pageview(page);
	};

	updateParentState = (state) => {
		return new Promise((resolve) => {
			this.setState(state, () => {
				resolve()
			});
		});
	};

	preprocessData = data => {
		// Custom Sorting - Move some tournaments to the top or bottom of the list (FYI: 62 = Turkey Super Lig, 309 = CONMEBOL Libertadores)
		let moveToTop = [62, 63]; // tournament Id's in order that you want at top i.e: [62, 36, 33]
		let moveToBottom = [309]; // tournament Id's in the reverse order that you want at the bottom i.e: [309,310]
		let tournaments = data.sportItem.tournaments;
		for (let i = 0; i < tournaments.length; i++) {
			for (let k = 0; k < moveToTop.length; k++) {
				if (tournaments[i].tournament.id === moveToTop[k]) {
					let a = tournaments.splice(i, 1); // removes the item
					tournaments.unshift(a[0]); // adds it back to the beginning
					break;
				}
			}
			for (let k = 0; k < moveToBottom.length; k++) {
				if (tournaments[i].tournament.id === moveToBottom[k]) {
					let a = tournaments.splice(i, 1); // removes the item
					tournaments.push(a[0]); // adds it back to the end
					break;
				}
			}
		}

		// remove yesterday matches
		let currentDate = data.params.date;
		data.sportItem.tournaments = data.sportItem.tournaments.reduce(function (whole, tournament) {
			tournament.events = tournament.events.filter((event) => {
				return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === currentDate;
			});
			tournament.events.forEach(() => {
				if (whole.indexOf(tournament) < 0) whole.push(tournament);
			});
			return whole;
		}, []);
		return data;
	};

	moveFavEventsToTop(jsonData) {
		let favEventsList = [];
		jsonData.sportItem.tournaments.forEach(tournament => {
			tournament.events.forEach(event => {
				if (this.state.favEvents.length > 0 && this.state.favEvents.indexOf(event.id) > -1) {
					favEventsList.push(event)
				}
			})
		});
		this.setState({
			favEventsList: favEventsList
		})
	};

	triggerFlashBoard(options) {
		console.log(options);
	}

	handleSocketChanges(res) {
		let {mainData} = this.state;
		console.log(res);
		res.forEach(change => {
			if (change.kind === "E" && change.event && change.event.id) {
				mainData.sportItem.tournaments.forEach(tournament => {
					tournament.events.forEach(event => {
						if (event.id === change.event.id) {
							if (change.path[1] === "statusDescription") { // minute change
								event.statusDescription = change.rhs;
								event.flashStatusDescription = true;
							} else if (change.path[1] === "homeScore" || change.path[1] === "awayScore") { // home scored
								event[change.path[1]].current = change.rhs;
								this.triggerFlashBoard({
									event: change.event,
									type: change.path[1],
									previous: change.lhs,
									new: change.rhs
								})
							}
						}
					});
				});
			}
		});
		this.setState({
			mainData: mainData,
			orjData: mainData
		});
	}

	handleSocketGetData(res, socket, options) {
		res = JSON.parse(res);
		res = this.preprocessData(res);
		if (this.state.favEvents.length > 0) this.moveFavEventsToTop(res);
		this.setState({
			orjData: res,
			mainData: res,
			loading: false,
			refreshBtn: false
		});
		this.updateMeta();
		this.analyzeSessionStorage();
		socket.emit('check for updates on homepage', options);
	}

	getData = options => {
		if (options.loading) this.setState({loading: true});
		const {socket} = this.props;

		socket.emit('current page', "homepage");

		socket.on('return differences on homepage', res => {
			this.handleSocketChanges(res);
		});

		socket.emit('get data from main', options);

		socket.on('return data from main for homepage', res => {
			this.handleSocketGetData(res, socket, options);
		});

		socket.on('my error', err => {
			if (options.loading) {
				this.setState({
					orjData: {error: err.toString()},
					mainData: {error: err.toString()},
					loading: false,
					refreshBtn: true
				});
			} else {
				this.setState({
					refreshBtn: true
				});
			}
		})
	};

	flagImg(tournament) {
		let uniqueTournamentImages = [7, 11, 384, 480, 679];
		if (uniqueTournamentImages.indexOf(tournament.tournament.uniqueId) > -1) {
			return (
				<div className="col flag-img">
					<img
						src={"/static/media/" + tournament.tournament.uniqueId + ".png"}
						alt={tournament.tournament.name}/>
				</div>
			)
		} else {
			return (
				<div className={"col flag flag-" + tournament.category.flag}/>
			)
		}
	};

	updateMeta() {
		if (i18n.language === "en") {
			HelperUpdateMeta({
				title: "UltraSkor - (No Ads) Live Score, Match Results and League Fixtures",
				canonical: "https://www.ultraskor.com/en",
				description: "No Ads. Get the live football scores update, see football match results & match fixtures from across the world",
				keywords: "live scores, live football results, match results, football fixtures, eufa champions league results",
				alternate: "https://www.ultraskor.com",
				hrefLang: "tr"
			});
		} else if (i18n.language === "tr") {
			HelperUpdateMeta({
				title: "UltraSkor - (Reklamsız) Canlı Skor, Canlı Maç Sonuçları, İddaa Sonuçları",
				canonical: "https://www.ultraskor.com",
				description: "Reklamsız olarak canli maç skorlarını takip edebilir, biten maçların sonuçlarını, istatistiklerini görebilir, iddaa bültenlerini ve biten iddaa maç sonuçlarını görebilirsiniz.",
				keywords: "canli skor, mac sonuclari, ultraskor, sonuclar, iddaa sonuclari",
				alternate: "https://www.ultraskor.com/en",
				hrefLang: "en"
			});
		}
	};

	render() {
		const dataObj = this.state.mainData;
		let mainContent = [],
			favEventContainer = [];

		if (this.state.favEventsList.length > 0) {
			favEventContainer.push(
				<React.Fragment key={1}>
					<div className="tournament-title">
						<div className="row align-items-center">
							<Icon name="fas fa-star event-fav-color"/>
							<div className="col tournament-name px-2">
								<strong>My Favorites</strong>
							</div>
						</div>
					</div>
					{this.state.favEventsList.map((event, i) => {
						return (<Event key={i} favContainer={true} event={event}
						               updateParentState={this.updateParentState} {...this.state}/>)
					})}
				</React.Fragment>
			)
		}

		if (dataObj) {
			if (typeof dataObj.error !== "undefined") {
				mainContent.push(<Errors key={1} type="error" message={dataObj.error}/>);
			} else {
				if (dataObj.sportItem) {
					if (dataObj.sportItem.tournaments.length > 0) {
						mainContent.push(<Tournament key={1} data={dataObj} updateParentState={this.updateParentState}
						                             flagImg={this.flagImg} {...this.state}/>)
					} else {
						mainContent.push(<Errors key={1} type="no-matched-game"/>)
					}
				} else if (dataObj.liveList) {
					mainContent.push(<Errors key={1} type="no-live-game"/>)
				}
			}
		}
		return (
			<div>
				<Headertabs
					{...this.state}
					updateParentState={this.updateParentState}
					getData={this.getData}
					flagImg={this.flagImg}
				/>

				{this.state.loading ? <Loading/> : null}
				<div className="container px-0 homepage-list">
					{favEventContainer}
					{mainContent}
				</div>
				{this.state.refreshBtn ? <RefreshBtn/> : ""}
				<Footer/>
				{/*<Flashscore flashData={this.state.flashData}/>*/}
			</div>
		)
	}
}

export default withNamespaces('translations')(Homepage);

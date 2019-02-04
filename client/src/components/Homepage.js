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
import RefreshButton from "./RefreshButton";
import i18n from "i18next";
import {HelperUpdateMeta} from "../Helper";
import FlashScoreBoard from "./FlashScoreBoard";

class Homepage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mainData: null,
			loading: false,
			orjData: null,
			favEvents: [],
			favEventsList: [],
			refreshButton: false,
		};
		this.updateParentState = this.updateParentState.bind(this);
		this.initSocket = this.initSocket.bind(this);
		this.handleSocketUpdatesData = this.handleSocketUpdatesData.bind(this);
		this.handleSocketData = this.handleSocketData.bind(this);
		this.todaysDate = null;
		this.socket = this.props.socket;
	};

	componentDidMount() {
		this.todaysDate = moment().subtract(3, "hours").format('YYYY-MM-DD');
		this.analyzeSessionStorage();
		this.initSocket({
			api: '/football//' + this.todaysDate + '/json',
			loading: true,
			page: "homepage"
		});

		const page = this.props.location.pathname;
		this.trackPage(page);
	}

	componentWillUnmount() {
		this.socket.emit('is-homepage-getupdates', false);
	}

	analyzeSessionStorage() {
		let storageHeadertabsState = JSON.parse(sessionStorage.getItem('HeadertabsState')),
			storageFavEvents = JSON.parse(localStorage.getItem('FavEvents')),
			storageFlashScoreMuted = JSON.parse(localStorage.getItem('FlashScoreMuted')),
			storageFlashScoreShrink = JSON.parse(localStorage.getItem('FlashScoreShrink'));

		if (storageHeadertabsState && storageHeadertabsState.selectedDay) {
			this.todaysDate = storageHeadertabsState.selectedDay;
		}

		if (storageFlashScoreShrink || storageFlashScoreMuted || storageFavEvents) {
			this.setState({
				flashScoreMuted: storageFlashScoreMuted,
				flashScoreShrinked: storageFlashScoreShrink,
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

	prepareData = data => {
		// Custom Sorting - Move some tournaments to the top or bottom of the list (FYI: 62 = Turkey Super Lig, 309 = CONMEBOL Libertadores)
		let moveToTop = [62, 63]; // tournament Id's in order that you want at top i.e: [62, 36, 33]
		let moveToBottom = []; // tournament Id's in the reverse order that you want at the bottom i.e: [309,310]
		let tournaments = data.sportItem.tournaments;
		for (let i = 0; i < tournaments.length; i++) {
			if (moveToTop.length > 0) {
				for (let k = 0; k < moveToTop.length; k++) {
					if (tournaments[i].tournament.id === moveToTop[k]) {
						let a = tournaments.splice(i, 1); // removes the item
						tournaments.unshift(a[0]); // adds it back to the beginning
						break;
					}
				}
			}
			if (moveToBottom.length > 0) {
				for (let k = 0; k < moveToBottom.length; k++) {
					if (tournaments[i].tournament.id === moveToBottom[k]) {
						let a = tournaments.splice(i, 1); // removes the item
						tournaments.push(a[0]); // adds it back to the end
						break;
					}
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

	handleSocketError(err, options) {
		if (options.loading) {
			this.setState({
				orjData: {error: err.toString()},
				mainData: {error: err.toString()},
				loading: false,
				refreshButton: true
			});
		} else {
			this.setState({
				refreshButton: true
			});
		}
	}

	handleSocketUpdatesData(res) {
		if (res && res.params && this.state.mainData && this.state.mainData.params && this.state.mainData.params.date === res.params.date)
			this.handleSocketData(res, true);
		else return false;
	}

	handleSocketData(res, updated) {
		if (!updated) {
			setTimeout(()=>{
				document.body.classList.add('initial-load');
			}, 0);
		}
		res = this.prepareData(res);
		if (this.state.favEvents.length > 0) this.moveFavEventsToTop(res);
		this.setState({
			orjData: res,
			mainData: res,
			loading: false,
			refreshButton: false
		});
		this.updateMeta();
		this.analyzeSessionStorage();
	}

	initSocket = options => {
		if (options.loading) {
			this.setState({loading: true});
			document.body.classList.remove('initial-load');
		}
		this.socket.emit('get-main', options);

		this.socket.removeListener('return-updates-homepage', this.handleSocketUpdatesData);
		this.socket.on('return-updates-homepage', this.handleSocketUpdatesData);
		this.socket.once('return-main-homepage', this.handleSocketData);
		this.socket.once('return-error-homepage', err => {
			this.handleSocketError(err, options)
		});

		this.socket.once('return-error-updates', () => {
			this.setState({
				refreshButton: true
			})
		});
		this.socket.on('disconnect', () => {
			this.setState({
				refreshButton: true
			});
		});

		this.socket.on('connect', () => {
			this.socket.emit('current-page', "homepage");
			this.socket.emit('is-homepage-getupdates', true);
			this.setState({
				refreshButton: false
			});
		});

		this.socket.on('close', () => {
			console.log('socket is disconnected');
		});
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
					initSocket={this.initSocket}
					flagImg={this.flagImg}
				/>

				{this.state.loading ? <Loading/> : null}
				<div className="container px-0 homepage-list">
					{favEventContainer}
					{mainContent}
				</div>
				{this.state.refreshButton ? <RefreshButton/> : ""}

				<FlashScoreBoard socket={this.socket}/>
				<Footer/>
			</div>
		)
	}
}

export default withNamespaces('translations')(Homepage);

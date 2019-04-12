import React, {Component} from 'react';
import Tournament from "./common/Tournament";
import Errors from "./common/Errors";
import Loading from "./common/Loading";
import moment from "moment";
import Headertabs from "./Headertabs";
import Footer from "./common/Footer";
import Event from "./common/Event";
import Icon from "./common/Icon";
import {Trans, withTranslation} from "react-i18next";
import ReactGA from "react-ga";
import RefreshButton from "./common/RefreshButton";
import i18n from "i18next";
import {HelperUpdateMeta, HelperTranslateUrlTo} from "../Helper";
import FlashScoreBoard from "./common/FlashScoreBoard";

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
		this.initGetData = this.initGetData.bind(this);
		this.onSocketReturnUpdatesData = this.onSocketReturnUpdatesData.bind(this);
		this.handleGetData = this.handleGetData.bind(this);
		this.onSocketConnect = this.onSocketConnect.bind(this);
		this.onSocketDisconnect = this.onSocketDisconnect.bind(this);
		this.throttle = this.throttle.bind(this);
		this.todaysDate = null;
		this.socket = this.props.socket;
	};

	componentDidMount() {
		if (this.props.match.params.date) {
			this.todaysDate = this.props.match.params.date;
		} else {
			this.todaysDate = moment().subtract('1', "hours").format('YYYY-MM-DD');
			this.analyzeSessionStorage();
		}
		this.initGetData({
			api: '/football//' + this.todaysDate + '/json',
			loading: true,
			today: moment(0, "HH").diff(this.todaysDate, 'days') === 0 ? 1 : 0,
			page: "homepage"
		});
		this.once = true;
		const page = this.props.location.pathname;
		this.trackPage(page);
		this.initSocket();
	}

	throttle(func, wait, options) {
		let context;
		let args;
		let result;
		let timeout = null;
		let previous = 0;
		if (!options) options = {};
		const later = () => {
			previous = options.leading === false ? 0 : Date.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		};
		return function () {
			const now = Date.now();
			if (!previous && options.leading === false) previous = now;
			const remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};

	// localStorageGet() {
	//     let storageHomepage = JSON.parse(sessionStorage.getItem('ultraskor_homepage'));
	//     if (storageHomepage) {
	//         this.setState(storageHomepage)
	//     }
	// }
	//
	// localStorageSet() {
	//     const { mainData, orjData, loading, refreshButton,  ...stateToStore} = this.state;
	//     console.log(stateToStore);
	//     localStorage.setItem('ultraskor_homepage', JSON.stringify(stateToStore))
	// }

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
				favEvents: storageFavEvents || []
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

	prepareRes = res => {
		// Custom Sorting - Move some tournaments to the top or bottom of the list (FYI: 62 = Turkey Super Lig, 309 = CONMEBOL Libertadores)
		let moveToTop = [62, 63]; // tournament Id's in order that you want at top i.e: [62, 36, 33]
		let moveToBottom = []; // tournament Id's in the reverse order that you want at the bottom i.e: [309,310]
		let tournaments = res.sportItem.tournaments;
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
		let currentDate = res.params.date;
		res.sportItem.tournaments = res.sportItem.tournaments.reduce(function (whole, tournament) {
			tournament.events = tournament.events.filter((event) => {
				return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === currentDate;
			});
			tournament.events.forEach(() => {
				if (whole.indexOf(tournament) < 0) whole.push(tournament);
			});
			return whole;
		}, []);
		return res;
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

	initGetData = options => {
		this.setState({loading: true});
		document.body.classList.remove('initial-load');
		fetch(`/api/?query=${options.api}&page=homepage&today=${options.today}`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				this.handleGetData(res, false);
			})
			.catch(err => {
				this.setState({
					orjData: {error: err.toString()},
					mainData: {error: err.toString()},
					loading: false,
					refreshBtn: true
				});
			});
	};

	handleGetData(res, isUpdated) {
		if (!isUpdated) {
			setTimeout(() => {
				document.body.classList.add('initial-load');
			}, 0);
		}
		res = this.prepareRes(res);
		if (this.state.favEvents.length > 0) this.moveFavEventsToTop(res);
		this.updateStateGetData(res, isUpdated);
		this.updateMeta();
		this.analyzeSessionStorage();
	}

	updateStateGetData(res, isUpdated) {
		if (!res) return false;
		this.setState({
			orjData: res,
			mainData: res,
			...(!isUpdated && {loading: false}),
			...(!isUpdated && {refreshButton: false}),
		});
	}

	componentWillUnmount() {
		this.removeSocketEvents();
	}

	removeSocketEvents() {
		const {socket} = this.props;
		socket.removeListener('connect', this.onSocketConnect);
		socket.removeListener('disconnect', this.onSocketDisconnect);
		socket.removeListener('return-error-updates', this.onSocketDisconnect);
		socket.removeListener('return-updates-homepage', this.onSocketReturnUpdatesData);
		clearTimeout(this.getUpdatesHomepageInterval);
	}

	initSocket(noInterval = false) {
		//socket.on('return-updates-homepage-2', this.onSocketReturnUpdatesData2);
		this.socket.on('disconnect', this.onSocketDisconnect);
		this.socket.on('return-error-updates', this.onSocketDisconnect);
		this.socket.on('return-updates-homepage', this.onSocketReturnUpdatesData);
		this.initGetUpdatesHomepage(noInterval);
	}

	initGetUpdatesHomepage(noInterval = false) {
		this.getUpdatesHomepageInterval = setTimeout(() => {  // init after 10 seconds
			this.socket.emit('get-updates-homepage');
		}, noInterval ? 100 : 10000);
	}

	onSocketReturnUpdatesData(res) {
		this.initGetUpdatesHomepage();
		if (res && res.params && this.state.mainData && this.state.mainData.params && this.state.mainData.params.date === res.params.date) {
			this.handleGetData(res, true);
		} else {
			return false;
		}
	}

	onSocketDisconnect() {
		this.removeSocketEvents();
		this.socket.on('connect', this.onSocketConnect);
		this.setState({
			refreshButton: true
		});
	}

	onSocketConnect() {
		console.log('Socket connected! - Homepage');
		this.socket.removeListener('connect', this.onSocketConnect);
		if (this.state.refreshButton) {
			this.initSocket(true);
			this.setState({
				refreshButton: false
			});
		}
	}

	// onSocketReturnUpdatesData2(res) {
	// 	if (res) {
	// 		//res = JSON.parse(res);
	// 		let event = res.data[1].data;
	// 		let changesData = event.changesData;
	// 		if (changesData) {
	// 			if (changesData) {
	// 				console.log(event);
	// 			}
	// 			if (changesData.score) {
	// 				if (changesData.away.score || changesData.away.team) {
	// 					console.log(`${t(event.homeTeam.name)} Scored. New score ${event.homeScore.current}`);
	// 				} else if (changesData.home.score || changesData.home.team) {
	// 					console.log(`${t(event.awayTEam.name)} Scored. New score ${event.awayTeam.current}`);
	// 				}
	// 			}
	// 			if (changesData.status) {
	// 				console.log(`Status Changed. New statusDescription: ${event.statusDescription} - New status name: ${event.status.description} - New status code: ${event.status.code}`);
	// 			}
	// 		}
	// 	}
	// }

	updateMeta() {
		const {date} = this.props.match.params || null;

		if (i18n.language === "en") {
			let title = date ? `UltraSkor - Results & Matches on ${moment(date, 'YYYY-MM-DD').format('dddd, MMMM DD, YYYY')}. See all Scores, Results, Stats and Match Highlights`
				: "Live Score, Match Results and League Fixtures - UltraSkor | (No Ads) ";

			let description = date ? `No Ads. Get the football coverages for the matches on ${moment(date, 'YYYY-MM-DD').format('dddd, MMMM DD, YYYY')}. See results, league standings and watch highlights`
				: "No Ads. Get the live football scores update, see football match results, match fixtures and match highlights from all around the world";

			let keywords = date ? `${moment(date, 'YYYY-MM-DD').format('dddd').toLowerCase()} matches, ${moment(date, 'YYYY-MM-DD').format('DD MMMM dddd').toLowerCase()} maç results, ` : ""

			HelperUpdateMeta({
				title: title,
				canonical: window.location.href,
				description: description,
				keywords: keywords + "live scores, live football results, match results, football fixtures, eufa champions league results, highlights",
				alternate: date ? HelperTranslateUrlTo('tr') : 'https://www.ultraskor.com',
				hrefLang: "tr"
			});
		} else if (i18n.language === "tr") {
			let title = date ?
				`UltraSkor - ${moment(date, 'YYYY-MM-DD').format('DD MMMM dddd')} Günü Oynanan Tüm Maçlar burada. Sonuçlar, İstatistikler ve Maç Özetleri için tıklayın.`
				: "Canlı Skor, Canlı Maç Sonuçları, İddaa Sonuçları - UltraSkor | (Reklamsız)";

			let description = date ? `Tamamen reklamsız olarak, ${moment(date, 'YYYY-MM-DD').format('DD MMMM dddd')} günü oynanmış tüm maçların sonuçlarını, lig puan durumlarını ve fikstürlerini takip edebilir, maç özetlerini izleyebilirsiniz.`
				: "Reklamsız olarak canli maç skorlarını takip edebilir, biten maçların sonuçlarını, istatistiklerini görebilir, iddaa bültenlerini ve biten iddaa maç sonuçlarını görebilirsiniz.";

			let keywords = date ? `${moment(date, 'YYYY-MM-DD').format('dddd').toLowerCase()} maçları, ${moment(date, 'YYYY-MM-DD').format('DD MMMM dddd').toLowerCase()} maç sonucları, ` : ""

			HelperUpdateMeta({
				title: title,
				canonical: window.location.href,
				description: description,
				keywords: keywords + "canlı skor, mac sonuclari, ultraskor, sonuclar, iddaa sonuclari, maç özetleri",
				alternate: date ? HelperTranslateUrlTo('en') : 'https://www.ultraskor.com/en',
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
				<div className="fav-container" key={1}>
					<div className="tournament-title">
						<Icon name="fas fa-star event-fav-color"/>
						<div className="col tournament-name px-2">
							<strong><Trans>My Favorites</Trans></strong>
						</div>
					</div>
					{this.state.favEventsList.map((event, i) => {
						return (<Event key={i}
						               socket={this.props.socket}
						               favContainer={true}
						               event={event}
						               updateParentState={this.updateParentState} {...this.state}/>)
					})}
				</div>
			)
		}
		if (dataObj) {
			if (typeof dataObj.error !== "undefined") {
				mainContent.push(<Errors key={1} type="error" message={dataObj.error}/>);
			} else {
				if (dataObj.sportItem) {
					if (dataObj.sportItem.tournaments.length > 0) {
						mainContent.push(<Tournament key={1}
						                             socket={this.props.socket}
						                             tournaments={dataObj.sportItem.tournaments}
						                             updateParentState={this.updateParentState}
						                             {...this.state}/>)
					} else {
						mainContent.push(<Errors key={1} type="no-matched-game"/>)
					}
				} else if (dataObj.liveList) {
					mainContent.push(<Errors key={1} type="no-live-game"/>)
				}
			}
		}
		const {t} = this.props;
		return (
			<div>
				<Headertabs
					{...this.state}
					updateParentState={this.updateParentState}
					initGetData={this.initGetData}
					todaysDateByUrl={this.props.match.params.date}
				/>

				{this.state.loading ? <Loading/> : null}
				<div className="container px-0 homepage-list">
					{favEventContainer}
					{mainContent}
				</div>
				<div className="container date-prev-next-container">
					<div className="row date-prev-next align-items-center">
						<div className="col col-yesterday"><a className="pl-3"
						                                      href={`/${i18n.language === "en" ? "en/" : ""}${t('matches')}/${t('date')}-${moment().subtract(1, 'd').format('YYYY-MM-DD')}`}
						                                      title={`${moment().subtract(1, 'd').format('LL')} ${t('Football Results')}`}><Icon
							name="fas fa-chevron-left"/> <Trans>Yesterday</Trans></a></div>
						<div className="col text-center col-today"><a href={i18n.language === "en" ? "/en/" : "/"}
						                                              title={t('Today\'s football matches')}><Trans>Today's
							Matches</Trans></a></div>
						<div className="col text-right col-tomorrow"><a className="pr-3"
						                                                href={`/${i18n.language === "en" ? "en/" : ""}${t('matches')}/${t('date')}-${moment().add(1, 'd').format('YYYY-MM-DD')}`}
						                                                title={`${moment().add(1, 'd').format('LL')} ${t('Football Results')}`}><Trans>Tomorrow</Trans>
							<Icon name="fas fa-chevron-right"/></a></div>
					</div>
				</div>
				{this.state.refreshButton ? <RefreshButton/> : ""}
				<FlashScoreBoard socket={this.props.socket} audioFiles={this.props.audioFiles}/>
				<Footer/>
			</div>)
	}
}

export default withTranslation('translations')(Homepage);

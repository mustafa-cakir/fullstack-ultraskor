import React, {Component} from 'react';
import Tournament from "./common/Tournament";
import Errors from "./common/Errors";
import Loading from "./common/Loading";
import moment from "moment";
import Headertabs from "./Headertabs";
import Footer from "./common/Footer";
import Icon from "./common/Icon";
import {Trans, withTranslation} from "react-i18next";
import ReactGA from "react-ga";
import RefreshButton from "./common/RefreshButton";
import i18n from "i18next";
import {HelperUpdateMeta, HelperTranslateUrlTo, getQueryStringFromUrl, restoreScrollY} from "../Helper";
import RedScoreBoard from "./common/RedScoreBar";
import FavTournament from "./common/FavTournament";
import BottomParagrah from "./common/BottomParagrah";

class Homepage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mainData: null,
			loading: false,
			favEvents: [],
			favEventsList: [],
			refreshButton: false,
			filteredTournaments: [],
			isLive: false,
			redScoreMuted: false,
			redScoreShrinked: false,
			redScoreFavOnly: false,
			redScoreBarIncident: null,
			isLazyLoad: !/bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(navigator.userAgent),
			lazyLoadCount: getQueryStringFromUrl("load") || 10
		};
		this.updateParentState = this.updateParentState.bind(this);
		this.initGetData = this.initGetData.bind(this);
		this.onSocketReturnUpdatesData = this.onSocketReturnUpdatesData.bind(this);
		this.onSocketReturnPushServiceData = this.onSocketReturnPushServiceData.bind(this);
		this.handleGetData = this.handleGetData.bind(this);
		this.onSocketConnect = this.onSocketConnect.bind(this);
		this.onSocketDisconnect = this.onSocketDisconnect.bind(this);
		this.socket = this.props.socket;
	};

	componentDidMount() {
		this.isPushServiceEnabled = true;
		if (this.props.match.params.date) {
			this.todaysDate = this.props.match.params.date;
		} else {
			//this.todaysDate = moment().subtract('1', "hours").format('YYYY-MM-DD');
			this.todaysDate = moment().format('YYYY-MM-DD')
//this.analyzeSessionStorage();
			this.getFromLocaleStorage();
		}
		this.initGetDataOnPageLoad(false);
		this.once = true;
		this.redScoreBarTimer = null;
		const page = this.props.location.pathname;
		this.trackPage(page);
		this.initSocket();
	}

	initGetDataOnPageLoad(isUpdated) {
		this.initGetData({
			api: '/football//' + this.todaysDate + '/json',
			loading: true,
			today: moment(0, "HH").diff(this.todaysDate, 'days') === 0 ? 1 : 0,
			page: "homepage",
			isUpdated: isUpdated
		});
	}

	getFromLocaleStorage() {
		const persistState = localStorage.getItem('ultraskor_homepage');
		if (persistState) {
			try {
				this.setState(JSON.parse(persistState));
			} catch (e) {
				console.log("Prev state can't implemented, something went seriously wrong!");
			}
		}
	}

	setToLocaleStorage() {
		const stateToStore = {
			...(this.state.filteredTournaments.length > 0 && {filteredTournaments: this.state.filteredTournaments}),
			...(this.state.isLive && {isLive: this.state.isLive}),
			...(this.state.favEvents.length > 0 && {favEvents: this.state.favEvents}),
			redScoreMuted: this.state.redScoreMuted,
			redScoreShrinked: this.state.redScoreShrinked,
			redScoreFavOnly: this.state.redScoreFavOnly,
		};
		localStorage.setItem('ultraskor_homepage', JSON.stringify(stateToStore))
	}

	trackPage(page) {
		ReactGA.set({
			page
		});
		ReactGA.pageview(page);
	};

	updateParentState = (state, isSetToLocalStorage = false) => {
		this.setState(state, () => {
			if (isSetToLocalStorage) this.setToLocaleStorage()
		});
	};

	prepareRes = res => {
		let tournaments = res.sportItem.tournaments;

		// Remove yesterday or tomorrow matches
		let currentDate = res.params.date;
		tournaments = tournaments.reduce(function (whole, tournament) {
			tournament.events = tournament.events.filter((event) => {
				return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === currentDate;
			});
			tournament.events.forEach(() => {
				if (whole.indexOf(tournament) < 0) whole.push(tournament);
			});
			return whole;
		}, []);

		// UEFA - CL - 7
		// UEFA - Europa League - 679
		// Turkey - Super Lig - 52
		// Turkey - TFF 1. Lig - 98
		// England - Premier League - 17
		// England - Championship - 18

		// Spain - LaLiga - 8
		// Germany - Bundesliga - 35
		// Italy - Seria A - 23
		// France - Liga 1 - 34
		// Holland - Eredivisie - 37
		// Belgium - First Division A - 38

		// Portugal - Primeira Liga - 238
		// Norway - Eliteserien - 20
		// Sweeden - Allsvenskan - 40
		// Denmark - Superliga - 39
		// Russia - Premier Liga - 203
		// Croatia - 1. HNL - 170
		// Czech Republic - 1. Liga - 172
		// Greece - Super League - 185
		// Israel - Premier League - 266
		// Ukraine - Premier League - 218

		// Spain - LaLiga 2 - 54
		// Germany - Bundesliga 2 - 44
		// Italy - Serie B - 53
		// France - Ligue 2 - 182
		// Holland - Eerste Divisie - 131
		// England - League One - 24
		// Switzerland - Super League - 215
		//
		// Mexico - Primera Division, Apertura - 11621
		// Argentina - Superliga - 155
		// Brasileiro Série A - 325
		//

		// Custom Sorting - Move some tournaments to the top or bottom of the list (FYI: 62 = Turkey Super Lig, 309 = CONMEBOL Libertadores)
		const moveToTop = [7,679,52,98,17,18,8,35,23,34,37,38,238,20,40,39,203,170,172,185,266,218,54,44,53,182,131,24,215]; // tournament Id's in order that you want at top i.e: [62, 36, 33]
		const moveToBottom = []; // tournament Id's in the reverse order that you want at the bottom i.e: [309,310]

		const priorityTournaments = tournaments.filter(x => moveToTop.indexOf(x.tournament.uniqueId) > -1);
		priorityTournaments.sort((a,b) => {
			if (moveToTop.indexOf(a.tournament.uniqueId) < moveToTop.indexOf(b.tournament.uniqueId)) {
				return -1;
			}
			if (moveToTop.indexOf(a.tournament.uniqueId) > moveToTop.indexOf(b.tournament.uniqueId)) {
				return 1;
			}
			return 0;
		});

		const otherTournaments = tournaments.filter(x => moveToTop.indexOf(x.tournament.uniqueId) === -1);
		tournaments = priorityTournaments.concat(otherTournaments);

		for (let i = 0; i < tournaments.length; i++) {
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

		tournaments[0].currentDate = currentDate;
		return tournaments;
	};

	moveFavEventsToTop(res) {
		res = res || this.state.mainData;
		let favEventsList = [];
		res.forEach(tournament => {
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
		if (!options.isUpdated) {
			this.setState({loading: true});
			document.body.classList.remove('initial-load');
		}
		fetch(`/api/?query=${options.api}&page=homepage&today=${options.today}`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				if (!res) {
					throw Error(`Response is empty`);
				} else {
					this.handleGetData(res, options.isUpdated);
					restoreScrollY();
				}
			})
			.catch(err => {
				this.setState({
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
		if (!isUpdated) this.updateMeta();
	}

	updateStateGetData(res, isUpdated) {
		//console.log(res);
		this.setState({
			mainData: res,
			...(!isUpdated && {loading: false}),
			...(!isUpdated && {refreshButton: false}),
		});
	}

	componentWillUnmount() {
		this.removeSocketEvents();
		clearTimeout(this.redScoreBarTimer);
	}

	removeSocketEvents() {
		const {socket} = this.props;
		socket.removeListener('connect', this.onSocketConnect);
		socket.removeListener('disconnect', this.onSocketDisconnect);
		socket.removeListener('return-error-updates', this.onSocketDisconnect);
		if (this.isPushServiceEnabled) {
			socket.removeListener('push-service', this.onSocketReturnPushServiceData);
		} else {
			socket.removeListener('return-updates-homepage', this.onSocketReturnUpdatesData);
			clearTimeout(this.getUpdatesHomepageInterval);
		}
	}

	initSocket(noInterval = false) {
		//socket.on('return-updates-homepage-2', this.onSocketReturnUpdatesData2);
		this.socket.on('disconnect', this.onSocketDisconnect);
		this.socket.on('return-error-updates', this.onSocketDisconnect);
		if (this.isPushServiceEnabled) {
			this.initGetPushService();
		} else {
			this.socket.on('return-updates-homepage', this.onSocketReturnUpdatesData);
			this.initGetUpdatesHomepage(noInterval);
		}
	}

	initGetPushService() {
		this.socket.on('push-service', this.onSocketReturnPushServiceData);
	}

	onSocketReturnPushServiceData(res) {
		if (!res) return false;
		if (!this.state.mainData) return false;

		let redScoreBarType = null;
		let redScoreBarIncident = {};

		let newMainData = JSON.parse(JSON.stringify(this.state.mainData));
		if (newMainData.length < 1) return false;
		// console.log(res);

		// let resEventId = res.emits[3].split('_')[1];
		let getTournament = newMainData.filter(x => x.tournament.id === res.info.tournament)[0];
		if (!getTournament) return;

		let event = getTournament.events.filter(x => x.id === res.info.id)[0];
		if (!event) return;

		// getEvent = getEvent[0];
		// console.log('## mainData -> geEvent', getEvent);
		if (res.changesData && res.changesData.status && res.status.code !== event.status.code) {
			event.status = res.status;
			event.homeScore = res.homeScore; // update score in each status updates
			event.awayScore = res.awayScore; // update score in each status updates
			redScoreBarType = "status_update";
		}

		if (res.homeRedCards && res.homeRedCards !== event.homeRedCards) {
			event.homeRedCards = res.homeRedCards; // home Team Red Card
			redScoreBarType = "home_redcard";
		}

		if (res.awayRedCards && res.awayRedCards !== event.awayRedCards) {
			event.awayRedCards = res.awayRedCards; // home Team Red Card
			redScoreBarType = "away_redcard";
		}

		if (res.changesData && res.changesData.score) {
			if (res.changesData.home.score) {
				let oldScore = event.homeScore.current || 0,
					newScore = res.homeScore.current;

				if (typeof newScore === "number" && typeof newScore === "number" && newScore !== oldScore) {
					if (newScore > oldScore) {
						//console.log(`${res.homeTeam.name} Home Team Scored. ${oldScore} -> ${newScore}`);
						redScoreBarType = "home_scored";
					} else if (newScore < oldScore) {// away team scored!!
						//console.log(`${res.homeTeam.name} Home Team Score Cancelled. ${oldScore} -> ${newScore}`);
						redScoreBarType = "home_scored_cancel";
					}
					event.homeScore = res.homeScore; // update score Object
				}

			} else if (res.changesData.away.score) {
				let oldScore = event.awayScore.current || 0,
					newScore = res.awayScore.current;

				if (typeof newScore === "number" && typeof newScore === "number" && newScore !== oldScore) {
					if (newScore > oldScore) {
						//console.log(`${res.awayTeam.name} Away Team Scored. ${oldScore} -> ${newScore}`);
						redScoreBarType = "away_scored";
					} else if (newScore < oldScore) {// away team scored!!
						//console.log(`${res.awayTeam.name} Away Team Score Cancelled. ${oldScore} -> ${newScore}`);
						redScoreBarType = "away_scored_cancel";
					}
					event.awayScore = res.awayScore;  // update score Object
				}
			}
		}

		// update statusDescription in all situations
		if (event.statusDescription !== res.statusDescription) {
			event.statusDescription = res.statusDescription
		}

		if (this.state.redScoreFavOnly && this.state.favEvents.length > 0 && this.state.favEvents.indexOf(event.id) < 0) {
			redScoreBarType = null;
		}

		if (redScoreBarType) {
			redScoreBarIncident = {
				type: redScoreBarType,
				event: event
			};
			clearTimeout(this.redScoreBarTimer);
			this.redScoreBarTimer = setTimeout(() => {
				this.setState({
					redScoreBarIncident: null
				});
			}, 15000);
		}

		if (this.state.redScoreBarIncident && redScoreBarType) {
			this.setState({
				redScoreBarIncident: null
			}, () => {
				this.setState({
					mainData: newMainData,
					redScoreBarIncident: redScoreBarIncident
				});
			})

		} else {
			this.setState({
				mainData: newMainData,
				...(redScoreBarType && {redScoreBarIncident: redScoreBarIncident})
			});
		}


		if (this.state.favEvents.length > 0) this.moveFavEventsToTop();
	}

	initGetUpdatesHomepage(noInterval = false) {
		this.getUpdatesHomepageInterval = setTimeout(() => {  // init after 10 seconds
			this.socket.emit('get-updates-homepage');
		}, noInterval ? 100 : 10000);
	}

	onSocketReturnUpdatesData(res) {
		this.initGetUpdatesHomepage();
		if (res && res.params && this.state.mainData[0].currentDate === res.params.date) {
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
			this.setState({
				refreshButton: false
			}, () => {
				this.initSocket(true);
				this.initGetDataOnPageLoad(true);
			});
		}
	}

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
		const {mainData} = this.state;
		if (!mainData) return <Loading/>;
		if (mainData.error) return <Errors key={1} type="error" message={mainData.error}/>;

		const {t} = this.props;
		return (
			<>
				<Headertabs
					isLive={this.state.isLive}
					filteredTournaments={this.state.filteredTournaments}
					updateParentState={this.updateParentState}
					initGetData={this.initGetData}
					mainData={this.state.mainData}
					todaysDateByUrl={this.props.match.params.date}
				/>

				{this.state.loading ? <Loading/> : null}
				<section className="container px-0 homepage-list">

					{this.state.favEventsList.length > 0 ? (
						<FavTournament
							isLive={this.state.isLive}
							socket={this.props.socket}
							updateParentState={this.updateParentState}
							favEvents={this.state.favEvents}
							favEventsList={this.state.favEventsList}
						/>
					) : ""}

					{mainData.length > 0 ? (
						<Tournament
							isLive={this.state.isLive}
							filteredTournaments={this.state.filteredTournaments}
							socket={this.props.socket}
							tournaments={mainData}
							updateParentState={this.updateParentState}
							favEvents={this.state.favEvents}
							favEventsList={this.state.favEventsList}
							isLazyLoad={this.state.isLazyLoad}
							lazyLoadCount={this.state.lazyLoadCount}
						/>
					) : <Errors key={1} type="no-matched-game"/>}

				</section>
				<section className="container date-prev-next-container">
					<div className="row date-prev-next align-items-center">
						<div className="col col-yesterday"><a
							href={`/${i18n.language === "en" ? "en/" : ""}${t('matches')}/${t('date')}-${moment().subtract(1, 'd').format('YYYY-MM-DD')}`}
							title={`${moment().subtract(1, 'd').format('LL')} ${t('Football Results')}`}><Icon
							name="fas fa-chevron-left"/><Trans>Yesterday</Trans></a></div>
						<div className="col text-center col-today"><a href={i18n.language === "en" ? "/en/" : "/"}
						                                              title={t('Today\'s football matches')}><Trans>Today's
							Matches</Trans></a></div>
						<div className="col text-right col-tomorrow"><a
							href={`/${i18n.language === "en" ? "en/" : ""}${t('matches')}/${t('date')}-${moment().add(1, 'd').format('YYYY-MM-DD')}`}
							title={`${moment().add(1, 'd').format('LL')} ${t('Football Results')}`}><Trans>Tomorrow</Trans>
							<Icon name="fas fa-chevron-right"/></a></div>
					</div>
				</section>
				<BottomParagrah page={"homepage"}/>
				{this.state.refreshButton ? <RefreshButton/> : ""}
				{this.state.redScoreBarIncident ?
					<RedScoreBoard
						redScoreBarIncident={this.state.redScoreBarIncident}
						audioFiles={this.props.audioFiles}
						redScoreMuted={this.state.redScoreMuted}
						redScoreShrinked={this.state.redScoreShrinked}
						updateParentState={this.updateParentState}
					/> : ""}
				<Footer/>
			</>
		)
	}
}

export default withTranslation('translations')(Homepage);

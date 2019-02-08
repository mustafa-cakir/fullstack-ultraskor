import React, {Component} from 'react';
import Loading from "../Loading";
import ReactSwipe from "react-swipe";
import Scoreboard from "./Scoreboard";
import Incidents from "./Incidents";
import PressureGraph from "./PressureGraph";
import MatchInfo from "./MatchInfo";
import Bestplayer from "./Bestplayer";
import Standings from "./Standings";
import Stats from "./Stats";
import Lineup from "./Lineup";
import Footer from "../Footer";
import {withNamespaces} from "react-i18next";
import Iddaa from "./Iddaa";
import Errors from "../common/Errors";
import ReactGA from 'react-ga';
import moment from "moment";
import Injuries from "./Injuries";
import RefreshButton from "../RefreshButton";
import smoothscroll from 'smoothscroll-polyfill';
import i18n from "i18next";
import {HelperTranslateUrlTo, HelperUpdateMeta} from "../../Helper";
import LiveTracker from "./LiveTracker";

class Eventdetails extends Component {
	constructor(props) {
		super(props);
		this.swipeEl = React.createRef();
		this.swipeMarkerEl = React.createRef();
		this.swipeTabsEl = React.createRef();
		this.swipeByIndex = this.swipeByIndex.bind(this);
		this.swipeByTabName = this.swipeByTabName.bind(this);
		this.swipeAdjustHeight = this.swipeAdjustHeight.bind(this);
		this.state = {
			loading: false,
			eventData: null,
			index: 0,
			isTabStanding: false,
			isTabLineup: false,
			isTabInjury: false,
			isTabLiveTracker: false,
			provider1MatchData: null,
			provider2MatchData: null,
			provider3MatchData: null,
			refreshButton: false
		};
		this.tabs = [];
		this.eventid = this.props.match.params.eventid;
		smoothscroll.polyfill();
	};

	componentDidMount() {
		this.initSocket({
			api: '/event/' + this.eventid + '/json',
			loading: true,
			page: "eventdetails"
		});
		this.tabs = [];
		const page = this.props.location.pathname;
		this.trackPage(page);
	};

	trackPage(page) {
		ReactGA.set({
			page
		});
		ReactGA.pageview(page);
	};

	componentDidUpdate() {
		if (this.swipeEl.current) {
			this.swipeAdjustHeight(this.state.index);
			this.swipeMarkerAndScrollHandler();
		}
	}

	swipeChanging = index => {
		this.setState({
			index: index
		});
	};
	swipeComplete = (index, el) => {
		let tab = el.getAttribute('data-tab');

		if (tab === "standing") {
			this.setState({isTabStanding: true})
		} else if (tab === "lineup") {
			this.setState({isTabLineup: true})
		} else if (tab === "injuries") {
			this.setState({isTabInjury: true})
		} else if (tab === "live-tracker") {
			this.setState({isTabLiveTracker: true})
		}
	};
	swipeSwiping = (percentage) => {
		//console.log(percentage);
	};
	swipeTabClick = (event, index) => {
		this.rippleEffectHandler(event);
		this.swipeEl.current.slide(index);
	};

	swipeAdjustHeight(index) {
		if (this.swipeEl.current && this.swipeEl.current.containerEl) {
			index = index || this.swipeEl.current.getPos();
			let container = this.swipeEl.current.containerEl.firstChild;
			let active = container.childNodes[index];
			container.style.height = active.offsetHeight + 'px';
		}
	}

	swipeMarkerAndScrollHandler() {
		let marker = this.swipeMarkerEl.current,
			active = document.querySelector('.swipe-tabs .active'),
			tabs = this.swipeTabsEl.current;

		marker.style.width = active.offsetWidth + 'px';
		marker.style.left = active.offsetLeft + 'px';

		tabs.scrollTo({
			left: active.offsetLeft - ((window.innerWidth - active.offsetWidth) / 2) + 7,
			behavior: 'smooth'
		});
	};

	swipeByIndex(index) {
		if (this.swipeEl) this.swipeEl.current.slide(index);
	}

	swipeByTabName(tab) {
		let index = (this.tabs) ? this.tabs.indexOf(tab) : 0;
		if (this.swipeEl) this.swipeEl.current.slide(index);
	}

	initSocket = options => {
		if (options.loading) this.setState({loading: true});
		const {socket} = this.props;

		socket.emit('current-page', "eventdetails");
		socket.emit('get-main', options);
		socket.once('return-main-eventdetails', jsonData => {
			this.handleSocketDataMain(jsonData);

			// init helperData socket emit
			let date1 = moment(jsonData.event.formatedStartDate, 'DD.MM.YYYY').format('DD.MM.YYYY'),
				date2 = moment(date1, 'DD.MM.YYYY').format('MM/DD/YYYY');

			socket.emit('get-eventdetails-helper-1', date1);
			socket.emit('get-eventdetails-helper-2', date2);
		});

		socket.on('return-error-eventdetails', err => {
			if (options.loading) {
				this.setState({
					eventData: {error: err.toString()},
					loading: false
				});
			} else {
				this.setState({
					refreshButton: true
				});
			}
		});

		socket.on('return-eventdetails-prodiver1', this.handleSocketDataProvider1.bind(this));
		socket.on('return-eventdetails-prodiver2', this.handleSocketDataProvider2.bind(this));
		socket.on('return-eventdetails-prodiver3', this.handleSocketDataProvider3.bind(this));
	};

	handleSocketDataMain(jsonData) {
		if (window.location.pathname.split('/')[1] === "eventdetails") {
			window.location = `${window.location.origin}/mac/${jsonData.event.slug}-canli-skor-${jsonData.event.id}/`;
			return;
		}
		this.setState({
			eventData: jsonData,
			loading: false,
			refreshButton: false
		});
		this.updateMeta();
	}

	handleSocketDataProvider1(res) {
		if (res.data && res.data.length > 0) {
			const jsonData = this.state.eventData;
			res.data.forEach(item => {
				let provider1Data = item.Matches.filter(match => match.HomeTeam.Id === jsonData.event.homeTeam.id);
				if (provider1Data.length > 0) {
					this.setState({
						provider1MatchData: provider1Data[0]
					});
				}
			});
		}
	}

	handleSocketDataProvider2(res) {
		if (res && res.initialData && res.initialData.length > 0) {
			const jsonData = this.state.eventData;
			let jsonDataTeamNames = [];
			jsonDataTeamNames.push(
				jsonData.event.homeTeam.name.toLowerCase(),
				jsonData.event.homeTeam.shortName.toLowerCase(),
				jsonData.event.homeTeam.slug.toLowerCase(),
				jsonData.event.awayTeam.name.toLowerCase(),
				jsonData.event.awayTeam.shortName.toLowerCase(),
				jsonData.event.awayTeam.slug.toLowerCase()
			);

			let provider2Data = [];
			res.initialData.forEach(item => {
				let found = item.matches.filter(match => {
					let homeName1_1 = match.homeTeam.middleName.toLowerCase(),
						homeName1_2 = match.homeTeam.name.toLowerCase(),
						awayName1_1 = match.awayTeam.middleName.toLowerCase(),
						awayName1_2 = match.awayTeam.name.toLowerCase();

					return jsonDataTeamNames.indexOf(homeName1_1) > -1 ||
						jsonDataTeamNames.indexOf(homeName1_2) > -1 ||
						jsonDataTeamNames.indexOf(awayName1_1) > -1 ||
						jsonDataTeamNames.indexOf(awayName1_2) > -1;
				});
				if (found.length > 0) provider2Data = found;
			});
			if (provider2Data.length > 0) {
				this.setState({
					provider2MatchData: provider2Data[0]
				});
				if (provider2Data[0].code) {
					let provider3Options = {
						date: moment(provider2Data[0].date, 'MM/DD/YYYY HH:mm:ss').format('DD.MM.YYYY'),
						code: provider2Data[0].code
					};
					this.props.socket.emit('get-eventdetails-helper-3', provider3Options);
				}
			}
		}
	}

	handleSocketDataProvider3(res) {
		const provider2Data = this.state.provider2MatchData;
		if (provider2Data && provider2Data.code) {
			const provider3Data = res[provider2Data.code] ? res[provider2Data.code] : null;
			if (provider3Data && provider3Data.startDate && moment(provider3Data.startDate * 1e3).format('MM/DD/YYYY HH:mm:ss') === provider2Data.date) {
				this.setState({
					provider3MatchData: provider3Data
				});
			}
		}
	}

	rippleEffectHandler(e) {
		let el = e.target,
			rippleEl = document.createElement("span"),
			rect = el.getBoundingClientRect(),
			clientX = e.clientX ? e.clientX : e.touches[0].clientX,
			clientY = e.clientY ? e.clientY : e.touches[0].clientY,
			rippleX = Math.round(clientX - rect.left),
			rippleY = Math.round(clientY - rect.top),
			rippleSize = Math.max(el.offsetWidth, el.offsetHeight);

		rippleEl.className = "ripple";
		el.appendChild(rippleEl);

		rippleEl.style.width = rippleSize + "px";
		rippleEl.style.height = rippleSize + "px";
		rippleEl.style.top = -(rippleSize / 2) + rippleY + 'px';
		rippleEl.style.left = -(rippleSize / 2) + rippleX + 'px';
		rippleEl.className += " rippleEffect";
		setTimeout(() => {
			rippleEl.remove();
		}, 600);
	};

	updateMeta() {
		const eventData = this.state.eventData;
		if (i18n.language === "en") {
			HelperUpdateMeta({
				title: `Live: ${typeof eventData.event.homeScore.current !== "undefined" ? eventData.event.homeScore.current : " "} - ${typeof eventData.event.awayScore.current !== "undefined" ? eventData.event.awayScore.current : " "} | ${eventData.event.name} Live Scores Coverage - See highlights and match statistics`,
				canonical: window.location.href,
				description: `${ eventData.event.tournament.name} Match Report and Live Scores for ${ eventData.event.name} on ${moment(eventData.event.startTimestamp * 1e3).format('ll')} at ${moment(eventData.event.startTimestamp * 1e3).format('HH:mm')}, including lineups, all goals and incidents`,
				keywords: `${eventData.event.homeTeam.slug} match results, ${eventData.event.awayTeam.slug} match results, ${eventData.event.tournament.slug} results, ${eventData.event.slug} lineup, ${eventData.event.slug} results, fixtures`,
				alternate: HelperTranslateUrlTo('tr'),
				hrefLang: "tr"
			})
		} else if (i18n.language === "tr") {
			HelperUpdateMeta({
				title: `Canlı: ${typeof eventData.event.homeScore.current !== "undefined" ? eventData.event.homeScore.current : " "} - ${typeof eventData.event.awayScore.current !== "undefined" ? eventData.event.awayScore.current : " "} | ${eventData.event.name} Maçı canlı skor burada - Maç özeti ve goller için tıklayın`,
				canonical: window.location.href,
				description: `${ eventData.event.tournament.name}, ${ eventData.event.name} (${moment(eventData.event.startTimestamp * 1e3).format('LL')}, saat: ${moment(eventData.event.startTimestamp * 1e3).format('HH:mm')}) maçının canlı skorlarını takip edebilirsiniz. İşte ${eventData.event.name} maçının canlı anlatımı, ilk 11 leri ve maça dair istatistikler...`,
				keywords: `${eventData.event.homeTeam.slug} mac sonuclari, ${eventData.event.awayTeam.slug} mac sonuclari, ${eventData.event.tournament.slug} sonuclari, ${eventData.event.slug} macinin sonucu, ultraskor, canli maclar, iddaa sonuclari`,
				alternate: HelperTranslateUrlTo('en'),
				hrefLang: "en"
			})
		}
	};

	render() {
		const {eventData, provider1MatchData, provider2MatchData, provider3MatchData} = this.state;
		if (!eventData) return <Loading/>;
		if (eventData.error) return <Errors type="error" message={eventData.error}/>;

		const {t} = this.props;
		this.tabs = [
			t('Summary'),
			...(provider1MatchData ? [t("Live Tracker")] : []),
			...(eventData.event.hasStatistics ? [t("Stats")] : []),
			...(eventData.event.hasLineups ? [t("Lineup")] : []),
			...(provider2MatchData ? [t('Injuries & Susp.')] : []),
			t('Iddaa'),
			...(eventData.standingsAvailable ? [t("Standing")] : []),
			t('Media'),
			t('Forum')
		];

		return (
			<div className="event-details">
				{this.state.loading ? <Loading/> : null}
				<Scoreboard eventData={eventData}/>
				<div className="middle-tabs">
					<div className="container">
						<ul className="swipe-tabs" ref={this.swipeTabsEl}>
							{this.tabs.map((tab, index) => {
								return <li key={index} onClick={(event) => this.swipeTabClick(event, index)}
								           className={(this.state.index === index ? "active" : "") + " ripple-effect pink"}>
									<span>{tab}</span></li>;
							})}
							<li className="marker" ref={this.swipeMarkerEl}/>
						</ul>
						<div className="swipe-shadows"/>
					</div>
				</div>
				<ReactSwipe className="swipe-contents"
				            childCount={this.tabs.length}
				            swipeOptions={{
					            speed: 200,
					            continuous: true,
					            callback: this.swipeChanging,
					            transitionEnd: this.swipeComplete,
					            swiping: this.swipeSwiping,
					            disableScroll: false
				            }} ref={this.swipeEl}>

					<div className="swipe-content summary">
						<div className="event-details-summary">
							<div className="container">
								<div className="white-box mt-2 pb-2"><PressureGraph eventData={eventData}/><Bestplayer
									eventData={eventData} swipeByTabName={this.swipeByTabName}/><Incidents
									eventData={eventData} swipeAdjustHeight={this.swipeAdjustHeight}/></div>
								<MatchInfo eventData={eventData} provider3MatchData={provider3MatchData}/>
								<small>1: {this.state.provider1MatchData ? "y" : "n"} -
									2: {this.state.provider2MatchData ? "y" : "n"} -
									3: {this.state.provider3MatchData ? "y" : "n"}</small>
							</div>
						</div>
					</div>

					{provider1MatchData ? (
						<div className="swipe-content live-tracker" data-tab="live-tracker">
							<LiveTracker matchid={provider1MatchData.Id}
							             isTabLiveTracker={this.state.isTabLiveTracker}/>
						</div>
					) : ""}

					{eventData.event.hasStatistics ? (
						<div className="swipe-content stats" data-tab="stats">
							<Stats eventData={eventData}/>
						</div>
					) : ""}

					{eventData.event.hasLineups ? (
						<div className="swipe-content lineup" data-tab="lineup">
							{this.state.isTabLineup ?
								<Lineup eventData={eventData} swipeAdjustHeight={this.swipeAdjustHeight}
								        socket={this.props.socket}/>
								: ""}
						</div>
					) : ""}

					{provider2MatchData ? (
						<div className="swipe-content injuries" data-tab="injuries">
							{this.state.isTabInjury ?
								<Injuries eventData={eventData}
								          matchid={provider2MatchData ? provider2MatchData.id : null}
								          swipeAdjustHeight={this.swipeAdjustHeight}
								          socket={this.props.socket}/>
								: ""}
						</div>
					) : ""}

					<div className="swipe-content iddaa" data-tab="iddaa">
						<Iddaa eventData={eventData} provider2MatchData={provider2MatchData}
						       provider3MatchData={provider3MatchData}
						       swipeAdjustHeight={this.swipeAdjustHeight}/>
					</div>

					{eventData.standingsAvailable ? (
						<div className="swipe-content standing" data-tab="standing">
							{this.state.isTabStanding ?
								<Standings eventData={eventData} socket={this.props.socket}
								           swipeAdjustHeight={this.swipeAdjustHeight}/> : ""}
						</div>
					) : ""}

					<div className="swipe-content media" data-tab="media">
						<div className="p-4">
							<h5>Coming Soon</h5>
							Media contents will be here
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
						</div>
					</div>
					<div className="swipe-content forum" data-tab="forum">
						<div className="p-4">
							<h5>Coming Soon</h5>
							Forum will be here
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
							<p>.</p>
						</div>
					</div>
				</ReactSwipe>
				{this.state.refreshButton ? <RefreshButton/> : ""}
				<Footer/>
			</div>
		)
	}
}

export default withNamespaces('translations')(Eventdetails)

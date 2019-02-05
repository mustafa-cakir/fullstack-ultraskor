import React, {Component} from 'react';
import {Trans, withNamespaces} from "react-i18next";
import Loading from "../Loading";
import Standings from "../common/Standings";
import ReactSwipe from "react-swipe";
import smoothscroll from "smoothscroll-polyfill";
import Footer from "../Footer";
import Tournament from "../common/Tournament";
import i18n from "i18next";
import {HelperTranslateUrlTo, HelperUpdateMeta} from "../../Helper";

class Leaguedetails extends Component {
	constructor(props) {
		super(props);
		this.swipeEl = React.createRef();
		this.swipeMarkerEl = React.createRef();
		this.swipeTabsEl = React.createRef();
		this.swipeByIndex = this.swipeByIndex.bind(this);
		this.swipeByTabName = this.swipeByTabName.bind(this);
		this.swipeAdjustHeight = this.swipeAdjustHeight.bind(this);
		this.state = {
			index: 0,
			leagueData: null,
		};
		smoothscroll.polyfill();
	}

	componentDidMount() {
		this.tabs = [];
		this.initSocket();
	}

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

	initSocket() {
		const {leagueid, seasonid} = this.props.match.params;
		const {socket} = this.props;
		let options = {
			api: `/u-tournament/${leagueid}/season/${seasonid}/json`,
			page: 'leaguedetails'
		};
		socket.emit("get-main", options);
		socket.once('return-main-leaguedetails', res => {
			this.setState({
				leagueData: res
			});
			this.updateMeta(res);
		});
	}

	updateMeta(leagueData) {
		const { t } = this.props;
		if (i18n.language === "en") {
			HelperUpdateMeta({
				title: `${leagueData.uniqueTournament.name} Standings, League Fixtures, ${leagueData.uniqueTournament.name} Weekly Highlights - UltraSkor`,
				canonical: window.location.href,
				description: `Follow live results for ${t(leagueData.category.name)} - ${t(leagueData.uniqueTournament.name)}, see the team of the week, watch weekly highlights and see the upcoming weeks' league fixtures.`,
				keywords: `${t(leagueData.uniqueTournament.name)} weekly results, league fixture, weekly fixtures, ${t(leagueData.uniqueTournament.name)} highlights, ${t(leagueData.uniqueTournament.name)} team of the week, ${t(leagueData.uniqueTournament.name)} top scorers, league stats`,
				alternate: HelperTranslateUrlTo('tr'),
				hrefLang: "tr"
			})
		} else if (i18n.language === "tr") {
			HelperUpdateMeta({
				title: `${t(leagueData.uniqueTournament.name)} Puan Durumu, Lig Fikstürü, ${t(leagueData.uniqueTournament.name)} Maç Özetleri - UltraSkor.com`,
				canonical: window.location.href,
				description: `${t(leagueData.category.name)} - ${t(leagueData.uniqueTournament.name)} canlı puan durumunu kontrol edebilir, haftanin takmini görebilir, maç özetlerini izleyebilirsiniz ve gelecek haftalarin fikstürlerine göz gezdirebilirsiniz.`,
				keywords: `${t(leagueData.uniqueTournament.name)} haftalık sonuclar, lig fikstürü, haftalık lıg fikstürü, ${t(leagueData.uniqueTournament.name)} özetleri, ${t(leagueData.uniqueTournament.name)} haftanın takımı, ${t(leagueData.uniqueTournament.name)} gol krallığı`,
				alternate: HelperTranslateUrlTo('en'),
				hrefLang: "en"
			})
		}
	};

	swipeByIndex(index) {
		if (this.swipeEl) this.swipeEl.current.slide(index);
	}

	swipeByTabName(tab) {
		let index = (this.tabs) ? this.tabs.indexOf(tab) : 0;
		if (this.swipeEl) this.swipeEl.current.slide(index);
	}

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

	render() {
		const {t} = this.props;
		const {leagueData} = this.state;
		if (!leagueData) return <Loading/>;

		this.tabs = [
			...(leagueData.standingsTables.length > 0 ? [t('LANG_Standing')] : []),
			t('Fixture'),
			t('Player Stats'),
			t('Top Scorers'),
			t('Team Of The Week'),
			t('Weekly Highlights'),
		];
		return (
			<div className="league-details">
				<div className="middle-tabs">
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

					{leagueData.standingsTables.length > 0 ? (
						<div className="swipe-content standing" data-tab="standing">
							<Standings standingsTables={leagueData.standingsTables} swipeAdjustHeight={this.swipeAdjustHeight}/>
						</div>
					) : ""}

					<div className="swipe-content fixture" data-tab="fixture">
						<Tournament tournaments={leagueData.events.roundMatches.tournaments}/>
					</div>

					<div className="swipe-content player-stats" data-tab="player-stats">
						<div className="coming-soon"><Trans>Player Stats</Trans> - <Trans>Coming soon</Trans></div>
					</div>

					<div className="swipe-content top-scorers" data-tab="top-scorers">
						<div className="coming-soon"><Trans>Top Scorers</Trans> - <Trans>Coming soon</Trans></div>
					</div>

					<div className="swipe-content team-of-week" data-tab="team-of-week">
						<div className="coming-soon"><Trans>Team Of The Week</Trans> - <Trans>Coming soon</Trans></div>
					</div>

					<div className="swipe-content weekly-highlights" data-tab="weekly-highlights">
						<div className="coming-soon"><Trans>Weekly Highlights</Trans> - <Trans>Coming soon</Trans></div>
					</div>

				</ReactSwipe>
				<Footer/>
			</div>
		)
	}
}

export default withNamespaces('translations')(Leaguedetails)

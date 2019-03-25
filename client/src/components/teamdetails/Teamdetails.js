import React, {Component} from 'react';
import {Trans, withTranslation} from "react-i18next";
import Loading from "../common/Loading";
import ReactSwipe from "react-swipe";
import smoothscroll from "smoothscroll-polyfill";
import Footer from "../common/Footer";
import i18n from "i18next";
import {HelperTranslateUrlTo, HelperUpdateMeta} from "../../Helper";
import Errors from "../common/Errors";
import Tournament from "../common/Tournament";

class Teamdetails extends Component {
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
			teamInfoData: null,
			teamTournamentsData: null,
			isTeamOfTheWeekClicked: false
		};
		smoothscroll.polyfill();
	}

	componentDidMount() {
		this.tabs = [];
		this.initGetData();
	}

	componentDidUpdate() {
		// if (this.swipeEl.current) {
		//     this.swipeAdjustHeight(this.state.index);
		//     this.swipeMarkerAndScrollHandler();
		// }
	}

	swipeChanging = index => {
		this.setState({
			index: index
		});
	};

	preProcessTournamentsData(data) {
		data.tournaments.reverse();
		data.tournaments.forEach(item => {
			item.events.reverse();
		});
		return data;
	}

	initGetData() {
		const {teamId} = this.props.match.params;
		const {language} = i18n;

		fetch(`/api/helper4/${language}/teams/${teamId}`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`404 - Malesef takım hakkında detaylı bilgiye ulaşılamadı`);
				}
			})
			.then(res => {
				this.setState({
					teamInfoData: res
				});
				//this.updateMeta(res);
			})
			.catch(err => {
				this.setState({
					teamInfoData: {error: err.toString()},
				});
			});

		fetch(`/api/?query=/team/${teamId}/events/json&page=teamdetails-fixture-round-matches`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				this.setState({
					loading: false,
					teamTournamentsData: this.preProcessTournamentsData(res)
				}, () => {
					setTimeout(() => {
						this.swipeAdjustHeight();
					}, 100);
				});
			})
			.catch(err => {
				this.setState({
					teamTournamentsData: {error: err.toString()},
				}, () => {
					setTimeout(() => {
						this.swipeAdjustHeight();
					}, 100);
				});
			});

	}

	updateMeta(teamInfoData) {
		const {t} = this.props;
		if (i18n.language === "en") {
			HelperUpdateMeta({
				title: `${teamInfoData.uniqueTournament.name} Standings, League Fixtures, ${teamInfoData.uniqueTournament.name} Weekly Highlights - UltraSkor`,
				canonical: window.location.href,
				description: `Follow live results for ${t(teamInfoData.category.name)} - ${t(teamInfoData.uniqueTournament.name)}, see the team of the week, watch weekly highlights and see the upcoming weeks' league fixtures.`,
				keywords: `${t(teamInfoData.uniqueTournament.name)} weekly results, league fixture, weekly fixtures, ${t(teamInfoData.uniqueTournament.name)} highlights, ${t(teamInfoData.uniqueTournament.name)} team of the week, ${t(teamInfoData.uniqueTournament.name)} top scorers, league stats`,
				alternate: HelperTranslateUrlTo('tr'),
				hrefLang: "tr"
			})
		} else if (i18n.language === "tr") {
			HelperUpdateMeta({
				title: `${t(teamInfoData.uniqueTournament.name)} Puan Durumu, Lig Fikstürü, ${t(teamInfoData.uniqueTournament.name)} Maç Özetleri - UltraSkor.com`,
				canonical: window.location.href,
				description: `${t(teamInfoData.category.name)} - ${t(teamInfoData.uniqueTournament.name)} canlı puan durumunu kontrol edebilir, haftanin takmini görebilir, maç özetlerini izleyebilirsiniz ve gelecek haftalarin fikstürlerine göz gezdirebilirsiniz.`,
				keywords: `${t(teamInfoData.uniqueTournament.name)} haftalık sonuclar, lig fikstürü, haftalık lıg fikstürü, ${t(teamInfoData.uniqueTournament.name)} özetleri, ${t(teamInfoData.uniqueTournament.name)} haftanın takımı, ${t(teamInfoData.uniqueTournament.name)} gol krallığı`,
				alternate: HelperTranslateUrlTo('en'),
				hrefLang: "en"
			})
		}
	};

	swipeComplete = (index, el) => {
		let tab = el.getAttribute('data-tab');

		if (tab === "team-of-week") {
			this.setState({isTeamOfTheWeekClicked: true});
		}

		this.swipeMarkerAndScrollHandler(index);
		this.swipeAdjustHeight(index);
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
		this.setState({
			index: index
		}, () => {
			this.swipeEl.current.slide(index);
			this.swipeMarkerAndScrollHandler(index);
			this.swipeAdjustHeight(index);
		});
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
		const {teamInfoData, teamTournamentsData} = this.state;
		if (!teamInfoData || !teamTournamentsData) return <Loading/>;
		if (teamInfoData.error) return <Errors type="error" message={teamInfoData.error}/>;
		if (teamTournamentsData.error) return <Errors type="error" message={teamTournamentsData.error}/>;

		this.tabs = [
			t('Fixture'),
			t('LANG_Players'),
			t('Standing'),
		];
		const {teamId} = this.props.match.params;
		return (
			<div className="team-details">
				<div className="row team-details-header align-items-center">
					<div className="col col-img">
						<img
							src={window.ImageServer + '/images/team-logo/football_' + teamId}
							alt={t(teamInfoData.team.name)}/>
					</div>
					<div className="col col-info">
						<div className="name">{t(teamInfoData.team.name)}</div>
						{teamInfoData.manager ? <div className="country">{teamInfoData.manager.name}</div> : ""}
					</div>
					{teamInfoData.venue ? (
						<div className="col col-stadium text-right">
							<div className="name">{teamInfoData.venue.name}</div>
							<div className="capacity"><Trans>Capacity</Trans>: {teamInfoData.venue.capacity}</div>
						</div>
					) : ""}
				</div>
				<div className="middle-tabs">
					<div className="container">
						<ul className="swipe-tabs" ref={this.swipeTabsEl}>
							{this.tabs.map((tab, index) => {
								return <li key={index} onClick={(event) => this.swipeTabClick(event, index)}
								           className={(this.state.index === index ? "active " : "") + "ripple-effect pink"}>
									<span>{tab}</span></li>;
							})}
							<li className="marker" ref={this.swipeMarkerEl}
							    style={{width: '85px', left: '0px'}}/>
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
					            disableScroll: false,
				            }} ref={this.swipeEl}>

					<div className="swipe-content fixture" data-tab="standing">
						<Tournament
							tournaments={teamTournamentsData.tournaments}
							from={"h2h"}
							selectedId={teamId}
							selected="home"
						/>
					</div>

					<div className="swipe-content standing" data-tab="fixture">
						<div className="coming-soon"><Trans>LANG_Players</Trans> - <Trans>Coming soon</Trans></div>
					</div>

					<div className="swipe-content team-of-week" data-tab="team-of-week">
						<div className="coming-soon"><Trans>Standing</Trans> - <Trans>Coming soon</Trans></div>
					</div>

				</ReactSwipe>
				<Footer/>
			</div>
		)
	}
}

export default withTranslation('translations')(Teamdetails)

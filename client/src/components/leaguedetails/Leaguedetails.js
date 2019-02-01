import React, {Component} from 'react';
import {Trans, withNamespaces} from "react-i18next";
import Loading from "../Loading";
import Standings from "./Standings";
import ReactSwipe from "react-swipe";
import smoothscroll from "smoothscroll-polyfill";
import Footer from "../Footer";

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
			})
		});
	}

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
			t('LANG_Standing'),
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

					<div className="swipe-content standing" data-tab="standing">
						<Standings leagueData={leagueData} swipeAdjustHeight={this.swipeAdjustHeight}/>
					</div>

					<div className="swipe-content fixture" data-tab="fixture">
						<div class="coming-soon"><Trans>Fixture</Trans> - <Trans>Coming soon</Trans></div>
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

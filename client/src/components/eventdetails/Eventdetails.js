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
import {withTranslation} from "react-i18next";
import Iddaa from "./Iddaa";
import Errors from "../common/Errors";
import ReactGA from 'react-ga';
import moment from "moment";
import Injuries from "./Injuries";
import smoothscroll from 'smoothscroll-polyfill';
import i18n from "i18next";
import {HelperTranslateUrlTo, HelperUpdateMeta} from "../../Helper";
import LiveTracker from "./LiveTracker";
import {Helmet} from "react-helmet";
import H2h from "./H2h";
import RefreshButton from "../RefreshButton";
import IddaLogo from "../../assets/images/icon-iddaa.png";
import Forum from "../common/Forum";

class Eventdetails extends Component {
    constructor(props) {
        super(props);
        this.swipeEl = React.createRef();
        this.swipeMarkerEl = React.createRef();
        this.swipeTabsEl = React.createRef();
        this.swipeByIndex = this.swipeByIndex.bind(this);
        this.swipeByTabName = this.swipeByTabName.bind(this);
        this.swipeAdjustHeight = this.swipeAdjustHeight.bind(this);
        this.handleSocketData = this.handleSocketData.bind(this);
        this.onSocketDisconnect = this.onSocketDisconnect.bind(this);
        this.onSocketConnect = this.onSocketConnect.bind(this);
        this.state = {
            loading: false,
            eventData: null,
            index: 0,
            isTabStanding: false,
            isTabLineup: false,
            isTabInjury: false,
            isTabLiveTracker: false,
            isTabForum: false,
            isTabH2h: false,
            provider1MatchData: null,
            provider2MatchData: null,
            provider3MatchData: null,
            refreshButton: false,
            eventid: this.props.match.params.eventid,
            matchTextInfo: null
        };
        this.tabs = [];
        smoothscroll.polyfill();
        this.initSocketInterval = null;
    };

    componentDidMount() {
        this.initGetData();
        this.initSocket();
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
        if (this.props.match.params.eventid !== this.state.eventid) {
            window.location.reload(); // in case the same component re-called with different matchid, refresh the page to load the fresh data
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
        } else if (tab === "h2h") {
            this.setState({isTabH2h: true})
        } else if (tab === "forum") {
            this.setState({isTabForum: true})
        }
        this.swipeMarkerAndScrollHandler(index);
        this.swipeAdjustHeight(index);
    };
    swipeSwiping = (percentage) => {
        //console.log(percentage);
    };
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

    swipeByIndex(index) {
        if (this.swipeEl) this.swipeEl.current.slide(index);
    }

    swipeByTabName(tab) {
        let index = (this.tabs) ? this.tabs.indexOf(tab) : 0;
        if (this.swipeEl) this.swipeEl.current.slide(index);
    }

    componentWillUnmount() {
        const {socket} = this.props;
        socket.removeListener('return-updates-details', this.handleSocketData);
        socket.removeListener('return-error-updates', this.onSocketDisconnect);
        socket.removeListener('disconnect', this.onSocketDisconnect);
        socket.removeListener('connect', this.onSocketConnect);
        clearTimeout(this.initSocketInterval);
    }

    initSocket() {
        const {socket} = this.props;
        this.emitSocketMessage();
        socket.on('return-updates-details', this.handleSocketData);
        socket.on('return-error-updates', this.onSocketDisconnect);
        socket.on('disconnect', this.onSocketDisconnect);
        socket.on('connect', this.onSocketConnect);
    };

    emitSocketMessage(nowait) {
        const {socket} = this.props;
        const api = '/event/' + this.state.eventid + '/json';

        if (nowait) {
            socket.emit('get-updates-details', api);
        } else {
            this.initSocketInterval = setTimeout(() => { // init socket after 10 seconds (10 seconds interval)
                socket.emit('get-updates-details', api);
            }, 10000);
        }
    }

    handleSocketData(res) {
        this.setState({
            eventData: res,
        }, () => {
            this.emitSocketMessage()

        });
    }

    onSocketConnect() {
        if (this.state.refreshButton) {
            this.setState({
                refreshButton: false
            }, () => {
                clearTimeout(this.initSocketInterval);
                this.emitSocketMessage(true);
            });
        }
    }

    onSocketDisconnect() {
        console.log('disconnected socket');
        clearTimeout(this.initSocketInterval);
        this.setState({
            refreshButton: true
        });
    }

    initGetData = () => {
        this.setState({loading: true});
        const api = '/event/' + this.state.eventid + '/json';

        fetch(`/api/?query=${api}&page=eventdetails`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then(res => {
                this.handleGetData(res);
                this.initGetDataHelper(res.event.formatedStartDate);
            })
            .catch(err => {
                this.setState({
                    eventData: {error: err.toString()},
                    loading: false
                });
            });
    };

    initGetDataHelper(date) {
        // init helperData socket emit
        let date1 = moment(date, 'DD.MM.YYYY').format('DD.MM.YYYY'),
            date2 = moment(date1, 'DD.MM.YYYY').format('MM/DD/YYYY');

        fetch('/api/helper1/' + date1)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then(res => {
                this.handleGetDataHelper1(res);
            })
            .catch(err => {
                console.log(err);
            });

        fetch('/api/helper2/' + date2.replace(/\//g, "."))
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then(res => {
                this.handleGetDataHelper2(res)
            })
            .catch(err => {
                console.log(err);
            });
        // socket.emit('get-eventdetails-helper-1', date1);
        // socket.emit('get-eventdetails-helper-2', date2);
    };

    handleGetData(jsonData) {
        if (window.location.pathname.split('/')[1] === "eventdetails") {
            window.location = `${window.location.origin}/mac/${jsonData.event.slug}-canli-skor-${jsonData.event.id}/`;
            return;
        }
        this.setState({
            eventData: jsonData,
            loading: false,
        });
        this.updateMeta();
        setTimeout(() => {
            this.swipeByTabName(this.props.t('Summary'));
        }, 100);
    }

    handleGetDataHelper1(res) {
        if (res && res.length > 0) {
            const jsonData = this.state.eventData;
            let provider1Data = res.filter(match => match.homeTeam.uid === jsonData.event.homeTeam.id);
            this.setState({
                provider1MatchData: provider1Data[0]
            });
        }
    }

    handleGetDataHelper2(res) {
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
                this.initFetchMatchTextData(provider2Data[0].id);
                this.setState({
                    provider2MatchData: provider2Data[0]
                });
                if (provider2Data[0].code) {
                    let date = moment(provider2Data[0].date, 'MM/DD/YYYY HH:mm:ss').format('DD.MM.YYYY'),
                        code = provider2Data[0].code;

                    fetch(`/api/helper3/${date}/${code}`)
                        .then(res => {
                            if (res.status === 200) {
                                return res.json();
                            } else {
                                throw Error(`Can't retrieve information from server, ${res.status}`);
                            }
                        })
                        .then(res => {
                            if (res) this.handleGetDataHelper3(res)
                        })
                        .catch(() => {
                            // do nothing
                        });
                }
            }
        }
    }

    initFetchMatchTextData(id) {
        fetch(`/api/helper2/widget/teamstats/${id}`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then(res => {
                this.setState({
                    matchTextInfo: res,
                });
            })
            .catch(err => {
                // do nothing
            });
    };

    handleGetDataHelper3(res) {
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
        const {eventData, provider1MatchData, provider2MatchData, provider3MatchData, matchTextInfo} = this.state;
        if (!eventData) return <Loading/>;
        if (eventData.error) return <Errors type="error" message={eventData.error}/>;

        const {socket, t} = this.props;
        this.tabs = [
            t('Summary'),
            ...(provider1MatchData ? [t("Live Tracker")] : []),
            ...(eventData.event.hasStatistics ? [t("Stats")] : []),
            ...(eventData.event.hasLineups ? [t("Lineup")] : []),
            ...(provider2MatchData ? [t('Injuries & Susp.')] : []),
            t('Head To Head'),
            t('Iddaa'),
            ...(eventData.standingsAvailable ? [t("Standing")] : []),
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
                                    <span className="text">{tab === "Iddaa" ?
                                        <img src={IddaLogo} className="tab-logo" alt="Iddaa Logo"/> : ""} {tab}</span>
                                </li>;
                            })}
                            <li className="marker" ref={this.swipeMarkerEl}
                                style={{width: i18n.language === "en" ? '102px' : '71px', left: '0px'}}/>
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
                                <div className="white-box mt-2 pb-2">
                                    <PressureGraph
                                        eventData={eventData}/>
                                    <Bestplayer
                                        eventData={eventData} swipeByTabName={this.swipeByTabName}/>
                                    <Incidents
                                        eventData={eventData} swipeAdjustHeight={this.swipeAdjustHeight}/>
                                </div>
                                <MatchInfo
                                    eventData={eventData}
                                    provider3MatchData={provider3MatchData}
                                    matchTextInfo={matchTextInfo}
                                    swipeAdjustHeight={this.swipeAdjustHeight}
                                    socket={socket}/>
                                <small>1: {this.state.provider1MatchData ? "y" : "n"} -
                                    2: {this.state.provider2MatchData ? "y" : "n"} -
                                    3: {this.state.provider3MatchData ? "y" : "n"}</small>
                            </div>
                        </div>
                    </div>

                    {provider1MatchData ? (
                        <div className="swipe-content live-tracker" data-tab="live-tracker">
                            <LiveTracker matchid={provider1MatchData.id}
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
                                        socket={socket}/>
                                : ""}
                        </div>
                    ) : ""}

                    {provider2MatchData ? (
                        <div className="swipe-content injuries" data-tab="injuries">
                            {this.state.isTabInjury ?
                                <Injuries eventData={eventData}
                                          provider2MatchData={provider2MatchData}
                                          swipeAdjustHeight={this.swipeAdjustHeight}
                                          socket={socket}/>
                                : ""}
                        </div>
                    ) : ""}

                    <div className="swipe-content h2h" data-tab="h2h">
                        {this.state.isTabH2h ?
                            <H2h eventData={eventData}
                                 matchTextInfo={matchTextInfo}
                                 swipeAdjustHeight={this.swipeAdjustHeight}
                                 socket={socket}/>
                            : ""}
                    </div>

                    <div className="swipe-content iddaa" data-tab="iddaa">
                        <Iddaa eventData={eventData}
                               matchTextInfo={matchTextInfo}
                               provider2MatchData={provider2MatchData}
                               provider3MatchData={provider3MatchData}
                               swipeAdjustHeight={this.swipeAdjustHeight}/>
                    </div>

                    {eventData.standingsAvailable ? (
                        <div className="swipe-content standing" data-tab="standing">
                            {this.state.isTabStanding ?
                                <Standings eventData={eventData} socket={socket}
                                           swipeAdjustHeight={this.swipeAdjustHeight}/> : ""}
                        </div>
                    ) : ""}

                    {/*<div className="swipe-content media" data-tab="media">*/}
                        {/*<div className="coming-soon">*/}
                            {/*<h5><Trans>Media</Trans></h5>*/}
                            {/*<Trans>Coming soon</Trans>*/}
                        {/*</div>*/}
                    {/*</div>*/}
                    <div className="swipe-content forum" data-tab="forum">
                        {this.state.isTabForum ? <Forum socket={socket} swipeAdjustHeight={this.swipeAdjustHeight} topicId={eventData.event.id}/> : ""}
                        {/*<div className="coming-soon">*/}
                            {/*<h5><Trans>Forum</Trans></h5>*/}
                            {/*<Trans>Coming soon</Trans>*/}
                        {/*</div>*/}
                    </div>
                </ReactSwipe>
                <Footer/>
                <span>{this.state.refreshButton ? <RefreshButton/> : null}</span>
                <Helmet>
                    <script type="application/ld+json">{`
				        {
							"@context": "http://schema.org",
							"@type": "SportsEvent",
							"name": "${eventData.event.tournament.name} ${eventData.event.season.year} - ${eventData.event.homeTeam.name} vs ${eventData.event.awayTeam.name}",
							"startDate": "${moment(eventData.event.startTimestamp * 1000).toISOString()}",
							"endDate": "${moment(eventData.event.startTimestamp * 1000).add('90', 'minute').toISOString()}",
							"description": "${eventData.event.tournament.name} ${eventData.event.season.year} sezonunda ${eventData.event.homeTeam.name}, ${eventData.event.awayTeam.name} ile evinde oynuyor. Maçın başlama saati ${moment(eventData.event.startTimestamp * 1000).format('HH:mm')}. ${eventData.event.venue ? eventData.event.venue.stadium ? eventData.event.venue.stadium.name : "" : ""} stadında oyanacak mücadeleyi, ${eventData.event.referee ? eventData.event.referee.name : ""} yönetiyor.",
							"awayTeam": {
								"@type": "SportsTeam",
								"name": "${eventData.event.homeTeam.name}",
								"coach": "${eventData.managerDuel ? eventData.managerDuel.homeManager.name : ""}"
							},
							"homeTeam": {
								"@type": "SportsTeam",
								"name": "${eventData.event.awayTeam.name}",
								"coach": "${eventData.managerDuel ? eventData.managerDuel.awayManager.name : ""}"
							},
							"image": [
								"${'https://www.ultraskor.com/images/team-logo/football_' + eventData.event.homeTeam.id + ''}",
								"${'https://www.ultraskor.com/images/team-logo/football_' + eventData.event.awayTeam.id + ''}"
							],
							"location": {
								"@type": "Place",
								"name": "${eventData.event && eventData.event.venue && eventData.event.venue.stadium && eventData.event.venue.stadium.name ? eventData.event.venue.stadium.name : "Vodafone Park"}",
								"address": {
									"@type": "PostalAddress",
									"addressCountry": "${eventData.event && eventData.event.venue && eventData.event.country && eventData.event.venue.country.name ? eventData.event.venue.country.name : "Turkey"}",
									"addressLocality": "${eventData.event && eventData.event.venue && eventData.event.venue.city && eventData.event.venue.city.name ? eventData.event.venue.city.name : "Istanbul"}"
								},
								"maximumAttendeeCapacity": "${eventData.event && eventData.event.venue && eventData.event.venue.stadium && eventData.event.venue.stadium.capcity ? eventData.event.venue.stadium.capcity : "45000"}"
							},
							"offers": {
                              "@type": "Offer",
                              "price": "0.00",
                              "priceCurrency": "TRY",
                              "url": "https://www.ultraskor.com${window.location.pathname}",
                              "availability": "live covarage",
                              "validFrom": "2019-02-20T20:00:00.000Z"
                            },
                            "performer": {
                            	"@type": "Place",
								"name": "${eventData.event && eventData.event.venue && eventData.event.venue.stadium && eventData.event.venue.stadium.name ? eventData.event.venue.stadium.name : "Vodafone Park"}",
								"address": {
									"@type": "PostalAddress",
									"addressCountry": "${eventData.event && eventData.event.venue && eventData.event.country && eventData.event.venue.country.name ? eventData.event.venue.country.name : "Turkey"}",
									"addressLocality": "${eventData.event && eventData.event.venue && eventData.event.venue.city && eventData.event.venue.city.name ? eventData.event.venue.city.name : "Istanbul"}"
								},
								"maximumAttendeeCapacity": "${eventData.event && eventData.event.venue && eventData.event.venue.stadium && eventData.event.venue.stadium.capcity ? eventData.event.venue.stadium.capcity : "45000"}"
                          	}
						}
				    `}</script>
                </Helmet>
            </div>
        )
    }
}

export default withTranslation('translations')(Eventdetails)

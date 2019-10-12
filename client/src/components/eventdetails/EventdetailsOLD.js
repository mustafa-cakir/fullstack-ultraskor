import React, { PureComponent } from 'react';
import update from 'react-addons-update';
import { withTranslation } from 'react-i18next';
import smoothscroll from 'smoothscroll-polyfill';
import ReactGA from 'react-ga';
import moment from 'moment';
import ReactSwipe from 'react-swipe';
import Loading from '../common/Loading';
import Scoreboard from './Scoreboard';
import Incidents from './Incidents';
import PressureGraph from './PressureGraph';
import Bestplayer from './BestPlayer';
import MatchInfo from './MatchInfo/index';
import Standings from './Standings';
import Stats from './Stats';
import Lineup from './Lineup';
import Footer from '../common/Footer';
import Iddaa from './Iddaa';
import Errors from '../common/Errors';
import Injuries from './Injuries';
import { HelperTranslateUrlTo, HelperUpdateMeta } from '../../Helper';
import LiveTracker from './LiveTracker';
import H2h from './H2h';
import RefreshButton from '../common/RefreshButton';
import IddaLogo from '../../assets/images/icon-iddaa.png';
import Forum from '../common/Forum';
import { JsonLd } from '../common/JsonLd';
import PreIddaa from './PreIddaa';

class EventdetailsOLD extends PureComponent {
    constructor(props) {
        super(props);
        this.swipeEl = React.createRef();
        this.swipeMarkerEl = React.createRef();
        this.swipeTabsEl = React.createRef();
        this.swipeByIndex = this.swipeByIndex.bind(this);
        this.swipeByTabName = this.swipeByTabName.bind(this);
        this.swipeAdjustHeight = this.swipeAdjustHeight.bind(this);
        this.onSocketDisconnect = this.onSocketDisconnect.bind(this);
        this.handleSocketData = this.handleSocketData.bind(this);
        this.onSocketReturnPushServiceData = this.onSocketReturnPushServiceData.bind(this);
        this.onSocketConnect = this.onSocketConnect.bind(this);
        const { match } = this.props;
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
            isTabIddaa: false,
            provider1MatchData: null,
            provider2MatchData: null,
            iddaaMatchData: null,
            refreshButton: false,
            eventid: match.params.eventid,
            matchTextInfo: null
        };
        this.tabs = [];
        smoothscroll.polyfill();
        this.initSocketInterval = null;
    }

    componentDidMount() {
        const { location } = this.props;
        this.isPushServiceEnabled = true;
        this.initGetData(false);
        // this.initSocket();
        this.tabs = [];
        const page = location.pathname;
        this.trackPage(page);
    }

    trackPage(page) {
        ReactGA.set({
            page
        });
        ReactGA.pageview(page);
    }

    componentDidUpdate() {
        if (this.props.match.params.eventid !== this.state.eventid) {
            // in case the same component re-called with different matchid, refresh the page to load the fresh data
            window.location.reload();
        }
    }

    swipeChanging(index) {
        this.setState({
            index
        });
    }

    swipeComplete(index, el) {
        const tab = el.getAttribute('data-tab');
        if (tab === 'standing') {
            this.setState({ isTabStanding: true });
        } else if (tab === 'lineup') {
            this.setState({ isTabLineup: true });
        } else if (tab === 'injuries') {
            this.setState({ isTabInjury: true });
        } else if (tab === 'live-tracker') {
            this.setState({ isTabLiveTracker: true });
        } else if (tab === 'h2h') {
            this.setState({ isTabH2h: true });
        } else if (tab === 'iddaa') {
            this.setState({ isTabIddaa: true });
        } else if (tab === 'forum') {
            this.setState({ isTabForum: true });
        }
        this.swipeMarkerAndScrollHandler(index);
        this.swipeAdjustHeight(index);
    }

    swipeTabClick(event, index) {
        this.rippleEffectHandler(event);
        this.setState(
            {
                index
            },
            () => {
                if (this.swipeEl && this.swipeEl.current) this.swipeEl.current.slide(index);
                this.swipeMarkerAndScrollHandler(index);
                this.swipeAdjustHeight(index);
            }
        );
    }

    swipeAdjustHeight(index) {
        if (this.swipeEl && this.swipeEl.current && this.swipeEl.current.containerEl) {
            index = index || this.swipeEl.current.getPos();
            const container = this.swipeEl.current.containerEl.firstChild;
            const active = container.childNodes[index];
            container.style.height = `${active.offsetHeight}px`;
        }
    }

    swipeMarkerAndScrollHandler() {
        const marker = this.swipeMarkerEl.current;
        const active = document.querySelector('.swipe-tabs .active');
        const tabs = this.swipeTabsEl.current;

        marker.style.width = `${active.offsetWidth}px`;
        marker.style.left = `${active.offsetLeft}px`;

        tabs.scrollTo({
            left: active.offsetLeft - (window.innerWidth - active.offsetWidth) / 2 + 7,
            behavior: 'smooth'
        });
    }

    swipeByIndex(index) {
        if (this.swipeEl && this.swipeEl.current) this.swipeEl.current.slide(index);
    }

    swipeByTabName(tab) {
        const index = this.tabs ? this.tabs.indexOf(tab) : 0;
        if (this.swipeEl && this.swipeEl.current) this.swipeEl.current.slide(index);
    }

    componentWillUnmount() {
        this.removeSocketEvents();
    }

    removeSocketEvents() {
        const { socket } = this.props;
        socket.removeListener('disconnect', this.onSocketDisconnect);
        socket.removeListener('connect', this.onSocketConnect);

        if (this.isPushServiceEnabled) {
            socket.removeListener('push-service', this.onSocketReturnPushServiceData);
        } else {
            socket.removeListener('return-updates-details', this.handleSocketData);
            socket.removeListener('return-error-updates', this.onSocketDisconnect);
            clearTimeout(this.initSocketInterval);
        }
    }

    initSocket() {
        const { socket } = this.props;
        socket.on('disconnect', this.onSocketDisconnect);
        socket.on('connect', this.onSocketConnect);

        if (this.isPushServiceEnabled) {
            this.initGetPushService();
        } else {
            this.emitSocketMessage();
            socket.on('return-updates-details', this.handleSocketData);
            socket.on('return-error-updates', this.onSocketDisconnect);
        }
    }

    initGetPushService() {
        this.props.socket.on('push-service', this.onSocketReturnPushServiceData);
    }

    onSocketReturnPushServiceData(res) {
        if (!res) return false;
        const { eventData } = this.state;
        if (!eventData) return false;

        if (res.info.id === eventData.event.id) {
            // there is a match
            const newEventData = update(eventData, {
                event: {
                    awayScore: { $set: res.awayScore },
                    homeScore: { $set: res.homeScore },
                    status: { $set: res.status },
                    statusDescription: { $set: res.statusDescription }
                }
            });
            this.setState({
                eventData: newEventData
            });
        }
        return false;
    }

    onSocketConnect() {
        const { socket } = this.props;
        socket.removeListener('connect', this.onSocketConnect);
        if (this.state.refreshButton) {
            this.setState(
                {
                    refreshButton: false
                },
                () => {
                    this.initGetData(true);
                    this.initSocket();
                }
            );
        }
    }

    onSocketDisconnect() {
        this.removeSocketEvents();
        this.props.socket.on('connect', this.onSocketConnect);
        console.log('disconnected socket');
        this.setState({
            refreshButton: true
        });
    }

    initGetData(isUpdated = false) {
        if (!isUpdated) this.setState({ loading: true });
        const { eventid } = this.state;
        fetch(`/api/eventdetails/${eventid}/${this.props.i18n.language}`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                throw Error(`Can't retrieve information from server, ${res.status}`);
            })
            .then(res => {
                this.handleGetData(res, isUpdated);
                // if (!isUpdated) this.initGetDataHelper(moment(res.event.startTimestamp).format('DD.MM.YYYY'));
            })
            .catch(err => {
                this.setState({
                    eventData: { error: err.toString() },
                    loading: false
                });
            });
    }

    emitSocketMessage() {
        const { socket } = this.props;
        const api = `/event/${this.state.eventid}/json`;

        this.initSocketInterval = setTimeout(() => {
            // init socket after 10 seconds (10 seconds interval)
            socket.emit('get-updates-details', api);
        }, 10000);
    }

    handleSocketData(res) {
        this.setState(
            {
                eventData: res
            },
            () => {
                this.emitSocketMessage();
            }
        );
    }

    handleGetData(jsonData, isUpdated) {
        if (window.location.pathname.split('/')[1] === 'eventdetails') {
            window.location = `${window.location.origin}/mac/${jsonData.event.slug}-canli-skor-${jsonData.event.id}/`;
            return;
        }
        this.setState({
            eventData: jsonData,
            ...(!isUpdated && { loading: false })
        });
        if (!isUpdated) this.updateMeta();
        setTimeout(() => {
            this.swipeByTabName(this.props.t('Summary'));
        }, 100);
    }

    rippleEffectHandler(e) {
        const el = e.target;
        const rippleEl = document.createElement('span');
        const rect = el.getBoundingClientRect();
        const clientX = e.clientX ? e.clientX : e.touches[0].clientX;
        const clientY = e.clientY ? e.clientY : e.touches[0].clientY;
        const rippleX = Math.round(clientX - rect.left);
        const rippleY = Math.round(clientY - rect.top);
        const rippleSize = Math.max(el.offsetWidth, el.offsetHeight);

        rippleEl.className = 'ripple';
        el.appendChild(rippleEl);

        rippleEl.style.width = `${rippleSize}px`;
        rippleEl.style.height = `${rippleSize}px`;
        rippleEl.style.top = `${-(rippleSize / 2) + rippleY}px`;
        rippleEl.style.left = `${-(rippleSize / 2) + rippleX}px`;
        rippleEl.className += ' rippleEffect';
        setTimeout(() => {
            rippleEl.remove();
        }, 600);
    }

    updateMeta() {
        const { eventData } = this.state;
        const { event } = eventData;
        if (this.props.i18n.language === 'en') {
            if (window.location.pathname.split('/')[2] === 'mac')
                window.location.href = HelperTranslateUrlTo('en', true);
            HelperUpdateMeta({
                title: `Live: ${typeof event.scores.home !== 'undefined' ? event.scores.home : ' '} - ${
                    typeof event.scores.away !== 'undefined' ? event.scores.away : ' '
                } | ${event.name} Live Scores Coverage - See highlights and match statistics`,
                canonical: window.location.href,
                description: `${event.tournament.name} Match Report and Live Scores for ${event.name} on ${moment(
                    event.startTimestamp
                ).format('ll')} at ${moment(event.startTimestamp).format(
                    'HH:mm'
                )}, including lineups, all goals and incidents`,
                keywords: `${event.teams.home.slug} match results, 
                ${event.teams.away.slug} match results, ${event.tournament.slug} results, 
                ${event.slug} lineup, ${event.slug} results, fixtures`,
                alternate: HelperTranslateUrlTo('tr'),
                hrefLang: 'tr'
            });
        } else if (this.props.i18n.language === 'tr') {
            if (window.location.pathname.split('/')[1] === 'match')
                window.location.href = HelperTranslateUrlTo('tr', true);
            HelperUpdateMeta({
                title: `Canlı: ${typeof event.scores.home !== 'undefined' ? event.scores.home : ' '} - ${
                    typeof event.scores.away !== 'undefined' ? event.scores.away : ' '
                } | ${event.name} Maçı canlı skor burada - Maç özeti ve goller için tıklayın`,
                canonical: window.location.href,
                description: `${event.tournament.name}, ${event.name} (${moment(event.startTimestamp).format(
                    'LL'
                )}, saat: ${moment(event.startTimestamp).format(
                    'HH:mm'
                )}) maçının canlı skorlarını takip edebilirsiniz. İşte ${
                    event.name
                } maçının canlı anlatımı, ilk 11 leri ve maça dair istatistikler...`,
                keywords: `${event.teams.home.slug} mac sonuclari, ${event.teams.away.slug} mac sonuclari, 
                ${event.tournament.slug} sonuclari, ${event.slug} macinin sonucu, ultraskor, 
                canli maclar, iddaa sonuclari`,
                alternate: HelperTranslateUrlTo('en'),
                hrefLang: 'en'
            });
        }
    }

    render() {
        const { eventData, provider2MatchData, matchTextInfo, iddaaMatchData } = this.state;
        if (!eventData) return <Loading />;
        if (eventData.error) return <Errors type="error" message={eventData.error} />;

        const { event, ids } = eventData;
        const { socket, t } = this.props;
        this.tabs = [
            t('Summary'),
            ...(ids.id_sp ? [t('Live Tracker')] : []),
            ...(event.hasStatistics ? [t('Stats')] : []),
            ...(event.hasLineups ? [t('Lineup')] : []),
            ...(provider2MatchData ? [t('Injuries & Susp.')] : []),
            t('Head To Head'),
            ...(iddaaMatchData ? [t('Iddaa')] : []),
            ...(event.standingsAvailable ? [t('Standing')] : []),
            t('Forum')
        ];

        const handleTabChange = args => {
            console.log(args);
        };

        return (
            <div className="event-details">
                {this.state.loading ? <Loading /> : null}
                <Scoreboard event={event} />
                <div className="middle-tabs">
                    <div className="container">
                        <ul className="swipe-tabs" ref={this.swipeTabsEl}>
                            {this.tabs.map((tab, index) => {
                                return (
                                    <li
                                        key={tab}
                                        onClick={e => this.swipeTabClick(e, index)}
                                        className={`${this.state.index === index ? 'active' : ''} ripple-effect pink`}
                                    >
                                        {tab === 'Iddaa' ? (
                                            <span className="text">
                                                <img src={IddaLogo} className="tab-logo" alt="Iddaa Logo" /> {tab}{' '}
                                                {event.status.type === 'inprogress' && <span className="live-pulse" />}
                                            </span>
                                        ) : (
                                            <span className="text">{tab}</span>
                                        )}
                                    </li>
                                );
                            })}
                            <li
                                className="marker"
                                ref={this.swipeMarkerEl}
                                style={{ width: this.props.i18n.language === 'en' ? '102px' : '71px', left: '0px' }}
                            />
                        </ul>
                        <div className="swipe-shadows" />
                    </div>
                </div>
                <ReactSwipe
                    className="swipe-contents"
                    childCount={this.tabs.length}
                    swipeOptions={{
                        speed: 200,
                        continuous: true,
                        callback: this.swipeChanging.bind(this),
                        transitionEnd: this.swipeComplete.bind(this),
                        swiping: this.swipeSwiping,
                        disableScroll: false
                    }}
                    ref={this.swipeEl}
                >
                    <div className="swipe-content summary">
                        <div className="event-details-summary">
                            <div className="container">
                                <div className="white-box mt-2 pb-2">
                                    <PressureGraph event={event} />
                                    <Bestplayer event={event} swipeByTabName={this.swipeByTabName} />
                                    <PreIddaa
                                        eventData={eventData}
                                        iddaaMatchData={iddaaMatchData}
                                        swipeByTabName={this.swipeByTabName}
                                    />
                                    <Incidents incidents={event.incidents} />
                                </div>
                                <MatchInfo eventData={eventData} swipeAdjustHeight={this.swipeAdjustHeight} />
                                <small>
                                    1: {this.state.provider1MatchData ? 'y' : 'n'} - 2:{' '}
                                    {this.state.provider2MatchData ? 'y' : 'n'} - 3: {this.state.iddaaList ? 'y' : 'n'}
                                </small>
                            </div>
                        </div>
                    </div>

                    {ids.id_sp && (
                        <div className="swipe-content live-tracker" data-tab="live-tracker">
                            {this.state.isTabLiveTracker && <LiveTracker matchid={ids.id_sp} />}
                        </div>
                    )}

                    {event.hasStatistics && (
                        <div className="swipe-content stats" data-tab="stats">
                            <Stats eventData={eventData} />
                        </div>
                    )}

                    {event.hasLineups && (
                        <div className="swipe-content lineup" data-tab="lineup">
                            {this.state.isTabLineup && (
                                <Lineup
                                    eventData={eventData}
                                    swipeAdjustHeight={this.swipeAdjustHeight}
                                    socket={socket}
                                />
                            )}
                        </div>
                    )}

                    {provider2MatchData && (
                        <div className="swipe-content injuries" data-tab="injuries">
                            {this.state.isTabInjury && (
                                <Injuries
                                    eventData={eventData}
                                    provider2MatchData={provider2MatchData}
                                    swipeAdjustHeight={this.swipeAdjustHeight}
                                    socket={socket}
                                />
                            )}
                        </div>
                    )}

                    <div className="swipe-content h2h" data-tab="h2h">
                        {this.state.isTabH2h && (
                            <H2h
                                eventData={eventData}
                                matchTextInfo={matchTextInfo}
                                swipeAdjustHeight={this.swipeAdjustHeight}
                                socket={socket}
                            />
                        )}
                    </div>

                    {iddaaMatchData && (
                        <div className="swipe-content iddaa" data-tab="iddaa">
                            {this.state.isTabIddaa && (
                                <Iddaa
                                    eventData={eventData}
                                    matchTextInfo={matchTextInfo}
                                    provider2MatchData={provider2MatchData}
                                    iddaaMatchData={iddaaMatchData}
                                    swipeAdjustHeight={this.swipeAdjustHeight}
                                />
                            )}
                        </div>
                    )}

                    {eventData.standingsAvailable && (
                        <div className="swipe-content standing" data-tab="standing">
                            {this.state.isTabStanding && (
                                <Standings
                                    eventData={eventData}
                                    socket={socket}
                                    swipeAdjustHeight={this.swipeAdjustHeight}
                                />
                            )}
                        </div>
                    )}
                    <div className="swipe-content forum" data-tab="forum">
                        {this.state.isTabForum && (
                            <Forum
                                t={t}
                                socket={socket}
                                swipeAdjustHeight={this.swipeAdjustHeight}
                                topicId={event.id}
                            />
                        )}
                    </div>
                </ReactSwipe>
                <Footer />
                <span>{this.state.refreshButton ? <RefreshButton /> : null}</span>

                <JsonLd
                    data={`
				        {
							"@context": "http://schema.org",
							"@type": "SportsEvent",
							"name": "${event.tournament.name}
							${event.season ? event.season.year : ''} - ${t(event.teams.home.name)}
							vs ${t(event.teams.away.name)}",
							"startDate": "${moment(event.startTimestamp).toISOString()}",
							"endDate": "${moment(event.startTimestamp)
                                .add('90', 'minute')
                                .toISOString()}",
							"description": "${event.tournament.name} ${event.season ? event.season.year : ''} sezonunda ${t(
                        event.teams.home.name
                    )}, ${t(event.teams.away.name)} ile evinde oynuyor. Maçın başlama saati ${moment(
                        event.startTimestamp
                    ).format('HH:mm')}. ${
                        event.venue && event.venue.stadium ? event.venue.stadium.name : ''
                    } stadında oyanacak mücadeleyi, ${event.referee ? event.referee.name : ''} yönetiyor.",
							"awayTeam": {
								"@type": "SportsTeam",
								"name": "${t(event.teams.home.name)}",
								"coach": "${eventData.managerDuel ? eventData.managerDuel.homeManager.name : ''}"
							},
							"homeTeam": {
								"@type": "SportsTeam",
								"name": "${t(event.teams.away.name)}",
								"coach": "${eventData.managerDuel ? eventData.managerDuel.awayManager.name : ''}"
							},
							"image": [
								"${`https://www.ultraskor.com/images/team-logo/football_${event.teams.home.id}.png`}",
								"${`https://www.ultraskor.com/images/team-logo/football_${event.teams.away.id}.png`}"
							],
							"location": {
								"@type": "Place",
								"name": "${
                                    event.venue && event.venue.stadium && event.venue.stadium.name
                                        ? event.venue.stadium.name
                                        : 'Vodafone Park'
                                }",
								"address": {
									"@type": "PostalAddress",
									"addressCountry": "${event.venue && event.country && event.venue.country.name ? event.venue.country.name : 'Turkey'}",
									"addressLocality": "${event.venue && event.venue.city && event.venue.city.name ? event.venue.city.name : 'Istanbul'}"
								},
								"maximumAttendeeCapacity": "${
                                    event.venue && event.venue.stadium && event.venue.stadium.capcity
                                        ? event.venue.stadium.capcity
                                        : '45000'
                                }"
							},
							"offers": {
                              "@type": "Offer",
                              "price": "0.00",
                              "priceCurrency": "TRY",
                              "url": "https://www.ultraskor.com${window.location.pathname}",
                              "availability": "http://schema.org/InStock",
                              "validFrom": "2019-02-20T20:00:00.000Z"
                            },
                            "performer": {
                            	"@type": "Place",
								"name": "${
                                    event.venue && event.venue.stadium && event.venue.stadium.name
                                        ? event.venue.stadium.name
                                        : 'Vodafone Park'
                                }",
								"address": {
									"@type": "PostalAddress",
									"addressCountry": "${event.venue && event.country && event.venue.country.name ? event.venue.country.name : 'Turkey'}",
									"addressLocality": "${event.venue && event.venue.city && event.venue.city.name ? event.venue.city.name : 'Istanbul'}"
								},
								"maximumAttendeeCapacity": "${
                                    event.venue && event.venue.stadium && event.venue.stadium.capcity
                                        ? event.venue.stadium.capcity
                                        : '45000'
                                }"
                          	}
						}
				    `}
                />
            </div>
        );
    }
}

export default withTranslation('translations')(EventdetailsOLD);

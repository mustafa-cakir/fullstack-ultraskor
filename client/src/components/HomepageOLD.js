import React, { Component } from 'react';
import moment from 'moment';
import { Trans, withTranslation } from 'react-i18next';
import i18n from 'i18next';
import Tournament from './common/Tournament';
import Errors from './common/Errors';
import Loading from './common/Loading';
import Headertabs from './Headertabs';
import Footer from './common/Footer';
import Icon from './common/Icon';
import RefreshButton from './common/RefreshButton';
import {
    HelperUpdateMeta,
    HelperTranslateUrlTo,
    getQueryStringFromUrl,
    restoreScrollY,
    prepareRes,
    trackPage
} from '../Helper';
import RedScoreBoard from './common/RedScoreBar';
import FavTournament from './common/FavTournament';
import BottomParagrah from './common/BottomParagrah';

class HomepageOLD extends Component {
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
            lazyLoadCount: getQueryStringFromUrl('load') || 10
        };
        this.updateParentState = this.updateParentState.bind(this);
        this.initGetData = this.initGetData.bind(this);
        this.onSocketReturnUpdatesData = this.onSocketReturnUpdatesData.bind(this);
        this.onSocketReturnPushServiceData = this.onSocketReturnPushServiceData.bind(this);
        this.handleGetData = this.handleGetData.bind(this);
        this.onSocketConnect = this.onSocketConnect.bind(this);
        this.onSocketDisconnect = this.onSocketDisconnect.bind(this);
        const { socket } = this.props;
        this.socket = socket;
    }

    componentDidMount() {
        const { match, location } = this.props;
        this.isPushServiceEnabled = true;
        if (match.params.date) {
            this.todaysDate = match.params.date;
        } else {
            // this.todaysDate = moment().subtract('1', "hours").format('YYYY-MM-DD');
            this.todaysDate = moment().format('YYYY-MM-DD');
            // this.analyzeSessionStorage();
            this.getFromLocaleStorage();
        }
        this.initGetDataOnPageLoad(false);
        this.once = true;
        this.redScoreBarTimer = null;
        const page = location.pathname;
        trackPage(page);
        this.initSocket();
    }

    componentWillUnmount() {
        this.removeSocketEvents();
        clearTimeout(this.redScoreBarTimer);
    }

    onSocketReturnPushServiceData(res) {
        const { mainData } = this.state;
        if (!res) return false;
        if (!mainData) return false;

        let redScoreBarType = null;
        let redScoreBarIncident = {};

        const newMainData = JSON.parse(JSON.stringify(mainData));
        if (newMainData.length < 1) return false;
        // console.log(res);

        // let resEventId = res.emits[3].split('_')[1];
        const getTournament = newMainData.filter(x => x.tournament.id === res.tournament.id)[0];
        if (!getTournament) return false;

        const event = getTournament.events.filter(x => x.id === res.event.id)[0];
        if (!event) return false;

        if (res.updated.status && event.status.code !== res.event.status.code) {
            event.status = res.event.status;
            event.scores = res.event.scores;
            event.scores = res.event.scores;
            redScoreBarType = 'status_update';
        }

        if (res.event.redCards.home > event.redCards.home && res.event.redCards.home) {
            event.redCards.home = res.redCards.home; // home Team Red Card
            redScoreBarType = 'home_redcard';
        }
        if (res.event.redCards.away && res.event.redCards.away > event.redCards.away) {
            event.redCards.away = res.event.redCards.away; // home Team Red Card
            redScoreBarType = 'away_redcard';
        }

        if (res.updated.score) {
            if (res.updated.scores.home) {
                const oldScore = event.scores.home || 0;
                const newScore = res.event.scores.home;

                if (typeof newScore === 'number' && typeof newScore === 'number' && newScore !== oldScore) {
                    if (newScore > oldScore) {
                        // console.log(`${event.teams.home.name} Home Team Scored. ${oldScore} -> ${newScore}`);
                        redScoreBarType = 'home_scored';
                    } else if (newScore < oldScore) {
                        // console.log(`${event.teams.away.name} Home Team Score Cancelled. ${oldScore} -> ${newScore}`);
                        redScoreBarType = 'home_scored_cancel';
                    }
                    event.scores = res.event.scores; // update score Object
                }
            } else if (res.updated.scores.scoawayre) {
                const oldScore = event.scores.away || 0;
                const newScore = res.event.scores.away;

                if (typeof newScore === 'number' && typeof newScore === 'number' && newScore !== oldScore) {
                    if (newScore > oldScore) {
                        // console.log(`${event.teams.away.name} Away Team Scored. ${oldScore} -> ${newScore}`);
                        redScoreBarType = 'away_scored';
                    } else if (newScore < oldScore) {
                        // console.log(`${event.teams.away.name} Away Team Score Cancelled. ${oldScore} -> ${newScore}`);
                        redScoreBarType = 'away_scored_cancel';
                    }
                    event.scores = res.event.scores; // update score Object
                }
            }
        }

        // update statusDescription in all situations
        event.statusBoxContent = res.event.statusBoxContent;
        event.startTimestamp = res.event.startTimestamp;
        event.winner = res.event.winner;

        const { redScoreFavOnly, favEvents } = this.state;
        if (redScoreFavOnly && favEvents.length > 0 && favEvents.indexOf(event.id) < 0) {
            redScoreBarType = null;
        }

        if (redScoreBarType) {
            redScoreBarIncident = {
                type: redScoreBarType,
                event
            };
            clearTimeout(this.redScoreBarTimer);
            this.redScoreBarTimer = setTimeout(() => {
                this.setState({
                    redScoreBarIncident: null
                });
            }, 15000);
        }

        const { redScoreBarIncident: isRedScoreBarIncident } = this.state;
        if (isRedScoreBarIncident && redScoreBarType) {
            this.setState(
                {
                    redScoreBarIncident: null
                },
                () => {
                    this.setState({
                        mainData: newMainData,
                        redScoreBarIncident
                    });
                }
            );
        } else {
            this.setState({
                mainData: newMainData,
                ...(redScoreBarType && { redScoreBarIncident })
            });
        }

        if (favEvents.length > 0) this.moveFavEventsToTop();
        return false;
    }

    onSocketReturnUpdatesData(res) {
        this.initGetUpdatesHomepage();
        const { mainData } = this.state;
        if (res && res.params && mainData[0].currentDate === res.params.date) {
            this.handleGetData(res, true);
        } else {
            return false;
        }
        return false;
    }

    onSocketDisconnect() {
        this.removeSocketEvents();
        this.socket.on('connect', this.onSocketConnect);
        this.setState({
            refreshButton: true
        });
    }

    onSocketConnect() {
        console.log('Socket connected! - HomepageOLD');
        this.socket.removeListener('connect', this.onSocketConnect);
        const { refreshButton } = this.state;
        if (refreshButton) {
            this.setState(
                {
                    refreshButton: false
                },
                () => {
                    this.initSocket(true);
                    this.initGetDataOnPageLoad(true);
                }
            );
        }
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
        const { filteredTournaments, isLive, favEvents, redScoreMuted, redScoreShrinked, redScoreFavOnly } = this.state;
        const stateToStore = {
            ...(filteredTournaments.length > 0 && { filteredTournaments }),
            ...(isLive && { isLive }),
            ...(favEvents.length > 0 && { favEvents }),
            redScoreMuted,
            redScoreShrinked,
            redScoreFavOnly
        };
        localStorage.setItem('ultraskor_homepage', JSON.stringify(stateToStore));
    }

    initSocket(noInterval = false) {
        // socket.on('return-updates-homepage-2', this.onSocketReturnUpdatesData2);
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

    removeSocketEvents() {
        const { socket } = this.props;
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

    updateStateGetData(res, isUpdated) {
        // console.log(res);
        this.setState({
            mainData: res,
            ...(!isUpdated && { loading: false }),
            ...(!isUpdated && { refreshButton: false })
        });
    }

    handleGetData(res, isUpdated) {
        if (!isUpdated) {
            setTimeout(() => {
                document.body.classList.add('initial-load');
            }, 0);
        }
        res = prepareRes(res);
        const { favEvents } = this.state;
        if (favEvents.length > 0) this.moveFavEventsToTop(res);
        this.updateStateGetData(res, isUpdated);
        if (!isUpdated) this.updateMeta();
    }

    initGetData(options) {
        if (!options.isUpdated) {
            this.setState({ loading: true });
            document.body.classList.remove('initial-load');
        }
        fetch(options.api, {
            headers: {
                Authorization:
                    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJVbHRyYVNrb3IgQVBJIEFVVEgiLCJpYXQiOjE1Njk4MDA0ODEsImV4cCI6MTYwMTMzNjQ4MSwiYXVkIjoidWx0cmFza29yLmNvbSIsInN1YiI6ImNvbnRhY3RAdWx0cmFza29yLmNvbSJ9.2BO51xRBwQ2YCoqQRjUjvImQru35VgSzUW9vpKoo82A'
            }
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                throw Error(`Can't retrieve information from server, ${res.status}`);
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
                    mainData: { error: err.toString() },
                    loading: false
                });
            });
    }

    moveFavEventsToTop(res) {
        const { favEvents, mainData } = this.state;
        res = res || mainData;
        const favEventsList = [];
        res.forEach(tournament => {
            tournament.events.forEach(event => {
                if (favEvents.length > 0 && favEvents.indexOf(event.id) > -1) {
                    favEventsList.push(event);
                }
            });
        });
        this.setState({
            favEventsList
        });
    }

    updateParentState(state, isSetToLocalStorage = false) {
        this.setState(state, () => {
            if (isSetToLocalStorage) this.setToLocaleStorage();
        });
    }

    initGetDataOnPageLoad(isUpdated) {
        this.initGetData({
            api: `/api/homepage/list/${this.todaysDate}`,
            loading: true,
            today: moment(0, 'HH').diff(this.todaysDate, 'days') === 0 ? 1 : 0,
            page: 'homepage',
            isUpdated
        });
    }

    initGetUpdatesHomepage(noInterval = false) {
        this.getUpdatesHomepageInterval = setTimeout(
            () => {
                // init after 10 seconds
                this.socket.emit('get-updates-homepage');
            },
            noInterval ? 100 : 10000
        );
    }

    updateMeta() {
        const { match } = this.props;
        const { date } = match.params || null;

        if (i18n.language === 'en') {
            const title = date
                ? `UltraSkor - Results & Matches on ${moment(date, 'YYYY-MM-DD').format(
                      'dddd, MMMM DD, YYYY'
                  )}. See all Scores, Results, Stats and Match Highlights`
                : 'Live Score, Match Results and League Fixtures - UltraSkor | (No Ads) ';

            const description = date
                ? `No Ads. Get the football coverages for the matches on ${moment(date, 'YYYY-MM-DD').format(
                      'dddd, MMMM DD, YYYY'
                  )}. See results, league standings and watch highlights`
                : 'No Ads. Get the live football scores update, see football match results, match fixtures and match highlights from all around the world';

            const keywords = date
                ? `${moment(date, 'YYYY-MM-DD')
                      .format('dddd')
                      .toLowerCase()} matches, ${moment(date, 'YYYY-MM-DD')
                      .format('DD MMMM dddd')
                      .toLowerCase()} maç results, `
                : '';

            HelperUpdateMeta({
                title,
                canonical: window.location.href,
                description,
                keywords: `${keywords}live scores, live football results, match results, football fixtures, eufa champions league results, highlights`,
                alternate: date ? HelperTranslateUrlTo('tr') : 'https://www.ultraskor.com',
                hrefLang: 'tr'
            });
        } else if (i18n.language === 'tr') {
            const title = date
                ? `UltraSkor - ${moment(date, 'YYYY-MM-DD').format(
                      'DD MMMM dddd'
                  )} Günü Oynanan Tüm Maçlar burada. Sonuçlar, İstatistikler ve Maç Özetleri için tıklayın.`
                : 'Canlı Skor, Canlı Maç Sonuçları, İddaa Sonuçları - UltraSkor | (Reklamsız)';

            const description = date
                ? `Tamamen reklamsız olarak, ${moment(date, 'YYYY-MM-DD').format(
                      'DD MMMM dddd'
                  )} günü oynanmış tüm maçların sonuçlarını, lig puan durumlarını ve fikstürlerini takip edebilir, maç özetlerini izleyebilirsiniz.`
                : 'Reklamsız olarak canli maç skorlarını takip edebilir, biten maçların sonuçlarını, istatistiklerini görebilir, iddaa bültenlerini ve biten iddaa maç sonuçlarını görebilirsiniz.';

            const keywords = date
                ? `${moment(date, 'YYYY-MM-DD')
                      .format('dddd')
                      .toLowerCase()} maçları, ${moment(date, 'YYYY-MM-DD')
                      .format('DD MMMM dddd')
                      .toLowerCase()} maç sonucları, `
                : '';

            HelperUpdateMeta({
                title,
                canonical: window.location.href,
                description,
                keywords: `${keywords}canlı skor, mac sonuclari, ultraskor, sonuclar, iddaa sonuclari, maç özetleri`,
                alternate: date ? HelperTranslateUrlTo('en') : 'https://www.ultraskor.com/en',
                hrefLang: 'en'
            });
        }
    }

    render() {
        const {
            mainData,
            isLive,
            filteredTournaments,
            favEventsList,
            loading,
            favEvents,
            isLazyLoad,
            lazyLoadCount,
            refreshButton,
            redScoreBarIncident,
            redScoreMuted,
            redScoreShrinked
        } = this.state;
        if (!mainData) return <Loading />;
        if (mainData.error) return <Errors key={1} type="error" message={mainData.error} />;

        const { t, match, socket, audioFiles } = this.props;
        return (
            <>
                <Headertabs
                    isLive={isLive}
                    filteredTournaments={filteredTournaments}
                    updateParentState={this.updateParentState}
                    initGetData={this.initGetData}
                    mainData={mainData}
                    todaysDateByUrl={match.params.date}
                />

                {loading ? <Loading /> : null}
                <section className="container px-0 homepage-list">
                    {favEventsList.length > 0 ? (
                        <FavTournament
                            isLive={isLive}
                            socket={socket}
                            updateParentState={this.updateParentState}
                            favEvents={favEvents}
                            favEventsList={favEventsList}
                        />
                    ) : (
                        ''
                    )}

                    {mainData.length > 0 ? (
                        <Tournament
                            isLive={isLive}
                            filteredTournaments={filteredTournaments}
                            socket={socket}
                            tournaments={mainData}
                            updateParentState={this.updateParentState}
                            favEvents={favEvents}
                            favEventsList={favEventsList}
                            isLazyLoad={isLazyLoad}
                            lazyLoadCount={lazyLoadCount}
                        />
                    ) : (
                        <Errors key={1} type="no-matched-game" />
                    )}
                </section>
                <section className="container date-prev-next-container">
                    <div className="row date-prev-next align-items-center">
                        <div className="col col-yesterday">
                            <a
                                href={`/${i18n.language === 'en' ? 'en/' : ''}${t('matches')}/${t('date')}-${moment()
                                    .subtract(1, 'd')
                                    .format('YYYY-MM-DD')}`}
                                title={`${moment()
                                    .subtract(1, 'd')
                                    .format('LL')} ${t('Football Results')}`}
                            >
                                <Icon name="fas fa-chevron-left" />
                                <Trans>Yesterday</Trans>
                            </a>
                        </div>
                        <div className="col text-center col-today">
                            <a href={i18n.language === 'en' ? '/en/' : '/'} title={t("Today's football matches")}>
                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                <Trans>Today's Matches</Trans>
                            </a>
                        </div>
                        <div className="col text-right col-tomorrow">
                            <a
                                href={`/${i18n.language === 'en' ? 'en/' : ''}${t('matches')}/${t('date')}-${moment()
                                    .add(1, 'd')
                                    .format('YYYY-MM-DD')}`}
                                title={`${moment()
                                    .add(1, 'd')
                                    .format('LL')} ${t('Football Results')}`}
                            >
                                <Trans>Tomorrow</Trans>
                                <Icon name="fas fa-chevron-right" />
                            </a>
                        </div>
                    </div>
                </section>
                <BottomParagrah page="homepage" />
                {refreshButton ? <RefreshButton /> : ''}
                {redScoreBarIncident ? (
                    <RedScoreBoard
                        redScoreBarIncident={redScoreBarIncident}
                        audioFiles={audioFiles}
                        redScoreMuted={redScoreMuted}
                        redScoreShrinked={redScoreShrinked}
                        updateParentState={this.updateParentState}
                    />
                ) : (
                    ''
                )}
                <Footer />
            </>
        );
    }
}

export default withTranslation('translations')(HomepageOLD);

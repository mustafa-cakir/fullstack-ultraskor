import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import moment from 'moment';
import update from 'immutability-helper';
import axios from 'axios';
import { Trans, withTranslation } from 'react-i18next';
import {
    getQueryStringFromUrl,
    HelperTranslateUrlTo,
    HelperUpdateMeta,
    prepareRes,
    restoreScrollY,
    trackPage
} from '../../core/utils/helper';
import { audioFiles, getFromLocalStorage, scrollTopOnClick, setToLocaleStorage } from '../../core/utils';
import Loading from '../common/Loading';
import FavTournament from '../common/FavTournament';
import Tournament from '../common/Tournament';
import Errors from '../common/Errors';
import RefreshButton from '../common/RefreshButton';
import RedScoreBoard from '../common/RedScoreBar';
import Headertabs from '../Headertabs';
import Footer from '../common/Footer';
import BottomParagrah from '../common/BottomParagrah';
import Icon from '../common/Icon';

let redScoreBarTimer = null;

const Homepage = ({ t, i18n, socket }) => {
    const stateFromLocalStorage = getFromLocalStorage('homepage');
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        mainData: [],
        isLoading: true,
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
        lazyLoadCount: getQueryStringFromUrl('load') || 10,
        ...(stateFromLocalStorage && { ...stateFromLocalStorage })
    });
    const {
        mainData,
        isLoading,
        favEvents,
        favEventsList,
        refreshButton,
        filteredTournaments,
        isLive,
        redScoreMuted,
        redScoreShrinked,
        redScoreFavOnly,
        redScoreBarIncident,
        isLazyLoad,
        lazyLoadCount
    } = state;
    const refMainData = useRef(mainData);
    const { language } = i18n;
    const { date } = useParams();
    const location = useLocation();
    const { pathname: page } = location;
    const currentDate = date || moment().format('YYYY-MM-DD');
    const isToday = moment(currentDate, 'YYYY-MM-DD').isSame(moment(), 'day');

    const updateMeta = () => {
        if (language === 'en') {
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
                      .toLowerCase()} match results, `
                : '';

            HelperUpdateMeta({
                title,
                canonical: window.location.href,
                description,
                keywords: `${keywords}live scores, live football results, match results, football fixtures, eufa champions league results, highlights`,
                alternate: date ? HelperTranslateUrlTo('tr') : 'https://www.ultraskor.com',
                hrefLang: 'tr'
            });
        } else {
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
    };

    const handleGetData = res => {
        const tournaments = prepareRes(res.data);
        setState({
            mainData: tournaments,
            refreshButton: false,
            isLoading: false
        });
        refMainData.current = tournaments;
        updateMeta();
    };

    const initAxios = () => {
        setState({ isLoading: true });
        axios
            .get(`/api/homepage/list/${currentDate}`)
            .then(res => {
                handleGetData(res);
                setTimeout(() => {
                    document.body.classList.add('initial-load');
                });
                restoreScrollY();
            })
            .catch(err => {
                console.log(err);
                setState({
                    isLoading: false,
                    error: 'something went wrong'
                });
            });
    };

    const initGetData = useCallback(() => {
        if (document.body.classList.contains('initial-load')) {
            document.body.classList.remove('initial-load');
            setTimeout(() => {
                initAxios();
            }, 600);
        } else {
            initAxios();
        }
    }, [currentDate]);

    const initRedScoreBar = (oldEvent, newEvent) => {
        if (redScoreFavOnly && favEvents.length > 0 && favEvents.indexOf(newEvent.id) < 0) return false;
        let redScoreBarType = null;
        if (newEvent.status.code !== oldEvent.status.code) {
            redScoreBarType = 'status_update';
        }
        if (newEvent.redCards.home > oldEvent.redCards.home) {
            redScoreBarType = 'home_redcard';
        }
        if (newEvent.redCards.away > oldEvent.redCards.away) {
            redScoreBarType = 'away_redcard';
        }
        if (newEvent.scores.home > oldEvent.scores.home) {
            redScoreBarType = 'home_scored';
        }
        if (newEvent.scores.home < oldEvent.scores.home) {
            redScoreBarType = 'home_scored_cancel';
        }
        if (newEvent.scores.away > oldEvent.scores.away) {
            redScoreBarType = 'away_scored';
        }
        if (newEvent.scores.away < oldEvent.scores.away) {
            redScoreBarType = 'away_scored_cancel';
        }

        if (redScoreBarType) {
            setState({
                redScoreBarIncident: {
                    type: redScoreBarType,
                    event: newEvent
                }
            });

            clearTimeout(redScoreBarTimer);
            redScoreBarTimer = setTimeout(() => {
                setState({
                    redScoreBarIncident: null
                });
            }, 15000);
        }

        return false;
    };

    const onSocketReturnPushServiceData = res => {
        if (!res) return false;
        if (refMainData.current.length === 0) return false;
        const { tournament, event } = res.ids;

        const tournamentIndex = refMainData.current.findIndex(x => x.tournament.id === tournament);
        if (tournamentIndex < 0) return false;

        const eventIndex = refMainData.current[tournamentIndex].events.findIndex(x => x.id === event);
        if (eventIndex < 0) return false;

        const oldEvent = refMainData.current[tournamentIndex].events[eventIndex];
        const newEvent = { ...oldEvent, ...res.event };
        const newMainData = update(refMainData.current, {
            [tournamentIndex]: { events: { [eventIndex]: { $set: newEvent } } }
        });
        refMainData.current = newMainData;
        setState({
            mainData: newMainData
        });
        initRedScoreBar(oldEvent, newEvent);
        return false;
    };

    const onSocketConnect = () => {
        console.log('Socket connected! - Homepage');
        socket.emit('get-updates-homepage');
        setState({
            refreshButton: false
        });
    };

    const onSocketDisconnect = () => {
        socket.on('connect', onSocketConnect);
        setState({
            refreshButton: true
        });
    };

    const initSocket = useCallback(() => {
        socket.on('disconnect', onSocketDisconnect);
        socket.on('return-updates-homepage', handleGetData);
        socket.on('push-service', onSocketReturnPushServiceData);
    }, []);

    const removeSocket = useCallback(() => {
        socket.removeListener('connect', onSocketConnect);
        socket.removeListener('disconnect', onSocketDisconnect);
        socket.removeListener('return-updates-homepage', handleGetData);
        socket.removeListener('push-service', onSocketReturnPushServiceData);
    }, []);

    useEffect(() => {
        refMainData.current = mainData;
    }, [mainData]);

    useEffect(() => {
        initGetData();
        trackPage(page);
        if (isToday) initSocket();
        return () => {
            if (isToday) removeSocket();
            clearTimeout(redScoreBarTimer);
        };
    }, [initGetData, trackPage, page, initSocket, removeSocket, isToday]);

    useEffect(() => {
        setToLocaleStorage('homepage', {
            favEvents,
            favEventsList,
            filteredTournaments,
            isLive,
            redScoreMuted,
            redScoreShrinked,
            redScoreFavOnly
        });
    }, [favEvents, favEventsList, filteredTournaments, isLive, redScoreMuted, redScoreShrinked, redScoreFavOnly]);

    return (
        <>
            <Headertabs
                isLive={isLive}
                filteredTournaments={filteredTournaments}
                setParentState={setState}
                mainData={mainData}
                currentDate={currentDate}
                isToday={isToday}
            />
            {isLoading ? (
                <div className="homepage-loading">
                    <Loading type="inside" />
                </div>
            ) : (
                <section className="container px-0 homepage-list">
                    {favEventsList.length > 0 && (
                        <FavTournament
                            isLive={isLive}
                            socket={socket}
                            updateParentState={setState}
                            favEvents={favEvents}
                            favEventsList={favEventsList}
                        />
                    )}

                    {mainData.length > 0 ? (
                        <Tournament
                            isLive={isLive}
                            filteredTournaments={filteredTournaments}
                            socket={socket}
                            tournaments={mainData}
                            updateParentState={setState}
                            favEvents={favEvents}
                            favEventsList={favEventsList}
                            isLazyLoad={isLazyLoad}
                            lazyLoadCount={lazyLoadCount}
                        />
                    ) : (
                        <Errors type="no-matched-game" />
                    )}
                </section>
            )}
            <section className="container date-prev-next-container">
                <div className="row date-prev-next align-items-center">
                    <div className="col col-yesterday">
                        <Link
                            onClick={scrollTopOnClick}
                            to={`/${language === 'en' ? 'en/' : ''}${t('matches')}/${t('date')}-${moment()
                                .subtract(1, 'd')
                                .format('YYYY-MM-DD')}`}
                            title={`${moment()
                                .subtract(1, 'd')
                                .format('LL')} ${t('Football Results')}`}
                        >
                            <Icon name="fas fa-chevron-left" />
                            <Trans>Yesterday</Trans>
                        </Link>
                    </div>
                    <div className="col text-center col-today">
                        <Link
                            to={language === 'en' ? '/en/' : '/'}
                            onClick={scrollTopOnClick}
                            title={t("Today's football matches")}
                        >
                            <Trans>Today's Matches</Trans>
                        </Link>
                    </div>
                    <div className="col text-right col-tomorrow">
                        <Link
                            onClick={scrollTopOnClick}
                            to={`/${language === 'en' ? 'en/' : ''}${t('matches')}/${t('date')}-${moment()
                                .add(1, 'd')
                                .format('YYYY-MM-DD')}`}
                            title={`${moment()
                                .add(1, 'd')
                                .format('LL')} ${t('Football Results')}`}
                        >
                            <Trans>Tomorrow</Trans>
                            <Icon name="fas fa-chevron-right" />
                        </Link>
                    </div>
                </div>
            </section>
            <BottomParagrah page="homepage" />
            {refreshButton && <RefreshButton />}

            {redScoreBarIncident && (
                <RedScoreBoard
                    redScoreBarIncident={redScoreBarIncident}
                    audioFiles={audioFiles}
                    redScoreMuted={redScoreMuted}
                    redScoreShrinked={redScoreShrinked}
                    updateParentState={setState}
                />
            )}
            <Footer />
        </>
    );
};

export default withTranslation('translations')(Homepage);

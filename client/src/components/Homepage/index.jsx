import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import moment from 'moment';
import update from 'immutability-helper';
import axios from 'axios';
import { Trans, useTranslation } from 'react-i18next';
import { getQueryStringFromUrl, prepareHomepageData, restoreScrollY } from '../../core/utils/helper';
import { audioFiles, getFromLocalStorage, scrollTopOnClick, setToLocaleStorage } from '../../core/utils';
import Loading from '../common/Loading';
import Tournament from '../common/Tournament';
import Errors from '../common/Errors';
import RefreshButton from '../common/RefreshButton';
import RedScoreBoard from '../common/RedScoreBar';
import Headertabs from '../Headertabs';
import Footer from '../common/Footer';
import BottomParagrah from '../common/BottomParagrah';
import Icon from '../common/Icon';
import UpdateMetaHomepage from '../../core/utils/updatemeta/homepage';
import FavTournament from '../common/FavTournament';
import ScrollToTop from '../common/ScrollToTop';

let miniTimer;

const Homepage = () => {
    const [t, i18n] = useTranslation();
    const stateFromLocalStorage = getFromLocalStorage('homepage');
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        mainData: [],
        isLoading: true,
        favEvents: [],
        isFav: false,
        refreshButton: false,
        filteredTournaments: [],
        isLive: false,
        redScoreMuted: false,
        redScoreShrinked: false,
        redScoreFavOnly: false,
        redScoreBarIncident: null,
        isLazyLoad: !/bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(navigator.userAgent),
        lazyLoadCount: getQueryStringFromUrl('load') || 10,
        ...(stateFromLocalStorage && { ...stateFromLocalStorage }),
    });
    const {
        mainData,
        isLoading,
        favEvents,
        isFav,
        refreshButton,
        filteredTournaments,
        isLive,
        redScoreMuted,
        redScoreShrinked,
        redScoreFavOnly,
        redScoreBarIncident,
        isLazyLoad,
        lazyLoadCount,
    } = state;
    const refMainData = useRef(mainData);
    const { language } = i18n;
    const { date } = useParams();
    const location = useLocation();
    const { pathname: page } = location;
    const currentDate = date || moment().subtract(2, 'hours').format('YYYY-MM-DD');
    const isToday = moment(currentDate, 'YYYY-MM-DD').isSame(moment(), 'day');

    const getMini = useCallback(() => {
        axios
            .get(`/api/get/${language}/event_getmini/1`)
            .then((res) => {
                console.log(res.data);
                if (res.data && res.data.length) {
                    res.data.forEach((item) => {
                        const { match = {}, type } = item;
                        const { _utid, _id, result: newResult = {} } = match;
                        if (!_utid || !_id) return false;

                        const tournamentIndex = refMainData.current.findIndex((x) => x._utid === _utid);
                        if (tournamentIndex < 0) return false;

                        const matchIndex = refMainData.current[tournamentIndex].matches.findIndex((x) => x._id === _id);
                        if (matchIndex < 0) return false;

                        const getMatch = refMainData.current[tournamentIndex].matches[matchIndex];
                        const { status = {}, teams = {}, result: oldResult = {} } = getMatch;
                        const { _id: statusId, text: statusText } = status;

                        const { home: oldResultHome, away: oldResultAway, winner: oldWinner } = oldResult;
                        const { home: newResultHome, away: newResultAway, winner: newWinner } = newResult;

                        if (
                            type === 'goal' &&
                            (oldResultHome !== newResultHome ||
                                oldResultAway !== newResultAway ||
                                oldWinner !== newWinner)
                        ) {
                            console.log(
                                `### GOAL!: ${teams.home.name} ${oldResultHome} - ${oldResultAway} ${teams.away.name} | ${status.text}  | NewResult: ${newResultHome} - ${newResultAway}`
                            );
                            const newMainData = update(refMainData.current, {
                                [tournamentIndex]: {
                                    matches: {
                                        [matchIndex]: {
                                            result: {
                                                $set: newResult,
                                            },
                                        },
                                    },
                                },
                            });
                            refMainData.current = newMainData;
                            setState({
                                mainData: newMainData,
                            });
                        } else if (type === 'match_started' && statusId !== 6) {
                            const newMainData = update(refMainData.current, {
                                [tournamentIndex]: {
                                    matches: {
                                        [matchIndex]: {
                                            status: {
                                                $set: {
                                                    name: '1. Half',
                                                    text: '1',
                                                    _doc: 'status',
                                                    _id: 6,
                                                },
                                            },
                                            result: { $set: newResult },
                                        },
                                    },
                                },
                            });
                            refMainData.current = newMainData;
                            setState({
                                mainData: newMainData,
                            });
                            console.log(
                                `## MatchStarted!! ${teams.home.name} ${newResultHome} - ${newResultAway} ${teams.away.name} | OldStatusText: ${statusText} | OldStatusID: ${statusId} | NewStatusText: 1 | OldStatusID: 6 | Type: ${type}`
                            );
                        } else if (type === 'match_ended' && statusId !== 100) {
                            const newMainData = update(refMainData.current, {
                                [tournamentIndex]: {
                                    matches: {
                                        [matchIndex]: {
                                            status: {
                                                $set: {
                                                    name: 'Full Time',
                                                    text: 'FT',
                                                    _doc: 'status',
                                                    _id: 100,
                                                },
                                            },
                                            result: { $set: newResult },
                                        },
                                    },
                                },
                            });
                            refMainData.current = newMainData;
                            setState({
                                mainData: newMainData,
                            });
                            console.log(
                                `## MatchEnded!! ${teams.home.name} ${newResultHome} - ${newResultAway} ${teams.away.name} | OldStatusText: ${statusText} | OldStatusID: ${statusId} | NewStatusText: FT | OldStatusID: 100 |  Type: ${type}`
                            );
                        } else if (type === 'periodscore' && statusId !== 31) {
                            const newMainData = update(refMainData.current, {
                                [tournamentIndex]: {
                                    matches: {
                                        [matchIndex]: {
                                            status: {
                                                $set: {
                                                    name: 'Half Time',
                                                    text: 'HT',
                                                    _doc: 'status',
                                                    _id: 31,
                                                },
                                            },
                                            result: { $set: newResult },
                                        },
                                    },
                                },
                            });
                            refMainData.current = newMainData;
                            setState({
                                mainData: newMainData,
                            });
                            console.log(
                                `## HalfTime!! ${teams.home.name} ${newResultHome} - ${newResultAway} ${teams.away.name} | OldStatusText: ${statusText} | OldStatusID: ${statusId} | NewStatusText: HT | OldStatusID: 31 | Type: ${type}`
                            );
                        }
                    });
                }

                miniTimer = setTimeout(() => {
                    getMini();
                }, 5000);
            })
            .catch((err) => {
                console.log(err);
                setState({
                    isLoading: false,
                    error: 'something went wrong',
                });
            });
    }, [language]);

    const getData = useCallback(() => {
        setState({ isLoading: true });
        axios
            .get(`/api/homepage/${currentDate}/${language}`)
            .then((res) => {
                const tournaments = prepareHomepageData(res.data);
                setState({
                    mainData: tournaments,
                    refreshButton: false,
                    isLoading: false,
                });
                setTimeout(() => {
                    document.body.classList.add('initial-load');
                    restoreScrollY();
                });
                refMainData.current = tournaments;
                UpdateMetaHomepage();
                getMini();
            })
            .catch((err) => {
                console.log(err);
                setState({
                    isLoading: false,
                    error: 'something went wrong',
                });
            });
    }, [currentDate, language, getMini]);

    useEffect(() => {
        scrollTopOnClick();
        getData();
        return () => {
            clearTimeout(miniTimer);
        };
    }, [getData, page]);

    useEffect(() => {
        setToLocaleStorage('homepage', {
            favEvents,
            isFav,
            filteredTournaments,
            isLive,
            redScoreMuted,
            redScoreShrinked,
            redScoreFavOnly,
        });
    }, [favEvents, isFav, filteredTournaments, isLive, redScoreMuted, redScoreShrinked, redScoreFavOnly]);

    return (
        <>
            <Headertabs
                isLive={isLive}
                filteredTournaments={filteredTournaments}
                setParentState={setState}
                mainData={mainData}
                currentDate={currentDate}
                isToday={isToday}
                isFav={isFav}
            />
            {isLoading ? (
                <div className="homepage-loading">
                    <ScrollToTop />
                    <Loading type="inside" />
                </div>
            ) : (
                <section className="container px-0 homepage-list">
                    {favEvents.length > 0 && (
                        <FavTournament
                            isFav={isFav}
                            isLive={isLive}
                            updateParentState={setState}
                            favEvents={favEvents}
                            tournaments={mainData}
                        />
                    )}

                    {!isFav && mainData.length > 0 && (
                        <Tournament
                            page="homepage"
                            isLive={isLive}
                            filteredTournaments={filteredTournaments}
                            tournaments={mainData}
                            updateParentState={setState}
                            favEvents={favEvents}
                            isLazyLoad={isLazyLoad}
                            lazyLoadCount={lazyLoadCount}
                        />
                    )}
                    {mainData.length === 0 && <Errors type="no-matched-game" />}
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
                            title={`${moment().subtract(1, 'd').format('LL')} ${t('Football Results')}`}
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
                            title={`${moment().add(1, 'd').format('LL')} ${t('Football Results')}`}
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

export default Homepage;

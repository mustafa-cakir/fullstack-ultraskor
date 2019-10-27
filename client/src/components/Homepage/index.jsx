import React, { useCallback, useEffect, useReducer } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { withTranslation } from 'react-i18next';
// import { Trans, withTranslation } from 'react-i18next';
import { getQueryStringFromUrl, prepareRes, restoreScrollY, trackPage } from '../../Helper';
import { getFromLocalStorage, setToLocaleStorage } from '../../core/utils';
import Headertabs from '../Headertabs';
import Loading from '../common/Loading';
import FavTournament from '../common/FavTournament';
import Tournament from '../common/Tournament';
import Errors from '../common/Errors';

const Homepage = ({ t, socket }) => {
    const stateFromLocalStorage = getFromLocalStorage('homepage');
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        data: null,
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
        data,
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
    const params = useParams();
    const location = useLocation();
    const { pathname: page } = location;
    const { date } = params;
    const currentDate = date || moment().format('YYYY-MM-DD');
    let redScoreBarTimer = null;

    setTimeout(() => {
        setToLocaleStorage('homepage', state);
    }, 2000);

    const moveFavEventsToTop = res => {
        res = res || data;
        const newFavEventsList = [];
        res.forEach(tournament => {
            tournament.events.forEach(event => {
                if (newFavEventsList.length > 0 && newFavEventsList.indexOf(event.id) > -1) {
                    newFavEventsList.push(event);
                }
            });
        });
        setState({
            favEventsList: favEventsList.concat(newFavEventsList)
        });
    };

    const handleGetData = (res, isInitial) => {
        const tournaments = prepareRes(res);
        if (favEvents.length > 0) moveFavEventsToTop(tournaments);
        setState({
            data: tournaments,
            isLoading: false,
            refreshButton: false
        });
        setTimeout(() => {
            document.body.classList.add('initial-load');
        }, 0);
        // if (isInitial) updateMeta();
    };

    const initGetData = useCallback(
        isInitial => {
            if (isInitial) setState({ isLoading: true, data: null });
            axios
                .get(`/api/homepage/list/${currentDate}`)
                .then(res => {
                    handleGetData(res.data, isInitial);
                    if (isInitial) restoreScrollY();
                })
                .catch(() => {
                    setState({
                        isLoading: false,
                        error: 'something went wrong'
                    });
                });
        },
        [currentDate]
    );

    const onSocketConnect = () => {};

    const onSocketReturnPushServiceData = res => {
        if (!res) return false;
        if (!data) return false;

        let redScoreBarType = null;
        // let newRedScoreBarIncident = null;

        // const data = JSON.parse(JSON.stringify(data));
        // if (data.length < 1) return false;
        // console.log(res);

        // let resEventId = res.emits[3].split('_')[1];
        const getTournament = data.filter(x => x.tournament.id === res.tournament.id)[0];
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

        if (redScoreFavOnly && favEvents.length > 0 && favEvents.indexOf(event.id) < 0) {
            redScoreBarType = null;
        }

        if (redScoreBarType) {
            // newRedScoreBarIncident = {
            //     type: redScoreBarType,
            //     event
            // };
            clearTimeout(redScoreBarTimer);
            redScoreBarTimer = setTimeout(() => {
                setState({
                    redScoreBarIncident: null
                });
            }, 15000);
        }

        // if (newRedScoreBarIncident && redScoreBarType) {
        //     setState({
        //                 mainData: data,
        //                 redScoreBarIncident: newRedScoreBarIncident
        //             });
        // } else {
        //     setState({
        //         mainData: data,
        //         ...(redScoreBarType && { redScoreBarIncident })
        //     });
        // }

        if (favEvents.length > 0) moveFavEventsToTop();
        return false;
    };

    const initGetPushService = () => {
        socket.on('push-service', onSocketReturnPushServiceData);
    };

    const onSocketDisconnect = () => {
        socket.removeListener('connect', onSocketConnect);
        socket.removeListener('disconnect', onSocketDisconnect);
        socket.removeListener('return-error-updates', onSocketDisconnect);
        socket.removeListener('push-service', onSocketReturnPushServiceData);
        socket.on('connect', onSocketConnect);
        setState({
            refreshButton: true
        });
    };

    const initSocket = useCallback(() => {
        socket.on('disconnect', onSocketDisconnect);
        socket.on('return-error-updates', onSocketDisconnect);
        initGetPushService();
    }, []);

    useEffect(() => {
        initGetData(true);
        trackPage(page);
        initSocket();
        return () => {
            socket.removeListener('connect', onSocketConnect);
            socket.removeListener('disconnect', onSocketDisconnect);
            socket.removeListener('return-error-updates', onSocketDisconnect);
            socket.removeListener('push-service', onSocketReturnPushServiceData);
            clearTimeout(redScoreBarTimer);
        };
    }, [initSocket, trackPage, page]);

    console.log(favEventsList);
    // if (!data) return false;

    return (
        <>
            <Headertabs
                isLive={isLive}
                filteredTournaments={filteredTournaments}
                updateParentState={setState}
                initGetData={initGetData}
                mainData={data}
                todaysDateByUrl={date}
            />
            {!data || isLoading ? (
                <Loading />
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

                    {data.length > 0 ? (
                        <Tournament
                            isLive={isLive}
                            filteredTournaments={filteredTournaments}
                            socket={socket}
                            tournaments={data}
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
        </>
    );
};

export default withTranslation('translations')(Homepage);

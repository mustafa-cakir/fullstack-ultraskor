import React, { useCallback, useEffect, useReducer, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import moment from "moment";
import update from "immutability-helper";
import axios from "axios";
import { Trans, withTranslation } from "react-i18next";
import { getQueryStringFromUrl, prepareRes, restoreScrollY } from "../../core/utils/helper";
import { audioFiles, getFromLocalStorage, scrollTopOnClick, setToLocaleStorage } from "../../core/utils";
import Loading from "../common/Loading";
import Tournament from "../common/Tournament";
import Errors from "../common/Errors";
import RefreshButton from "../common/RefreshButton";
import RedScoreBoard from "../common/RedScoreBar";
import Headertabs from "../Headertabs";
import Footer from "../common/Footer";
import BottomParagrah from "../common/BottomParagrah";
import Icon from "../common/Icon";
import UpdateMetaHomepage from "../../core/utils/updatemeta/homepage";
import FavTournament from "../common/FavTournament";

let redScoreBarTimer = null;

const Homepage = ({ t, i18n, socket }) => {
    const stateFromLocalStorage = getFromLocalStorage("homepage");
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
        lazyLoadCount: getQueryStringFromUrl("load") || 10,
        ...(stateFromLocalStorage && { ...stateFromLocalStorage })
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
        lazyLoadCount
    } = state;
    const refMainData = useRef(mainData);
    const { language } = i18n;
    const { date } = useParams();
    const location = useLocation();
    const { pathname: page } = location;
    const currentDate = date || moment().format("YYYY-MM-DD");
    const isToday = moment(currentDate, "YYYY-MM-DD").isSame(moment(), "day");

    const handleGetData = useCallback(res => {
        const tournaments = prepareRes(res.data);
        setState({
            mainData: tournaments,
            refreshButton: false,
            isLoading: false
        });
        refMainData.current = tournaments;
        UpdateMetaHomepage();
    }, []);

    const initAxios = useCallback(() => {
        setState({ isLoading: true });
        axios
            .get(`/api/homepage/list/${currentDate}`)
            .then(res => {
                handleGetData(res);
                setTimeout(() => {
                    document.body.classList.add("initial-load");
                });
                restoreScrollY();
            })
            .catch(err => {
                console.log(err);
                setState({
                    isLoading: false,
                    error: "something went wrong"
                });
            });
    }, [currentDate, handleGetData]);

    const initGetData = useCallback(() => {
        if (document.body.classList.contains("initial-load")) {
            document.body.classList.remove("initial-load");
            setTimeout(() => {
                initAxios();
            }, 600);
        } else {
            initAxios();
        }
    }, [initAxios]);

    const initRedScoreBar = useCallback(
        (oldEvent, newEvent) => {
            if (redScoreFavOnly && favEvents.length > 0 && favEvents.indexOf(newEvent.id) < 0) return false;
            let redScoreBarType = null;
            if (newEvent.status.code !== oldEvent.status.code) {
                redScoreBarType = "status_update";
            }
            if (newEvent.redCards.home > oldEvent.redCards.home) {
                redScoreBarType = "home_redcard";
            }
            if (newEvent.redCards.away > oldEvent.redCards.away) {
                redScoreBarType = "away_redcard";
            }
            if (newEvent.scores.home > oldEvent.scores.home) {
                redScoreBarType = "home_scored";
            }
            if (newEvent.scores.home < oldEvent.scores.home) {
                redScoreBarType = "home_scored_cancel";
            }
            if (newEvent.scores.away > oldEvent.scores.away) {
                redScoreBarType = "away_scored";
            }
            if (newEvent.scores.away < oldEvent.scores.away) {
                redScoreBarType = "away_scored_cancel";
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
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [redScoreFavOnly]
    );

    const onSocketReturnPushServiceData = useCallback(
        res => {
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
        },
        [initRedScoreBar]
    );

    const onSocketDisconnect = useCallback(() => {
        setState({
            refreshButton: true
        });
    }, []);

    const initSocket = useCallback(() => {
        socket.on("disconnect", onSocketDisconnect);
        socket.on("push-service", onSocketReturnPushServiceData);
    }, [socket, onSocketDisconnect, onSocketReturnPushServiceData]);

    const removeSocket = useCallback(() => {
        socket.removeListener("disconnect", onSocketDisconnect);
        socket.removeListener("push-service", onSocketReturnPushServiceData);
    }, [socket, onSocketDisconnect, onSocketReturnPushServiceData]);

    useEffect(() => {
        refMainData.current = mainData;
    }, [mainData]);

    useEffect(() => {
        scrollTopOnClick();
        initGetData();
        if (isToday) initSocket();
        return () => {
            if (isToday) removeSocket();
            clearTimeout(redScoreBarTimer);
        };
    }, [initGetData, page, initSocket, removeSocket, isToday]);

    useEffect(() => {
        setToLocaleStorage("homepage", {
            favEvents,
            isFav,
            filteredTournaments,
            isLive,
            redScoreMuted,
            redScoreShrinked,
            redScoreFavOnly
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
                            socket={socket}
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
                            to={`/${language === "en" ? "en/" : ""}${t("matches")}/${t("date")}-${moment()
                                .subtract(1, "d")
                                .format("YYYY-MM-DD")}`}
                            title={`${moment()
                                .subtract(1, "d")
                                .format("LL")} ${t("Football Results")}`}
                        >
                            <Icon name="fas fa-chevron-left" />
                            <Trans>Yesterday</Trans>
                        </Link>
                    </div>
                    <div className="col text-center col-today">
                        <Link
                            to={language === "en" ? "/en/" : "/"}
                            onClick={scrollTopOnClick}
                            title={t("Today's football matches")}
                        >
                            <Trans>Today's Matches</Trans>
                        </Link>
                    </div>
                    <div className="col text-right col-tomorrow">
                        <Link
                            onClick={scrollTopOnClick}
                            to={`/${language === "en" ? "en/" : ""}${t("matches")}/${t("date")}-${moment()
                                .add(1, "d")
                                .format("YYYY-MM-DD")}`}
                            title={`${moment()
                                .add(1, "d")
                                .format("LL")} ${t("Football Results")}`}
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

export default withTranslation("translations")(Homepage);

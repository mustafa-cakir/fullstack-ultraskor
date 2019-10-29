import React, { useReducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { withTranslation } from 'react-i18next';
import { Tabs, Tab } from '@material-ui/core';
import { Swiper, Slide } from 'react-dynamic-swiper';
import 'react-dynamic-swiper/lib/styles.css';
import Errors from '../common/Errors';
import Loading from '../common/Loading';
import Summary from './Summary';
import LiveTracker from './LiveTracker';
import { appendValueToArray } from '../../core/utils/helper';
import H2h from './H2h';
import Stats from './Stats';
import Scoreboard from './Scoreboard';
import Lineups from './Lineups';
import Injuries from './Injuries';
import Standings from './Standings';
import UpdateMetaEventdetails from '../../core/utils/updatemeta/eventdetails';
import Footer from '../common/Footer';

const Eventdetails = ({ t, i18n }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        tabIndex: 0,
        clickedTabIndex: [0],
        data: null,
        error: null,
        isLoading: true,
        swiper: null
    });

    const { language } = i18n;
    const { tabIndex, clickedTabIndex, data, error, isLoading, swiper } = state;
    const params = useParams();
    const { eventid } = params;

    const getData = useCallback(() => {
        setState({
            tabIndex: 0,
            clickedTabIndex: [0],
            data: null,
            error: null,
            isLoading: true,
            swiper: null
        });
        axios
            .get(`/api/eventdetails/${eventid}/${language}`)
            .then(res => {
                setState({
                    data: res.data,
                    isLoading: false,
                    error: null
                });
                UpdateMetaEventdetails(res.data);
            })
            .catch(err => {
                setState({
                    error: err,
                    isLoading: false
                });
            });
    }, [eventid, language]);

    useEffect(() => {
        getData();
    }, [getData]);

    const updateAutoHeight = useCallback(() => {
        setTimeout(() => {
            swiper.updateAutoHeight();
        });
    }, [swiper]);

    if (error) return <Errors message={error} />;
    if (isLoading || !data) return <Loading />;

    const { event, ids, textList } = data;
    const { injuries, teams, stats, isStanding, isLineups } = event;
    const slides = [];

    const swipeByTabId = tabId => {
        const targetIndex = slides.findIndex(x => x.id === tabId);
        swiper.slideTo(targetIndex);
    };

    slides.push({
        id: 0,
        label: t('Summary'),
        Component: Summary,
        props: {
            data,
            swipeByTabId
        }
    });

    if (ids.id_sp)
        slides.push({
            id: 1,
            label: t('Live Tracker'),
            Component: LiveTracker,
            props: {
                id: ids.id_sp
            }
        });

    if (stats)
        slides.push({
            id: 2,
            label: t('Stats'),
            Component: Stats,
            props: {
                stats
            }
        });

    if (isLineups)
        slides.push({
            id: 3,
            label: t('Lineup'),
            Component: Lineups,
            props: {
                id: event.id,
                teams,
                updateAutoHeight
            }
        });

    if (injuries)
        slides.push({
            id: 4,
            label: t('Injuries & Susp.'),
            Component: Injuries,
            props: {
                teams,
                injuries
            }
        });

    if (isStanding)
        slides.push({
            id: 5,
            label: t('Standing'),
            Component: Standings,
            props: {
                event,
                updateAutoHeight
            }
        });

    if (teams)
        slides.push({
            id: 6,
            label: t('Head To Head'),
            Component: H2h,
            props: {
                id: event.id,
                teams,
                textList,
                updateAutoHeight
            }
        });

    const handleTabChange = (e, value) => {
        if (swiper) swiper.slideTo(value);
        setState({
            tabIndex: value,
            clickedTabIndex: appendValueToArray(clickedTabIndex, slides[value] ? slides[value].id : 0)
        });
    };

    const onInitSwiper = swiperInstance => {
        setState({
            swiper: swiperInstance
        });
        swiperInstance.on('slideChange', () => {
            setState({
                tabIndex: swiperInstance.activeIndex,
                clickedTabIndex: appendValueToArray(
                    clickedTabIndex,
                    slides[swiperInstance.activeIndex] ? slides[swiperInstance.activeIndex].id : 0
                )
            });
        });
    };

    return (
        <div className="event-details">
            <Scoreboard event={event} />
            <div className="middle-tabs">
                <div className="container">
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        variant="scrollable"
                        indicatorColor="secondary"
                        textColor="secondary"
                    >
                        {slides.map(({ label }) => (
                            <Tab label={label} key={label} />
                        ))}
                    </Tabs>
                </div>
            </div>
            <Swiper
                swiperOptions={{
                    slidesPerView: 1,
                    autoHeight: true
                }}
                navigation={false}
                pagination={false}
                onInitSwiper={onInitSwiper}
            >
                {slides.map(({ label, Component, props, id }) => {
                    return (
                        <Slide key={label}>
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <Component hasActived={clickedTabIndex.indexOf(id) > -1} {...props} />
                        </Slide>
                    );
                })}
            </Swiper>
            <Footer />
        </div>
    );
};

export default withTranslation('translations')(Eventdetails);

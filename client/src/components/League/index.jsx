import React, { useEffect, useReducer } from 'react';
import { Swiper, Slide } from 'react-dynamic-swiper';
import axios from 'axios';
import { Tabs, Tab } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Fixture from './Fixture';
import TeamOfTheWeek from './TeamOfTheWeek';
import Loading from '../common/Loading';
import Errors from '../common/Errors';
import StandingTable from '../common/StandingTable';
import './Style.scss';
import UpdateMetaLeague from '../../core/utils/updatemeta/league';
import Footer from '../common/Footer';

const Leageue = ({ t }) => {
    const { leagueid, seasonid } = useParams();
    // let { activeTab } = useParams();
    // activeTab = activeTab ? parseFloat(activeTab) : 0;

    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        tabIndex: 0,
        clickedTabIndex: [0],
        data: {},
        error: null,
        isLoading: true,
        swiper: null
    });
    const { tabIndex, clickedTabIndex, data, error, isLoading, swiper } = state;

    useEffect(() => {
        axios
            .get(`/api/u-tournament/${leagueid}/${seasonid}`)
            .then(res => {
                setState({
                    data: res.data,
                    isLoading: false,
                    error: null
                });
                UpdateMetaLeague(res.data, t);
            })
            .catch(err => {
                setState({
                    error: err,
                    isLoading: false
                });
            });
    }, [leagueid, seasonid, t]);

    const onInitSwiper = swiperInstance => {
        setState({
            swiper: swiperInstance
        });
        swiperInstance.on('slideChange', () => {
            setState({
                tabIndex: swiperInstance.activeIndex
            });
        });
    };

    const handleTabChange = (e, value) => {
        if (swiper) swiper.slideTo(value);
        setState({
            tabIndex: value
        });
    };

    if (isLoading) return <Loading />;
    if (error) return <Errors message={error} />;

    const slides = [];
    const { standingsTables, tournamentInfo, events } = data;
    const { roundMatches, rounds } = events;

    if (standingsTables && standingsTables.length > 0)
        slides.push({
            id: 1,
            label: t('LANG_Standing'),
            Component: StandingTable,
            props: {
                standingsTables
            }
        });

    slides.push({
        id: 0,
        label: t('Fixture'),
        Component: Fixture,
        props: {
            roundMatches,
            rounds,
            leagueid,
            seasonid
        }
    });

    if (tournamentInfo && tournamentInfo.teamOfTheWeek)
        slides.push({
            id: 2,
            label: t('Team Of The Week'),
            Component: TeamOfTheWeek,
            props: {
                teamOfTheWeek: tournamentInfo.teamOfTheWeek
            }
        });

    return (
        <div className="page-league">
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

export default withTranslation('translations')(Leageue);

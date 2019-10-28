import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import { withTranslation, Trans } from 'react-i18next';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { Swiper, Slide } from 'react-dynamic-swiper';
import { Tabs, Tab } from '@material-ui/core';
import Fixture from './Fixture';

let swiper;
const Team = ({ t, i18n }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        infoData: null,
        isLoading: true,
        error: null,
        tabIndex: 0,
        clickedTabIndex: [0]
    });
    const { infoData, isLoading, error, tabIndex, clickedTabIndex } = state;

    const { language } = i18n;
    const params = useParams();
    let { teamId } = params;
    const paramArr = teamId.split('-');
    teamId = paramArr[paramArr.length - 1];

    useEffect(() => {
        axios
            .get(`/api/team/info/${language}/${teamId}`)
            .then(res => {
                setState({
                    infoData: res.data,
                    isLoading: false,
                    error: null
                });
            })
            .catch(err => {
                setState({
                    error: t('Something went wrong'),
                    isLoading: false
                });
            });
    }, []);
    const handleTabChange = (e, value) => {
        if (swiper) swiper.slideTo(value);
        setState({
            tabIndex: value
        });
    };

    const updateAutoHeight = () => {
        console.log(swiper);
        setTimeout(() => {
            swiper.updateAutoHeight();
        });
    };

    const onInitSwiper = swiperInstance => {
        console.log('heyoo');
        swiper = swiperInstance;
        swiperInstance.on('slideChange', () => {
            setState({
                tabIndex: swiperInstance.activeIndex
            });
        });
    };

    const slides = [];

    slides.push({
        id: 0,
        label: t('Fixture'),
        Component: Fixture,
        props: {
            teamId,
            updateAutoHeight
        }
    });

    return (
        <div className="team-details">
            <div className="team-details-info">
                {infoData && (
                    <>
                        <div className="top">
                            <div className="top-team-logo">
                                <img
                                    src={`${window.ImageServer}/images/team-logo/football_${teamId}.png`}
                                    className="img"
                                    alt={infoData.team.mediumname}
                                />
                            </div>
                        </div>
                        <div className="bottom" style={{ color: `#${infoData.homejersey.number}` }}>
                            <span className="bg" style={{ background: `#${infoData.homejersey.base}` }} />
                            <div className="bg-over">
                                <h1>{infoData.team.mediumname}</h1>
                                <div className="text">
                                    <strong>
                                        <Trans>Manager</Trans>:
                                    </strong>{' '}
                                    {infoData.manager.name}
                                    <br />
                                    <small>
                                        (<Trans>Contract Since</Trans>:{' '}
                                        {moment(infoData.manager.membersince.date, 'DD/MM/YYYY').format('MMM YYYY')})
                                    </small>
                                </div>
                                <div className="text">
                                    <strong>
                                        <Trans>Stadium</Trans>:
                                    </strong>{' '}
                                    {infoData.stadium.name}{' '}
                                    <small>
                                        (<Trans>Capacity</Trans>: {infoData.stadium.capacity}})
                                    </small>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

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
        </div>
    );
};

export default withTranslation('translations')(Team);

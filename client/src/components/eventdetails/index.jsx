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
import { appendValueToArray } from '../../Helper';

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
        axios
            .get(`/api/eventdetails/${eventid}/${language}`)
            .then(res => {
                setState({
                    data: res.data,
                    isLoading: false,
                    error: null
                });
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

    if (error) return <Errors message={error} />;
    if (isLoading) return <Loading />;

    const slides = [
        {
            id: 0,
            label: t('Summary'),
            Component: Summary,
            props: {
                data,
                swiper: swiper
            }
        }
    ];

    if (data.ids.id_sp)
        slides.push({
            id: 1,
            label: t('Live Tracker'),
            Component: LiveTracker,
            props: {
                matchid: data.ids.id_sp
            }
        });

    const handleTabChange = (event, value) => {
        if (swiper) swiper.slideTo(value);
        setState({
            tabIndex: value,
            clickedTabIndex: appendValueToArray(clickedTabIndex, slides[value].id)
        });
    };

    const onInitSwiper = swiperInstance => {
        setState({
            swiper: swiperInstance
        });
        swiperInstance.on('slideChange', () => {
            setState({
                tabIndex: swiperInstance.activeIndex,
                clickedTabIndex: appendValueToArray(clickedTabIndex, slides[swiperInstance.activeIndex].id)
            });
        });
    };

    return (
        <div className="event-details">
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
                            <Component hasActived={clickedTabIndex.indexOf(id) > -1} {...props} />
                        </Slide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default withTranslation('translations')(Eventdetails);

import React, { useReducer } from 'react';
import { withTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Swiper, Slide } from 'react-dynamic-swiper';
import { Tabs, Tab } from '@material-ui/core';
import Fixture from './Fixture';

const Teamdetails = ({ t }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        tabIndex: 0,
        clickedTabIndex: [0],
        swiper: null
    });
    const { tabIndex, clickedTabIndex, swiper } = state;

    console.log(swiper);
    const params = useParams();
    let { teamId } = params;
    const paramArr = teamId.split('-');
    teamId = paramArr[paramArr.length - 1];

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
        setState({
            swiper: swiperInstance
        });
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

    slides.push({
        id: 0,
        label: t('Fixture2'),
        Component: Fixture,
        props: {
            teamId,
            updateAutoHeight
        }
    });

    return (
        <div className="team-details">
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

export default withTranslation('translations')(Teamdetails);

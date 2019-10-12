import React, { useReducer } from 'react';
import { withTranslation } from 'react-i18next';
import { Tabs, Tab } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';

const Eventdetails = () => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        tabIndex: 0,
        tabExtra1: false,
        tabExtra2: false
    });
    const { tabIndex, tabExtra1, tabExtra2 } = state;

    const handleTabChange = (event, value) => {
        setState({
            tabIndex: value
        });
    };

    const handleSwipeChange = value => {
        setState({
            tabIndex: value
        });
    };

    setTimeout(() => {}, 4000);

    setTimeout(() => {
        setState({
            tabExtra1: true
        });
    }, 8000);

    const slides = [1, 2, ...(tabExtra1 ? [3] : []), 4, ...(tabExtra2 ? [5] : [])];
    return (
        <div>
            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="scrollable"
                indicatorColor="secondary"
                textColor="secondary"
            >
                <Tab label="tab n°1" />
                <Tab label="tab n°2" />
                {tabExtra1 && <Tab label="tab n°3 Extra" />}
                <Tab label="tab n°4" />
                {tabExtra2 && <Tab label="tab n°5 Extra" />}
            </Tabs>
            <SwipeableViews
                // key={Math.random()}
                enableMouseEvents
                index={tabIndex}
                onChangeIndex={handleSwipeChange}
                animateHeight
                hysteresis={0.4}
            >
                {slides.map(number => {
                    return <SlideItem number={number} />;
                })}
            </SwipeableViews>
        </div>
    );
};

const SlideItem = ({ number }) => {
    return (
        <div className="slide4" style={{ height: 800, backgroundColor: 'green' }}>
            slide {number}
        </div>
    );
};

export default withTranslation('translations')(Eventdetails);

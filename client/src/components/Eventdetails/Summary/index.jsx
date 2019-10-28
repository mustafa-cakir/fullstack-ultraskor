import React from 'react';
import PressureGraph from '../PressureGraph';
import Bestplayer from '../BestPlayer';
import PreIddaa from '../Preiddaa/PreIddaa';
import Incidents from '../Incidents';
import MatchInfo from '../MatchInfo';

const Summary = ({ data, swipeByTabId }) => {
    const { event } = data;
    return (
        <div className="swipe-content summary">
            <div className="event-details-summary">
                <div className="container">
                    <div className="white-box mt-2 pb-2">
                        <PressureGraph event={event} />
                        <Bestplayer event={event} swipeByTabId={swipeByTabId} />
                        <PreIddaa eventData={data} iddaaMatchData={data} swipeByTabId={swipeByTabId} />
                        <Incidents incidents={event.incidents} />
                    </div>
                    <MatchInfo eventData={data} />
                </div>
            </div>
        </div>
    );
};

export default Summary;

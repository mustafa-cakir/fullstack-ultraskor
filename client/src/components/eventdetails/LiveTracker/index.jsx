import React from 'react';
import i18n from 'i18next';

const LiveTracker = ({ matchid, hasActived }) => {
    if (!hasActived) return false;
    const { language } = i18n;
    return (
        <div className="live-match-iframe-wrapper">
            <iframe
                title="Live Match Tracker"
                className="live-match-iframe"
                src={`/static/live-match/index.html?matchid=${matchid}&lang=${language}`}
                width="100%"
                height="800"
                frameBorder="no"
                scrolling="no"
            />
        </div>
    );
};

export default LiveTracker;

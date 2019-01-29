import React, {Component} from 'react';
import i18n from "i18next";

class LiveTracker extends Component {
	render() {
		const {matchid, isTabLiveTracker} = this.props;
		const {language} = i18n;
		if (!isTabLiveTracker) return false;
		return (
			<div className="live-match-iframe-wrapper">
				<iframe title="Live Match Tracker" className="live-match-iframe" src={`/static/live-match/?matchid=${matchid}&lang=${language}`} width="100%" height="800" frameBorder="no" scrolling="no"/>
			</div>
		)
	}
}

export default LiveTracker

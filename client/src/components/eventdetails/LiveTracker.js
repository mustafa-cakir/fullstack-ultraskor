import React, {Component} from 'react';
import i18n from "i18next";

class LiveTracker extends Component {
	render() {
		const {matchid} = this.props;
		const {language} = i18n;

		return (
			<div className="live-match-iframe-wrapper">
				<iframe className="live-match-iframe" src={`/static/live-match/?matchid=${matchid}&lang=${language}`} width="100%" height="800" frameBorder="no" scrolling="no"/>
			</div>
		)
	}
}

export default LiveTracker

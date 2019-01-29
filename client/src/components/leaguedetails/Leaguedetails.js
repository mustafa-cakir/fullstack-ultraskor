import React, {Component} from 'react';
import {withNamespaces} from "react-i18next";

class Leaguedetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0,
		};
		this.leagueid = this.props.match.params.leagueid;
		this.seasonid = this.props.match.params.seasonid;

	}

	render() {
		const {index} = this.state;
		return (
			<div className="tournament-details">
				League details page will go here
				<p>
					league ID: {this.leagueid}
				</p>
				<p>
					Season ID: {this.seasonid}
				</p>
			</div>
		)
	}
}

export default withNamespaces('translations')(Leaguedetails)

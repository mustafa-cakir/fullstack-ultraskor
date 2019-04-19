import React, {Component} from 'react';
import Event from "./Event";
import {Trans, withTranslation} from "react-i18next";
import Icon from "./Icon";

class FavTournament extends Component {
	render() {
		return (
			<React.Fragment>
				<div className="fav-container" key={1}>
					<div className="tournament-title">
						<Icon name="fas fa-star event-fav-color"/>
						<div className="col tournament-name px-2">
							<strong><Trans>My Favorites</Trans></strong>
						</div>
					</div>
					{this.props.favEventsList.map((event, i) => {
						if (this.props.isLive && event.status.type !== "inprogress") return false;
						return (<Event key={i}
						               favEvents={this.props.favEvents}
						               favEventsList={this.props.favEventsList}
						               socket={this.props.socket}
						               favContainer={true}
						               event={event}
						               updateParentState={this.props.updateParentState}/>)
					})}
				</div>
			</React.Fragment>

		)
	}
}

export default withTranslation('translations')(FavTournament)

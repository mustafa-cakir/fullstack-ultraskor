import React, {PureComponent} from 'react';
import Event from "./Event";
import {Trans, withTranslation} from "react-i18next";
import {generateSlug, flagImg} from "../../Helper";
import { Link } from "react-router-dom"
import Errors from "./Errors";

class Tournament extends PureComponent {

	// shouldComponentUpdate(nextProps, nextState) {
	// 	return false;
	// }

	render() {
		const {t, isLive, filteredTournaments} = this.props;
		let tournamentCount = 0;
		return (
			<React.Fragment>
				{this.props.tournaments.map(tournament => {
					if (isLive) {
						let checkLive = tournament.events.filter(event => {
							return event.status.type === "inprogress";
						});
						if (checkLive.length < 1) return false;
					}

					if (filteredTournaments.length > 0) {
						if (filteredTournaments.indexOf(tournament.tournament.uniqueId) < 0) return false;
					}
					tournamentCount++;
					return tournament.events.length > 0 ? (
						<React.Fragment key={tournament.tournament.id}>
							<div className="tournament-title">
									{flagImg(tournament)}
										<Link to={{
											pathname: `/${t('league')}/${generateSlug(t(tournament.category.name))}-${generateSlug(t(tournament.tournament.name))}${t('-standing-')}${tournament.tournament.uniqueId}${t('-season-')}${tournament.season ? tournament.season.id : "0"}`,
											state: {isPrev: true}
										}} className="col tournament-name"
											  title={`${t(tournament.category.name)} - ${t(tournament.tournament.name)}  ${t('click for standings, highlights and league fixtures')}`}>
											<strong><Trans>{tournament.category.name}</Trans></strong> - {t(tournament.tournament.name)}
										</Link>
							</div>

							{tournament.events.map((event, k) => {
								if (isLive && event.status.type !== "inprogress") return false;
								return (<Event key={event.id}
								               favEvents={this.props.favEvents}
								               favEventsList={this.props.favEventsList}
											   index={k}
											   event={event}
											   updateParentState={this.props.updateParentState}/>)
							})}
						</React.Fragment>
					) : ""
				})}
				{tournamentCount < 1 ? <Errors type="no-matched-game"/> : ""}
			</React.Fragment>
		)
	}
}

export default withTranslation('translations')(Tournament)

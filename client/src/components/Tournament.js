import React, {Component} from 'react';
import Event from "./Event";
import {Trans, withNamespaces} from "react-i18next";
import {generateSlug} from "../Helper";
import Link from "react-router-dom/es/Link";

class Tournament extends Component {
	render() {
		const {t} = this.props;
		return (
			<React.Fragment>
				{this.props.data.sportItem.tournaments.map((tournament, i) => {
					return (
						<React.Fragment key={i}>
							{/*<div className="tournament-container" data-key={i}>*/}
								<div className="tournament-title league-link-container">
									<Link to={{
										pathname: `/${t('league')}/${generateSlug(t(tournament.category.name))}-${generateSlug(t(tournament.tournament.name))}${t('-standing-')}${tournament.tournament.uniqueId}${t('-season-')}${tournament.season ? tournament.season.id : "0"}`,
										state: {isPrev: true}
									}} className="row align-items-center league-link">
										{this.props.flagImg(tournament)}
										<div className="col tournament-name px-2">
											<strong><Trans>{tournament.category.name}</Trans></strong> - {tournament.tournament.name}
										</div>
									</Link>
								</div>

								{tournament.events.map((event, k) => {
									return (<Event key={i+k} event={event}
									               updateParentState={this.updateParentState} {...this.props}/>)
								})}
							{/*</div>*/}
						</React.Fragment>
					)
				})}
			</React.Fragment>
		)
	}
}

export default withNamespaces('translations')(Tournament)

import React, {PureComponent} from 'react';
import Event from "./Event";
import {Trans, withTranslation} from "react-i18next";
import {generateSlug, flagImg} from "../../Helper";
import { Link } from "react-router-dom"

class Tournament extends PureComponent {
	render() {
		const {t} = this.props;
		return (
			<React.Fragment>
				{this.props.tournaments.map((tournament, i) => {
					return tournament.events.length > 0 ? (
						<React.Fragment key={i}>
							{/*<div className="tournament-container" data-key={i}>*/}
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
								return (<Event key={k}
											   index={k}
											   event={event}
											   updateParentState={this.updateParentState} {...this.props}/>)
							})}
							{/*</div>*/}
						</React.Fragment>
					) : ""
				})}
			</React.Fragment>
		)
	}
}

export default withTranslation('translations')(Tournament)

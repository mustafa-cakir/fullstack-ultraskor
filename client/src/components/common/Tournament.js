import React, {PureComponent} from 'react';
import Event from "./Event";
import {Trans, withTranslation} from "react-i18next";
import {generateSlug, flagImg, updateQueryString} from "../../Helper";
import {Link} from "react-router-dom"
import Errors from "./Errors";

class Tournament extends PureComponent {

	lazyLoadLoadMoreBtn() {
		let newLazyLoadCount = parseInt(this.props.lazyLoadCount) + 10;
		let newUrl = updateQueryString("load", newLazyLoadCount);

		if (window.history.replaceState) {
			window.history.replaceState("data", `${document.title} - ${newLazyLoadCount}`, newUrl);
		}

		this.props.updateParentState({
			lazyLoadCount: newLazyLoadCount
		});
	}

	render() {
		const {t, isLive, filteredTournaments, isLazyLoad, lazyLoadCount} = this.props;
		let tournamentCount = 0;
		return (
			<React.Fragment>
				{this.props.tournaments.map((tournament, index) => {
					if (isLive) {
						let checkLive = tournament.events.filter(event => {
							return event.status.type === "inprogress";
						});
						if (checkLive.length < 1) return false;
					}

					if (filteredTournaments && filteredTournaments.length > 0) {
						if (filteredTournaments.indexOf(tournament.tournament.uniqueId) < 0) return false;
					}

					if (isLazyLoad && !isLive) {
						if (index === parseInt(lazyLoadCount)) {
							return <div key="more" onClick={(e) => {this.lazyLoadLoadMoreBtn()}} className="load-more-homepage"><i className="fas"/><Trans>Load more</Trans></div>
						} else if (index > parseInt(lazyLoadCount)) {
							return false
						}
					}
					tournamentCount++;
					return tournament.events.length > 0 ? (
						<React.Fragment key={tournament.tournament.uniqueId + "_" + index}>
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
								               selectedId={this.props.selectedId}
								               selected={this.props.selected}
								               from={this.props.from}
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

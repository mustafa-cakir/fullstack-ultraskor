import React, {Component} from 'react';
import Icon from "./Icon";
import moment from "moment";
import Link from "react-router-dom/es/Link";
import {Trans, withNamespaces} from "react-i18next";
import {generateSlug} from "../../Helper";
import {askForPermissioToReceiveNotifications} from "../../web-push";

class Event extends Component {
	isInProgress() {
		let text;
		let liveBlinkerCodes = [6, 7];
		const {from} = this.props;
		switch (this.props.event.status.type) {
			case "inprogress":
				text =
					<div
						className="red font-weight-bold">
						<Trans>{this.props.event.statusDescription}</Trans>
						{(this.props.event.status.code === 6) ? '' : ''}
						{(liveBlinkerCodes.indexOf(this.props.event.status.code) > -1) ?
							<span className="live-blinker">'</span> : ''}
					</div>;
				break;
			case "notstarted":
				text =
					<div className="full-time font-weight-bold">
						<div className="day">
							{moment(this.props.event.startTimestamp * 1000).isSame(moment(), 'day') ?
								<Trans>Today</Trans> :
								<span>{moment(this.props.event.startTimestamp * 1000).format('D MMM')}</span>}
						</div>
						{moment(this.props.event.startTimestamp * 1000).format('HH:mm')}
					</div>;
				break;
			case "canceled":
				text =
					<div className="red small-text line-clamp">
						<Trans>Cancelled</Trans>
					</div>;
				break;
			case "postponed":
				text =
					<div className="red small-text line-clamp">
						<Trans>Postponed</Trans>
					</div>;
				break;
			default:
				text = from === "h2h" || from === "fixture" ? <div
						className="full-time in-the-past">{moment(this.props.event.startTimestamp * 1000).format('DD.MM.YY')}</div> :
					<div className="full-time font-weight-bold"><Trans>FT</Trans></div>
		}
		return text;
	}

	favClickHandler() {
		const event = this.props.event,
			eventId = this.props.event.id;

		let favEvents = this.props.favEvents || [],
			favEventsList = this.props.favEventsList || [],
			method = favEvents.indexOf(eventId) < 0 ? "subscribeToTopic" : "unsubscribeFromTopic";

		if (method === "subscribeToTopic") {
			favEvents.push(eventId);
			favEventsList.push(event);
		} else {
			favEvents = favEvents.filter(item => item !== eventId);
			favEventsList = favEventsList.filter(item => item !== event);
		}

		askForPermissioToReceiveNotifications().then(token => {
			fetch(`/api/webpush`, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					token: [token],
					topic: `/topics/match_${eventId}`,
					method: method
				})
			})
				.then(res => {
					if (res.status === 200) {
						return res;
					} else {
						throw Error(`Can't retrieve information from server, ${res}`);
					}
				})
				.then(() => {
					console.log(`Successfully ${method} for /topics/match_${eventId}`);
					localStorage.setItem('FavEvents', JSON.stringify(favEvents));
					this.props.updateParentState({
						favEvents: favEvents,
						favEventsList: favEventsList
					});
				})
				.catch(err => {
					// error
					console.log(`Failed to ${method} for /topics/match_${eventId} - Message returned: ${err}`);
				});
		})

	}

	render() {
		const {event, t, from} = this.props;
		let favEvents = this.props.favEvents || [];
		const favActive = favEvents.indexOf(event.id) > -1;
		return (
			<div className={favActive ? "fav-active event-container " : "event-container"}>
				<div className="container">
					<div className="row">
						<div className="col event-time pr-0 pl-2">
							{this.isInProgress()}
						</div>
						<Link to={{
							pathname: `/${t('match')}/${generateSlug(event.name)}-${t('live-score')}-${event.id}`,
							state: {isPrev: true},
						}} className="event-link col p-0"
							  title={`${event.homeTeam.name} - ${event.awayTeam.name}  ${t('click for live scores, lineup and stats')}`}>
							<div className="row m-0">
								<div className="col event-team home text-right pr-0 pl-2">
									{event.homeRedCards ? <span className={"red-card"}>{event.homeRedCards}</span> : ""}
									{event.homeTeam.name}
								</div>
								<div
									className={"col event-score text-center font-weight-bold px-0" + (event.status.type === 'inprogress' ? ' live' : '')}>
									{(typeof event.homeScore.current !== "undefined" || typeof event.awayScore.current !== "undefined") ?
										(
											<React.Fragment>
												<span>{event.homeScore.current}</span><span
												className="score-separator">:</span><span>{event.awayScore.current}</span>
											</React.Fragment>
										)
										: (" - ")
									}
								</div>
								<div className="col event-team away text-left pl-0 pr-2">
									{event.awayRedCards ? <span className={"red-card"}>{event.awayRedCards}</span> : ""}
									{event.awayTeam.name}
								</div>
							</div>
						</Link>
						{(from === "h2h" || from === "fixture") ? (
							<div className="col event-fav half-time-score pl-0 text-right pr-2">
								{typeof event.homeScore.period1 !== "undefined" ? `(${event.homeScore.period1}-${event.awayScore.period1})` : ""}
							</div>
						) : (
							<div className="col event-fav pl-0 text-right pr-2"
								 onClick={this.favClickHandler.bind(this)}>
								<Icon name="fas fa-spinner fav-loading"/>
								{this.props.favContainer || favActive ? (
									<Icon name="fas fa-star active"/>) : event.status.type !== "finished" ?
									<Icon name="far fa-star"/> : ""}
							</div>
						)}

					</div>

				</div>
			</div>
		)
	}
}

export default withNamespaces('translations')(Event)

import React, {Component} from 'react';
import Icon from "./Icon";
import moment from "moment";
import { Link } from "react-router-dom"
import {Trans, withTranslation} from "react-i18next";
import {generateSlug} from "../../Helper";
import {askForPermissioToReceiveNotifications} from "../../web-push";

class Event extends Component {
	constructor(props) {
		super(props);
		this.state = {
			favEventLoading: false
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (
			this.props.event.status.type !== nextProps.event.status.type
			|| this.props.event.statusDescription !== nextProps.event.statusDescription
			|| this.props.event.status.code !== nextProps.event.status.code
			|| this.props.event.startTimestamp !== nextProps.event.startTimestamp
			|| this.props.favEvents.toString() !== nextProps.favEvents.toString()
			|| this.state.favEventLoading !== nextState.favEventLoading
		) {
			console.log('changed!!');
			return true;
		}
		return false;
	}

	isInProgress() {
		let text;
		let liveBlinkerCodes = [6, 7];
		const {from} = this.props;
		switch (this.props.event.status.type) {
			case "inprogress":
				text =
					<div
						className="col event-time pr-0 pl-2 red font-weight-bold">
						<Trans>{this.props.event.statusDescription}</Trans>
						{(this.props.event.status.code === 6) ? '' : ''}
						{(liveBlinkerCodes.indexOf(this.props.event.status.code) > -1) ?
							<span className="live-blinker">'</span> : ''}
					</div>;
				break;
			case "notstarted":
				text =
					<div className="col event-time pr-0 pl-2 full-time font-weight-bold">
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
					<div className="col event-time pr-0 pl-2 red small-text line-clamp">
						<Trans>Cancelled</Trans>
					</div>;
				break;
			case "postponed":
				text =
					<div className="col event-time pr-0 pl-2 red small-text line-clamp">
						<Trans>Postponed</Trans>
					</div>;
				break;
			case "interrupted":
				text =
					<div className="col event-time pr-0 pl-2 red small-text line-clamp">
						<Trans>Interrupted</Trans>
					</div>;
				break;
			default:
				text = from === "h2h" || from === "fixture" ? <div
						className="col event-time pr-0 pl-2 full-time in-the-past">{moment(this.props.event.startTimestamp * 1000).format('DD.MM.YY')}</div> :
					<div className="col event-time pr-0 pl-2 full-time font-weight-bold"><Trans>FT</Trans></div>
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

		this.setState({favEventLoading: true});
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
						this.setState({favEventLoading: false});
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
					this.setState({favEventLoading: false});
					localStorage.setItem('FavEvents', JSON.stringify(favEvents));
					this.props.updateParentState({
						favEvents: favEvents,
						favEventsList: favEventsList
					});
					console.log(`Failed to ${method} for /topics/match_${eventId} - Message returned: ${err}`);
				});
		})

	}

	render() {
		const {event, t, from, selected, selectedId} = this.props;
		let favEvents = this.props.favEvents || [];
		const favActive = favEvents.indexOf(event.id) > -1;
		if (event.homeTeam.id === 2687) console.log('triggered!!', event.homeTeam.name);
		return (
			<div className={"event-container" + (this.props.index % 2 === 0 ? " " : " bg-gray")}>
				{this.isInProgress()}
				<Link to={{
					pathname: `/${t('match')}/${generateSlug(t(event.homeTeam.name) + '-' + t(event.awayTeam.name))}-${t('live-score')}-${event.id}`,
					state: {isPrev: true},
				}} className={`event-link col p-0 row m-0 ${event.winnerCode ? "winner-" + event.winnerCode : ""}`}
					  title={`${t(event.homeTeam.name)} - ${t(event.awayTeam.name)}  ${t('click for live scores, lineup and stats')}`}>
                            <span className="col event-team home text-right pr-0 pl-2">
                                {event.homeRedCards ? <span className={"red-card"}>{event.homeRedCards}</span> : ""}
								{t(event.homeTeam.name)}
                            </span>
					<span
						className={"col event-score text-center font-weight-bold px-0" + (event.status.type === 'inprogress' ? ' live' : '')}>
                                {(typeof event.homeScore.current !== "undefined" || typeof event.awayScore.current !== "undefined") ?
									(
										<React.Fragment>{event.homeScore.current}<span
											className="score-separator">:</span>{event.awayScore.current}
										</React.Fragment>
									)
									: (" - ")
								}
                            </span>
					<span className="col event-team away text-left pl-0 pr-2">
                                {event.awayRedCards ? <span className={"red-card"}>{event.awayRedCards}</span> : ""}
						{t(event.awayTeam.name)}
                            </span>
				</Link>
				{(from === "h2h" || from === "fixture") ? (
					<div className="col event-fav half-time-score pl-0 text-right pr-2">
						{selected !== "h2h" ? (
							<TeamForm selectedId={selectedId} event={event}/>
						) : (
							<span>{typeof event.homeScore.period1 !== "undefined" ? `(${event.homeScore.period1}-${event.awayScore.period1})` : ""}</span>
						)}
					</div>
				) : (
					<div className="col event-fav pl-0 text-right pr-2"
						 onClick={this.favClickHandler.bind(this)}>
						{this.state.favEventLoading ? <Icon name="fas fa-spinner fav-loading"/> : ""}
						{this.props.favContainer || favActive ? (
							<Icon name="fas fa-star active"/>) : event.status.type !== "finished" ?
							<Icon name="far fa-star"/> : ""}
					</div>
				)}

			</div>
		)
	}
}

const TeamForm = props => {
	const {event, selectedId} = props;
	let result = null;
	//console.log(typeof selectedId, typeof event.homeTeam.id, event.id, event.winnerCode);
	if (event.winnerCode === 1) {
	    result = parseInt(selectedId) === event.homeTeam.id ? "W" : "L"
    } else if (event.winnerCode === 2) {
        result = parseInt(selectedId) === event.homeTeam.id ? "L" : "W"
    } else if (event.winnerCode === 3) {
	    result = "D"
    }

	return result ? <span className={"team-form team-form-" + result}>{result}</span> : <span/>;
};

export default withTranslation('translations')(Event)

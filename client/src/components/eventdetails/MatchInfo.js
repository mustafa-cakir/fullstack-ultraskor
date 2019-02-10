import React, {Component} from 'react';
import moment from "moment";
import i18n from "i18next";
import {Trans} from "react-i18next";

class MatchInfo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			teamStats: null,
			initSocketOnce: true
		}
	}

	componentDidMount() {
		moment.locale((i18n.language === "tr") ? "tr-TR" : "en-US");
	}

	componentDidUpdate() {
		setTimeout(() => {
			this.props.swipeAdjustHeight();
		}, 100);
		if (this.state.initSocketOnce && this.props.provider2MatchData) {
			this.setState({initSocketOnce: false}, () => {
				this.initSocket();
			});
		}
	}

	initSocket() {

		const {socket, provider2MatchData} = this.props;
		socket.emit("get-oley", {matchid: provider2MatchData.id, type: "teamstats"});
		socket.once('return-oley-teamstats', res => {
			this.setState({
				teamStats: res,
			});
		});
		socket.on('return-oley-error-teamstats', err => {
			// do nothing
		});
	}

	render() {
		const {eventData, provider3MatchData} = this.props;
		const {teamStats} = this.state;
		const {language} = i18n;

		let tournament, country, city, stadium, capacity, attendance, date, referee, broadcast;
		tournament = eventData.event.tournament ? eventData.event.tournament.name : null;
		attendance = eventData.event.attendance ? eventData.event.attendance.toLocaleString() : null;
		date = moment(eventData.event.startTimestamp * 1000).format('DD MMM YYYY, HH:mm');
		broadcast = provider3MatchData && provider3MatchData.broadcast && provider3MatchData.broadcast.length > 0 ? provider3MatchData.broadcast.join(', ') : null;
		referee = eventData.event.referee ? eventData.event.referee.name : null;
		if (eventData.event.hasVenue) {
			country = eventData.event.venue.country ? eventData.event.venue.country.name : null;
			city = eventData.event.venue.city ? eventData.event.venue.city.name : null;
			stadium = eventData.event.venue.stadium ? eventData.event.venue.stadium.name : null;
			capacity = (eventData.event.venue.stadium && eventData.event.venue.stadium.capacity) ? eventData.event.venue.stadium.capacity.toLocaleString() : null;
		}

		return (
			<div className="white-box mt-2">
				<h1 className="title">{eventData.event.homeTeam.name} - {eventData.event.awayTeam.name} <Trans>Match
					Information</Trans></h1>

				{teamStats ? <Teamstats teamStats={teamStats}/> : ""}

				{language === "tr" ? (
					<React.Fragment>
						<p className="match-facts">Başlama düdüğünden
							itibaren {broadcast ? "" + broadcast + " kanalindan maçı canlı olarak izleyebilir ve " : ""}
							Ultraskor.com <a href={window.location.href}
							                 title={`${eventData.event.homeTeam.name} - ${eventData.event.awayTeam.name} canlı skor ve maç sonucu`}>{eventData.event.homeTeam.name} - {eventData.event.awayTeam.name} maç
								sonucu</a> sayfasindan maçın canlı skorunu, istatiklerini, kadrolarını ve canlı puan
							durumunu anlık olarak takip edebilirsiniz.</p>
					</React.Fragment>) : (
					<React.Fragment>
						<p>
							You
							can {broadcast ? "watch live stream through " + broadcast + " channel when the game kicks off and " : ""} track
							the live score, stats, lineups and live standings on UltraSkor.com's <a
							href={window.location.href}
							title={`${eventData.event.homeTeam.name} - ${eventData.event.awayTeam.name} live score and match result`}>{eventData.event.homeTeam.name} - {eventData.event.awayTeam.name}</a> match
							details page.
						</p>
					</React.Fragment>)}

				<div className="body">
					<div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Date</Trans></div>
						<div className="col col-7">{date}</div>
					</div>
					{tournament ? <div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Tournament</Trans></div>
						<div className="col col-7">{tournament}</div>
					</div> : ''}
					{(country || city) ? <div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Location</Trans></div>
						<div className="col col-7">{country || ""}, {city || ""}</div>
					</div> : ''}
					{stadium ? <div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Stadium</Trans></div>
						<div className="col col-7">{stadium}</div>
					</div> : ''}
					{capacity ? <div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Capacity</Trans></div>
						<div className="col col-7">{capacity}</div>
					</div> : ''}
					{attendance ? <div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Attendance</Trans></div>
						<div className="col col-7">{attendance}</div>
					</div> : ''}
					{referee ? <div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Referee</Trans></div>
						<div className="col col-7">{referee}</div>
					</div> : ''}

					{broadcast ? <div className="row">
						<div className="col col-3 f-500 text-right pr-0"><Trans>Broadcast</Trans></div>
						<div className="col col-7">{broadcast}</div>
					</div> : ""}
				</div>
			</div>
		)
	}
}

const Teamstats = props => {
	const {teamStats} = props;

	//let generalInfo = [];
	//console.log(teamStats);
	let generalInfo = teamStats.textList.filter(item => {
		return item.textGroupName === "Maça Giriş"
	});

	return (
		<React.Fragment>
			{generalInfo.map((item, index) => {
				return (index === 0) ? (
					<h2 className="desc provider2-data" key={index}>{item.textValue}</h2>
				) : (
					<p className="provider2-data" key={index}>{item.textValue}</p>
				)
			})}
		</React.Fragment>
	)
};

export default MatchInfo

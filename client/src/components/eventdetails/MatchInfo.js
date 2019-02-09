import React, {Component} from 'react';
import moment from "moment";
import i18n from "i18next";
import {Trans} from "react-i18next";

class MatchInfo extends Component {
	componentDidMount() {
		moment.locale((i18n.language === "tr") ? "tr-TR" : "en-US");
	}
	render() {
		const {eventData, provider3MatchData} = this.props;
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
		const {language} = i18n;
		return (
			<div className="white-box mt-2">
				<h1 className="title">{eventData.event.homeTeam.name} - {eventData.event.awayTeam.name} <Trans>Match
					Information</Trans></h1>
				{language === "tr" ? (
					<React.Fragment>
						<h2 className="desc">
							{eventData.event.tournament.name} {eventData.event.season.year} sezonunda {eventData.event.homeTeam.name} ve {eventData.event.awayTeam.name} arasında {moment(eventData.event.startTimestamp * 1000).format('LL')} günü oynanacak olan maçın başlama  saati {moment(eventData.event.startTimestamp * 1000).format('HH:mm')}. {stadium} stadındaki mücadeleyi {referee} yönetiyor.
						</h2>
						<p>Başlama düdüğünden itibaren  {broadcast ? "" + broadcast + " kanalindan canlı olarak izleyebilir ve " : ""}
							Ultraskor.com <a href={window.location.href} title={`${eventData.event.homeTeam.name} - ${eventData.event.awayTeam.name} canlı skor ve maç sonucu`}>{eventData.event.homeTeam.name} - {eventData.event.awayTeam.name}</a> maç detay sayfasindan maçın canlı skorunu, istatiklerini, kadrolarını ve canlı puan durumunu anlık olarak takip edebilirsiniz.</p>
					</React.Fragment>) : (
					<React.Fragment>
						<h2 className="desc">
							{eventData.event.homeTeam.name} is playing against {eventData.event.awayTeam.name} in the {eventData.event.tournament.name} {eventData.event.season.year} season. The match starts on {moment(eventData.event.startTimestamp * 1000).format('LL')} @ {moment(eventData.event.startTimestamp * 1000).format('HH:mm')} at {stadium} stadium.  The referee will be {referee}
						</h2>
						<p>
							You can {broadcast ? "watch live stream through " + broadcast + " channel when the game kicks off and " : ""} track the live score, stats, lineups and live standings on UltraSkor.com's <a href={window.location.href} title={`${eventData.event.homeTeam.name} - ${eventData.event.awayTeam.name} live score and match result`}>{eventData.event.homeTeam.name} - {eventData.event.awayTeam.name}</a> match details page.
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

export default MatchInfo

import React, {Component} from 'react';
import moment from "moment";
import {Trans} from "react-i18next";

class MatchInfo extends Component {
    render() {
        const {eventData} = this.props;
        let tournament, country, city, stadium, capacity, attendance, date, referee;

        tournament = eventData.event.tournament ? eventData.event.tournament.name : null;
        attendance = eventData.event.attendance ? eventData.event.attendance.toLocaleString() : null;
        date = moment(eventData.event.startTimestamp * 1000).format('DD MMM YYYY, HH:mm');
        referee = eventData.event.referee ? eventData.event.referee.name : null;
        if (eventData.event.hasVenue) {
            country = eventData.event.venue.country ? eventData.event.venue.country.name : null;
            city = eventData.event.venue.city ? eventData.event.venue.city.name : null;
            stadium = eventData.event.venue.stadium ? eventData.event.venue.stadium.name : null;
            capacity = (eventData.event.venue.stadium && eventData.event.venue.stadium.capacity) ? eventData.event.venue.stadium.capacity.toLocaleString() : null;
        }
        return (
            <div className="white-box mt-2">
                <div className="title"><Trans>Match Information</Trans></div>
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
                </div>
            </div>
        )
    }
}

export default MatchInfo

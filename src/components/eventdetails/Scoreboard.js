import React, {Component} from 'react';
import moment from "moment";

class Scoreboard extends Component {
    render() {
        const {eventData} = this.props;
        return (
            <div className="event-details-scoreboard stadium">
                <div className="container">
                    <div className="row text-center flex-nowrap">
                        <div className="col-4 pr-0">
                            <div className="team-logo mb-2">
                                <img
                                    alt={eventData.event.homeTeam.name}
                                    src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.homeTeam.id + '.png'}
                                />
                            </div>
                            <div className="team-name">{eventData.event.homeTeam.name}</div>
                            <div
                                className="team-coach mb-2">{eventData.managerDuel ? eventData.managerDuel.homeManager.name : ''}</div>
                            <div>{(eventData.teamsForm) ?
                                <TeamForm data={eventData.teamsForm.homeTeam.form}/> : ""}</div>
                        </div>
                        <div className="col-4 align-self-center middle">
                            <div className="time"><IsInProgress eventData={eventData}/></div>
                            <div className={"score" + (eventData.event.status.type === 'inprogress' ? ' live' : '')}>
                                {(eventData.event.homeScore && eventData.event.awayScore && eventData.event.homeScore.current && eventData.event.awayScore.current) ? eventData.event.homeScore.current + ' - ' + eventData.event.awayScore.current : " - "}
                            </div>
                            {(eventData.event.homeScore && eventData.event.awayScore && eventData.event.homeScore.period1 && eventData.event.awayScore.period1) ?
                                <div
                                    className="score-halftime">(HT: {eventData.event.homeScore.period1} - {eventData.event.awayScore.period1})</div> : ""}
                        </div>
                        <div className="col-4 pl-0">
                            <div className="team-logo mb-2">
                                <img alt={eventData.event.awayTeam.name}
                                     src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.awayTeam.id + '.png'}/>
                            </div>
                            <div className="team-name">{eventData.event.awayTeam.name}</div>
                            <div
                                className="team-coach mb-2">{eventData.managerDuel ? eventData.managerDuel.awayManager.name : ''}</div>
                            <div>{(eventData.teamsForm) ?
                                <TeamForm data={eventData.teamsForm.awayTeam.form}/> : ""}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const IsInProgress = props => {
    let eventData = props.eventData;
    let text;
    let liveBlinkerCodes = [6, 7];
    switch (eventData.event.status.type) {
        case "inprogress":
            text =
                <div className="red font-weight-bold">
                    {eventData.event.statusDescription}
                    {(eventData.event.status.code === 6) ? '' : ''}
                    {(liveBlinkerCodes.indexOf(eventData.event.status.code) > -1) ?
                        <span className="live-blinker">'</span> : ''}
                </div>;
            break;
        case "notstarted":
            text =
                <div className="full-time font-weight-bold">
                    {moment(eventData.event.startTimestamp * 1000).format('HH:mm')}
                </div>;
            break;
        case "canceled":
            text =
                <div className="red small-text line-clamp">
                    Cancelled
                </div>;
            break;
        case "postponed":
            text =
                <div className="red small-text line-clamp">
                    Postponed
                </div>;
            break;
        default:
            text =
                <div className="full-time font-weight-bold">
                    FT
                </div>
    }
    return text;
};

const TeamForm = props => {
    let result = [];
    props.data.forEach((status, index) => {
        result.push(<span key={index} className={"team-form team-form-" + status}>{status}</span>)
    });
    return result;
};


export default Scoreboard

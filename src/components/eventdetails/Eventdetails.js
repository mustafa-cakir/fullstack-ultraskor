import React, {Component} from 'react';
import Loading from "../Loading";
import moment from "moment";
import Tabview from "./Tabview";

class Eventdetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            eventData: null
        };
    };

    componentDidMount() {
        const eventid = this.props.match.params.eventid;
        this.getData('/event/' + eventid + '/json');
    }

    getData = api => {
        this.setState({loading: true});
        let jsonData = {};
        fetch('https://www.sofascore.com' + api, {referrerPolicy: "no-referrer", cache: "no-store"})
            .then(res => res.json())
            .then(
                (result) => {
                    jsonData = result;
                    console.log('heyoo');
                },
                (error) => {
                    jsonData = {error: error.toString()};
                    console.log('heyoo2');
                }
            )
            .then(() => {
                this.setState({
                    eventData: jsonData,
                    loading: false
                });
            })
    };



    render() {
        let header = [],
            eventData = this.state.eventData;

        if (eventData) {
            const isInProgress = () => {
                let text;
                let liveBlinkerCodes = [6,7];
                switch (eventData.event.status.type) {
                    case "inprogress":
                        text =
                            <div className="red font-weight-bold">
                                {eventData.event.statusDescription}
                                {(eventData.event.status.code === 6) ? '' : ''}
                                {(liveBlinkerCodes.indexOf(eventData.event.status.code) > -1) ? <span className="live-blinker">'</span> : ''}
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

            header.push(
                <div key={1} className="container event-details-header">
                    <div className="row">
                        <div className="col col-4 text-center">
                            <div className="team-logo mb-2">
                                <img
                                    alt={eventData.event.homeTeam.name}
                                    src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.homeTeam.id + '.png'}
                                />
                            </div>
                            <div className="team-name">{eventData.event.homeTeam.name}</div>
                            <div className="team-coach mb-2">{eventData.managerDuel ? eventData.managerDuel.homeManager.name : ''}</div>
                            <div><TeamForm data={eventData.teamsForm.homeTeam.form}/></div>
                        </div>
                        <div className="col col-4 text-center align-self-center">
                            <div className="time">{isInProgress()}</div>
                            <div className={"score" + (eventData.event.status.type === 'inprogress' ? ' live' : '')}>
                                {(typeof eventData.event.homeScore.current !== "undefined" || typeof eventData.event.awayScore.current !== "undefined") ? eventData.event.homeScore.current + ' - ' + eventData.event.awayScore.current : " - "}
                            </div>
                            <div className="score-halftime">
                                {(typeof eventData.event.homeScore.period1 !== "undefined" || typeof eventData.event.awayScore.period1 !== "undefined") ? '(HT: ' + eventData.event.homeScore.period1 + ' - ' + eventData.event.awayScore.current + ")" : ""}
                            </div>
                        </div>
                        <div className="col col-4 text-center">
                            <div className="team-logo mb-2">
                                <img alt={eventData.event.awayTeam.name} src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.awayTeam.id + '.png'}/>
                            </div>
                            <div className="team-name">{eventData.event.awayTeam.name}</div>
                            <div className="team-coach mb-2">{eventData.managerDuel ? eventData.managerDuel.awayManager.name : ''}</div>
                            <div><TeamForm data={eventData.teamsForm.awayTeam.form}/></div>
                        </div>


                    </div>
                </div>
            )
        }

        console.log(this.state.mainData);
        return (
            <div className="event-details">
                {header}
                <div className="container p-2 pb-4">
                    {this.state.loading ? <Loading/> : null}
                    <hr />
                    <p>####</p>
                    <Tabview/>
                    <p>####</p>
                </div>
            </div>
        )
    }
}

const TeamForm = props => {
    let result = [];
    props.data.forEach((status, index) => {
        result.push(<span key={index} className={"team-form team-form-" + status}>{status}</span>)
    });
    return result;
}

export default Eventdetails

import React, {Component} from 'react';
import Icon from "./Icon";
import moment from "moment";
import Link from "react-router-dom/es/Link";

class Event extends Component {
    constructor(props) {
        super(props);
        this.favClickHandler = this.favClickHandler.bind(this);
        this.state = {
            favActive: false,
        };
        this.persistState = {"favEvents": []};
    }

    componentDidMount() {
        // this.persistState = sessionStorage.getItem('FavEvents');
        // if (this.persistState) {
        //     try {
        //         if (this.persistState.favEvents.indexOf(this.props.event.id) > -1) {
        //             this.setState({favActive: true});
        //         }
        //     } catch (e) {
        //         console.log("Prev state can't implemented, something went seriously wrong!");
        //     }
        // }
    }

    setSessionStorage() {
        const favEventId = this.props.event.id;
        if (this.persistState.favEvents.indexOf(favEventId) === -1) {
            this.persistState.favEvents.push(favEventId);
            debugger;
        } else {
            this.persistState = this.persistState.favEvents.filter(function(item) {
                return item !== favEventId
            });
        }
        console.log(this.persistState.favEvents);
        //const {...obj} = this.persistState;
        sessionStorage.setItem('FavEvents', JSON.stringify(this.persistState));
    }

    isInProgress() {
        let text;
        let liveBlinkerCodes = [6, 7];
        switch (this.props.event.status.type) {
            case "inprogress":
                text =
                    <div className="red font-weight-bold">
                        {this.props.event.statusDescription}
                        {(this.props.event.status.code === 6) ? '' : ''}
                        {(liveBlinkerCodes.indexOf(this.props.event.status.code) > -1) ?
                            <span className="live-blinker">'</span> : ''}
                    </div>;
                break;
            case "notstarted":
                text =
                    <div className="full-time font-weight-bold">
                        {moment(this.props.event.startTimestamp * 1000).format('HH:mm')}
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
    }

    favClickHandler() {
        this.setState({favActive: !this.state.favActive}, this.setSessionStorage);
    }

    render() {
        const event = this.props.event;
        return (
            <div className={this.state.favActive ? "fav-active event-container " : "event-container"}>
                <div className="container">

                    <div className="row">
                        <Link to={{
                            pathname: "/eventdetails/" + event.id,
                            state: {isPrev: true}
                        }} className="event-link col">
                            <div className="row">
                                <div className="col event-time pr-0 pl-2">
                                    {this.isInProgress()}
                                </div>
                                <div className="col event-team home text-right pr-0 pl-2">
                                    {event.homeRedCards ? <span className={"red-card"}>{event.homeRedCards}</span> : ""}
                                    {event.homeTeam.name}
                                </div>
                                <div
                                    className={"col event-score text-center font-weight-bold px-0" + (event.status.type === 'inprogress' ? ' live' : '')}>
                                    {(typeof event.homeScore.current !== "undefined" || typeof event.awayScore.current !== "undefined") ? event.homeScore.current + ':' + event.awayScore.current : " - "}
                                </div>
                                <div className="col event-team away text-left pl-0 pr-2">
                                    {event.awayRedCards ? <span className={"red-card"}>{event.awayRedCards}</span> : ""}
                                    {event.awayTeam.name}
                                </div>
                            </div>
                        </Link>
                        <div className="col event-fav pl-0 text-right pr-2" onClick={this.favClickHandler}>
                            {this.state.favActive ? <Icon name="fas fa-star active"/> : <Icon name="far fa-star"/>}
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

export default Event

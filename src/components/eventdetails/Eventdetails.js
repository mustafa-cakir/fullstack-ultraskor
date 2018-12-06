import React, {Component} from 'react';
import Loading from "../Loading";
import moment from "moment";
import ReactSwipe from "react-swipe";
import Icon from "../Icon";
import iconWhistle from "./../../assets/images/icon-whistle.png"

class Eventdetails extends Component {
    swipeChanging = index => {
        this.setState({
            index: index
        }, () => {
            this.swipeMarkerAndScrollHandler();
            this.swipeAdjustHeight(index);
        });
    };
    swipeComplete = (index, el) => {
        //console.log(index);
    };
    swipeSwiping = (percentage) => {
        //console.log(percentage);
    };
    swipeTabClick = (event, index) => {
        this.rippleEffectHandler(event);
        this.swipeEl.current.slide(index);
    };
    getData = api => {
        this.setState({loading: true});
        let jsonData = {};
        fetch('https://www.sofascore.com' + api, {referrerPolicy: "no-referrer", cache: "no-store"})
            .then(res => res.json())
            .then(
                (result) => {
                    jsonData = result;
                },
                (error) => {
                    jsonData = {error: error.toString()};
                }
            )
            .then(() => {
                this.setState({
                    eventData: jsonData,
                    loading: false
                });
            })
    };

    constructor(props) {
        super(props);
        this.swipeEl = React.createRef();
        this.swipeMarkerEl = React.createRef();
        this.swipeTabsEl = React.createRef();
        this.state = {
            loading: false,
            eventData: null,
            index: 0
        };
    };

    componentDidMount() {
        const eventid = this.props.match.params.eventid;
        this.getData('/event/' + eventid + '/json');
        this.swipeMarkerAndScrollHandler();

    };

    componentDidUpdate() {
        this.swipeAdjustHeight(this.state.index);
    }

    swipeAdjustHeight(index) {
        let container = this.swipeEl.current.containerEl.firstChild;
        let active = container.childNodes[index];
        container.style.height = active.offsetHeight + 'px';
    }

    rippleEffectHandler(e) {
        let el = e.target,
            rippleEl = document.createElement("span"),
            rect = el.getBoundingClientRect(),
            clientX = e.clientX ? e.clientX : e.touches[0].clientX,
            clientY = e.clientY ? e.clientY : e.touches[0].clientY,
            rippleX = Math.round(clientX - rect.left),
            rippleY = Math.round(clientY - rect.top),
            rippleSize = Math.max(el.offsetWidth, el.offsetHeight);

        rippleEl.className = "ripple";
        el.appendChild(rippleEl);

        rippleEl.style.width = rippleSize + "px";
        rippleEl.style.height = rippleSize + "px";
        rippleEl.style.top = -(rippleSize / 2) + rippleY + 'px';
        rippleEl.style.left = -(rippleSize / 2) + rippleX + 'px';
        rippleEl.className += " rippleEffect";
        setTimeout(() => {
            rippleEl.remove();
        }, 600);
    };

    swipeMarkerAndScrollHandler() {
        let marker = this.swipeMarkerEl.current,
            active = document.querySelector('.swipe-tabs .active'),
            tabs = this.swipeTabsEl.current;

        marker.style.width = active.offsetWidth + 'px';
        marker.style.left = active.offsetLeft + 'px';
        tabs.scrollTo({
            left: active.offsetLeft - ((window.outerWidth - active.offsetWidth) / 2) + 7,
            behavior: 'smooth'
        });
    };

    render() {
        let eventData = this.state.eventData;
        const tabs = [
            'Summary',
            'Stats',
            'Lineup',
            'Media Media Media Media',
            'Standing'
        ];
        return (
            <div className="event-details">
                {this.state.loading ? <Loading/> : null}
                {(eventData) ? <ScoreBoard eventData={eventData}/> : ''}
                <ul className="swipe-tabs" ref={this.swipeTabsEl}>
                    {
                        tabs.map((tab, index) => {
                            return <li key={index} onClick={(event) => this.swipeTabClick(event, index)}
                                       className={(this.state.index === index ? "active" : "") + " ripple-effect pink"}>{tab}</li>;
                        })
                    }
                    <li className="marker" ref={this.swipeMarkerEl}/>
                </ul>
                <div className="swipe-shadows"/>
                <ReactSwipe className="swipe-contents"
                            swipeOptions={{
                                speed: 200,
                                continuous: true,
                                callback: this.swipeChanging,
                                transitionEnd: this.swipeComplete,
                                swiping: this.swipeSwiping,
                                disableScroll: false
                            }} ref={this.swipeEl}>
                    <div className="swipe-content general">
                        {(eventData) ? <MatchInfo eventData={eventData}/> : ''}
                    </div>
                    <div className="swipe-content stats">
                        Stats content will go here
                        <div className="row2">
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                        </div>
                    </div>
                    <div className="swipe-content line-up">
                        Line up content will go here
                        <div className="row2">
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                        </div>
                    </div>
                    <div className="swipe-content media">
                        Media content will go here
                        <div className="row2">
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                        </div>
                    </div>
                    <div className="swipe-content standing">
                        standing content will go here
                        <div className="row2">
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                            <p>.</p>
                        </div>
                    </div>
                </ReactSwipe>
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
};

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

const ScoreBoard = props => {
    const {eventData} = props;
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
                            {(typeof eventData.event.homeScore.current !== "undefined" || typeof eventData.event.awayScore.current !== "undefined") ? eventData.event.homeScore.current + ' - ' + eventData.event.awayScore.current : " - "}
                        </div>
                        {(typeof eventData.event.homeScore.period1 !== "undefined" || typeof eventData.event.awayScore.period1 !== "undefined") ?
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
};

const MatchInfo = props => {
    const {eventData} = props;

    let tournament, country, city, stadium, capacity, attendance, date, referee;

    tournament = eventData.event.tournament ? eventData.event.tournament.name : null;
    attendance = eventData.event.attendance ? eventData.event.attendance.toLocaleString() : null;
    date = moment(eventData.event.startTimestamp * 1000).format('DD MMM YYYY, H:m');
    referee = eventData.event.referee ? eventData.event.referee.name : null;
    if (eventData.event.hasVenue) {
        country = eventData.event.venue.country ? eventData.event.venue.country.name : null;
        city = eventData.event.venue.city ? eventData.event.venue.city.name : null;
        stadium = eventData.event.venue.stadium ? eventData.event.venue.stadium.name : null;
        capacity = (eventData.event.venue.stadium && eventData.event.venue.stadium.capacity) ? eventData.event.venue.stadium.capacity.toLocaleString() : null;
    }
    return (
        <div className="event-details-summary">
            <div className="container">

                <div className="white-box mt-2">
                    <PressureGraph eventData={eventData}/>
                    <IncidentsDisplay eventData={eventData}/>
                </div>
                <div className="white-box mt-3">
                    <div className="title">Match Information</div>
                    <div className="body">
                        <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">Date</div>
                            <div className="col col-7">{date}</div>
                        </div>
                        {tournament ? <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">Tournament</div>
                            <div className="col col-7">{tournament}</div>
                        </div> : ''}
                        {(country || city) ? <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">Location</div>
                            <div className="col col-7">{country || ""}, {city || ""}</div>
                        </div> : ''}
                        {stadium ? <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">Stadium</div>
                            <div className="col col-7">{stadium}</div>
                        </div> : ''}
                        {capacity ? <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">Capacity</div>
                            <div className="col col-7">{capacity}</div>
                        </div> : ''}
                        {attendance ? <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">Attendance</div>
                            <div className="col col-7">{attendance}</div>
                        </div> : ''}
                        {referee ? <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">Referee</div>
                            <div className="col col-7">{referee}</div>
                        </div> : ''}
                    </div>
                </div>
            </div>
        </div>
    )
};

const IncidentsDisplay = props => {
    const {eventData} = props;
    if (!eventData.incidents || eventData.incidents.length === 0) return false;
    eventData.incidents.reverse();
    const typesHandler = (item, type, isHome) => {
        if (type === "period") {
            if (item.text === "Second half" || item.text === "First half") return false;
            return (
                <div className="row align-items-center">
                    <div className="col period-time text-center text-bold">
                        <img src={iconWhistle} alt="whistle" className="icon-whistle"/> {item.text}
                    </div>
                </div>
            )
        } else if (type === "injuryTime") {
            return (
                <div className="row">
                    <div className="col additional-time text-center text-gray">
                        <Icon name="fas fa-plus"/> Additional Time {item.length}'
                    </div>
                </div>
            )
        } else if (type === "card") {
            return (
                <div className={"py-3 row align-items-center" + (isHome ? "" : " flex-row-reverse")}>
                    <div className="col">
                        <div className={"row align-items-center " + (isHome ? "" : " flex-row-reverse")}>
                            <div className={"col put-border " + (isHome ? "home text-right" : " text-left")}>
                                <div className="name">{item.player.name}</div>
                                <div className="text-gray">{item.reason}</div>
                            </div>
                            <div className="col col-icon text-center">
                                <div className={item.incidentClass}/>
                            </div>
                        </div>
                    </div>
                    <div className="col col-time">
                        <div className="time">
                            <div>{item.time}'</div>
                        </div>
                    </div>
                    <div className="col"/>
                </div>
            )
        } else if (type === "substitution") {
            return (
                <div className={"py-3 row align-items-center" + (isHome ? "" : " flex-row-reverse")}>
                    <div className="col">
                        <div className={"row align-items-center " + (isHome ? "" : " flex-row-reverse")}>
                            <div className={"col put-border " + (isHome ? "home text-right" : " text-left")}>
                                <div className="playerIn">{item.playerIn.name}</div>
                                <div className="playerOut">{item.playerOut.name}</div>
                            </div>
                            <div className="col col-icon p-0 text-center">
                                <span className="icon-subs"/>
                            </div>
                        </div>
                    </div>
                    <div className="col col-time">
                        <div className="time">
                            <div>{item.time}'</div>
                        </div>
                    </div>
                    <div className="col"/>
                </div>
            )
        } else if (type === "goal") {
            return (
                <div className={"py-3 row goal align-items-center" + (isHome ? "" : " flex-row-reverse")}>
                    <div className="col">
                        <div className={"row align-items-center " + (isHome ? "" : " flex-row-reverse")}>
                            <div className={"col put-border " + (isHome ? "home text-right" : " text-left")}>
                                <div className="player text-bold">{item.player.name}</div>
                                {item.assist1 ? <div className="text-gray">{item.assist1.name}</div> : ""}
                                {item.from ? <div className="text-gray goal-from">({item.from})</div> : ""}
                                {item.awayScore || item.homeScore ?
                                    <div className="text-bold">{item.homeScore} - {item.awayScore}</div> : ""}
                            </div>
                            <div className="col col-icon col-goal-icon p-0 text-center">
                                <Icon name="far fa-futbol icon-goal"/>
                            </div>
                        </div>
                    </div>
                    <div className="col col-time">
                        <div className="time">
                            <div>{item.time}'</div>
                        </div>
                    </div>
                    <div className="col"/>
                </div>
            )
        }
    };
    return (
        <div>
            <div className="title">Match Incidents</div>
            <div className="body">
                <div className="match-incidents">
                    {eventData.incidents.map((item, index) => {
                        return (
                            <div key={index} className={"match-incidents-row"}>
                                {typesHandler(item, item.incidentType, item.isHome === true)}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
};

const PressureGraph = props => {
    const {eventData} = props;
    if (!eventData.liveForm || eventData.liveForm.length === 0) return false;
    return (
        <div>
            <div className="title">Pressure</div>
            <div className="body">
                <div className="pressure-graph mt-2">
                    <div className="homeLabel">
                        <img
                            alt={eventData.event.homeTeam.name}
                            src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.homeTeam.id + '.png'}
                        />
                    </div>
                    <div className="row m-0">
                        {eventData.liveForm.map((item, i) => {
                            let direction = (item.value < 0) ? "away" : (item.value !== 0) ? "home" : "",
                                style = {
                                    height: Math.abs(item.value) + "%",
                                    top: (item.value > 0) ? "-" + item.value + "%" : ""
                                };
                            return (
                                <div key={i} className={"col " + direction} style={style}/>
                            )
                        })}
                    </div>
                    <div className="awayLabel">
                        <img
                            alt={eventData.event.awayTeam.name}
                            src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.awayTeam.id + '.png'}
                        />
                    </div>
                </div>
                <div className="minute-measure row flex-nowrap mt-0 mb-2">
                    <div className="col label">Min</div>
                    <div className="col">15'</div>
                    <div className="col">30'</div>
                    <div className="col">45'</div>
                    <div className="col">60'</div>
                    <div className="col">75'</div>
                    <div className="col last">90'</div>
                </div>
            </div>
        </div>
    )
};

export default Eventdetails

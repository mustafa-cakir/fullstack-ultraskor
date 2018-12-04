import React, {Component} from 'react';
import Loading from "../Loading";
import moment from "moment";
import ReactSwipe from "react-swipe";
import Link from "react-router-dom/es/Link";
import Icon from "../Icon";

class Eventdetails extends Component {
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
            'General',
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
                                       className={(this.state.index === index ? "active" : "") + " ripple-effect blue"}>{tab}</li>;
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
                        {(eventData) ? <MatchDetails eventData={eventData}/> : ''}
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
        <div className="event-details-scoreboard">
            <div className="container">
                <div className="row text-center flex-nowrap">
                    <div className="col col-4 pr-0">
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
                    <div className="col col-4 align-self-center">
                        <div className="time"><IsInProgress eventData={eventData}/></div>
                        <div className={"score" + (eventData.event.status.type === 'inprogress' ? ' live' : '')}>
                            {(typeof eventData.event.homeScore.current !== "undefined" || typeof eventData.event.awayScore.current !== "undefined") ? eventData.event.homeScore.current + ' - ' + eventData.event.awayScore.current : " - "}
                        </div>
                        <div className="score-halftime">
                            {(typeof eventData.event.homeScore.period1 !== "undefined" || typeof eventData.event.awayScore.period1 !== "undefined") ? '(HT: ' + eventData.event.homeScore.period1 + ' - ' + eventData.event.awayScore.current + ")" : ""}
                        </div>
                    </div>
                    <div className="col col-4 pl-0">
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

const MatchDetails = props => {
    const {eventData} = props;
    return (
        <div className="event-details-matchdetails">
            <div className="container">
                <div className="white-box top-border-radius-0">
                    <div className="title">Match Information</div>
                    <div className="body">
                        <div className="row">
                            <div className="col col-3 f-500 text-right">Tournament</div>
                            <div className="col col-7">{eventData.event.tournament.name}</div>
                            <div className="col col-3 f-500 text-right">Country</div>
                            <div className="col col-7">{eventData.event.venue.country.name}</div>
                            <div className="col col-3 f-500 text-right">City</div>
                            <div className="col col-7">{eventData.event.venue.city.name}</div>
                            <div className="col col-3 f-500 text-right">Stadium</div>
                            <div className="col col-7">{eventData.event.venue.stadium.name}</div>
                            <div className="col col-3 f-500 text-right">Capacity</div>
                            <div className="col col-7">{eventData.event.venue.stadium.capacity}</div>
                        </div>
                    </div>
                    <div className="footer see-more">
                        <Link to="/read-more">See More <Icon name="fas fa-angle-down"/></Link>
                    </div>
                </div>
                <div className="white-box mt-3">
                    <div className="title">Dummy Box</div>
                    <div className="body">
                        <div className="row">
                            <div className="col col-3 f-500 text-right">Tournament</div>
                            <div className="col col-7">{eventData.event.tournament.name}</div>
                            <div className="col col-3 f-500 text-right">Country</div>
                            <div className="col col-7">{eventData.event.venue.country.name}</div>
                            <div className="col col-3 f-500 text-right">City</div>
                            <div className="col col-7">{eventData.event.venue.city.name}</div>
                            <div className="col col-3 f-500 text-right">Stadium</div>
                            <div className="col col-7">{eventData.event.venue.stadium.name}</div>
                            <div className="col col-3 f-500 text-right">Capacity</div>
                            <div className="col col-7">{eventData.event.venue.stadium.capacity}</div>
                        </div>
                    </div>
                    <div className="footer text-right">
                            <Link to="/read-more" className="mr-4">Link <Icon name="fas fa-angle-right"/></Link>
                            <Link to="/read-more">Read More <Icon name="fas fa-angle-right"/></Link>
                    </div>
                </div>
                <div className="white-box mt-3">
                    <div className="title">Another Dummy Box</div>
                    <div className="body">
                        <div className="row">
                            <div className="col col-3 f-500 text-right">Tournament</div>
                            <div className="col col-7">{eventData.event.tournament.name}</div>
                            <div className="col col-3 f-500 text-right">Country</div>
                            <div className="col col-7">{eventData.event.venue.country.name}</div>
                            <div className="col col-3 f-500 text-right">City</div>
                            <div className="col col-7">{eventData.event.venue.city.name}</div>
                            <div className="col col-3 f-500 text-right">Stadium</div>
                            <div className="col col-7">{eventData.event.venue.stadium.name}</div>
                            <div className="col col-3 f-500 text-right">Capacity</div>
                            <div className="col col-7">{eventData.event.venue.stadium.capacity}</div>
                        </div>
                    </div>
                    <div className="footer text-right">
                        <Link to="/read-more">Read More <Icon name="fas fa-angle-right"/></Link>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Eventdetails

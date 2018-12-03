import React, {Component} from 'react';
import Loading from "../Loading";
import moment from "moment";
import ReactSwipe from "react-swipe";

class Eventdetails extends Component {
    swipeChanging = index => {
        this.setState({
            index: index
        }, () => {
            this.swipeMarkerAndScrollHandler();
        });
    };
    swipeComplete = (index, el) => {
        // callback onSwipeComplete
    };
    swipeSwiping = (percentage) => {
        //console.log(percentage);
    };
    swipeTabClick = (event, index) => {
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
    }

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
            'Media',
            'Standing'
        ];
        return (
            <div className="event-details">
                {this.state.loading ? <Loading/> : null}
                <ul className="swipe-tabs" ref={this.swipeTabsEl}>
                    {
                        tabs.map((tab, index) => {
                            return <li key={index} onClick={(event) => this.swipeTabClick(event, index)}
                                       className={(this.state.index === index ? "active" : "") + " ripple-effect grey"}>{tab}</li>;
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
                                swiping: this.swipeSwiping
                            }} ref={this.swipeEl}>
                    <div className="swipe-content general">
                        { (eventData) ? <GeneralTabContent eventData={eventData}/> : ''}
                    </div>
                    <div className="swipe-content stats">Stats content will go here</div>
                    <div className="swipe-content line-up">Line up content will go here</div>
                    <div className="swipe-content media">Media content will go here</div>
                    <div className="swipe-content standing">standing content will go here</div>
                </ReactSwipe>
                <button onClick={() => this.swipeEl.current.next()}>Next</button>
                <button onClick={() => this.swipeEl.current.prev()}>Previous</button>
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

const GeneralTabContent = props => {
    const eventData = props.eventData;
    console.log(eventData);
    return (
        <div key={1} className="container event-details-header">
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
                    <div><TeamForm data={eventData.teamsForm.homeTeam.form}/></div>
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
                    <div><TeamForm data={eventData.teamsForm.awayTeam.form}/></div>
                </div>


            </div>
        </div>
    )
};

export default Eventdetails

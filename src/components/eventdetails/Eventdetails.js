import React, {Component} from 'react';
import Loading from "../Loading";
import ReactSwipe from "react-swipe";
import Scoreboard from "./Scoreboard";
import Incidents from "./Incidents";
import PressureGraph from "./PressureGraph";
import MatchInfo from "./MatchInfo";
import Bestplayer from "./Bestplayer";
import Standings from "./Standings";
import Stats from "./Stats";
import Lineup from "./Lineup";
import Footer from "../Footer";

class Eventdetails extends Component {
    constructor(props) {
        super(props);
        this.swipeEl = React.createRef();
        this.swipeMarkerEl = React.createRef();
        this.swipeTabsEl = React.createRef();
        this.swipeByIndex = this.swipeByIndex.bind(this);
        this.swipeByTabName = this.swipeByTabName.bind(this);
        this.swipeAdjustHeight = this.swipeAdjustHeight.bind(this);
        this.state = {
            loading: false,
            eventData: null,
            index: 0,
            isTabStanding: false,
            isTabLineup: false
        };
    };

    componentDidMount() {
        const eventid = this.props.match.params.eventid;
        this.getData('/event/' + eventid + '/json');
        this.tabs = [];
    };

    componentDidUpdate() {
        if (this.swipeEl.current) {
            this.swipeAdjustHeight(this.state.index);
            this.swipeMarkerAndScrollHandler();
        }
    }

    swipeChanging = index => {
        this.setState({
            index: index
        });
    };
    swipeComplete = (index, el) => {
        let tab = el.getAttribute('data-tab');

        if (tab === "standing") {
            this.setState({isTabStanding: true})
        }
        else if (tab === "lineup") {
            this.setState({isTabLineup: true})
        }
    };
    swipeSwiping = (percentage) => {
        //console.log(percentage);
    };
    swipeTabClick = (event, index) => {
        this.rippleEffectHandler(event);
        this.swipeEl.current.slide(index);
    };

    swipeAdjustHeight(index) {
        if (this.swipeEl.current.containerEl) {
            index = index || this.swipeEl.current.getPos();
            let container = this.swipeEl.current.containerEl.firstChild;
            let active = container.childNodes[index];
            container.style.height = active.offsetHeight + 'px';
        }
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

    swipeByIndex(index) {
        if (this.swipeEl) this.swipeEl.current.slide(index);
    }

    swipeByTabName(tab) {
        let index = (this.tabs) ? this.tabs.indexOf(tab) : 0;
        if (this.swipeEl) this.swipeEl.current.slide(index);
    }

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

    render() {
        let eventData = this.state.eventData;
        if (!eventData) return (<Loading/>);
        this.tabs = [
            'Summary',
            ...(eventData.event.hasStatistics ? ["Stats"] : []),
            ...(eventData.event.hasLineups ? ["Lineup"] : []),
            ...(eventData.standingsAvailable ? ["Standing"] : []),
            'Media',
            'Forum'
        ];
        return (
            <div className="event-details">
                {this.state.loading ? <Loading/> : null}
                <Scoreboard eventData={eventData}/>
                <ul className="swipe-tabs" ref={this.swipeTabsEl}>
                    {this.tabs.map((tab, index) => {
                        return <li key={index} onClick={(event) => this.swipeTabClick(event, index)}
                                   className={(this.state.index === index ? "active" : "") + " ripple-effect pink"}>{tab}</li>;
                    })}
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
                    <div className="swipe-content summary">
                        <div className="event-details-summary">
                            <div className="container">
                                <div className="white-box mt-2 pb-2">
                                    <PressureGraph eventData={eventData}/>
                                    <Bestplayer eventData={eventData} swipeByTabName={this.swipeByTabName}/>
                                    <Incidents eventData={eventData}/>
                                </div>
                                <MatchInfo eventData={eventData}/>
                            </div>
                        </div>
                    </div>

                    {eventData.event.hasStatistics ? (
                        <div className="swipe-content stats" data-tab="stats">
                            <Stats eventData={eventData}/>
                        </div>
                    ) : ""}

                    {eventData.event.hasLineups ? (
                        <div className="swipe-content lineup" data-tab="lineup">
                            {this.state.isTabLineup ?
                                <Lineup eventData={eventData} swipeAdjustHeight={this.swipeAdjustHeight}/>
                                : ""}
                        </div>
                    ) : ""}

                    {eventData.standingsAvailable ? (
                        <div className="swipe-content standing" data-tab="standing">
                            {this.state.isTabStanding ?
                                <Standings eventData={eventData} swipeAdjustHeight={this.swipeAdjustHeight}/> : ""}
                        </div>
                    ) : ""}

                    <div className="swipe-content media" data-tab="media">
                        <div className="p-4">
                            <h5>Coming Soon</h5>
                            Media contents will be here
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
                    <div className="swipe-content forum" data-tab="forum">
                        <div className="p-4">
                            <h5>Coming Soon</h5>
                            Forum will be here
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
                <Footer/>
            </div>
        )
    }
}

export default Eventdetails

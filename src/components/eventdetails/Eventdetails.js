import React, {Component} from 'react';
import Loading from "../Loading";
import moment from "moment";
import ReactSwipe from "react-swipe";
import Scoreboard from "./Scoreboard";
import Incidents from "./Incidents";
import PressureGraph from "./PressureGraph";
import MatchInfo from "./MatchInfo";

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
                {(eventData) ? <Scoreboard eventData={eventData}/> : ''}
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

export default Eventdetails

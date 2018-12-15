import React, {Component} from 'react';
import iconWhistle from "../../assets/images/icon-whistle.png";
import Icon from "../Icon";

class Incidents extends Component {
    static typesHandler(item, type, isHome) {
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
                                {item.player ? <div className="name">{item.player.name}</div> : ""}
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
        } else if (type === "YellowRed") {
            return (
                <div className={"py-3 row align-items-center" + (isHome ? "" : " flex-row-reverse")}>
                    <div className="col">
                        <div className={"row align-items-center " + (isHome ? "" : " flex-row-reverse")}>
                            <div className={"col put-border " + (isHome ? "home text-right" : " text-left")}>
                                {item.player ? <div className="name">{item.player.name}</div> : ""}
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
                                {item.playerIn ? <div className="playerIn">{item.playerIn.name}</div> : ""}
                                {item.playerOut ? <div className="playerOut">{item.playerOut.name}</div> : ""}
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
        } else if (type === "penalty") {
            return (
                <div className={"py-3 row missed-penalty align-items-center" + (isHome ? "" : " flex-row-reverse")}>
                    <div className="col">
                        <div className={"row align-items-center " + (isHome ? "" : " flex-row-reverse")}>
                            <div className={"col put-border " + (isHome ? "home text-right" : " text-left")}>
                                {item.incidentDescription ? <div className="player text-bold">{item.incidentDescription}</div> : ""}
                                {item.player ? <div className="text-gray">{item.player.name}</div> : ""}
                                {item.description ? <div className="text-gray">({item.description})</div> : ""}
                                {item.awayScore || item.homeScore ?
                                    <div className="text-bold">{item.homeScore} - {item.awayScore}</div> : ""}
                            </div>
                            <div className="col col-icon col-goal-icon p-0 text-center">
                                <Icon name="far fa-futbol icon-goal"/>
                                <Icon name="fas fa-times"/>
                            </div>
                        </div>
                    </div>
                    <div className="col col-time">
                        <div className="time">
                            <div>{item.time}{item.addedTime ? <sup>+{item.addedTime}</sup> : "'"}</div>
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
                                {item.player ? <div className="player text-bold">{item.player.name}</div> : ""}
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
                            <div>{item.time}{item.addedTime ? <sup>+{item.addedTime}</sup> : "'"}</div>
                        </div>
                    </div>
                    <div className="col"/>
                </div>
            )
        }
    };

    render() {
        const {eventData} = this.props;
        if (!eventData.incidents || eventData.incidents.length === 0) return false;
        eventData.incidents.reverse();
        return (
            <div>
                <div className="title">Match Incidents</div>
                <div className="body">
                    <div className="match-incidents">
                        <div className="row align-items-center">
                            <div className="col period-time text-center text-bold">
                                <img src={iconWhistle} alt="whistle" className="icon-whistle"/> Kick off
                            </div>
                        </div>
                        {eventData.incidents.map((item, index) => {
                            return (
                                <div key={index} className={"match-incidents-row"}>
                                    {Incidents.typesHandler(item, item.incidentType, item.isHome === true)}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}
export default Incidents

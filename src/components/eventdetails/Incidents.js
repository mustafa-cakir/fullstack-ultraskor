import React, {Component} from 'react';
import iconWhistle from "../../assets/images/icon-whistle.png";
import Icon from "../Icon";
import {Trans, withNamespaces} from "react-i18next";

class Incidents extends Component {
    constructor(props) {
        super(props);
        const {eventData} = this.props;
        this.incidents = eventData.incidents.reverse();
    }

    static typesHandler(item, type, isHome, t) {
        if (type === "period") {
            if (item.text === "Second half" || item.text === "First half") return false;
            return (
                <div className="row align-items-center">
                    <div className="col period-time text-center text-bold">
                        <img src={iconWhistle} alt="whistle"
                             className="icon-whistle"/> {item.text.replace("HT", t("HT")).replace("FT", t("MS"))}
                    </div>
                </div>
            )
        } else if (type === "injuryTime") {
            return (
                <div className="row">
                    <div className="col additional-time text-center text-gray">
                        <Icon name="fas fa-plus"/> <Trans>Additional Time</Trans> {item.length}'
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
                                <div className="text-gray"><Trans>{item.reason}</Trans></div>
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
                                <div className="text-gray"><Trans>{item.reason}</Trans></div>
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
                                {item.incidentDescription ?
                                    <div className="player text-bold">{item.incidentDescription}</div> : ""}
                                {item.player ? <div className="text-gray">{item.player.name}</div> : ""}
                                {item.description ?
                                    <div className="text-gray">(<Trans>{item.description}</Trans>)</div> : ""}
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
                                {item.from ?
                                    <div className="text-gray goal-from">(<Trans>{item.from}</Trans>)</div> : ""}
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
        if (!this.incidents || this.incidents.length === 0) return false;
        const {t} = this.props;
        return (
            <div>
                <div className="title"><Trans>Match Incidents</Trans></div>
                <div className="body">
                    <div className="match-incidents">
                        <div className="row align-items-center">
                            <div className="col period-time text-center text-bold">
                                <img src={iconWhistle} alt="whistle" className="icon-whistle"/> <Trans>Kick off</Trans>
                            </div>
                        </div>
                        {this.incidents.map((item, index) => {
                            return (
                                <div key={index} className={"match-incidents-row"}>
                                    {Incidents.typesHandler(item, item.incidentType, item.isHome === true, t)}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export default withNamespaces('translations')(Incidents)

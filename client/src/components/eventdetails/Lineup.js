import React, {Component} from 'react';
import Loading from "../Loading";
import {Trans} from "react-i18next";
import Errors from "../common/Errors";
import {ratingClass} from "../../Helper";
import {withTranslation} from "react-i18next";

class Lineup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lineupData: null,
            defaultFormation: 1,
            activeTeam: null,
            listTab: 0
        };
    }

    componentDidMount() {
        const {eventData} = this.props;
        this.getData("/event/" + eventData.event.id + "/lineups/json");
    };

    componentDidUpdate() {
        this.props.swipeAdjustHeight()
    }

    getData = api => {
        // const {socket} = this.props;

	    fetch(`/api/?query=${api}&page=lineup`)
		    .then(res => {
			    if (res.status === 200) {
				    return res.json();
			    } else {
				    throw Error(`Can't retrieve information from server, ${res.status}`);
			    }
		    })
		    .then(res => {
			    this.setState({
				    lineupData: res,
				    activeTeam: res.homeTeam
			    });
		    })
		    .catch(err => {
			    this.setState({
				    lineupData: {error: err.toString()},
			    });
		    });

        // socket.emit('get-main', options);

        // socket.once('return-main-lineup', res => {
        //     this.setState({
        //         lineupData: res,
        //         activeTeam: res.homeTeam
        //     });
        // });

        // socket.on('return-error-lineup', err => {
        //     this.setState({
        //         lineupData: {error: err.toString()},
        //     });
        // })
    };

    listTabHandler(selection) {
        this.setState({
            listTab: selection
        });
    }

    formationSwitchHandler(option) {
        this.setState({
            defaultFormation: option,
            activeTeam: (option === 1) ? this.state.lineupData.homeTeam : this.state.lineupData.awayTeam
        });
    }

    render() {
        const {lineupData, activeTeam} = this.state;
        const { t } = this.props;
        if (!lineupData) return <Loading type="inside"/>;
        if (lineupData.error) return <Errors type="error" message={lineupData.error}/>;

        const {eventData} = this.props;
        const homeFormation = lineupData.homeTeam.formation,
            awayFormation = lineupData.awayTeam.formation;

        // let yellowCards = [],
        //     goals = [],
        //     redCards = [],
        //     playersIn = [],
        //     playersOut = [];
        //
        // console.log(typeof activeTeam.incidents, activeTeam.incidents);
        // Object.keys(activeTeam.incidents).forEach((item) => {
        //     console.log(item);
        //     item.forEach((incident) => {
        //         if (incident.incidentType === "card") {
        //             if (incident.type === "Yellow") yellowCards.push(incident.player.id);
        //             else if (incident.type === "Red") redCards.push(incident.player.id);
        //         } else if (incident.incidentType === "substitution") {
        //             playersIn.push(incident.playerIn.id);
        //             playersOut.push(incident.playerOut.id);
        //         } else if (incident.incidentType === "goal") {
        //             goals.push(incident.player.id);
        //         }
        //     });
        // });

        const formationReverse = [...activeTeam.formation].reverse();
        let iteration = 11;

        return (
            <div>
                <div className="lineup container">
                    <div className="white-box mt-2">
                        <div className="formation">
                            <div className="row">
                                <div className={"col home" + (this.state.defaultFormation === 1 ? " active" : "")}
                                     onClick={() => this.formationSwitchHandler(1)}>
                                    <img
                                        alt={t(eventData.event.homeTeam.name)}
                                        src={window.ImageServer + '/images/team-logo/football_' + eventData.event.homeTeam.id + ''}
                                    />
                                    {homeFormation.map((item, index) => {
                                        return (
                                            <span
                                                key={index}>{item}{index === homeFormation.length - 1 ? "" : " - "}</span>
                                        )
                                    })}
                                </div>
                                <div className={"col away" + (this.state.defaultFormation === 2 ? " active" : "")}
                                     onClick={() => this.formationSwitchHandler(2)}>
                                    {awayFormation.map((item, index) => {
                                        return (
                                            <span
                                                key={index}>{item}{index === awayFormation.length - 1 ? "" : " - "}</span>
                                        )
                                    })}
                                    <img alt={t(eventData.event.awayTeam.name)}
                                         src={window.ImageServer + '/images/team-logo/football_' + eventData.event.awayTeam.id + ''}/>
                                </div>
                            </div>
                        </div>
                        <div className="pitch">
                            <div className={"area-container row-" + formationReverse.length}>
                                {formationReverse.map((item, index) => {
                                    return (
                                        <div key={index} className={"area area-" + item}>
                                            <div className="row">
                                                {[...Array(parseInt(item))].map((x, i) => {
                                                        iteration--;
                                                        let player = activeTeam.lineupsSorted[iteration].player,
                                                            rating = activeTeam.lineupsSorted[iteration].rating,
                                                            incidents = activeTeam.incidents && activeTeam.incidents[player.id] ? activeTeam.incidents[player.id] : null;

                                                        return (
                                                            <div key={i} className="col text-center">
                                                                <div className="player-container">
                                                                    <div className="picture">
                                                                        <img
                                                                            alt={player.name}
                                                                            src={window.ImageServer + "/images/player/image_" + player.id + ""}
                                                                            className="player-picture"
                                                                        />

                                                                        {rating ? (
                                                                            <span
                                                                                className={"text-bold rating " + ratingClass(rating)}>{rating}</span>
                                                                        ) : ""}

                                                                        {incidents ?
                                                                            incidents.map((item, index) => {
                                                                                return <span key={index}
                                                                                             className={"lineup-icon " + item.incidentClass}/>
                                                                            }) : ""}

                                                                    </div>
                                                                    <div className="clearfix"/>
                                                                    <div className="name" style={{
                                                                        background: '#' + activeTeam.color.player.outline,
                                                                        color: '#' + activeTeam.color.player.number
                                                                    }}>
                                                                        <span>{player.shortName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div className={"area area-1"}>
                                    <div className="row">
                                        <div className="col text-center">
                                            <div className="player-container">
                                                <div className="picture">
                                                    <img
                                                        alt={activeTeam.lineupsSorted[0].player.name}
                                                        src={window.ImageServer + "/images/player/image_" + activeTeam.lineupsSorted[0].player.id + ""}
                                                        className="player-picture"
                                                    />

                                                    {activeTeam.lineupsSorted[0].rating ? <span
                                                        className={"text-bold rating " + ratingClass(activeTeam.lineupsSorted[0].rating)}>{activeTeam.lineupsSorted[0].rating}</span> : ""}

                                                    {activeTeam.incidents && activeTeam.incidents[activeTeam.lineupsSorted[0].player.id] ?
                                                        activeTeam.incidents[activeTeam.lineupsSorted[0].player.id].map((item, index) => {
                                                            return <span key={index}
                                                                         className={"lineup-icon " + item.incidentClass}/>
                                                        }) : ""}
                                                </div>
                                                <div className="clearfix"/>
                                                <div className="name" style={{
                                                    background: '#' + activeTeam.color.goalkeeper.outline,
                                                    color: '#' + activeTeam.color.goalkeeper.number
                                                }}>
                                                    <span>{activeTeam.lineupsSorted[0].player.shortName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row pb-2">
                            <div className="col">
                                <div className="row align-items-center">
                                    <div className="col col-coach-picture">
                                        <img
                                            alt={activeTeam.manager.name}
                                            className="coach-picture"
                                            src={window.ImageServer + "/images/?url=/api/v1/manager/" + activeTeam.manager.id + "/image"}
                                        />
                                    </div>
                                    <div className="col">
                                        <div className="coach-name f-700">{activeTeam.manager.name}</div>
                                        <div className="text-gray"><Trans>Coach</Trans></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col col-5 text-right right-info">
                                {!activeTeam.confirmedLineups ?
                                    <div className="possible-lineup"><Trans>Possible Lineup</Trans>!</div> :
                                    <div className="confirmed-lineup"><Trans>Confirmed Lineup</Trans></div>}
                                {activeTeam.rating ?
                                    <div className="team-rating"><Trans>Team Avg. Rating</Trans>: <span
                                        className={"text-bold rating " + ratingClass(activeTeam.rating)}>{activeTeam.rating}</span>
                                    </div> : ""}

                                {activeTeam.averageAge.startersAverageAge ?
                                    <div className="mt-1"><Trans>Avg. Age</Trans>: <span
                                        className="f-500"> {activeTeam.averageAge.startersAverageAge}</span></div> : ""}
                            </div>
                        </div>
                        <div className="body list">
                            <ul className="horizontal-tab">
                                <li className={this.state.listTab === 0 ? "active" : ""}
                                    onClick={() => this.listTabHandler(0)}><span><Trans>Lineup</Trans></span></li>
                                <li className={this.state.listTab === 1 ? "active" : ""}
                                    onClick={() => this.listTabHandler(1)}><span><Trans>Substitues</Trans></span></li>
                            </ul>
                            {activeTeam.lineupsSorted.map((item, index) => {
                                if (this.state.listTab === 0 && item.substitute) return false;
                                if (this.state.listTab === 1 && !item.substitute) return false;
                                return (
                                    <div key={index}
                                         className="row list-row align-items-center">
                                        <div className="col list-image">
                                            <img
                                                alt={item.player.name}
                                                src={window.ImageServer + "/images/player/image_" + item.player.id + ""}/>
                                        </div>

                                        <div className="col list-text">
                                            <div
                                                className="f-700">{item.shirtNumber} - {item.player.name} {item.captain ?
                                                <span className="captain">C</span> : ""}
                                                {activeTeam.incidents && activeTeam.incidents[item.player.id] ?
                                                    activeTeam.incidents[item.player.id].map((item, index) => {
                                                        return <span key={index}
                                                                     className={"mx-1 lineup-icon " + item.incidentClass}/>
                                                    }) : ""}
                                                {(item.substitute && item.rating !== "–") ? <span key={index}
                                                                                                  className={"mx-1 lineup-icon substitutionin"}/> : ""}
                                            </div>
                                            <div className="text-gray"><Trans>{item.positionName}</Trans></div>
                                        </div>
                                        {item.rating ? <div className="col list-rating"><span
                                            className={"text-bold rating " + ratingClass(item.rating)}>{item.rating}</span>
                                        </div> : ""}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withTranslation('translations')(Lineup)

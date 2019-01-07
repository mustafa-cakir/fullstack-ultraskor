import React, {Component} from 'react';
import Event from "./Event";
import {Trans} from "react-i18next";

class Tournament extends Component {
    render() {
        return (
            <React.Fragment>
                {this.props.data.sportItem.tournaments.map((tournament, i) => {
                    return (
                        <React.Fragment key={i}>
                            <div className="tournament-title">
                                <div className="row align-items-center">
                                    {this.props.flagImg(tournament)}
                                    <div className="col tournament-name px-2">
                                        <strong><Trans>{tournament.category.name}</Trans></strong> - {tournament.tournament.name}
                                    </div>
                                </div>
                            </div>
                            {/*<div className="events-wrapper">*/}
                                {tournament.events.map((event, i) => {
                                    return (<Event key={i} event={event} updateParentState={this.updateParentState} {...this.props}/>)
                                })}
                            {/*</div>*/}
                        </React.Fragment>
                    )
                })}
            </React.Fragment>
        )
    }
}
export default Tournament
import React, {Component} from 'react';
import Event from "./Event";

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
                                        <strong>{tournament.category.name}</strong> - {tournament.tournament.name}
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

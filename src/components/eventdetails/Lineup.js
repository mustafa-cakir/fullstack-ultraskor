import React, {Component} from 'react';
import Loading from "../Loading";

class Lineup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lineupData: null,
            defaultFormation: 1,
            activeTeam: null
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
                    lineupData: jsonData,
                    activeTeam: jsonData.homeTeam
                });
            })
    };

    formationSwitchHandler(option) {
        this.setState({
            defaultFormation: option,
            activeTeam: (option === 1) ? this.state.lineupData.homeTeam : this.state.lineupData.awayTeam
        });
    }

    render() {
        const {lineupData, activeTeam} = this.state;
        const {eventData} = this.props;
        if (!lineupData) return <Loading/>;

        const homeFormation = lineupData.homeTeam.formation,
            awayFormation = lineupData.awayTeam.formation;
        let iteration = 11;

        return (
            <div>
                <div className="lineup container">
                    <div className="white-box mt-2">
                        <div className="formation">
                            <div className="row">
                                <div className={"col home" + (this.state.defaultFormation === 1 ? " active" : "")} onClick={() => this.formationSwitchHandler(1)}>
                                    <img
                                        alt={eventData.event.homeTeam.name}
                                        src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.homeTeam.id + '.png'}
                                    />
                                    {homeFormation.map((item, index) => {
                                        return (
                                            <span key={index}>{item}{index === homeFormation.length - 1 ? "" : " - "}</span>
                                        )
                                    })}
                                </div>
                                <div className={"col away" + (this.state.defaultFormation === 2 ? " active" : "")} onClick={() => this.formationSwitchHandler(2)}>
                                    {awayFormation.map((item, index) => {
                                        return (
                                            <span key={index}>{item}{index === awayFormation.length - 1 ? "" : " - "}</span>
                                        )
                                    })}
                                    <img alt={eventData.event.awayTeam.name}
                                         src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.awayTeam.id + '.png'}/>
                                </div>
                            </div>
                        </div>
                        <div className="pitch">
                            <div className="area-container">
                            {activeTeam.formation.reverse().map((item,index) => {
                                return (
                                    <div  key={index} className={"row area area-" + item }>
                                        {[...Array(parseInt(item))].map((x, i) => {
                                            iteration--;
                                             return (
                                                 <div key={i} className="col text-center">
                                                     <div className="player-container">
                                                         <div className="name">{activeTeam.lineupsSorted[iteration].player.shortName}</div>
                                                     </div>
                                                 </div>
                                             )
                                            }
                                        )}
                                    </div>
                                )
                            })}
                            </div>
                            <div className="row">
                                <div className="col">

                                </div>
                            </div>
                        </div>
                        <div className="body">
                            body here
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Lineup

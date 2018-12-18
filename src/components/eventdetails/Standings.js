import React, {Component} from 'react';
import Loading from "../Loading";

class Standings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            standingData: null
        };
    }

    componentDidMount() {
        const {eventData} = this.props;
        this.getData("/tournament/" + eventData.event.tournament.id + "/" + eventData.event.season.id + "/standings/tables/json");
    };

    componentDidUpdate() {
        this.props.swipeAdjustHeight()
    }

    getData = api => {
        let jsonData = {};
        fetch('http://host.flexiblewebdesign.com/api/?api=' + api, {referrerPolicy: "no-referrer", cache: "no-store"})
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
                    standingData: jsonData,
                });
            })
    };

    render() {
        const {standingData} = this.state;
        const {eventData} = this.props;
        if (!standingData) return <Loading type="inside"/>;
        const standingsTables = standingData.standingsTables[0];
        return (
            <div>
                <div className="standing container">
                    <div className="white-box mt-2">
                        <div className="row heading align-items-center">
                            <div className="col col-img">
                                <img
                                    src={"https://www.sofascore.com/u-tournament/" + standingsTables.tournament.uniqueId + "/logo"}
                                    alt={standingsTables.tournament.name}/>
                            </div>
                            <div className="col">
                                <div className="name">{standingsTables.tournament.name}</div>
                                <div className="country">{standingsTables.category.name}</div>
                            </div>
                            {standingsTables.isLive ? <div className="col text-right live-label pr-4">Live Table!</div> : ""}
                        </div>
                        <div className="body">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th className="order" scope="col"/>
                                    <th className="team" scope="col"/>
                                    <th scope="col">P</th>
                                    <th scope="col">W</th>
                                    <th scope="col">D</th>
                                    <th scope="col">L</th>
                                    <th scope="col">Pts</th>
                                </tr>
                                </thead>
                                <tbody>
                                {standingsTables.tableRows.map((item, index) => {
                                    return (
                                        <tr key={index}
                                            className={(item.team.id === eventData.event.homeTeam.id ? "highlight-home " : "") + (item.team.id === eventData.event.awayTeam.id ? "highlight-away " : "") + (item.isLive ? ("live-game " + item.liveMatchStatus) : "")}>
                                            <td className={"order " + (item.promotion && standingsTables.promotionsColoring ? "promotion " + standingsTables.promotionsColoring[item.promotion.id].class : "")}><span>{item.position}</span></td>
                                            <td className="team">{item.team.shortName}<span className="live-pulse"/>
                                            </td>
                                            <td className="matches">{item.totalFields.matchesTotal}</td>
                                            <td className="win">{item.totalFields.winTotal}</td>
                                            <td className="draw">{item.totalFields.drawTotal}</td>
                                            <td className="loss">{item.totalFields.lossTotal}</td>
                                            <td className="points">{item.totalFields.pointsTotal}</td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Standings

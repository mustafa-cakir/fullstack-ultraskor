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
                    standingData: jsonData,
                });
            })
    };

    flagImg(event) {
        let uniqueTournamentImages = [7, 8, 11, 384, 480, 679];
        if (uniqueTournamentImages.indexOf(event.tournament.uniqueId) > -1) {
            return (
                <div className="col flag-img">
                    <img
                        src={(process.env.NODE_ENV === 'production' ? '/livescore/' : '/') + "static/media/" + event.tournament.uniqueId + ".png"}
                        alt={event.tournament.name}/>
                </div>
            )
        } else {
            return (
                <div className={"col flag flag-" + event.category.flag}/>
            )
        }
    };

    render() {
        const {standingData} = this.state;
        if (!standingData) return <Loading/>;
        const standingsTables = standingData.standingsTables[0];
        return (
            <div>
                <div className="standing container">
                    <div className="white-box mt-2">
                        <div className="row heading align-items-center">
                            <div className="col col-img">
                                {this.flagImg(standingsTables)}
                            </div>
                            <div className="col">
                                <div className="name">{standingsTables.tournament.name}</div>
                                <div className="country">{standingsTables.tournament.name}</div>
                            </div>
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
                                    <th scope="col">Pt</th>
                                </tr>
                                </thead>
                                <tbody>
                                {standingsTables.tableRows.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="order">{item.position}</td>
                                            <td className="team">{item.team.shortName}</td>
                                            <td>{item.totalFields.matchesTotal}</td>
                                            <td>{item.totalFields.winTotal}</td>
                                            <td>{item.totalFields.drawTotal}</td>
                                            <td>{item.totalFields.lossTotal}</td>
                                            <td className="point">{item.totalFields.pointsTotal}</td>
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

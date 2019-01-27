import React, {Component} from 'react';
import Loading from "../Loading";
import {Trans, withNamespaces} from "react-i18next";
import Errors from "../Errors";
import Icon from "../Icon";

class Injuries extends Component {
    constructor(props) {
        super(props);
        this.state = {
            injuriesData: null,
        };
    }

    componentDidMount() {

    };

    componentDidUpdate() {
        setTimeout(() => {
            this.props.swipeAdjustHeight();
        }, 100);
    }

    getData = matchid => {
        if (matchid === "not found") {
            this.setState({
                injuriesData: "not found",
            });
        } else {
            const {socket} = this.props;

            socket.emit("get-eventdetails-missing", matchid);

            socket.once('return-eventdetails-missing', res => {
                this.setState({
                    injuriesData: res,
                });
            });

            socket.on('return-error-missing', err => {
                this.setState({
                    injuriesData: {error: err.toString()},
                });
            });
        }
    };

    render() {
        const { matchid } = this.props;
        const {injuriesData} = this.state;

        if (!injuriesData && matchid) this.getData(matchid);
        if (!matchid || !injuriesData) return <Loading type="inside"/>;

        if (matchid === "not found") return (
            <div>
                <div className="injuries container">
                    <div className="white-box mt-2">
                        <div className="body p-4 text-center"><Trans>Injuries & suspension information cannot be gathered for this match</Trans> :(</div>
                    </div>
                </div>
            </div>
        );

        if (injuriesData.error) return <div className="white-bg mt-2"><Errors type="error" message={injuriesData.error}/></div>;

        const {eventData, t} = this.props;

        return (
            <div>
                <div className="injuries container">
                    <div className="white-box mt-2">
                        <div className="row heading align-items-center">
                            <div className="col col-img">
                                <img
                                    alt={eventData.event.homeTeam.name}
                                    src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.homeTeam.id + '.png'}
                                />
                            </div>
                            <div className="col">
                                <div className="team-name">{eventData.event.homeTeam.name}</div>
                                <div className="injury-report">
                                    {injuriesData.homeTeamNoMissing || injuriesData.homeTeamMissings.length === 0 ? (
                                        <span>-</span>
                                    ) : (
                                        <InjurySummary data={injuriesData.homeTeamSummary} t={t}/>
                                    )}</div>
                            </div>
                        </div>
                        <div className="body">
                            {injuriesData.homeTeamNoMissing || injuriesData.homeTeamMissings.length === 0 ? (
                                <div className="no-injury"><Trans>No injured or suspended player</Trans></div>
                            ) : (
                                <InjuryTable data={injuriesData.homeTeamMissings}/>
                            )}
                        </div>
                        <hr/>
                        <div className="row heading align-items-center pt-3">
                            <div className="col col-img">
                                <img
                                    alt={eventData.event.awayTeam.name}
                                    src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.awayTeam.id + '.png'}
                                />
                            </div>
                            <div className="col">
                                <div className="team-name">{eventData.event.awayTeam.name}</div>
                                <div className="injury-report">
                                    {injuriesData.awayTeamNoMissing || injuriesData.awayTeamMissings.length === 0 ? (
                                        <span>-</span>
                                    ) : (
                                        <InjurySummary data={injuriesData.awayTeamSummary} t={t}/>
                                    )}</div>
                            </div>
                        </div>
                        <div className="body pb-3">
                            {injuriesData.awayTeamNoMissing || injuriesData.awayTeamMissings.length === 0 ? (
                                <div className="no-injury"><Trans>No injured or suspended player</Trans></div>
                            ) : (
                                <InjuryTable data={injuriesData.awayTeamMissings}/>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const InjurySummary = props => {
    const {data, t} = props;
    let summary = [];
    if (data.INJURED) summary.push(`${data.INJURED} ${t('Injured')}`);
    if (data.BANNED) summary.push(`${data.BANNED} ${t('Suspended')}`);
    if (data.DOUBTFUL) summary.push(`${data.DOUBTFUL} ${t('Suspicious')}`);
    if (data.OUT_OF_SQUAD) summary.push(`${data.OUT_OF_SQUAD} ${t('Out Of Squad')}`);
    if (data.ON_LEAVE || data.OTHER) summary.push(`${data.ON_LEAVE + data.OTHER} ${t('Other')}`);

    return (
        <React.Fragment>
            {summary.join(', ')}
        </React.Fragment>
    )
};


const InjuryTable = props => {
    const {data} = props;
    return (
        <React.Fragment>
            <table className="table injury-table table-striped ">
                <thead>
                <tr>
                    <th colSpan="3"/>
                    <th scope="col"><Trans>Match</Trans></th>
                    <th scope="col"><Trans>11</Trans></th>
                    <th scope="col"><Trans><Icon name="far fa-futbol"/></Trans></th>
                    <th scope="col"><Trans>As.</Trans></th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => {
                    return (
                        <tr key={index}>
                            <td className=""><span className={"icon icon-" + item.missingType + " reason-" + item.missingReasonId}/></td>
                            <td className="player">
                                <div className="name">{item.player.knownName}</div>
                                <div className="reason">{item.description}</div>
                            </td>
                            <td><div className="position"><Trans>{item.position.toLowerCase()}</Trans></div></td>
                            <td>{item.generalStatistics.totalPlayed}</td>
                            <td>{item.generalStatistics.lineupCount}</td>
                            <td>{item.generalStatistics.goalCount}</td>
                            <td>{item.generalStatistics.assistCount}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </React.Fragment>
    )
};

export default withNamespaces('translations')(Injuries);


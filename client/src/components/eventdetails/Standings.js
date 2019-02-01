import React, {Component} from 'react';
import Loading from "../Loading";
import {Trans} from "react-i18next";
import Errors from "../Errors";

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

		const {socket} = this.props;
		const options = {
			api: api,
			page: 'standing'
		};

		socket.emit('get-main', options);

		socket.once('return-main-standing', res => {
			this.setState({
				standingData: res,
			});
		});

		socket.on('return-error-standing', err => {
			this.setState({
				standingData: {error: err.toString()},
			});
		});

		// fetch('/api/?api=' + api, {referrerPolicy: "no-referrer", cache: "no-store"})
		//     .then(res => {
		//         if (res.status === 200) {
		//             return res.json();
		//         } else {
		//             throw Error(`Can't retrieve information from server, ${res.status}`);
		//         }
		//     })
		//     .then(res => {
		//         this.setState({
		//             standingData: res,
		//         });
		//     })
		//     .catch(err => {
		//         this.setState({
		//             standingData: {error: err.toString()},
		//         });
		//     });
	};

	render() {
		const {standingData} = this.state;
		if (!standingData) return <Loading type="inside"/>;
		if (standingData.error) return <Errors type="error" message={standingData.error}/>;

		const {eventData} = this.props;
		const standingsTables = standingData.standingsTables[0];
		return (
			<div className="standing-table container">
				<div className="white-box mt-2 pt-3">
					<div className="row heading align-items-center">
						<div className="col col-img">
							<img
								src={"https://www.sofascore.com/u-tournament/" + standingsTables.tournament.uniqueId + "/logo"}
								alt={standingsTables.tournament.name}/>
						</div>
						<div className="col">
							<div className="name">{standingsTables.tournament.name}</div>
							<div className="country"><Trans>{standingsTables.category.name}</Trans></div>
						</div>
						{standingsTables.isLive ?
							<div className="col text-right live-label pr-4"><Trans>Live Table</Trans>!</div> : ""}
					</div>
					<div className="body pt-0">
						<table className="table">
							<thead>
							<tr>
								<th/>
								<th/>
								<th/>
								<th scope="col"><Trans>P</Trans></th>
								<th scope="col"><Trans>W</Trans></th>
								<th scope="col"><Trans>D</Trans></th>
								<th scope="col"><Trans>L</Trans></th>
								<th scope="col"><Trans>Pts</Trans></th>
							</tr>
							</thead>
							<tbody>
							{standingsTables.tableRows.map((item, index) => {
								return (
									<tr key={index}
									    className={(item.team.id === eventData.event.homeTeam.id ? "highlight-home " : "") + (item.team.id === eventData.event.awayTeam.id ? "highlight-away " : "") + (item.isLive ? ("live-game " + item.liveMatchStatus) : "")}>
										<td className={"order " + (item.promotion && standingsTables.promotionsColoring ? "promotion " + standingsTables.promotionsColoring[item.promotion.id].class : "")}>
											<span>{item.position}</span></td>
										<td className="team-logo"><img src={`https://www.sofascore.com/images/team-logo/football_${item.team.id}.png`} alt={item.team.name}/></td>
										<td className="team">{item.team.shortName}<span className="live-pulse"/></td>
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
		)
	}
}

export default Standings

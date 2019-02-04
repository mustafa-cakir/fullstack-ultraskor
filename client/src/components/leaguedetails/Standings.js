import React, {Component} from 'react';
import Loading from "../Loading";
import {Trans} from "react-i18next";

class Standings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			standingsTables: this.props.standingsTables,
			sortBy: 'position'
		};
	}

	componentDidUpdate() {
		this.props.swipeAdjustHeight()
	}

	tabSwitcherHandler(sortBy) {
		this.setState({
			sortBy: sortBy
		}, () => {
			//this.state.leagueData.standingsTables[0].tableRows.sort((a, b) => parseFloat(a[sortBy]) - parseFloat(b[sortBy]));
		});
	}

	render() {
		const {standingsTables} = this.state;
		console.log(standingsTables);
		if (!standingsTables) return <Loading/>;
		return (
			<div>
				{standingsTables.map((standingsTable, index) => {
					return (
						<div className="standing-table container" key={index}>
							<div className="white-box mt-2 pt-3">
								<div className="row heading align-items-center">
									<div className="col col-img">
										<img
											src={"https://www.sofascore.com/u-tournament/" + standingsTable.tournament.uniqueId + "/logo"}
											alt={standingsTable.tournament.name}/>
									</div>
									<div className="col">
										<div className="name">{standingsTable.tournament.name}</div>
										<div className="country"><Trans>{standingsTable.category.name}</Trans></div>
									</div>
									{standingsTable.isLive ?
										<div className="col text-right live-label pr-4"><Trans>Live Table</Trans>!
										</div> : ""}
								</div>
								<div className="body pt-0">
									<table className="table">
										<thead>
										<tr>
											<th className="order" scope="col"/>
											<th className="team" scope="col"/>
											<th className="team" scope="col"/>
											<th scope="col"><Trans>P</Trans></th>
											<th scope="col"><Trans>W</Trans></th>
											<th scope="col"><Trans>D</Trans></th>
											<th scope="col"><Trans>L</Trans></th>
											<th scope="col"><Trans>Pts</Trans></th>
										</tr>
										</thead>
										<tbody>
										{standingsTable.tableRows.map((row, index) => {
											return (
												<tr key={index}
												    className={(row.isLive ? ("live-game " + row.liveMatchStatus) : "")}>
													<td className={"order " + (row.promotion && standingsTable.promotionsColoring ? "promotion " + standingsTable.promotionsColoring[row.promotion.id].class : "")}>
														<span>{row.position}</span></td>
													<td className="team-logo"><img
														src={`https://www.sofascore.com/images/team-logo/football_${row.team.id}.png`}
														alt={row.team.name}/></td>
													<td className="team">{row.team.shortName}<span
														className="live-pulse"/>
													</td>
													<td className="matches">{row.totalFields.matchesTotal}</td>
													<td className="win">{row.totalFields.winTotal}</td>
													<td className="draw">{row.totalFields.drawTotal}</td>
													<td className="loss">{row.totalFields.lossTotal}</td>
													<td className="points">{row.totalFields.pointsTotal}</td>
												</tr>
											)
										})}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		)
	}
}

export default Standings

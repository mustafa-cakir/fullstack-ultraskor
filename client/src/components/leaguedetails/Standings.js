import React, {Component} from 'react';
import Loading from "../Loading";
import {Trans} from "react-i18next";

class Standings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			leagueData: this.props.leagueData,
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
		const {leagueData} = this.state;
		if (!leagueData) return <Loading/>;
		return (
			<div className="standing-table container">
				<div className="white-box mt-2 pt-3">
					<div className="row heading align-items-center">
						<div className="col col-img">
							<img
								src={"https://www.sofascore.com/u-tournament/" + leagueData.uniqueTournament.id + "/logo"}
								alt={leagueData.uniqueTournament.name}/>
						</div>
						<div className="col">
							<div className="name">{leagueData.uniqueTournament.name}</div>
							<div className="country"><Trans>{leagueData.category.name}</Trans></div>
						</div>
						{leagueData.standingsTables[0].isLive ?
							<div className="col text-right live-label pr-4"><Trans>Live Table</Trans>!</div> : ""}
					</div>
					{/*<ul className="horizontal-tab mt-4 mb-2">*/}
						{/*<li className={this.state.sortBy === 'position' ? "active" : ""}*/}
						    {/*onClick={() => this.tabSwitcherHandler("position")}>*/}
							{/*<span><Trans>Overall</Trans></span>*/}
						{/*</li>*/}
						{/*<li className={this.state.sortBy === 'homePosition' ? "active" : ""}*/}
						    {/*onClick={() => this.tabSwitcherHandler("homePosition")}>*/}
							{/*<span><Trans>Home</Trans></span>*/}
						{/*</li>*/}
						{/*<li className={this.state.sortBy === 'awayPosition' ? "active" : ""}*/}
						    {/*onClick={() => this.tabSwitcherHandler("awayPosition")}>*/}
							{/*<span><Trans>Away</Trans></span>*/}
						{/*</li>*/}
					{/*</ul>*/}
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
							{leagueData.standingsTables[0].tableRows.map((item, index) => {
								return (
									<tr key={index}
									    className={(item.isLive ? ("live-game " + item.liveMatchStatus) : "")}>
										<td className={"order " + (item.promotion && leagueData.standingsTables[0].promotionsColoring ? "promotion " + leagueData.standingsTables[0].promotionsColoring[item.promotion.id].class : "")}>
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

import React, {Component} from 'react';
import Loading from "../Loading";
import {Trans} from "react-i18next";
import Errors from "../common/Errors";

class Standings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			standingData: null,
			tab: 'Total'
		};
	}

	componentDidMount() {
		const {eventData} = this.props;
		this.getData("/tournament/" + eventData.event.tournament.id + "/" + eventData.event.season.id + "/standings/tables/json");
	};

	componentDidUpdate() {
		this.props.swipeAdjustHeight()
	}

	tabSwitcherHandler(tab) {
		this.setState({
			tab: tab
		});
	}

	getData = api => {
		// const {socket} = this.props;

		fetch(`/api/?query=${api}&page=standing`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				this.setState({
					standingData: res,
				});
			})
			.catch(err => {
				this.setState({
					standingData: {error: err.toString()},
				});
			});

		// socket.emit('get-main', options);
		//
		// socket.once('return-main-standing', res => {
		// 	this.setState({
		// 		standingData: res,
		// 	});
		// });
		//
		// socket.on('return-error-standing', err => {
		// 	this.setState({
		// 		standingData: {error: err.toString()},
		// 	});
		// });
	};

	render() {
		const {standingData, tab} = this.state;
		if (!standingData) return <Loading type="inside"/>;
		if (standingData.error) return <Errors type="error" message={standingData.error}/>;

		const {eventData} = this.props;
		const standingsTables = standingData.standingsTables[0];
		const positionLabel = tab === "Home" ? "homePosition" : tab === "Away" ? "awayPosition" : "position";
		const tabLower = tab.toLowerCase();
		standingsTables.tableRows.sort((a, b) => parseFloat(a[positionLabel]) - parseFloat(b[positionLabel]));
		return (
			<div className="standing-table container">
				<div className="white-box mt-2 pt-3">
					<div className="row league-heading align-items-center">
						<div className="col col-img">
							<img
                                src={window.ImageServer + '/images/?url=/u-tournament/' + standingsTables.tournament.uniqueId + '/logo'}
								alt={standingsTables.tournament.name}/>
						</div>
						<div className="col">
							<div className="name">{standingsTables.tournament.name}</div>
							<div className="country"><Trans>{standingsTables.category.name}</Trans></div>
						</div>
						{standingsTables.isLive ?
							<div className="col text-right live-label pr-4"><Trans>Live Table</Trans>!</div> : ""}
					</div>
					<ul className="horizontal-tab mt-4 mb-1">
						<li className={tab === 'Total' ? "active" : ""}
						    onClick={() => this.tabSwitcherHandler('Total')}>
							<span><Trans>Overall</Trans></span>
						</li>
						<li className={tab === 'Home' ? "active" : ""}
						    onClick={() => this.tabSwitcherHandler('Home')}>
							<span><Trans>Home</Trans></span>
						</li>
						<li className={tab === 'Away' ? "active" : ""}
						    onClick={() => this.tabSwitcherHandler('Away')}>
							<span><Trans>Away</Trans></span>
						</li>
					</ul>
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
								<th scope="col">Av</th>
								<th scope="col"><Trans>Pts</Trans></th>
							</tr>
							</thead>
							<tbody>
							{standingsTables.tableRows.map((row, index) => {
								return (
									<tr key={index}
									    className={(row.team.id === eventData.event.homeTeam.id ? "highlight-home " : "") + (row.team.id === eventData.event.awayTeam.id ? "highlight-away " : "") + (row.isLive ? ("live-game " + row.liveMatchStatus) : "")}>
										<td className={"order " + (row.promotion && standingsTables.promotionsColoring ? "promotion " + standingsTables.promotionsColoring[row.promotion.id].class : "")}>
											<span>{row.position}</span></td>
										<td className="team-logo"><img
											src={`${window.ImageServer}/images/team-logo/football_${row.team.id}`}
											alt={row.team.name}/></td>
										<td className="team"><span className="line-clamp">{row.team.shortName}</span><span className="live-pulse"/></td>
										<td className="matches">{row[`${tabLower}Fields`][`matches${tab}`]}</td>
										<td className="win">{row[`${tabLower}Fields`][`win${tab}`]}</td>
										<td className="draw">{row[`${tabLower}Fields`][`draw${tab}`]}</td>
										<td className="loss">{row[`${tabLower}Fields`][`loss${tab}`]}</td>
										<td className="goal-diff">{row[`${tabLower}Fields`][`goalDiff${tab}`]}</td>
										<td className="points">{row[`${tabLower}Fields`][`points${tab}`]}</td>
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

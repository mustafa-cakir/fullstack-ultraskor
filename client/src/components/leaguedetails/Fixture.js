import React, {Component} from 'react';
import Tournament from "../common/Tournament";
import Icon from "../common/Icon";
import {Trans} from "react-i18next";
import Loading from "../Loading";

class Fixture extends Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0,
			loading: false,
			isDropdown: false,
			weekMatches: this.props.events.weekMatches,
			currentWeek: this.props.events.weekMatches.data.index
		};
	}

	initSocket(start, end) {
		const {leagueid, seasonid} = this.props.params;
		const {socket} = this.props;
		let options = {
			api: `/u-tournament/${leagueid}/season/${seasonid}/matches/week/${start}/${end}`,
			page: 'leaguedetails-fixture-week-matches'
		};
		socket.emit("get-main", options);
		socket.on('return-main-leaguedetails-fixture-week-matches', res => {
			console.log(res.weekMatches);
			this.setState({
				loading: false,
				weekMatches: res.weekMatches
			});
		});
	}

	componentDidMount() {

	}

	weekClicked(week) {
		this.setState({
			currentWeek: week.weekIndex,
			isDropdown: false,
			loading: true
		}, () => {
			this.initSocket(week.weekStartDate, week.weekEndDate);
		});
	}

	render() {
		const {weekMatches, currentWeek, loading} = this.state;

		const prevWeek = this.props.events.weeks.filter(item => {
			return item.weekIndex === currentWeek - 1;
		})[0];
		const nextWeek = this.props.events.weeks.filter(item => {
			return item.weekIndex === currentWeek + 1;
		})[0];

		//console.log(prevWeek, nextWeek);
		return (
			<div className="container">
				<div className="white-box mt-2">
					<div className="px-3">
						<div className="row heading align-items-center">
							<div className={"col col-3 col-nav " + (!prevWeek ? "not-exist" : "")} onClick={() => prevWeek ? this.weekClicked(prevWeek) : ""}>
								<Icon name="fas fa-chevron-left"/> <Trans>Prev</Trans>
							</div>
							<div
								className={"col px-0 col-6 text-center col-dropdown " + (this.state.isDropdown ? "open" : "")}>
								<div className="week-label"
								     onClick={() => this.setState({isDropdown: !this.state.isDropdown})}>
									{currentWeek}<Trans>th Week</Trans><Icon name="fas fa-caret-down"/>
									<div className="dropdown">
										<ul>
											{this.props.events.weeks.map((week, index) => {
												return (
													<li key={index}
													    className={(week.weekIndex === currentWeek ? "active" : "") + (week.weekIndex === this.props.events.weekMatches.data.index ? " this-week" : "")}
													    onClick={() => this.weekClicked(week)}>{week.weekIndex}<Trans>th
														Week</Trans></li>
												)
											})}
										</ul>
									</div>
								</div>
							</div>
							<div className={"col col-3 text-right col-nav " + (!nextWeek ? "not-exist" : "")} onClick={() => nextWeek ? this.weekClicked(nextWeek) : ""}>
								<Trans>Next</Trans> <Icon name="fas fa-chevron-right"/>
							</div>
						</div>
					</div>
					<div className="fixture-list">
						{loading ? <Loading type="inside"/> : ""}
						<Tournament tournaments={weekMatches.tournaments}/>
					</div>
				</div>
			</div>
		)
	}
}

export default Fixture

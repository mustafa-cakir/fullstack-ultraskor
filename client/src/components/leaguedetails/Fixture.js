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
			roundName: this.props.events.roundMatches.data.roundName,
			roundMatches: this.props.events.roundMatches,
			currentRound: this.props.events.roundMatches.data.index
		};
	}

	initSocket(round, name) {
		const {leagueid, seasonid} = this.props.params;
		const {socket} = this.props;
		let options = {
			api: `/u-tournament/${leagueid}/season/${seasonid}/matches/round/${round}${name ? "/" + name : ""}`,
			page: 'leaguedetails-fixture-round-matches'
		};
		socket.emit("get-main", options);
		socket.on('return-main-leaguedetails-fixture-round-matches', res => {
			console.log(res.roundMatches);
			this.setState({
				loading: false,
				roundMatches: res.roundMatches
			});
		});
	}

	componentDidMount() {

	}

	roundClicked(round) {
		this.setState({
			roundName: round.name,
			currentRound: round.round,
			isDropdown: false,
			loading: true
		}, () => {
			this.initSocket(round.round, round.name);
		});
	}

	render() {
		const {roundMatches, currentRound, loading, roundName} = this.state;

		const currentRoundIndex = this.props.events.rounds.findIndex(x => x.round === currentRound);
		const prevRound = this.props.events.rounds[currentRoundIndex - 1];
		const nextRound = this.props.events.rounds[currentRoundIndex + 1];

		console.log(this.props.events.rounds[currentRoundIndex], prevRound, nextRound);
		return (
			<div className="container">
				<div className="white-box mt-2">
					<div className="px-3">
						<div className="row heading align-items-center">
							<div className={"col col-3 col-nav " + (!prevRound ? "not-exist" : "")} onClick={() => prevRound ? this.roundClicked(prevRound) : ""}>
								<Icon name="fas fa-chevron-left"/> <Trans>Prev</Trans>
							</div>
							<div
								className={"col px-0 col-6 text-center col-dropdown " + (this.state.isDropdown ? "open" : "")}>
								<div className="week-label"
								     onClick={() => this.setState({isDropdown: !this.state.isDropdown})}>
									{roundName ? <Trans>{roundName}</Trans> : <span>{currentRound}<Trans>th Week</Trans></span>} <Icon name="fas fa-caret-down"/>
									<div className="dropdown">
										<ul>
											{this.props.events.rounds.map((round, index) => {
												return (
													<li key={index}
													    className={(round.round === currentRound ? "active" : "") + (round.round === this.props.events.roundMatches.data.index ? " this-round" : "")}
													    onClick={() => this.roundClicked(round)}>{round.name? <Trans>{round.name}</Trans> : <span>{round.round}<Trans>th
														Week</Trans></span>}</li>
												)
											})}
										</ul>
									</div>
								</div>
							</div>
							<div className={"col col-3 text-right col-nav " + (!nextRound ? "not-exist" : "")} onClick={() => nextRound ? this.roundClicked(nextRound) : ""}>
								<Trans>Next</Trans> <Icon name="fas fa-chevron-right"/>
							</div>
						</div>
					</div>
					<div className="fixture-list">
						{loading ? <Loading type="inside"/> : ""}
						<Tournament tournaments={roundMatches.tournaments}/>
					</div>
				</div>
			</div>
		)
	}
}

export default Fixture

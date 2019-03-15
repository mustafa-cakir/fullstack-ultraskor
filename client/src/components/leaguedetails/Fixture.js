import React, {Component} from 'react';
import Tournament from "../common/Tournament";
import Icon from "../common/Icon";
import {Trans} from "react-i18next";
import Loading from "../Loading";
import Errors from "../common/Errors";

class Fixture extends Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0,
			loading: false,
			isDropdown: false,
			roundName: this.props.events.roundMatches.data.roundName,
			roundMatches: this.props.events.roundMatches,
			currentRound: this.props.events.roundMatches.data.roundName ? this.props.events.roundMatches.data.roundName : this.props.events.roundMatches.data.index
		};
	}

	initGetData(round, name) {
		const {leagueid, seasonid} = this.props.params;

		let api =  `/u-tournament/${leagueid}/season/${seasonid}/matches/round/${round}${name ? "/" + name : ""}`;

		fetch(`/api/?query=${api}&page=leaguedetailsFixture`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				this.setState({
					loading: false,
					roundMatches: res.roundMatches
				}, () => {
				    this.props.swipeAdjustHeight();
                });
			})
			.catch(err => {
				this.setState({
					roundMatches: {error: err.toString()},
				}, () => {
                    this.props.swipeAdjustHeight();
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
			this.initGetData(round.round, round.name);
		});
	}

	render() {
		const {roundMatches, currentRound, loading, roundName} = this.state;

		if (roundMatches.error) return <Errors type="error" message={roundMatches.error}/>;
        const currentRoundIndex = this.props.events.rounds.findIndex(x => x[isNaN(currentRound) ? "name" : "round"] === currentRound);
		const prevRound = this.props.events.rounds[currentRoundIndex - 1];
		const nextRound = this.props.events.rounds[currentRoundIndex + 1];

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
											    let isActive = null;
											    let isThisTournament = null;

											    if (roundName) {
                                                    if (round.name && round.name === roundName) isActive = true;
                                                } else if (!round.name && round.round === currentRound) isActive = true;

                                                if (this.props.events.roundMatches.data.roundName) {
                                                    if (round.name === this.props.events.roundMatches.data.roundName) isThisTournament = true;
                                                } else if (round.round === this.props.events.roundMatches.data.index) isThisTournament = true;

												return (
													<li key={index}
													    className={(isActive ? "active" : "") + (isThisTournament ? " this-round" : "")}
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
					<div className="fixture-list position-relative">
						{loading ? <Loading type="inside"/> : ""}
						<Tournament tournaments={roundMatches.tournaments} from="fixture"/>
					</div>
				</div>
			</div>
		)
	}
}

export default Fixture

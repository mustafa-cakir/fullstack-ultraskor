import React, {Component} from 'react';
import Icon from "./Icon";
import Mp3Goal from "../assets/sound/goal.mp3";
import Mp3HighLow from "../assets/sound/whistle_high_low.mp3";
import Mp3Finished from "../assets/sound/finish.mp3";
import Mp3Short from "../assets/sound/whistle_short.mp3";
import {Trans, withNamespaces} from "react-i18next";

class FlashScoreBoard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			flashScoreBoardData: null,
			flashScoreMuted: false,
			flashScoreShrinked: false,
			flashData: null
		};
		this.handleSocketFlashScoreChanges = this.handleSocketFlashScoreChanges.bind(this);
		this.flashScoreTimer = null;
		this.socket = this.props.socket;
		this.sound = new Audio(Mp3Goal);
		this.goalCancelledSoundAudio = new Audio(Mp3Finished);
	}

	componentWillUnmount() {
		this.socket.emit('is-flashscore-active', false);
		clearTimeout(this.flashScoreTimer);
	}

	componentDidMount() {
		this.analyzeSessionStorage();
		this.socket.emit('is-flashscore-active', true);

		this.socket.removeListener('return-flashcore-changes', this.handleSocketFlashScoreChanges);
		this.socket.on('return-flashcore-changes', this.handleSocketFlashScoreChanges);
	}

	playSound(type) {
		if (!this.state.flashScoreMuted) {
			setTimeout(() => {
				if (type === "goal")  new Audio(Mp3Goal).play();
				else if (type === "goal-cancelled") new Audio(Mp3HighLow).play();
				else if (type === "red-card") new Audio(Mp3Short).play();
			}, 500);
		}
	}

	analyzeSessionStorage() {
		let storageFlashScoreMuted = JSON.parse(localStorage.getItem('FlashScoreMuted')),
			storageFlashScoreShrinked = JSON.parse(localStorage.getItem('flashScoreShrinked'));

		if (storageFlashScoreShrinked || storageFlashScoreMuted) {
			this.setState({
				flashScoreMuted: storageFlashScoreMuted,
				flashScoreShrinked: storageFlashScoreShrinked
			});
		}
	}


	handleSocketFlashScoreChanges(res) {
		if (res && res.length > 0) {
			res.forEach(x => {
				x.forEach(change => {
					console.log(change);
					if (change.kind === "E" && change.event && change.event.id) {
						if ((change.path[0] === "homeScore" || change.path[0] === "awayScore") && change.path[1] === "current") { // home or away scored!!
							if (parseInt(change.rhs) > parseInt(change.lhs)) {
								change.desc = <Trans>GOOAL!</Trans>;
								this.playSound('goal');
							} else {
								change.desc = <Trans>Goal Cancelled</Trans>;
								this.playSound('goal-cancelled');
							}
						}
						if (change.path[0] === "homeRedCards" || change.path[0] === "awayRedCards") {
							change.desc = <Trans>Red Card</Trans>;
							this.playSound('red-card');
						}
						if (change.path[0] === "homeRedCards" || change.path[0] === "awayRedCards") {
							change.desc = <Trans>Red Card</Trans>;
							this.playSound('red-card');
						}
						if (change.path[0] === "status") { // status changed, HT or FT
							//
						}
						this.setState({
							flashData: change
						}, () => {
							clearTimeout(this.flashScoreTimer);
							this.flashScoreTimer = setTimeout(() => {
								this.setState({flashData: null})
							}, 150000);
						});
					}
				});
			});
		}
	}

	shrinkToggle() {
		this.setState({
			flashScoreShrinked: !this.state.flashScoreShrinked
		}, () => {
			localStorage.setItem('flashScoreShrinked', this.state.flashScoreShrinked);
		})
	}

	muteToggle() {
		this.setState({
			flashScoreMuted: !this.state.flashScoreMuted
		}, () => {
			localStorage.setItem('FlashScoreMuted', this.state.flashScoreMuted);
		})
	}

	render() {
		const {flashData, flashScoreShrinked, flashScoreMuted} = this.state;
		if (!flashData) return false;
		return (
			<div className={"flash-score-board " + (flashScoreShrinked ? "shrink" : "")}>
				<div className="container">
					<div className="shrink-btn" onClick={this.shrinkToggle.bind(this)}><Icon
						name={"fas fa-chevron-" + (flashScoreShrinked ? "up" : "down")}/></div>
					<div className="row align-items-center content">
						<div className="col col-minute">{flashData.event.statusDescription}'</div>
						<div className="col home-team text-center">
							<img
								src={`https://www.sofascore.com/images/team-logo/football_${flashData.event.homeTeam.id}.png`}
								className="team-logo"
								alt={flashData.event.homeTeam.name}/>
							<div className="team-name">{flashData.event.homeTeam.name}</div>
						</div>
						<div className="col col-score">
							<div className="desc">{flashData.desc ? flashData.desc : ""}</div>
							<span
								className={"home " + (flashData.path[0] === "homeScore" ? "flash-blinker-5" : "")}>{flashData.event.homeScore.current}</span>
							<span className="separator">:</span>
							<span
								className={"away " + (flashData.path[0] === "awayScore" ? "flash-blinker-5" : "")}>{flashData.event.awayScore.current}</span>
						</div>
						<div className="col away-team text-center">
							<img
								src={`https://www.sofascore.com/images/team-logo/football_${flashData.event.awayTeam.id}.png`}
								className="team-logo"
								alt={flashData.event.awayTeam.name}/>
							<div className="team-name">{flashData.event.awayTeam.name}</div>
						</div>
						<div className={"col col-sound " + (flashScoreMuted ? "muted" : "")}
						     onClick={this.muteToggle.bind(this)}><Icon
							name={"fas fa-volume-" + (flashScoreMuted ? "off" : "up")}/></div>
					</div>
				</div>
			</div>
		)
	}
}

export default withNamespaces('translations')(FlashScoreBoard)

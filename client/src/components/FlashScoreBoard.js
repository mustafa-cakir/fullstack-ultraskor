import React, {Component} from 'react';
import Icon from "./Icon";
import GoalMp3 from "../assets/goal.mp3";

class FlashScoreBoard extends Component {
	constructor(props) {
		super(props);
		this.goalSound = React.createRef();
		this.state = {
			flashScoreBoardData: null,
			flashScoreMuted: false,
			flashScoreShrinked: false,
			flashData: null
		};
		this.handleSocketFlashScoreChanges = this.handleSocketFlashScoreChanges.bind(this);
		this.flashScoreTimer = null;
		this.socket = this.props.socket;
		this.goalSoundAudio = new Audio(GoalMp3);
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
					if (change.kind === "E" && change.event && change.event.id) {
						if ((change.path[0] === "homeScore" || change.path[0] === "awayScore") && change.path[1] === "current") { // home or away scored!!
							this.setState({
								flashData: change
							}, () => {
								if (!this.state.flashScoreMuted) this.goalSoundAudio.play();
								clearTimeout(this.flashScoreTimer);
								this.flashScoreTimer = setTimeout(() => {
									this.setState({flashData: null})
								}, 10000);
							});

						}
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
							<span
								className={"home " + (flashData.type === "homeScore" ? "flash-blinker-5" : "")}>{flashData.event.homeScore.current}</span>
							<span className="separator">:</span>
							<span
								className={"away " + (flashData.type === "awayScore" ? "flash-blinker-5" : "")}>{flashData.event.awayScore.current}</span>
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

export default FlashScoreBoard

import React, {Component} from 'react';
import Icon from "./Icon";

class FlashScoreBoard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0,
			shrink: false,
			hidden: false
		};
		this.containerEl = React.createRef();
		this.timer = null;
		this.hidden = false;
	}

	componentDidMount() {
		this.startTimer()
	}

	componentDidUpdate() {
		this.containerEl.current.classList.remove('hidden');
		clearTimeout(this.timer);
		this.startTimer();
	}

	shrinkToggle() {
		this.setState({
			shrink: !this.state.shrink
		})
	}

	startTimer() {
		this.timer = setTimeout(()=> {
			this.containerEl.current.classList.add('hidden');
		}, 10000);
	}

	render() {
		const {flashData} = this.props;
		if (this.hidden) return null;
		return (
			<div className={"flash-score-board " + (this.state.shrink ? "shrink" : "")} ref={this.containerEl}>
				<div className="container">
					<div className="shrink-btn" onClick={this.shrinkToggle.bind(this)}><Icon name={"fas fa-chevron-" + (this.state.shrink ? "up" : "down")}/></div>
					<div className="row align-items-center content">
						<div className="col col-minute">{flashData.event.statusDescription}'</div>
						<div className="col home-team text-center">
							<img src={`https://www.sofascore.com/images/team-logo/football_${flashData.event.homeTeam.id}.png`}
							     className="team-logo"
							     alt={flashData.event.homeTeam.name}/>
							<div className="team-name">{flashData.event.homeTeam.name}</div>
						</div>
						<div className="col col-score">
							<span className={"home " + (flashData.type === "homeScore" ? "flash-blinker-5" : "")}>{flashData.event.homeScore.current}</span>
							<span className="separator">:</span>
							<span className={"away " + (flashData.type === "awayScore" ? "flash-blinker-5" : "")}>{flashData.event.awayScore.current}</span>
						</div>
						<div className="col away-team text-center">
							<img src={`https://www.sofascore.com/images/team-logo/football_${flashData.event.awayTeam.id}.png`}
							     className="team-logo"
							     alt={flashData.event.awayTeam.name}/>
							<div className="team-name">{flashData.event.awayTeam.name}</div>
							</div>
						<div className="col col-sound"><Icon name="fas fa-volume-up"/></div>
					</div>
				</div>
			</div>
		)
	}
}

export default FlashScoreBoard

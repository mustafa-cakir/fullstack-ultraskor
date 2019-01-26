import React, {Component} from 'react';
import Icon from "./Icon";

class FlashScoreBoard extends Component {
	shrinkToggle() {
        this.props.updateParentState({
            flashScoreShrink: !this.props.flashScoreShrink
        }).then(()=> {
            localStorage.setItem('FlashScoreShrink', JSON.stringify(this.props.flashScoreShrink));
        });
    }

	muteToggle() {
	    this.props.updateParentState({
            flashScoreMuted: !this.props.flashScoreMuted
        }).then(()=>{
            localStorage.setItem('FlashScoreMuted', JSON.stringify(this.props.flashScoreMuted));
        });
    }

	render() {
		const {flashData, flashScoreShrink, flashScoreMuted} = this.props;
		return (
			<div className={"flash-score-board " + (flashScoreShrink ? "shrink" : "")}>
                <div className="container">
					<div className="shrink-btn" onClick={this.shrinkToggle.bind(this)}><Icon name={"fas fa-chevron-" + (flashScoreShrink ? "up" : "down")}/></div>
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
						<div className={"col col-sound " + (flashScoreMuted ? "muted" : "")}  onClick={this.muteToggle.bind(this)}><Icon name={"fas fa-volume-" + (flashScoreMuted ? "off" : "up")}/></div>
					</div>
				</div>
			</div>
		)
	}
}

export default FlashScoreBoard

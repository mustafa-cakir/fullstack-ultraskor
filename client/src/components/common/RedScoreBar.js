import React, {Component} from 'react';
import Icon from "./Icon";
import {withTranslation} from "react-i18next";
import { Link } from "react-router-dom"
import {generateSlug} from "../../Helper";

class RedScoreBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        	data: null
        }
    }

    componentDidMount() {
	    let { redScoreBarIncident: data, t } = this.props;

	    if (data.type === "status_update") {
		    if (data.event.status.code === 6) {
			    this.playSound('red-card');
			    data.desc = t("Game Started");
		    } else if (data.event.status.code === 31) {
			    this.playSound('half-time');
			    data.desc = t("Half Time Result");
		    } else if (data.event.status.code === 7) {
			    this.playSound('half-time');
			    data.desc = t("2nd Half Started");
		    } else if (data.event.status.code === 100) {
			    this.playSound('finished');
			    data.desc = t("Full Time Result");
		    } else if (data.event.status.code === 60) {
			    data.desc = t("Postponed");
		    } else if (data.event.status.code === 70) {
			    data.desc = t("Cancelled");
		    }
	    } else if (data.type === "away_redcard" || data.type === "home_redcard") {
		    this.playSound('goal-cancelled');
		    data.desc = t("Red Card")
	    } else if (data.type === "home_scored" || data.type === "away_scored") {
		    this.playSound('goal');
		    data.desc = t("GOOAL!")
	    } else if (data.type === "home_scored_cancel" || data.type === "away_scored_cancel") {
		    this.playSound('goal-cancelled');
		    data.desc = t("Goal Cancelled");
	    }

	    this.setState({
		    data: data
	    });
    }

    playSound(type) {
        if (!this.props.redScoreMuted) {
            setTimeout(() => {
                if (type === "goal") this.props.audioFiles.goal.play();
                else if (type === "cancel") this.props.audioFiles.cancel.play();
                else if (type === "finish") this.props.audioFiles.finish.play();
                else if (type === "red-card") this.props.audioFiles.redcard.play();
                else if (type === "half-time") this.props.audioFiles.halftime.play();
                else if (type === "start") this.props.audioFiles.start.play();
            }, 100);
        }
    }

    shrinkToggle() {
    	this.props.updateParentState({
		    redScoreShrinked: !this.props.redScoreShrinked
	    }, true);
    }

    muteToggle() {
	    this.props.updateParentState({
		    redScoreMuted: !this.props.redScoreMuted
	    }, true);
    }

    render() {
    	const { data } = this.state;
    	if (!data) return false;
	    const {t, redScoreShrinked, redScoreMuted} = this.props;
        const link = `/${t('match')}/${generateSlug(t(data.event.homeTeam.name) + '-' + t(data.event.awayTeam.name))}-${t('live-score')}-${data.event.id}`;
        return (
            <div className={"flash-score-board " + (redScoreShrinked ? "shrink" : "")}>
                <div className="container">
                    <div className="shrink-btn" onClick={this.shrinkToggle.bind(this)}><Icon
                        name={"fas fa-chevron-" + (redScoreShrinked ? "up" : "down")}/></div>
                    <div className="row align-items-center content">
                        <div className="col col-minute">{data.event.statusDescription}'</div>
                        <Link to={{
                                  pathname: link,
                                  state: {isPrev: true}
                              }} className="col home-team text-center">
                            <img
                                src={`${window.ImageServer}/images/team-logo/football_${data.event.homeTeam.id}.png`}
                                className="team-logo"
                                alt={t(data.event.homeTeam.name)}/>
                            <div className="team-name">{t(data.event.homeTeam.name)}</div>
                        </Link>
                        <Link to={{
                            pathname: link,
                            state: {isPrev: true}
                        }} className="col col-score">
                            {data.type === "home_redcard" ? <div
                                className="red-card home flash-blinker-5">{data.event.homeRedCards}</div> : ""}
                            {data.type === "away_redcard" ? <div
                                className="red-card away flash-blinker-5">{data.event.awayRedCards}</div> : ""}
                            <div className="desc">{data.desc ? data.desc : ""}</div>
                            <span className={"home " + (data.type === "home_scored" || data.type === "home_scored_cancel" ? "flash-blinker-5" : "")}>{data.event.homeScore.current || 0}</span>
                            <span className="separator">:</span>
                            <span className={"away " + (data.type === "away_scored" || data.type === "away_scored_cancel" ? "flash-blinker-5" : "")}>{data.event.awayScore.current || 0}</span>
                        </Link>
                        <Link to={{
                            pathname: link,
                            state: {isPrev: true}
                        }} className="col away-team text-center">
                            <img
                                src={`${window.ImageServer}/images/team-logo/football_${data.event.awayTeam.id}.png`}
                                className="team-logo"
                                alt={t(data.event.awayTeam.name)}/>
                            <div className="team-name">{t(data.event.awayTeam.name)}</div>
                        </Link>
                        <div className={"col col-sound " + (redScoreMuted ? "muted" : "")}
                             onClick={this.muteToggle.bind(this)}><Icon
                            name={"fas fa-volume-" + (redScoreMuted ? "off" : "up")}/></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withTranslation('translations')(RedScoreBar)

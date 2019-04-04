import React, {Component} from 'react';
import Icon from "./Icon";
import {withTranslation} from "react-i18next";
import { Link } from "react-router-dom"
import {generateSlug} from "../../Helper";

class FlashScoreBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flashScoreBoardData: null,
            flashScoreMuted: false,
            flashScoreShrinked: false,
            flashData: null,
            disconnected: false
        };
        this.handleSocketFlashScoreChanges = this.handleSocketFlashScoreChanges.bind(this);
        this.onSocketConnect = this.onSocketConnect.bind(this);
        this.removeSocketEvents = this.removeSocketEvents.bind(this);
        this.onSocketDisconnect = this.onSocketDisconnect.bind(this);
        this.flashScoreTimer = null;
        this.socket = this.props.socket;
    }

    componentDidMount() {
        this.analyzeSessionStorage();
        this.initSocket();
    }

    componentWillUnmount() {
        this.removeSocketEvents();
    }

    removeSocketEvents() {
        clearTimeout(this.flashScoreTimer);
        clearInterval(this.getUpdatesFlashScoresInterval);
        this.socket.removeListener('disconnect', this.onSocketDisconnect);
        this.socket.removeListener('return-error-updates', this.onSocketDisconnect);
        this.socket.removeListener('connect', this.onSocketConnect);
        this.socket.removeListener('return-flashcore-changes', this.handleSocketFlashScoreChanges);
    }

    initSocket() {
        this.socket.on('disconnect', this.onSocketDisconnect);
        this.socket.on('return-error-updates', this.onSocketDisconnect);

        clearInterval(this.getUpdatesFlashScoresInterval);
        this.initGetUpdatesFlashScores();
    }

    initGetUpdatesFlashScores() {
        this.socket.on('return-flashcore-changes', this.handleSocketFlashScoreChanges);
        this.getUpdatesFlashScoresInterval = setInterval(() => {  // init after 10 seconds
            this.socket.emit('get-flashcore-changes');
        }, 20000);
    }

    onSocketDisconnect() {
        this.removeSocketEvents();
        this.socket.on('connect', this.onSocketConnect);
        this.setState({
            disconnected: true
        });
    }

    onSocketConnect() {
        console.log('socket connected!');
        this.socket.removeListener('connect', this.onSocketConnect);
        if (this.state.disconnected) {
            this.initSocket();
            this.setState({
                disconnected: false
            });
        }
    }

    playSound(type) {
        if (!this.state.flashScoreMuted) {
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
        const {t} = this.props;
        if (res && res.length > 0) {
            res.forEach(x => {
                x.forEach(change => {
                    //console.log(change);
                    if (change.kind === "E" && change.event && change.event.id) {
                        if ((change.path[0] === "homeScore" || change.path[0] === "awayScore") && change.path[1] === "current") { // home or away scored!!
                            if (parseInt(change.rhs) > parseInt(change.lhs)) {
                                change.desc = t("GOOAL!");
                                this.playSound('goal');
                            } else {
                                change.desc = t("Goal Cancelled");
                                this.playSound('goal-cancelled');
                            }
                        }
                        if (change.path[0] === "homeRedCards" || change.path[0] === "awayRedCards") {
                            change.desc = t("Red Card");
                            this.playSound('red-card');
                        }
                        if (change.path[0] === "status" && change.path[1] === "code") { // status update
                            if (change.lhs === 0 && change.rhs === 6) { // game started
                                change.desc = t("Game Started");
                                this.playSound('red-card');
                            } else if (change.lhs === 6 && change.rhs === 31) { // half time
                                change.desc = t("Half Time Result");
                                this.playSound('half-time');
                            } else if (change.lhs === 31 && change.rhs === 7) { // 2nd half started
                                change.desc = t("2nd Half Started");
                                this.playSound('half-time');
                            } else if (change.rhs === 100) { // full time
                                change.desc = t("Full Time Result");
                                this.playSound('finished');
                            }
                        }

                        if (change.desc) {
                            this.setState({
                                flashData: change
                            }, () => {
                                clearTimeout(this.flashScoreTimer);
                                this.flashScoreTimer = setTimeout(() => {
                                    this.setState({flashData: null})
                                }, 15000);
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
        const {t} = this.props;
        if (!flashData) return false;
        const link = `/${t('match')}/${generateSlug(t(flashData.event.homeTeam.name) + '-' + t(flashData.event.awayTeam.name))}-${t('live-score')}-${flashData.event.id}`;
        return (
            <div className={"flash-score-board " + (flashScoreShrinked ? "shrink" : "")}>
                <div className="container">
                    <div className="shrink-btn" onClick={this.shrinkToggle.bind(this)}><Icon
                        name={"fas fa-chevron-" + (flashScoreShrinked ? "up" : "down")}/></div>
                    <div className="row align-items-center content">
                        <div className="col col-minute">{flashData.event.statusDescription}'</div>
                        <Link to={{
                                  pathname: link,
                                  state: {isPrev: true}
                              }} className="col home-team text-center">
                            <img
                                src={`${window.ImageServer}/images/team-logo/football_${flashData.event.homeTeam.id}.png`}
                                className="team-logo"
                                alt={t(flashData.event.homeTeam.name)}/>
                            <div className="team-name">{t(flashData.event.homeTeam.name)}</div>
                        </Link>
                        <Link to={{
                            pathname: link,
                            state: {isPrev: true}
                        }} className="col col-score">
                            {flashData.path[0] === "homeRedCards" ? <div
                                className="red-card home flash-blinker-5">{flashData.event.homeRedCards}</div> : ""}
                            {flashData.path[0] === "awayRedCards" ? <div
                                className="red-card away flash-blinker-5">{flashData.event.awayRedCards}</div> : ""}
                            <div className="desc">{flashData.desc ? flashData.desc : ""}</div>
                            <span
                                className={"home " + (flashData.path[0] === "homeScore" ? "flash-blinker-5" : "")}>{flashData.event.homeScore.current}</span>
                            <span className="separator">:</span>
                            <span
                                className={"away " + (flashData.path[0] === "awayScore" ? "flash-blinker-5" : "")}>{flashData.event.awayScore.current}</span>
                        </Link>
                        <Link to={{
                            pathname: link,
                            state: {isPrev: true}
                        }} className="col away-team text-center">
                            <img
                                src={`${window.ImageServer}/images/team-logo/football_${flashData.event.awayTeam.id}.png`}
                                className="team-logo"
                                alt={t(flashData.event.awayTeam.name)}/>
                            <div className="team-name">{t(flashData.event.awayTeam.name)}</div>
                        </Link>
                        <div className={"col col-sound " + (flashScoreMuted ? "muted" : "")}
                             onClick={this.muteToggle.bind(this)}><Icon
                            name={"fas fa-volume-" + (flashScoreMuted ? "off" : "up")}/></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withTranslation('translations')(FlashScoreBoard)

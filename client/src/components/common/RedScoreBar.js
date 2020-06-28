import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { generateSlug } from '../../core/utils/helper';

class RedScoreBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
        };
    }

    componentDidMount() {
        const { redScoreBarIncident: data, t } = this.props;

        if (data.type === 'status_update') {
            if (data.event.status.code === 6) {
                this.playSound('red-card');
                data.desc = t('Game Started');
            } else if (data.event.status.code === 31) {
                this.playSound('half-time');
                data.desc = t('Half Time Result');
            } else if (data.event.status.code === 7) {
                this.playSound('half-time');
                data.desc = t('2nd Half Started');
            } else if (data.event.status.code === 100) {
                this.playSound('finished');
                data.desc = t('Full Time Result');
            } else if (data.event.status.code === 60) {
                data.desc = t('Postponed');
            } else if (data.event.status.code === 70) {
                data.desc = t('Cancelled');
            }
        } else if (data.type === 'away_redcard' || data.type === 'home_redcard') {
            this.playSound('goal-cancelled');
            data.desc = t('Red Card');
        } else if (data.type === 'home_scored' || data.type === 'away_scored') {
            this.playSound('goal');
            data.desc = t('GOOAL!');
        } else if (data.type === 'home_scored_cancel' || data.type === 'away_scored_cancel') {
            this.playSound('goal-cancelled');
            data.desc = t('Goal Cancelled');
        }

        this.setState({
            data,
        });
    }

    playSound(type) {
        const { audioFiles, redScoreMuted } = this.props;
        let audio = null;
        if (!redScoreMuted && audioFiles) {
            setTimeout(() => {
                if (type === 'goal' && audioFiles.goal) audio = audioFiles.goal.play();
                else if (type === 'cancel' && audioFiles.cancel) audio = audioFiles.cancel.play();
                else if (type === 'finish' && audioFiles.finish) audio = audioFiles.finish.play();
                else if (type === 'red-card' && audioFiles.redcard) audio = audioFiles.redcard.play();
                else if (type === 'half-time' && audioFiles.halftime) audio = audioFiles.halftime.play();
                else if (type === 'start' && audioFiles.start) audio = audioFiles.start.play();
                if (audio) {
                    audio.catch((err) => {
                        console.log("AudioFile can't be played", err);
                    });
                }
            }, 500);
        }
    }

    shrinkToggle() {
        const { updateParentState, redScoreShrinked } = this.props;
        updateParentState(
            {
                redScoreShrinked: !redScoreShrinked,
            },
            true
        );
    }

    muteToggle() {
        const { updateParentState, redScoreMuted } = this.props;
        updateParentState(
            {
                redScoreMuted: !redScoreMuted,
            },
            true
        );
    }

    render() {
        const { data } = this.state;
        if (!data) return false;
        const { t, redScoreShrinked, redScoreMuted } = this.props;
        const link = `/${t('match')}/${generateSlug(
            `${t(data.event.teams.home.name)}-${t(data.event.teams.away.name)}`
        )}-${t('live-score')}-${data.event.id}`;
        return (
            <div className={`flash-score-board ${redScoreShrinked ? 'shrink' : ''}`}>
                <div className="container">
                    <div
                        role="button"
                        tabIndex="1"
                        className="shrink-btn"
                        onKeyDown={this.shrinkToggle.bind(this)}
                        onClick={this.shrinkToggle.bind(this)}
                    >
                        <Icon name={`fas fa-chevron-${redScoreShrinked ? 'up' : 'down'}`} />
                    </div>
                    <div className="row align-items-center content">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        <div className="col col-minute">{data.event.statusBoxContent}'</div>
                        <Link
                            to={{
                                pathname: link,
                                state: { isPrev: true },
                            }}
                            className="col home-team text-center"
                        >
                            <img
                                src={`${window.ImageServer}/images/team-logo/football_${data.event.teams.home.id}.png`}
                                className="team-logo"
                                alt={t(data.event.teams.home.name)}
                            />
                            <div className="team-name">{t(data.event.teams.home.name)}</div>
                        </Link>
                        <Link
                            to={{
                                pathname: link,
                                state: { isPrev: true },
                            }}
                            className="col col-score"
                        >
                            {data.type === 'home_redcard' ? (
                                <div className="red-card home flash-blinker-5">{data.event.redCards.home}</div>
                            ) : (
                                ''
                            )}
                            {data.type === 'away_redcard' ? (
                                <div className="red-card away flash-blinker-5">{data.event.redCards.away}</div>
                            ) : (
                                ''
                            )}
                            <div className="desc">{data.desc ? data.desc : ''}</div>
                            <span
                                className={`home ${
                                    data.type === 'home_scored' || data.type === 'home_scored_cancel'
                                        ? 'flash-blinker-5'
                                        : ''
                                }`}
                            >
                                {data.event.scores.home || 0}
                            </span>
                            <span className="separator">:</span>
                            <span
                                className={`away ${
                                    data.type === 'away_scored' || data.type === 'away_scored_cancel'
                                        ? 'flash-blinker-5'
                                        : ''
                                }`}
                            >
                                {data.event.scores.away || 0}
                            </span>
                        </Link>
                        <Link
                            to={{
                                pathname: link,
                                state: { isPrev: true },
                            }}
                            className="col away-team text-center"
                        >
                            <img
                                src={`${window.ImageServer}/images/team-logo/football_${data.event.teams.away.id}.png`}
                                className="team-logo"
                                alt={t(data.event.teams.away.name)}
                            />
                            <div className="team-name">{t(data.event.teams.away.name)}</div>
                        </Link>
                        <div
                            role="button"
                            tabIndex="1"
                            className={`col col-sound ${redScoreMuted ? 'muted' : ''}`}
                            onKeyDown={this.muteToggle.bind(this)}
                            onClick={this.muteToggle.bind(this)}
                        >
                            <Icon name={`fas fa-volume-${redScoreMuted ? 'off' : 'up'}`} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation('translations')(RedScoreBar);

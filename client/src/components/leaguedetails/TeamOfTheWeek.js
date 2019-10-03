import React, { Component } from 'react';
import Loading from '../common/Loading';
// import {Trans} from "react-i18next";
import { ratingClass } from '../../Helper';
import Icon from '../common/Icon';
import { Trans } from 'react-i18next';
import Errors from '../common/Errors';

class TeamOfTheWeek extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teamOfTheWeekData: null,
            isDropdown: false,
            rounds: this.props.leagueData.tournamentInfo.teamOfTheWeek.rounds,
            roundName: this.props.leagueData.tournamentInfo.teamOfTheWeek.rounds[0].roundName
        };
    }

    componentDidMount() {
        const { leagueData } = this.props;
        this.initGetData(leagueData.tournamentInfo.teamOfTheWeek.rounds[0].roundSlug);
    }

    componentDidUpdate() {
        this.props.swipeAdjustHeight();
    }

    initGetData = roundSlug => {
        const { leagueData } = this.props;
        const api = `/u-tournament/${leagueData.uniqueTournament.id}/season/${leagueData.season.id}/team-of-the-week/${roundSlug}/json`;

        fetch(`/api/?query=${api}&page=teamoftheweek`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then(res => {
                this.setState({
                    teamOfTheWeekData: res,
                    loading: false
                });
            })
            .catch(err => {
                this.setState({
                    teamOfTheWeekData: { error: err.toString() },
                    loading: false
                });
            });
    };

    roundClicked(round) {
        this.setState(
            {
                roundName: round.roundName,
                isDropdown: false,
                loading: true
            },
            () => {
                this.initGetData(round.roundSlug);
            }
        );

        // console.log("Name", round.roundName, "Slug", round.roundSlug);
    }

    render() {
        const { teamOfTheWeekData, roundName, rounds, loading } = this.state;

        if (!teamOfTheWeekData) return <Loading type="inside" />;
        if (teamOfTheWeekData.error) return <Errors type="error" message={teamOfTheWeekData.error} />;

        const formation = teamOfTheWeekData.formation.split('-');
        const formationReverse = [...formation].reverse();
        const goalie = teamOfTheWeekData.players[0];
        let iteration = 11;

        const currentRoundIndex = rounds.findIndex(x => x.roundName === roundName);
        const prevRound = rounds[currentRoundIndex + 1];
        const nextRound = rounds[currentRoundIndex - 1];

        console.log(this.props.leagueData);

        return (
            <div>
                <div className="lineup container pb-4">
                    <div className="white-box mt-2">
                        <div className="px-3">
                            <div className="row heading align-items-center">
                                <div
                                    className={'col col-3 col-nav ' + (!prevRound ? 'not-exist' : '')}
                                    onClick={() => (prevRound ? this.roundClicked(prevRound) : '')}
                                >
                                    <Icon name="fas fa-chevron-left" /> <Trans>Prev</Trans>
                                </div>
                                <div className="col px-0 col-6 text-center col-dropdown">
                                    <div
                                        className={'pure-dropdown' + (this.state.isDropdown ? ' open' : '')}
                                        onClick={() => this.setState({ isDropdown: !this.state.isDropdown })}
                                    >
                                        <Trans>{roundName}</Trans>
                                        {roundName.length > 2 ? '' : <Trans>th Week</Trans>}
                                        <Icon name="fas fa-caret-down" />
                                        <div className="dropdown">
                                            <ul>
                                                {rounds.map((round, index) => {
                                                    return (
                                                        <li
                                                            key={index}
                                                            className={
                                                                roundName === round.roundName ? 'active this-round' : ''
                                                            }
                                                            onClick={() => this.roundClicked(round)}
                                                        >
                                                            <span>
                                                                {round.roundName}
                                                                {round.roundName.length > 2 ? (
                                                                    ''
                                                                ) : (
                                                                    <Trans>th Week</Trans>
                                                                )}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={'col col-3 text-right col-nav ' + (!nextRound ? 'not-exist' : '')}
                                    onClick={() => (nextRound ? this.roundClicked(nextRound) : '')}
                                >
                                    <Trans>Next</Trans> <Icon name="fas fa-chevron-right" />
                                </div>
                            </div>
                        </div>
                        <div className="position-relative">
                            {loading ? <Loading type="inside" /> : ''}
                            <div className="container">
                                <div className="row league-heading align-items-center py-2 bg-gray">
                                    <div className="col col-img">
                                        <img
                                            src={
                                                window.ImageServer +
                                                '/images/u-tournament/' +
                                                this.props.leagueData.uniqueTournament.id +
                                                '.png'
                                            }
                                            alt={this.props.leagueData.uniqueTournament.name}
                                        />
                                    </div>
                                    <div className="col">
                                        <div className="name">{this.props.leagueData.uniqueTournament.name}</div>
                                        <div className="country">
                                            <Trans>{this.props.leagueData.category.name}</Trans>
                                        </div>
                                    </div>
                                    <div className="col text-right">
                                        <strong>
                                            <Trans>{roundName}</Trans>
                                            {roundName.length > 2 ? '' : <Trans>th Week</Trans>}
                                        </strong>
                                        <br />
                                        <Trans>Team Of The Week</Trans>
                                    </div>
                                </div>
                            </div>
                            <div className="pitch">
                                <div className={'area-container row-' + formationReverse.length}>
                                    {formationReverse.map((item, index) => {
                                        return (
                                            <div key={index} className={'area area-' + item}>
                                                <div className="row">
                                                    {[...Array(parseInt(item))].map((x, i) => {
                                                        iteration--;
                                                        const team = teamOfTheWeekData.players[iteration].team,
                                                            player = teamOfTheWeekData.players[iteration].player,
                                                            rating = teamOfTheWeekData.players[iteration].rating;
                                                        return (
                                                            <div key={i} className="col text-center">
                                                                <div className="player-container">
                                                                    <div className="picture">
                                                                        <img
                                                                            alt={player.name}
                                                                            src={
                                                                                window.ImageServer +
                                                                                '/images/player/image_' +
                                                                                player.id +
                                                                                '.png'
                                                                            }
                                                                            className="player-picture"
                                                                        />

                                                                        {rating ? (
                                                                            <span
                                                                                className={
                                                                                    'text-bold rating ' +
                                                                                    ratingClass(rating)
                                                                                }
                                                                            >
                                                                                {rating}
                                                                            </span>
                                                                        ) : (
                                                                            ''
                                                                        )}

                                                                        <img
                                                                            src={
                                                                                window.ImageServer +
                                                                                '/images/team-logo/football_' +
                                                                                team.id +
                                                                                '.png'
                                                                            }
                                                                            alt={team.name}
                                                                            className="team-logo"
                                                                        />
                                                                    </div>
                                                                    <div className="clearfix" />
                                                                    <div
                                                                        className="name"
                                                                        style={{
                                                                            background: '#3F1052',
                                                                            color: '#f0f0f0'
                                                                        }}
                                                                    >
                                                                        <span>{player.shortName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className={'area area-1'}>
                                        <div className="row">
                                            <div className="col text-center">
                                                <div className="player-container">
                                                    <div className="picture">
                                                        <img
                                                            alt={goalie.player.name}
                                                            src={
                                                                window.ImageServer +
                                                                '/images/player/image_' +
                                                                goalie.player.id +
                                                                '.png'
                                                            }
                                                            className="player-picture"
                                                        />

                                                        {goalie.rating ? (
                                                            <span
                                                                className={
                                                                    'text-bold rating ' + ratingClass(goalie.rating)
                                                                }
                                                            >
                                                                {goalie.rating}
                                                            </span>
                                                        ) : (
                                                            ''
                                                        )}

                                                        <img
                                                            src={
                                                                window.ImageServer +
                                                                '/images/team-logo/football_' +
                                                                goalie.team.id +
                                                                '.png'
                                                            }
                                                            alt={goalie.team.name}
                                                            className="team-logo"
                                                        />
                                                    </div>
                                                    <div className="clearfix" />
                                                    <div
                                                        className="name"
                                                        style={{
                                                            background: '#3F1052',
                                                            color: '#f0f0f0'
                                                        }}
                                                    >
                                                        <span>{goalie.player.shortName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="body list px-3 pt-0">
                                {teamOfTheWeekData.players.map((item, index) => {
                                    return (
                                        <div key={index} className="row list-row align-items-center">
                                            <div className="col list-image">
                                                <img
                                                    alt={item.player.name}
                                                    src={
                                                        window.ImageServer +
                                                        '/images/player/image_' +
                                                        item.player.id +
                                                        '.png'
                                                    }
                                                />
                                                <img
                                                    src={
                                                        window.ImageServer +
                                                        '/images/team-logo/football_' +
                                                        item.team.id +
                                                        '.png'
                                                    }
                                                    alt={item.team.name}
                                                    className="team-logo-list"
                                                />
                                            </div>

                                            <div className="col list-text">
                                                <div className="f-700">{item.player.name}</div>
                                                <div className="text-gray align-items-center d-flex">
                                                    <Trans>{item.team.name}</Trans>
                                                </div>
                                            </div>
                                            {item.rating ? (
                                                <div className="col list-rating">
                                                    <span className={'text-bold rating ' + ratingClass(item.rating)}>
                                                        {item.rating}
                                                    </span>
                                                </div>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TeamOfTheWeek;

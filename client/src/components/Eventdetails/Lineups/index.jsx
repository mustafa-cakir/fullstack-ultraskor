import React, { useCallback, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Trans, withTranslation } from 'react-i18next';
import { ratingClass } from '../../../Helper';
import { printImageSrc } from '../../../core/utils';
import Loading from '../../common/Loading';
import Errors from '../../common/Errors';

const Lineups = ({ id, teams, updateAutoHeight, hasActived, t }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        currentTeam: 'homeTeam',
        tabIndex: 0,
        lineups: null,
        isLoading: true,
        error: null
    });
    const { currentTeam, tabIndex, lineups, isLoading, error } = state;

    const getData = useCallback(() => {
        axios
            .get(`/api/eventdetails/${id}/lineups`)
            .then(res => {
                setState({
                    isLoading: false,
                    lineups: res.data
                });
                setTimeout(() => {
                    updateAutoHeight();
                })
            })
            .catch(() => {
                setState({
                    isLoading: false,
                    error: t('Something went wrong')
                });
            });
    }, [id, updateAutoHeight, t]);

    useEffect(() => {
        if (hasActived) {
            getData();
        }
    }, [hasActived, getData]);

    if (!lineups || isLoading || !hasActived) return <Loading type="whitebox container" />;
    if (error) return <Errors message={error} />;

    const currentTeamClickHandler = newCurrentTeam => {
        setState({
            currentTeam: newCurrentTeam
        })
    };

    const tabIndexClickHandler = newTabIndex => {
        setState({
            tabIndex: newTabIndex
        })
    };

    const homeFormation = lineups.homeTeam.formation;
    const awayFormation = lineups.awayTeam.formation;
    const activeTeam = lineups[currentTeam];
    const formationReverse = [...activeTeam.formation].reverse();
    // console.log(activeTeam.formation);
    let iteration = 11;
    return (
        <div className="lineup container">
            <div className="white-box mt-2">
                <div className="formation">
                    <div className="row">
                        <button
                            type="button"
                            className={`col home${currentTeam === 'homeTeam' ? ' active' : ''}`}
                            onClick={() => currentTeamClickHandler('homeTeam')}
                        >
                            <img
                                alt={t(teams.home.name)}
                                src={printImageSrc(`/images/team-logo/football_${teams.home.id}.png`)}
                            />
                            {homeFormation.join(' - ')}
                        </button>
                        <button
                            type="button"
                            className={`col away${currentTeam === 'awayTeam' ? ' active' : ''}`}
                            onClick={() => currentTeamClickHandler('awayTeam')}
                        >
                            {awayFormation.join(' - ')}
                            <img
                                alt={t(teams.away.name)}
                                src={printImageSrc(`/images/team-logo/football_${teams.away.id}.png`)}
                            />
                        </button>
                    </div>
                </div>
                <div className="pitch">
                    <div className={`area-container row-${formationReverse.length}`}>
                        {formationReverse.map((item, index) => {
                            return (
                                // eslint-disable-next-line react/no-array-index-key
                                <div key={`${currentTeam}_${item}_${index}`} className={`area area-${item}`}>
                                    <div className="row">
                                        {[...Array(parseFloat(item))].map(() => {
                                            iteration -= 1;
                                            const { player } = activeTeam.lineupsSorted[iteration];
                                            const { rating } = activeTeam.lineupsSorted[iteration];
                                            const incidents =
                                                activeTeam.incidents && activeTeam.incidents[player.id]
                                                    ? activeTeam.incidents[player.id]
                                                    : null;

                                            return (
                                                <div key={player.id} className="col text-center">
                                                    <div className="player-container">
                                                        <div className="picture">
                                                            <img
                                                                alt={player.name}
                                                                src={printImageSrc(
                                                                    `/images/player/image_${player.id}.png`
                                                                )}
                                                                className="player-picture"
                                                            />

                                                            {rating && (
                                                                <span
                                                                    className={`text-bold rating ${ratingClass(
                                                                        rating
                                                                    )}`}
                                                                >
                                                                    {rating}
                                                                </span>
                                                            )}

                                                            {incidents && (
                                                                <span className="lineup-icon">
                                                                    {incidents.map(incident => {
                                                                        return (
                                                                            <span
                                                                                key={Math.random()}
                                                                                className={`${incident.incidentClass}`}
                                                                            />
                                                                        );
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="clearfix"/>
                                                        <div
                                                            className="name"
                                                            style={{
                                                                background: `#${activeTeam.color.player.outline}`,
                                                                color: `#${activeTeam.color.player.number}`
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
                        <div className="area area-1" key={currentTeam}>
                            <div className="row">
                                <div className="col text-center">
                                    <div className="player-container">
                                        <div className="picture">
                                            <img
                                                alt={activeTeam.lineupsSorted[0].player.name}
                                                src={printImageSrc(
                                                    `/images/player/image_${activeTeam.lineupsSorted[0].player.id}.png`
                                                )}
                                                className="player-picture"
                                            />

                                            {activeTeam.lineupsSorted[0].rating ? (
                                                <span
                                                    className={`text-bold rating ${ratingClass(
                                                        activeTeam.lineupsSorted[0].rating
                                                    )}`}
                                                >
                                                    {activeTeam.lineupsSorted[0].rating}
                                                </span>
                                            ) : (
                                                ''
                                            )}

                                            {activeTeam.incidents &&
                                            activeTeam.incidents[activeTeam.lineupsSorted[0].player.id] && (
                                                <span className="lineup-icon">
                                                        {activeTeam.incidents[
                                                            activeTeam.lineupsSorted[0].player.id
                                                            ].map(item => {
                                                            return (
                                                                <span
                                                                    key={Math.random()}
                                                                    className={`${item.incidentClass}`}
                                                                />
                                                            );
                                                        })}
                                                    </span>
                                            )}
                                        </div>
                                        <div className="clearfix"/>
                                        <div
                                            className="name"
                                            style={{
                                                background: `#${activeTeam.color.goalkeeper.outline}`,
                                                color: `#${activeTeam.color.goalkeeper.number}`
                                            }}
                                        >
                                            <span>{activeTeam.lineupsSorted[0].player.shortName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row pb-2">
                    <div className="col">
                        <div className="row align-items-center">
                            <div className="col col-coach-picture">
                                <img
                                    alt={activeTeam.manager.name}
                                    className="coach-picture"
                                    src={printImageSrc(`/images/manager/${activeTeam.manager.id}.png`)}
                                />
                            </div>
                            <div className="col">
                                <div className="coach-name f-700">{activeTeam.manager.name}</div>
                                <div className="text-gray">
                                    <Trans>Coach</Trans>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col col-5 text-right right-info">
                        {!activeTeam.confirmedLineups ? (
                            <div className="possible-lineup">
                                <Trans>Possible Lineup</Trans>!
                            </div>
                        ) : (
                            <div className="confirmed-lineup">
                                <Trans>Confirmed Lineup</Trans>
                            </div>
                        )}
                        {activeTeam.rating ? (
                            <div className="team-rating">
                                <Trans>Team Avg. Rating</Trans>:{' '}
                                <span className={`text-bold rating ${ratingClass(activeTeam.rating)}`}>
                                    {activeTeam.rating}
                                </span>
                            </div>
                        ) : (
                            ''
                        )}

                        {activeTeam.averageAge.startersAverageAge ? (
                            <div className="mt-1">
                                <Trans>Avg. Age</Trans>:{' '}
                                <span className="f-500"> {activeTeam.averageAge.startersAverageAge}</span>
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                <div className="body list">
                    <div className="horizontal-tab">
                        <button type="button" className={tabIndex === 0 ? 'active' : ''} onClick={() => tabIndexClickHandler(0)}>
                            <span>
                                <Trans>Lineup</Trans>
                            </span>
                        </button>
                        <button type="button" className={tabIndex === 1 ? 'active' : ''} onClick={() => tabIndexClickHandler(1)}>
                            <span>
                                <Trans>Substitues</Trans>
                            </span>
                        </button>
                    </div>
                    {activeTeam.lineupsSorted.map(item => {
                        if (tabIndex === 0 && item.substitute) return false;
                        if (tabIndex === 1 && !item.substitute) return false;
                        return (
                            <div key={item.player.id} className="row list-row align-items-center">
                                <div className="col list-image">
                                    <img
                                        alt={item.player.name}
                                        src={printImageSrc(`/images/player/image_${item.player.id}.png`)}
                                    />
                                </div>

                                <div className="col list-text">
                                    <div className="f-700">
                                        {item.shirtNumber} - {item.player.name}{' '}
                                        {item.captain ? <span className="captain">C</span> : ''}
                                        {activeTeam.incidents && activeTeam.incidents[item.player.id] && (
                                            <span className="lineup-icon">
                                                {activeTeam.incidents[item.player.id].map(incident => {
                                                    return (
                                                        <span
                                                            key={Math.random()}
                                                            className={`mx-1 ${incident.incidentClass}`}
                                                        />
                                                    );
                                                })}
                                            </span>
                                        )}
                                        {item.substitute && item.rating !== '–' && (
                                            <span className="mx-1 lineup-icon">
                                                <span className="substitutionin"/>
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray">
                                        <Trans>{item.positionName}</Trans>
                                    </div>
                                </div>
                                {item.rating ? (
                                    <div className="col list-rating">
                                        <span className={`text-bold rating ${ratingClass(item.rating)}`}>
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
    );
};

export default withTranslation('translations')(Lineups);

import React, { useEffect, useReducer } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loading from '../../common/Loading';
import Errors from '../../common/Errors';
import { generateSlug } from '../../../Helper';
import { printImageSrc } from '../../../core/utils';

const Standings = ({ event, updateAutoHeight, hasActived, t }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        data: null,
        error: null,
        isLoading: true,
        tab: 'Total'
    });
    const { data, error, isLoading, tab } = state;
    const { teams, tournament, season } = event;
    useEffect(() => {
        if (hasActived) {
            axios
                .get(`/api/tournament/standings/${tournament.id}/${season.id}`)
                .then(res => {
                    setState({
                        isLoading: false,
                        data: res.data.standingsTables[0],
                        isLoaded: true
                    });
                    updateAutoHeight();
                })
                .catch(err => {
                    setState({
                        isLoading: false,
                        error: err,
                        isLoaded: true
                    });
                });
        }
    }, [tournament.id, season.id, hasActived, updateAutoHeight]);

    const tabSwitcherHandler = selectedTab => {
        setState({
            tab: selectedTab
        });
    };

    const getPositionLabel = () => {
        if (tab === 'Home') return 'homePosition';
        if (tab === 'Away') return 'awayPosition';
        return 'position';
    };

    if (!hasActived) return false;
    if (isLoading) return <Loading type="inside" />;
    if (error) return <Errors message={error} />;
    const tabLower = tab.toLowerCase();
    const positionLabel = getPositionLabel();
    const tableRows = [...data.tableRows].sort((a, b) => parseFloat(a[positionLabel]) - parseFloat(b[positionLabel]));
    return (
        <div className="standing-table container">
            <div className="white-box mt-2 pt-3">
                <div className="row league-heading align-items-center">
                    <div className="col col-img">
                        <img
                            src={printImageSrc(`/images/u-tournament/${data.tournament.uniqueId}.png`)}
                            alt={t(data.tournament.name)}
                        />
                    </div>
                    <div className="col">
                        <div className="name">{t(data.tournament.name)}</div>
                        <div className="country">
                            <Trans>{data.category.name}</Trans>
                        </div>
                    </div>
                    {data.isLive ? (
                        <div className="col text-right live-label pr-4">
                            <Trans>Live Table</Trans>!
                        </div>
                    ) : (
                        ''
                    )}
                </div>
                <div className="horizontal-tab mt-4 mb-1">
                    <button
                        type="button"
                        className={tab === 'Total' ? 'active' : ''}
                        onClick={() => tabSwitcherHandler('Total')}
                    >
                        <span>
                            <Trans>Overall</Trans>
                        </span>
                    </button>
                    <button
                        type="button"
                        className={tab === 'Home' ? 'active' : ''}
                        onClick={() => tabSwitcherHandler('Home')}
                    >
                        <span>
                            <Trans>Home</Trans>
                        </span>
                    </button>
                    <button
                        type="button"
                        className={tab === 'Away' ? 'active' : ''}
                        onClick={() => tabSwitcherHandler('Away')}
                    >
                        <span>
                            <Trans>Away</Trans>
                        </span>
                    </button>
                </div>
                <div className="body pt-0">
                    <table className="table">
                        <thead>
                            <tr>
                                <th> </th>
                                <th> </th>
                                <th> </th>
                                <th scope="col">
                                    <Trans>P</Trans>
                                </th>
                                <th scope="col">
                                    <Trans>W</Trans>
                                </th>
                                <th scope="col">
                                    <Trans>D</Trans>
                                </th>
                                <th scope="col">
                                    <Trans>L</Trans>
                                </th>
                                <th scope="col">Av</th>
                                <th scope="col">
                                    <Trans>Pts</Trans>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map(row => {
                                return (
                                    <tr
                                        key={row.team.id}
                                        className={
                                            (row.team.id === teams.home.id ? 'highlight-home ' : '') +
                                            (row.team.id === teams.home.id ? 'highlight-away ' : '') +
                                            (row.isLive ? `live-game ${row.liveMatchStatus}` : '')
                                        }
                                    >
                                        <td
                                            className={`order ${
                                                row.promotion && data.promotionsColoring
                                                    ? `promotion ${data.promotionsColoring[row.promotion.id].class}`
                                                    : ''
                                            }`}
                                        >
                                            <span>{row.position}</span>
                                        </td>
                                        <td className="team-logo">
                                            <Link
                                                to={{
                                                    pathname: `/${t('team')}/${generateSlug(t(row.team.shortName))}-${
                                                        row.team.id
                                                    }`,
                                                    state: { isPrev: true }
                                                }}
                                                title={`${t(row.team.shortName)} - ${t(
                                                    'Fixtures, highlights and standings, click for more'
                                                )}`}
                                            >
                                                <img
                                                    src={`${window.ImageServer}/images/team-logo/football_${row.team.id}.png`}
                                                    alt={t(row.team.name)}
                                                />
                                            </Link>
                                        </td>
                                        <td className="team">
                                            <Link
                                                to={{
                                                    pathname: `/${t('team')}/${generateSlug(t(row.team.shortName))}-${
                                                        row.team.id
                                                    }`,
                                                    state: { isPrev: true }
                                                }}
                                                title={`${t(row.team.shortName)} - ${t(
                                                    'Fixtures, highlights and standings, click for more'
                                                )}`}
                                            >
                                                <span className="line-clamp team-name">{t(row.team.shortName)}</span>
                                            </Link>
                                            <span className="live-pulse" />
                                        </td>
                                        <td className="matches">{row[`${tabLower}Fields`][`matches${tab}`]}</td>
                                        <td className="win">{row[`${tabLower}Fields`][`win${tab}`]}</td>
                                        <td className="draw">{row[`${tabLower}Fields`][`draw${tab}`]}</td>
                                        <td className="loss">{row[`${tabLower}Fields`][`loss${tab}`]}</td>
                                        <td className="goal-diff">{row[`${tabLower}Fields`][`goalDiff${tab}`]}</td>
                                        <td className="points">{row[`${tabLower}Fields`][`points${tab}`]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default withTranslation('translations')(Standings);

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { printImageSrc } from '../../../core/utils';
import { generateSlug } from '../../../core/utils/helper';

const StandingTable = ({ standingsTables, teams, t }) => {
    const [tab, setTab] = useState('Total');
    const getPositionLabel = () => {
        if (tab === 'Home') return 'homePosition';
        if (tab === 'Away') return 'awayPosition';
        return 'position';
    };

    const tabLower = tab.toLowerCase();
    const positionLabel = getPositionLabel();

    const tabSwitcherHandler = selectedTab => {
        setTab(selectedTab);
    };
    return (
        <>
            {standingsTables.map(item => {
                const tableRows = [...item.tableRows].sort(
                    (a, b) => parseFloat(a[positionLabel]) - parseFloat(b[positionLabel])
                );
                return (
                    <div className="standing-table container" key={item.tournament.name}>
                        <div className="white-box mt-2 pt-3">
                            <div className="row league-heading align-items-center">
                                <div className="col col-img">
                                    <img
                                        src={printImageSrc(`/images/u-tournament/${item.tournament.uniqueId}.png`)}
                                        alt={t(item.tournament.name)}
                                    />
                                </div>
                                <div className="col">
                                    <div className="name">{t(item.tournament.name)}</div>
                                    <div className="country">
                                        <Trans>{item.category.name}</Trans>
                                    </div>
                                </div>
                                {item.isLive ? (
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
                                                        (teams && row.team.id === teams.home.id
                                                            ? 'highlight-home '
                                                            : '') +
                                                        (teams && row.team.id === teams.home.id
                                                            ? 'highlight-away '
                                                            : '') +
                                                        (row.isLive ? `live-game ${row.liveMatchStatus}` : '')
                                                    }
                                                >
                                                    <td
                                                        className={`order ${
                                                            row.promotion && item.promotionsColoring
                                                                ? `promotion ${item.promotionsColoring[row.promotion.id].class}`
                                                                : ''
                                                        }`}
                                                    >
                                                        <span>{row.position}</span>
                                                    </td>
                                                    <td className="team-logo">
                                                        <Link
                                                            to={{
                                                                pathname: `/${t('team')}/${generateSlug(
                                                                    t(row.team.shortName)
                                                                )}-${row.team.id}`,
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
                                                                pathname: `/${t('team')}/${generateSlug(
                                                                    t(row.team.shortName)
                                                                )}-${row.team.id}`,
                                                                state: { isPrev: true }
                                                            }}
                                                            title={`${t(row.team.shortName)} - ${t(
                                                                'Fixtures, highlights and standings, click for more'
                                                            )}`}
                                                        >
                                                            <span className="line-clamp team-name">
                                                                {t(row.team.shortName)}
                                                            </span>
                                                        </Link>
                                                        <span className="live-pulse" />
                                                    </td>
                                                    <td className="matches">
                                                        {row[`${tabLower}Fields`][`matches${tab}`]}
                                                    </td>
                                                    <td className="win">{row[`${tabLower}Fields`][`win${tab}`]}</td>
                                                    <td className="draw">{row[`${tabLower}Fields`][`draw${tab}`]}</td>
                                                    <td className="loss">{row[`${tabLower}Fields`][`loss${tab}`]}</td>
                                                    <td className="goal-diff">
                                                        {row[`${tabLower}Fields`][`goalDiff${tab}`]}
                                                    </td>
                                                    <td className="points">
                                                        {row[`${tabLower}Fields`][`points${tab}`]}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

StandingTable.propTypes = {
    standingsTables: PropTypes.array.isRequired,
    teams: PropTypes.object,
    t: PropTypes.func
};

StandingTable.defaultProps = {
    teams: null,
    t: () => {}
};

export default withTranslation('translations')(StandingTable);

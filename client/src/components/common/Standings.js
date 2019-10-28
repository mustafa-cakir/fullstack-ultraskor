import React, { Component } from 'react';
import Loading from './Loading';
import { Trans } from 'react-i18next';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { generateSlug } from '../../core/utils/helper';

class Standings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            standingsTables: this.props.standingsTables,
            tab: 'Total'
        };
    }

    tabSwitcherHandler(tab) {
        this.setState({
            tab: tab
        });
    }

    render() {
        const { standingsTables, tab } = this.state;
        const { t } = this.props;
        if (!standingsTables) return <Loading />;
        const tabLower = tab.toLowerCase();
        let positionLabel = tab === 'Home' ? 'homePosition' : tab === 'Away' ? 'awayPosition' : 'position';
        return (
            <div>
                {standingsTables.map((standingsTable, index) => {
                    standingsTable.tableRows.sort(
                        (a, b) => parseFloat(a[positionLabel]) - parseFloat(b[positionLabel])
                    );
                    return (
                        <div className="standing-table container" key={index}>
                            <div className="white-box mt-2 pt-3">
                                <div className="row league-heading align-items-center">
                                    <div className="col col-img">
                                        <img
                                            src={
                                                window.ImageServer +
                                                '/images/u-tournament/' +
                                                standingsTable.tournament.uniqueId +
                                                '.png'
                                            }
                                            alt={t(standingsTable.tournament.name)}
                                        />
                                    </div>
                                    <div className="col">
                                        <div className="name">{t(standingsTable.tournament.name)}</div>
                                        <div className="country">
                                            <Trans>{standingsTable.category.name}</Trans>
                                        </div>
                                    </div>
                                    {standingsTable.isLive ? (
                                        <div className="col text-right live-label pr-4">
                                            <Trans>Live Table!</Trans>!
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                </div>
                                <ul className="horizontal-tab mt-4 mb-1">
                                    <li
                                        className={tab === 'Total' ? 'active' : ''}
                                        onClick={() => this.tabSwitcherHandler('Total')}
                                    >
                                        <span>
                                            <Trans>Overall</Trans>
                                        </span>
                                    </li>
                                    <li
                                        className={tab === 'Home' ? 'active' : ''}
                                        onClick={() => this.tabSwitcherHandler('Home')}
                                    >
                                        <span>
                                            <Trans>Home</Trans>
                                        </span>
                                    </li>
                                    <li
                                        className={tab === 'Away' ? 'active' : ''}
                                        onClick={() => this.tabSwitcherHandler('Away')}
                                    >
                                        <span>
                                            <Trans>Away</Trans>
                                        </span>
                                    </li>
                                </ul>
                                <div className="body pt-0">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="order" scope="col" />
                                                <th className="team" scope="col" />
                                                <th className="team" scope="col" />
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
                                            {standingsTable.tableRows.map((row, index) => {
                                                return (
                                                    <tr
                                                        key={index}
                                                        className={row.isLive ? 'live-game ' + row.liveMatchStatus : ''}
                                                    >
                                                        <td
                                                            className={
                                                                'order ' +
                                                                (row.promotion && standingsTable.promotionsColoring
                                                                    ? 'promotion ' +
                                                                      standingsTable.promotionsColoring[
                                                                          row.promotion.id
                                                                      ].class
                                                                    : '')
                                                            }
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
                                                        <td className="draw">
                                                            {row[`${tabLower}Fields`][`draw${tab}`]}
                                                        </td>
                                                        <td className="loss">
                                                            {row[`${tabLower}Fields`][`loss${tab}`]}
                                                        </td>
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
            </div>
        );
    }
}

export default withTranslation('translations')(Standings);

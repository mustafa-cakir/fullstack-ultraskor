import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { printImageSrc } from '../../../core/utils';
import Icon from '../../common/Icon';

const Injuries = ({ teams, injuries, t }) => {
    return (
        <div className="injuries container">
            <div className="white-box mt-2">
                <div className="row heading align-items-center">
                    <div className="col col-img">
                        <img
                            alt={t(teams.home.name)}
                            src={printImageSrc(`/images/team-logo/football_${teams.home.id}.png`)}
                        />
                    </div>
                    <div className="col">
                        <div className="team-name">{t(teams.home.name)}</div>
                        <div className="injury-report">
                            {injuries.homeTeamNoMissing || injuries.homeTeamMissings.length === 0 ? (
                                <span>-</span>
                            ) : (
                                <InjurySummary data={injuries.homeTeamSummary} t={t} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="body">
                    {injuries.homeTeamNoMissing || injuries.homeTeamMissings.length === 0 ? (
                        <div className="no-injury">
                            <Trans>No injured or suspended player</Trans>
                        </div>
                    ) : (
                        <InjuryTable data={injuries.homeTeamMissings} />
                    )}
                </div>
                <hr />
                <div className="row heading align-items-center pt-3">
                    <div className="col col-img">
                        <img
                            alt={t(teams.away.name)}
                            src={printImageSrc(`/images/team-logo/football_${teams.away.id}.png`)}
                        />
                    </div>
                    <div className="col">
                        <div className="team-name">{t(teams.away.name)}</div>
                        <div className="injury-report">
                            {injuries.awayTeamNoMissing || injuries.awayTeamMissings.length === 0 ? (
                                <span>-</span>
                            ) : (
                                <InjurySummary data={injuries.awayTeamSummary} t={t} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="body pb-3">
                    {injuries.awayTeamNoMissing || injuries.awayTeamMissings.length === 0 ? (
                        <div className="no-injury">
                            <Trans>No injured or suspended player</Trans>
                        </div>
                    ) : (
                        <InjuryTable data={injuries.awayTeamMissings} />
                    )}
                </div>
            </div>
        </div>
    );
};

const InjurySummary = ({ data, t }) => {
    const summary = [];
    if (data.INJURED) summary.push(`${data.INJURED} ${t('Injured')}`);
    if (data.BANNED) summary.push(`${data.BANNED} ${t('Suspended')}`);
    if (data.DOUBTFUL) summary.push(`${data.DOUBTFUL} ${t('Suspicious')}`);
    if (data.OUT_OF_SQUAD) summary.push(`${data.OUT_OF_SQUAD} ${t('Out Of Squad')}`);
    if (data.ON_LEAVE || data.OTHER) summary.push(`${data.ON_LEAVE + data.OTHER} ${t('Other')}`);

    return summary.join(', ');
};

const InjuryTable = ({ data }) => {
    return (
        <table className="table injury-table table-striped ">
            <thead>
                <tr>
                    <th colSpan="3"> </th>
                    <th scope="col">
                        <Trans>Match</Trans>
                    </th>
                    <th scope="col">
                        <Trans>11</Trans>
                    </th>
                    <th scope="col">
                        <Trans>
                            <Icon name="far fa-futbol" />
                        </Trans>
                    </th>
                    <th scope="col">
                        <Trans>As.</Trans>
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map(item => {
                    return (
                        <tr key={Math.random()}>
                            <td className="">
                                <span className={`icon icon-${item.missingType} reason-${item.missingReasonId}`} />
                            </td>
                            <td className="player">
                                <div className="name">{item.player.knownName}</div>
                                <div className="reason">{item.description}</div>
                            </td>
                            <td>
                                <div className="position">
                                    <Trans>{item.position.toLowerCase()}</Trans>
                                </div>
                            </td>
                            <td>{item.generalStatistics.totalPlayed}</td>
                            <td>{item.generalStatistics.lineupCount}</td>
                            <td>{item.generalStatistics.goalCount}</td>
                            <td>{item.generalStatistics.assistCount}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default withTranslation('translations')(Injuries);

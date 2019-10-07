import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';
import { generateSlug } from '../../Helper';

const Scoreboard = ({ event, t }) => {
    return (
        <div className="event-details-scoreboard stadium">
            <div className="container">
                <div className="row text-center flex-nowrap">
                    <Link
                        to={{
                            pathname: `/${t('team')}/${generateSlug(t(event.homeTeam.name))}-${event.homeTeam.id}`,
                            state: { isPrev: true }
                        }}
                        className="col-4 team-link"
                        title={`${t(event.homeTeam.name)} - ${t('Fixtures, highlights and standings, click for more')}`}
                    >
                        <div className="team-logo mb-2">
                            <img
                                alt={t(event.homeTeam.name)}
                                src={`${window.ImageServer}/images/team-logo/football_${event.homeTeam.id}.png`}
                            />
                        </div>
                        <div className="team-name">{t(event.homeTeam.name)}</div>
                        {event.managerDuel ? (
                            <div className="team-coach mb-2">{event.managerDuel.homeManager.name}</div>
                        ) : (
                            ''
                        )}
                        <div>{event.teamsForm ? <TeamForm data={event.teamsForm.homeTeam.form} /> : ''}</div>
                    </Link>
                    <div className="col-4 align-self-center middle">
                        <div className="time">
                            <IsInProgress eventData={event} />
                        </div>
                        <div className={`score${event.status.type === 'inprogress' ? ' live' : ''}`}>
                            {event.homeScore.current} - {event.awayScore.current}
                        </div>
                        {event.hasHalfTimeScore ? (
                            <div className="score-halftime">
                                (<Trans>HT</Trans>: {event.homeScore.period1} - {event.awayScore.period1})
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                    <Link
                        to={{
                            pathname: `/${t('team')}/${generateSlug(t(event.awayTeam.name))}-${event.awayTeam.id}`,
                            state: { isPrev: true }
                        }}
                        className="col-4 team-link"
                        title={`${t(event.homeTeam.name)} - ${t('Fixtures, highlights and standings, click for more')}`}
                    >
                        <div className="team-logo mb-2">
                            <img
                                alt={t(event.awayTeam.name)}
                                src={`${window.ImageServer}/images/team-logo/football_${event.awayTeam.id}.png`}
                            />
                        </div>
                        <div className="team-name">{t(event.awayTeam.name)}</div>
                        <div className="team-coach mb-2">
                            {event.managerDuel ? event.managerDuel.awayManager.name : ''}
                        </div>
                        <div>{event.teamsForm ? <TeamForm data={event.teamsForm.awayTeam.form} /> : ''}</div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const IsInProgress = ({ event }) => {
    let text;
    const liveBlinkerCodes = [6, 7];
    switch (event.status.type) {
        case 'inprogress':
            text = (
                <div className="red font-weight-bold">
                    <Trans>{event.statusDescription}</Trans>
                    {event.status.code === 6 ? '' : ''}
                    {liveBlinkerCodes.indexOf(event.status.code) > -1 ? <span className="live-blinker">'</span> : ''}
                </div>
            );
            break;
        case 'notstarted':
            text = (
                <div className="full-time font-weight-bold">{moment(event.startTimestamp * 1000).format('HH:mm')}</div>
            );
            break;
        case 'canceled':
            text = (
                <div className="red small-text line-clamp">
                    <Trans>Cancelled</Trans>
                </div>
            );
            break;
        case 'postponed':
            text = (
                <div className="red small-text line-clamp">
                    <Trans>Postponed</Trans>
                </div>
            );
            break;
        case 'interrupted':
            text = (
                <div className="red small-text line-clamp">
                    <Trans>Interrupted</Trans>
                </div>
            );
            break;
        default:
            text = (
                <div className="full-time font-weight-bold">
                    <Trans>FT</Trans>
                </div>
            );
    }
    return text;
};

const TeamForm = ({ data }) => {
    const result = [];
    data.forEach(status => {
        result.push(
            <span key={Math.random()} className={`team-form team-form-${status}`}>
                <Trans>{status}</Trans>
            </span>
        );
    });
    return result;
};

export default withTranslation('translations')(Scoreboard);

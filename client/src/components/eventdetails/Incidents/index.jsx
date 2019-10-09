import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import iconWhistle from '../../../assets/images/icon-whistle.png';
import Icon from '../../common/Icon';

const Incidents = ({ incidents, t }) => {
    if (!incidents || incidents.length === 0) return false;
    return (
        <div>
            <div className="title">
                <Trans>Match Incidents</Trans>
            </div>
            <div className="body">
                <div className="match-incidents">
                    <div className="row align-items-center">
                        <div className="col period-time text-center text-bold">
                            <img src={iconWhistle} alt="whistle" className="icon-whistle" /> <Trans>Kick off</Trans>
                        </div>
                    </div>
                    {incidents.reverse().map(item => {
                        return (
                            <div key={Math.random()} className="match-incidents-row">
                                <Types item={item} t={t} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const Types = ({ item, t }) => {
    const { incidentType, isHome } = item;
    if (incidentType === 'period') {
        if (item.text === 'Second half' || item.text === 'First half') return false;
        return (
            <div className="row align-items-center">
                <div className="col period-time text-center text-bold">
                    <img src={iconWhistle} alt="whistle" className="icon-whistle" />{' '}
                    {item.text.replace('HT', t('HT')).replace('FT', t('FT'))}
                </div>
            </div>
        );
    }
    if (incidentType === 'injuryTime') {
        return (
            <div className="row">
                <div className="col additional-time text-center text-gray">
                    <Icon name="fas fa-plus" /> <Trans>Additional Time</Trans> {item.length}'
                </div>
            </div>
        );
    }
    if (incidentType === 'card') {
        return (
            <div className={`py-3 row align-items-center${isHome ? '' : ' flex-row-reverse'}`}>
                <div className="col">
                    <div className={`row align-items-center${isHome ? '' : ' flex-row-reverse'}`}>
                        <div className={`col put-border${isHome ? ' home text-right' : ' text-left'}`}>
                            {item.player ? <div className="name">{item.player.name}</div> : ''}
                            <div className="text-gray">
                                <Trans>{item.reason}</Trans>
                            </div>
                        </div>
                        <div className="col col-icon text-center">
                            <div className={item.incidentClass} />
                        </div>
                    </div>
                </div>
                <div className="col col-time">
                    <div className="time">
                        <div>{item.time}'</div>
                    </div>
                </div>
                <div className="col" />
            </div>
        );
    }
    if (incidentType === 'YellowRed') {
        return (
            <div className={`py-3 row align-items-center${isHome ? '' : ' flex-row-reverse'}`}>
                <div className="col">
                    <div className={`row align-items-center${isHome ? '' : ' flex-row-reverse'}`}>
                        <div className={`col put-border${isHome ? ' home text-right' : ' text-left'}`}>
                            {item.player ? <div className="name">{item.player.name}</div> : ''}
                            <div className="text-gray">
                                <Trans>{item.reason}</Trans>
                            </div>
                        </div>
                        <div className="col col-icon text-center">
                            <div className={item.incidentClass} />
                        </div>
                    </div>
                </div>
                <div className="col col-time">
                    <div className="time">
                        <div>{item.time}'</div>
                    </div>
                </div>
                <div className="col" />
            </div>
        );
    }
    if (incidentType === 'substitution') {
        return (
            <div className={`py-3 row align-items-center${isHome ? '' : ' flex-row-reverse'}`}>
                <div className="col">
                    <div className={`row align-items-center ${isHome ? '' : ' flex-row-reverse'}`}>
                        <div className={`col put-border ${isHome ? 'home text-right' : ' text-left'}`}>
                            {item.playerIn ? <div className="playerIn">{item.playerIn.name}</div> : ''}
                            {item.playerOut ? <div className="playerOut">{item.playerOut.name}</div> : ''}
                        </div>
                        <div className="col col-icon p-0 text-center">
                            <span className="icon-subs" />
                        </div>
                    </div>
                </div>
                <div className="col col-time">
                    <div className="time">
                        <div>{item.time}'</div>
                    </div>
                </div>
                <div className="col" />
            </div>
        );
    }
    if (incidentType === 'penalty') {
        return (
            <div className={`py-3 row missed-penalty align-items-center${isHome ? '' : ' flex-row-reverse'}`}>
                <div className="col">
                    <div className={`row align-items-center ${isHome ? '' : ' flex-row-reverse'}`}>
                        <div className={`col put-border ${isHome ? 'home text-right' : ' text-left'}`}>
                            {item.incidentDescription ? (
                                <div className="player text-bold">{item.incidentDescription}</div>
                            ) : (
                                ''
                            )}
                            {item.player ? <div className="text-gray">{item.player.name}</div> : ''}
                            {item.description ? (
                                <div className="text-gray">
                                    (<Trans>{item.description}</Trans>)
                                </div>
                            ) : (
                                ''
                            )}
                            {item.awayScore || item.homeScore ? (
                                <div className="text-bold">
                                    {item.homeScore} - {item.awayScore}
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="col col-icon col-goal-icon p-0 text-center">
                            <Icon name="far fa-futbol icon-goal" />
                            <Icon name="fas fa-times" />
                        </div>
                    </div>
                </div>
                <div className="col col-time">
                    <div className="time">
                        <div>
                            {item.time}
                            {item.addedTime ? <sup>+{item.addedTime}</sup> : "'"}
                        </div>
                    </div>
                </div>
                <div className="col" />
            </div>
        );
    }
    if (incidentType === 'goal') {
        return (
            <div className={`py-3 row goal align-items-center${isHome ? '' : ' flex-row-reverse'}`}>
                <div className="col">
                    <div className={`row align-items-center ${isHome ? '' : ' flex-row-reverse'}`}>
                        <div className={`col put-border ${isHome ? 'home text-right' : ' text-left'}`}>
                            {item.player ? <div className="player text-bold">{item.player.name}</div> : ''}
                            {item.assist1 ? <div className="text-gray">{item.assist1.name}</div> : ''}
                            {item.from ? (
                                <div className="text-gray goal-from">
                                    (<Trans>{item.from}</Trans>)
                                </div>
                            ) : (
                                ''
                            )}
                            {item.awayScore || item.homeScore ? (
                                <div className="text-bold">
                                    {item.homeScore} - {item.awayScore}
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="col col-icon col-goal-icon p-0 text-center">
                            <Icon name="far fa-futbol icon-goal" />
                        </div>
                    </div>
                </div>
                <div className="col col-time">
                    <div className="time">
                        <div>
                            {item.time}
                            {item.addedTime ? <sup>+{item.addedTime}</sup> : "'"}
                        </div>
                    </div>
                </div>
                <div className="col" />
            </div>
        );
    }
    return false;
};

export default withTranslation('translations')(Incidents);

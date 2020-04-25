import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { printImageSrc } from '../../../core/utils';

const PressureGraph = ({ event, t }) => {
    if (!event.liveForm || event.liveForm.length === 0) return false;
    return (
        <div>
            <div className="title">
                <Trans>Pressure</Trans>
            </div>
            <div className="body">
                <div className="pressure-graph-container mt-2">
                    <div className="row mx-0">
                        <div className="col pressure-graph p-0">
                            <div className="row m-0">
                                {event.liveForm.map(item => {
                                    const direction = item.value < 0 ? ' away' : ' home';
                                    const style = {
                                        height: `${Math.abs(item.value)}%`,
                                        top: item.value > 0 ? `-${item.value}%` : ''
                                    };
                                    return (
                                        <div
                                            key={Math.random()}
                                            className={`col${item.value !== 0 ? direction : ''}`}
                                            style={style}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        {event.liveForm.length < 91 ? (
                            <div
                                className="col blank p-0"
                                style={{
                                    flex: `0 0 ${91 - event.liveForm.length + 5}%`,
                                    maxWidth: `${91 - event.liveForm.length + 5}%`
                                }}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                    <div className="pressure-graph-animation" />
                    <div className="homeLabel">
                        <img
                            alt={t(event.teams.home.name)}
                            src={printImageSrc(`/images/team-logo/football_${event.teams.home.id}.png`)}
                        />
                    </div>
                    <div className="awayLabel">
                        <img
                            alt={t(event.teams.away.name)}
                            src={printImageSrc(`/images/team-logo/football_${event.teams.away.id}.png`)}
                        />
                    </div>
                </div>
                <div className="minute-measure row flex-nowrap mt-0 mb-2">
                    <div className="col label">
                        <Trans>Minutes</Trans>
                    </div>
                    <div className="col empty-space" />
                    <div className="col">15'</div>
                    <div className="col">30'</div>
                    <div className="col">45'</div>
                    <div className="col">60'</div>
                    <div className="col">75'</div>
                    <div className="col last">90'</div>
                </div>
            </div>
        </div>
    );
};

export default withTranslation('translations')(PressureGraph);

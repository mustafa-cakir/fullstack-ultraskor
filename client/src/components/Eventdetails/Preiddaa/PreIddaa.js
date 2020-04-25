import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import IddaLogo from '../../../assets/images/icon-iddaa.png';

const PreIddaa = ({ iddaaMatchData, swipeByTabId, eventData }) => {
    if (!iddaaMatchData) return false;
    const { m } = iddaaMatchData;

    if (!m || m.length < 1) return false;

    const isLive = eventData.event.status.type === 'inprogress';
    return (
        <div className="pre-iddaa">
            <div className="title">
                <img src={IddaLogo} className="title-logo" alt="Iddaa Oranlari, Iddaa Tahminleri" />{' '}
                <Trans>{isLive ? 'Live ' : ''}Iddaa Odds</Trans>
            </div>
            <div className="pre-iddaa-container" onClick={() => swipeByTabId(1)}>
                {m.map(market => {
                    // if (market.name !== "1-1") return false;
                    return (
                        <div key={market.mid} className="item">
                            <div className="row align-items-center">
                                <div className="col col-4 item-title">{market.mn}</div>
                                <div className="col col-mbs">
                                    <span className={'mbs mbs-' + market.mbs}>{market.mbs}</span>
                                </div>
                                <div className="col px-1 pr-2">
                                    <div className="row row-odds">
                                        {market.o.map(odd => (
                                            <div key={odd.ov} className="col">
                                                <div className="odd-box">
                                                    <div className="odd-box-name">{odd.ona}</div>
                                                    <div className="odd-box-value">{odd.odd.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div onClick={() => swipeByTabId(1)} className="pre-iddaa-link text-center">
                <span className="live-pulse" />{' '}
                <span>
                    <Trans>See All {isLive ? 'Live ' : ''}Iddaa Odds</Trans> <i className="fas fa-angle-right" />
                </span>
            </div>
        </div>
    );
};

export default withTranslation('translations')(PreIddaa);

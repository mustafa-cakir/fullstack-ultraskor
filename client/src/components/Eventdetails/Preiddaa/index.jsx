import React from 'react';
import { Trans } from 'react-i18next';
import IddaLogo from '../../../assets/images/icon-iddaa.png';
import Markets from '../Iddaa/Markets';

const PreIddaa = ({ iddaaData, isLive, swipeByTabId }) => {
    if (iddaaData.length === 0 && !isLive) return false;
    const displayedOdds = isLive
        ? ['4_4', '4_14', '4_14_3.5', '4_14_1.5', '4_14_2.5', '4_23', '4_34']
        : ['1_1', '2_101_2.5', '2_87', '2_101_3.5', '2_89'];

    let markets = iddaaData.reduce((whole, current) => {
        if (displayedOdds.indexOf(current.muk) > -1) whole.push(current);
        return whole;
    }, []);

    if (markets.length === 0) markets = iddaaData.splice(0, 6);

    return (
        <div className="pre-iddaa">
            <div className="title">
                <img src={IddaLogo} className="title-logo" alt="Iddaa Oranlari, Iddaa Tahminleri" />{' '}
                <Trans>{isLive ? 'Live ' : ''}Iddaa Odds</Trans>
            </div>
            <div
                className="pre-iddaa-container"
                onClick={() => swipeByTabId(5)}
                onKeyPress={() => swipeByTabId(5)}
                tabIndex={1}
                role="button"
            >
                <Markets markets={markets} />
            </div>
            <button type="button" onClick={() => swipeByTabId(5)} className="pre-iddaa-link text-center">
                <span className="live-pulse" />{' '}
                <span>
                    <Trans>See All {isLive ? 'Live ' : ''}Iddaa Odds</Trans> <i className="fas fa-angle-right" />
                </span>
            </button>
        </div>
    );
};

export default PreIddaa;

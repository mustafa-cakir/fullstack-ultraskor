import React from 'react';
import Icon from '../../common/Icon';
import { marketsPlaceholder } from '../../../core/utils/helper';

const Markets = ({ markets }) => {
    const marketsData = markets && markets.length > 0 ? markets : marketsPlaceholder;
    marketsData.sort((a, b) => (a.muk < b.muk ? -1 : 1));

    return marketsData.map(market => {
        return (
            <div key={market.mid} className="item">
                <div className="row align-items-center">
                    <div className="col col-4 item-title">{market.mn}</div>
                    <div className="col col-mbs">
                        <span className={`mbs mbs-${market.mbs}`}>{market.mbs}</span>
                    </div>
                    <div className="col pl-1">
                        <div className="row row-odds">
                            {market.o.map(odd => (
                                <div key={odd.ov} className="col">
                                    <div className="odd-box">
                                        <div className="odd-box-name">{odd.ona}</div>
                                        <div className="odd-box-value">
                                            {odd.locked ? <Icon name="fas fa-lock" /> : odd.odd.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    });
};

export default Markets;

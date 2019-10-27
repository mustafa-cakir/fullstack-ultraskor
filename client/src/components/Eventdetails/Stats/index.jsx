import React, { useState } from 'react';
import { Trans, withTranslation } from 'react-i18next';

const Stats = ({ stats, t }) => {
    const [period, setPeriod] = useState(0);
    const { periods } = stats;
    if (!periods[period]) return false;

    const customSorting = ['Possession', 'Shots', 'Shots extra', 'Passes', 'TVData', 'Duels', 'Defending'];
    const groups = periods[period].groups.reduce((total, item) => {
        item.sorting = customSorting.indexOf(item.groupName) !== -1 ? customSorting.indexOf(item.groupName) : 99;
        total.push(item);
        return total;
    }, []);
    groups.sort((a, b) => {
        if (a.sorting > b.sorting) return 1;
        if (b.sorting > a.sorting) return -1;
        return 0;
    });

    const periodChangeHandler = value => {
        setPeriod(value);
    };

    return (
        <div className="stats container">
            <div className="white-box mt-2 pb-2">
                {periods[1] && periods[2] && (
                    <div className="horizontal-tab">
                        <button
                            type="button"
                            className={period === 0 ? 'active' : ''}
                            onClick={() => periodChangeHandler(0)}
                        >
                            <span>
                                <Trans>Overal</Trans>
                            </span>
                        </button>
                        <button
                            type="button"
                            className={period === 1 ? 'active' : ''}
                            onClick={() => periodChangeHandler(1)}
                        >
                            <span>
                                <Trans>1st Half</Trans>
                            </span>
                        </button>
                        <button
                            type="button"
                            className={period === 2 ? 'active' : ''}
                            onClick={() => periodChangeHandler(2)}
                        >
                            <span>
                                <Trans>2nd Half</Trans>
                            </span>
                        </button>
                    </div>
                )}
                {groups.map(group => {
                    if (group.groupName === 'Possession') {
                        return (
                            <div key={group.groupName}>
                                <div className="group-title">
                                    <Trans>{group.groupName}</Trans>
                                </div>
                                {group.statisticsItems.map(item => {
                                    return (
                                        <div className="horizontal-bar" key={item.name}>
                                            <div className="row">
                                                <div className="col home" style={{ maxWidth: item.home }}>
                                                    {item.home}
                                                </div>
                                                <div className="col col-space" />
                                                <div className="col away" style={{ maxWidth: item.away }}>
                                                    {item.away}
                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }
                    return (
                        <div key={group.groupName}>
                            <div className="group-title">
                                {group.groupName === 'TVData' ? t('Discipline') : <Trans>{group.groupName}</Trans>}
                            </div>
                            {group.statisticsItems.map(item => {
                                const homeNum = parseInt(item.home, 10);
                                const awayNum = parseInt(item.away, 10);
                                const homeWidth = Math.floor((100 * homeNum) / (awayNum + homeNum));
                                const awayWidth = Math.floor((100 * awayNum) / (awayNum + homeNum));
                                return (
                                    <div className="horizontal-bar style-2 mb-3" key={item.name}>
                                        <div className="row labels mb-2">
                                            <div className="col text-left f-700">
                                                <span className={`num home-num ${homeNum > awayNum ? 'higher' : ''}`}>
                                                    {item.home}
                                                </span>
                                            </div>
                                            <div className="col f-300">
                                                <Trans>{item.name}</Trans>
                                            </div>
                                            <div className="col text-right f-700">
                                                <span className={`num away-num ${awayNum > homeNum ? 'higher' : ''}`}>
                                                    {item.away}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <div className="row col-container">
                                                    <div className="col" style={{ maxWidth: `${100 - homeWidth}%` }} />
                                                    <div className="col home" style={{ maxWidth: `${homeWidth}%` }} />
                                                </div>
                                            </div>
                                            <div className="col col-space" />
                                            <div className="col">
                                                <div className="row col-container">
                                                    <div className="col away" style={{ maxWidth: `${awayWidth}%` }} />
                                                    <div className="col" style={{ maxWidth: `${100 - awayWidth}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <hr />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default withTranslation('translations')(Stats);

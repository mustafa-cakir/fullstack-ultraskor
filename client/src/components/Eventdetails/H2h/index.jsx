import React, { useCallback, useEffect, useReducer } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import axios from 'axios';
import Tournament from '../../common/Tournament';
import { printImageSrc } from '../../../core/utils';
import Icon from '../../common/Icon';
import Loading from '../../common/Loading';
import Errors from '../../common/Errors';

const H2h = ({ id, teams, textList, t, updateAutoHeight, hasActived }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        tab: 'h2h',
        by: 'byDates',
        showMore: true,
        matches: null,
        isLoading: true,
        error: null
    });

    const { tab, by, showMore, matches, isLoading, error } = state;

    const getData = useCallback(() => {
        axios
            .get(`/api/eventdetails/${id}/head2head/${teams.home.id}/${teams.away.id}`)
            .then(res => {
                setState({
                    isLoading: false,
                    matches: res.data
                });
                setTimeout(() => {
                    updateAutoHeight();
                });
            })
            .catch(() => {
                setState({
                    isLoading: false,
                    error: t('Something went wrong')
                });
            });
    }, [id, teams.home.id, teams.away.id, updateAutoHeight, t]);

    useEffect(() => {
        if (hasActived) {
            getData();
        }
    }, [hasActived, getData]);

    if (!matches || isLoading || !hasActived) return <Loading type="whitebox container" />;
    if (error) return <Errors message={error} />;

    const tournaments = matches[tab][by];
    const tabClickHandler = newTab => {
        if (newTab !== tab) {
            setState({
                tab: newTab,
                showMore: true
            });
            updateAutoHeight();
        }
    };

    const showMoreClickHandler = () => {
        setState({
            showMore: !showMore
        });
        updateAutoHeight();
    };

    const byClickHandler = newBy => {
        if (newBy !== by) {
            setState({
                by: newBy
            });
            updateAutoHeight();
        }
    };

    return (
        <div className="h2h container">
            <div className="white-box mt-2 p-0">
                <div className="horizontal-tab pt-4">
                    <button
                        type="button"
                        className={tab === 'h2h' ? 'active' : ''}
                        onClick={() => tabClickHandler('h2h')}
                    >
                        <span className="tab-container">
                            <Trans>H2H</Trans>
                        </span>
                    </button>
                    <button
                        type="button"
                        className={tab === 'home' ? 'active' : ''}
                        onClick={() => tabClickHandler('home')}
                    >
                        <span className="tab-container">
                            <img
                                className="team-logo"
                                alt={t(teams.home.name)}
                                src={printImageSrc(`/images/team-logo/football_${teams.home.id}.png`)}
                            />
                            <div className="team-name">{t(teams.home.name)}</div>
                        </span>
                    </button>
                    <button
                        type="button"
                        className={tab === 'away' ? 'active' : ''}
                        onClick={() => tabClickHandler('away')}
                    >
                        <span className="tab-container">
                            <img
                                className="team-logo"
                                alt={t(teams.home.name)}
                                src={printImageSrc(`/images/team-logo/football_${teams.away.id}.png`)}
                            />
                            <div className="team-name">{t(teams.away.name)}</div>
                        </span>
                    </button>
                </div>
                {tournaments && tournaments.length > 0 && (
                    <div className="sort-by-container">
                        <button
                            type="button"
                            className={`sort-by-btn${by === 'byDates' ? ' checked' : ''}`}
                            onClick={() => byClickHandler('byDates')}
                        >
                            <span className="checkbox" />
                            <Trans>By Dates</Trans>
                        </button>
                        <button
                            type="button"
                            className={`sort-by-btn${by === 'byTournaments' ? ' checked' : ''}`}
                            onClick={() => byClickHandler('byTournaments')}
                        >
                            <span className="checkbox" />
                            <Trans>By Tournaments</Trans>
                        </button>
                    </div>
                )}
                {textList && (
                    <MatchTextInfo
                        textList={textList}
                        tab={tab}
                        showMore={showMore}
                        showMoreClickHandler={showMoreClickHandler}
                    />
                )}
                <div className="h2h-list">
                    {tournaments && tournaments.length > 0 ? (
                        <Tournament
                            favEvents={[]}
                            tournaments={tournaments}
                            from="h2h"
                            selected={tab}
                            selectedId={tab === 'home' ? teams.home.id : teams.away.id}
                        />
                    ) : (
                        <div className="no-match-found">
                            <Trans>No match found!</Trans>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MatchTextInfo = ({ textList, tab, showMore, showMoreClickHandler }) => {
    let filterBy = 'Aralarında Oynanan Maçlar';
    if (tab === 'home') filterBy = 'Ev Sahibi Takım';
    else if (tab === 'away') filterBy = 'Misafir Takım';
    const list = textList.filter(x => x.textGroupName === filterBy);
    return (
        <div className="match-text-info">
            {list.map((item, index) => (
                <React.Fragment key={item.textValue}>
                    <p className={index > 1 && showMore ? 'd-none' : ''}>
                        <Icon name="fa fa-angle-right" /> {item.textValue}
                    </p>
                    {index === 1 && showMore && (
                        <button type="button" className="show-more" onClick={() => showMoreClickHandler()}>
                            <Trans>Show More</Trans> <Icon name="fa fa-angle-down" />
                        </button>
                    )}
                </React.Fragment>
            ))}
            {!showMore && list.length > 2 && (
                <button type="button" className="show-more" onClick={() => showMoreClickHandler()}>
                    <Trans>Hide</Trans> <Icon name="fa fa-angle-up" />
                </button>
            )}
        </div>
    );
};

export default withTranslation('translations')(H2h);

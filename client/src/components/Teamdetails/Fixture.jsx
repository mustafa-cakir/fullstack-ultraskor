import React, { useCallback, useEffect, useReducer } from 'react';
import { Trans } from 'react-i18next';
import axios from 'axios';
import Tournament from '../common/Tournament';
import Icon from '../common/Icon';
import Loading from '../common/Loading';
import Errors from '../common/Errors';

const Fixture = ({ teamId, updateAutoHeight }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        by: 'byDates',
        isDropdown: false,
        data: null,
        isLoading: true,
        error: null
    });
    const { by, isDropdown, data, isLoading, error } = state;

    const getData = useCallback(() => {
        axios
            .get(`/api/team/${teamId}`)
            .then(res => {
                setState({
                    data: res.data,
                    isLoading: false,
                    error: null
                });
                setTimeout(() => {
                    updateAutoHeight();
                }, 2000);
            })
            .catch(err => {
                setState({
                    error: err,
                    isLoading: false
                });
            });
    }, []);

    useEffect(() => {
        getData();
    }, [getData]);

    const byClickHandler = newBy => {
        if (newBy !== by) {
            setState({
                by: newBy,
                isDropdown: false
            });
        }
    };

    const prevClickHandler = () => {};
    const nextClickHandler = () => {};

    const dropdownClickHandler = () => {
        setState({
            isDropdown: !isDropdown
        });
    };

    if (!data || isLoading) return <Loading type="whitebox container" />;
    if (error) return <Errors message={error} />;

    return (
        <div className="section-fixture">
            <div className="container">
                <div className="white-box mt-2">
                    <div className="px-3">
                        <div className="row heading align-items-center">
                            <button
                                type="button"
                                className="col col-3 text-left col-nav"
                                onClick={() => prevClickHandler()}
                            >
                                <Icon name="fas fa-chevron-left" /> <Trans>Prev</Trans>
                            </button>
                            <div className="col px-2 col-6 text-center col-dropdown">
                                <div className={`pure-dropdown${isDropdown ? ' open' : ''}`}>
                                    <button type="button" className="pure-dropdown-btn" onClick={dropdownClickHandler}>
                                        {by === 'byDates' && <Trans>Order By Dates</Trans>}
                                        {by === 'byTournaments' && <Trans>Order By Tournaments</Trans>}
                                        <Icon name="fas fa-caret-down" />
                                    </button>
                                    <div className="dropdown">
                                        <ul>
                                            <li className={by === 'byDates' ? 'active' : ''}>
                                                <button type="button" onClick={() => byClickHandler('byDates')}>
                                                    <Trans>Order By Dates</Trans>
                                                </button>
                                            </li>
                                            <li className={by === 'byTournaments' ? 'active' : ''}>
                                                <button type="button" onClick={() => byClickHandler('byTournaments')}>
                                                    <Trans>Order By Tournaments</Trans>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="col col-3 text-right col-nav"
                                onClick={() => nextClickHandler()}
                            >
                                <Trans>Next</Trans> <Icon name="fas fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                    <div className="fixture-list position-relative">
                        {!data || isLoading ? (
                            <Loading type="inside" />
                        ) : (
                            <Tournament tournaments={data[by]} from="h2h" selectedId={teamId} selected="home" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Fixture;

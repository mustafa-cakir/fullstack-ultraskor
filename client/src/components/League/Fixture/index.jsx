import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { withTranslation, Trans } from 'react-i18next';
import Icon from '../../common/Icon';
import Loading from '../../common/Loading';
import Tournament from '../../common/Tournament';
import './Style.scss';

const Fixture = ({ roundMatches, rounds, leagueid, seasonid, t }) => {
    const initialStates = {
        roundMatchesLocal: roundMatches,
        isLoading: false,
        isDropdown: false,
        roundName: roundMatches.data.roundName,
        roundIndex: parseFloat(roundMatches.data.index)
    };
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), initialStates);
    const { error, roundMatchesLocal, isLoading, isDropdown, roundIndex, roundName } = state;

    const initGetData = (round, name) => {
        axios
            .get(`/api/u-tournament/${leagueid}/${seasonid}/matches/round/${round}${name ? `/${name}` : ''}`)
            .then(res => {
                console.log(res.data);
                setState({
                    isLoading: false,
                    roundMatchesLocal: res.data,
                    roundName: res.data.data.roundName,
                    roundIndex: parseFloat(res.data.data.index)
                });
            })
            .catch(() => {
                setState({
                    isLoading: false,
                    error: t('Something went wrong')
                });
            });
    };

    const roundClicked = round => {
        setState({
            isDropdown: false,
            isLoading: true
        });
        initGetData(round.round, round.name);
    };

    const dropdownClickHandler = () => {
        setState({
            isDropdown: !isDropdown
        });
    };

    // console.log(roundName, currentRound);
    // console.log(Number.isNaN(parseFloat(currentRound)), parseFloat(currentRound));
    const getCurrentRoundIndex = roundName
        ? rounds.findIndex(x => x.name === roundName)
        : rounds.findIndex(x => x.round === roundIndex && x.name === null);
    const prevRound = rounds[getCurrentRoundIndex - 1];
    const nextRound = rounds[getCurrentRoundIndex + 1];

    return (
        <div className="section-fixture">
            <div className="container">
                <div className="white-box mt-2">
                    <div className="px-3">
                        <div className="row heading align-items-center">
                            <button
                                type="button"
                                className={`col col-3 text-left col-nav ${!prevRound ? 'not-exist' : ''}`}
                                onClick={() => (prevRound ? roundClicked(prevRound) : '')}
                            >
                                <Icon name="fas fa-chevron-left" /> <Trans>Prev</Trans>
                            </button>
                            <div className="col px-2 col-6 text-center col-dropdown">
                                <div className={`pure-dropdown${isDropdown ? ' open' : ''}`}>
                                    <button type="button" className="pure-dropdown-btn" onClick={dropdownClickHandler}>
                                        {roundName ? (
                                            <Trans>{roundName}</Trans>
                                        ) : (
                                            <span>
                                                {roundIndex}
                                                <Trans>th Week</Trans>
                                            </span>
                                        )}{' '}
                                        <Icon name="fas fa-caret-down" />
                                    </button>
                                    <div className="dropdown">
                                        <ul>
                                            {rounds.map(round => {
                                                let isActive = null;
                                                let isThisTournament = null;

                                                if (round.name && round.name === roundName) {
                                                    isActive = true;
                                                } else if (
                                                    round.name === null &&
                                                    roundName == null &&
                                                    round.round === roundIndex
                                                ) {
                                                    isActive = true;
                                                }

                                                if (round.name && round.name === roundMatches.data.roundName) {
                                                    isThisTournament = true;
                                                } else if (
                                                    round.name === null &&
                                                    roundMatches.data.roundName === null &&
                                                    round.round === parseFloat(roundMatches.data.index)
                                                ) {
                                                    isThisTournament = true;
                                                }

                                                return (
                                                    <li
                                                        key={`${round.name}_${round.round}`}
                                                        className={
                                                            (isActive ? 'active' : '') +
                                                            (isThisTournament ? ' this-round' : '')
                                                        }
                                                    >
                                                        <button type="button" onClick={() => roundClicked(round)}>
                                                            {round.name ? (
                                                                <Trans>{round.name}</Trans>
                                                            ) : (
                                                                <span>
                                                                    {round.round}
                                                                    <Trans>th Week</Trans>
                                                                </span>
                                                            )}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`col col-3 text-right col-nav ${!nextRound ? 'not-exist' : ''}`}
                                onClick={() => (nextRound ? roundClicked(nextRound) : '')}
                            >
                                <Trans>Next</Trans> <Icon name="fas fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                    <div className="fixture-list position-relative">
                        {isLoading ? <Loading type="inside" /> : ''}
                        <Tournament tournaments={roundMatchesLocal.tournaments} from="fixture" selected="h2h" />
                    </div>
                </div>
            </div>
        </div>
    );
};

Fixture.propTypes = {
    roundMatches: PropTypes.object.isRequired,
    leagueid: PropTypes.string.isRequired,
    seasonid: PropTypes.string.isRequired
};

Fixture.defaultProps = {};

export default withTranslation('translations')(Fixture);

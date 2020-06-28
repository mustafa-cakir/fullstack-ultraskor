import React, { useReducer } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import DayPicker from 'react-day-picker';
import MomentLocaleUtils from 'react-day-picker/moment';
import moment from 'moment';
import Icon from '../common/Icon';
import { flagImg } from '../../core/utils/helper';
import { toggleValueInArray } from '../../core/utils';

const Headertabs = ({
    t,
    i18n,
    isLive,
    filteredTournaments,
    setParentState,
    mainData,
    currentDate,
    isToday,
    isFav,
}) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        isFilterDropdown: false,
        filteredTournamentsLocale: filteredTournaments,
        isSportDropdown: false,
        isDateDropdown: false,
    });
    const { isFilterDropdown, filteredTournamentsLocale, isSportDropdown, isDateDropdown } = state;

    const history = useHistory();
    const { language } = i18n;
    const openSportDropdown = () => {
        setState({
            isSportDropdown: !isSportDropdown,
            isFilterDropdown: false,
            isDateDropdown: false,
        });
    };

    const openFilterDropdown = () => {
        setState({
            isSportDropdown: false,
            isFilterDropdown: !isFilterDropdown,
            isDateDropdown: false,
        });
    };

    const openDateDropdown = () => {
        setState({
            isSportDropdown: false,
            isFilterDropdown: false,
            isDateDropdown: !isDateDropdown,
        });
    };

    const toggleLive = () => {
        setParentState({
            isLive: !isLive,
        });
    };

    const toggleFav = () => {
        setParentState({
            isFav: !isFav,
        });
    };

    const handleSelectedDay = (day) => {
        const selectedDay = moment(day).format('YYYY-MM-DD');
        if (currentDate !== selectedDay) {
            history.push(`/${t('matches')}/${t('date')}-${selectedDay}`);
        }

        if (filteredTournaments.length > 0) {
            setParentState({
                filteredTournaments: [],
            });
        }

        setState({
            isDateDropdown: false,
        });
    };

    const itemClickHandler = (id) => {
        setState({
            filteredTournamentsLocale: toggleValueInArray(filteredTournamentsLocale, id),
        });
    };

    const applyFilter = () => {
        setState({
            isFilterDropdown: false,
        });
        setParentState({
            filteredTournaments: filteredTournamentsLocale,
        });
    };

    const clearFilter = () => {
        setState({
            isFilterDropdown: false,
            filteredTournamentsLocale: [],
        });
        setParentState({
            filteredTournaments: [],
        });
    };

    return (
        <ul className="header-tabs row">
            <li className="col p-0">
                <button type="button" className="header-tabs-btn" onClick={openSportDropdown}>
                    <Icon name="far fa-futbol mr-2" />
                    Futbol
                    <Icon name={`ml-2 fas fa-angle-${isSportDropdown ? 'up' : 'down'}`} />
                </button>
                <div
                    className={`dropdown-menu sports left${isSportDropdown ? ' show' : ''}`}
                    aria-labelledby="dropdownMenuButton"
                >
                    <a className="dropdown-item" href="/">
                        <Icon name="far fa-futbol" /> Futbol
                    </a>
                    <hr className="separator" />
                    <a className="dropdown-item soon" href="/">
                        <Icon name="fas fa-basketball-ball" /> Basketball
                        <small>
                            {' '}
                            - <Trans>very soon</Trans>
                        </small>
                    </a>
                    <hr className="separator" />
                    <a className="dropdown-item soon" href="/">
                        <Icon name="fas fa-table-tennis" /> Tennis
                        <small>
                            {' '}
                            - <Trans>soon</Trans>
                        </small>
                    </a>
                    <hr className="separator" />
                    <a className="dropdown-item soon" href="/">
                        <Icon name="fas fa-baseball-ball" /> Baseball
                        <small>
                            {' '}
                            - <Trans>soon</Trans>
                        </small>
                    </a>
                    <hr className="separator" />
                    <a className="dropdown-item soon" href="/">
                        <Icon name="fas fa-football-ball" /> Amr. Football{' '}
                        <small>
                            {' '}
                            - <Trans>soon</Trans>
                        </small>
                    </a>
                    <hr className="separator" />
                    <a className="dropdown-item soon" href="/">
                        <Icon name="fas fa-football-ball" /> Rugby
                        <small>
                            {' '}
                            - <Trans>soon</Trans>
                        </small>
                    </a>
                    <hr className="separator" />
                    <a className="dropdown-item soon" href="/">
                        <Icon name="fas fa-hockey-puck" /> Hokey
                        <small>
                            {' '}
                            - <Trans>soon</Trans>
                        </small>
                    </a>
                    <hr className="separator" />
                    <a className="dropdown-item soon" href="/">
                        <Icon name="fas fa-volleyball-ball" /> Voleyball
                        <small>
                            {' '}
                            - <Trans>soon</Trans>
                        </small>
                    </a>
                </div>
            </li>

            <li className={`col col-fav p-0${isFav ? ' active' : ''}`}>
                <button type="button" className="header-tabs-btn justify-content-center" onClick={toggleFav}>
                    <Icon name="far fa-star" />
                </button>
            </li>
            <li className={`col col-live p-0${isLive ? ' active' : ''}`}>
                <button type="button" className="header-tabs-btn justify-content-center" onClick={toggleLive}>
                    <Icon name="far fa-clock mr-1" /> <Trans>Live</Trans>
                </button>
            </li>
            <li className="col col-date p-0">
                <button type="button" className="header-tabs-btn justify-content-end" onClick={openDateDropdown}>
                    {isToday ? (
                        <Trans>Today</Trans>
                    ) : (
                        <div className="selected-date">
                            <span>{moment(currentDate).format('DD')}</span>
                            <span>{moment(currentDate).format('MMM')}</span>
                        </div>
                    )}
                    <Icon name="mx-2 fas fa-angle-down" />
                </button>
                {isDateDropdown ? (
                    <DayPicker
                        onDayClick={(day) => handleSelectedDay(day)}
                        firstDayOfWeek={1}
                        selectedDays={new Date(currentDate)}
                        locale={language}
                        localeUtils={MomentLocaleUtils}
                    />
                ) : null}
            </li>
            <li className={`col col-filter p-0${filteredTournaments.length > 0 ? ' active' : ''}`}>
                <button type="button" className="header-tabs-btn justify-content-center" onClick={openFilterDropdown}>
                    <Icon name="ml-1 fas fa-filter" />
                </button>
                <div
                    className={`dropdown-menu filters right${isFilterDropdown ? ' show' : ''}`}
                    aria-labelledby="dropdownMenuButton"
                >
                    <div className="list-container">
                        {isFilterDropdown ? (
                            <FilterItems
                                i18n={i18n}
                                filteredTournamentsLocale={filteredTournamentsLocale}
                                mainData={mainData}
                                itemClickHandler={itemClickHandler}
                                language={language}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                    <div className="confirm-container row m-0">
                        <button type="button" className="col filter-btn filter-okay" onClick={applyFilter}>
                            <Trans>Apply</Trans> (<strong>{filteredTournamentsLocale.length}</strong>)
                        </button>
                        <button type="button" className="col filter-btn filter-clear" onClick={clearFilter}>
                            <Trans>Clear</Trans>
                        </button>
                    </div>
                </div>
            </li>
        </ul>
    );
};

const FilterItems = ({ mainData, itemClickHandler, filteredTournamentsLocale, language }) => {
    let index = 1;
    return mainData.map((tournament) => {
        index += 1;
        const classname = filteredTournamentsLocale.indexOf(tournament.tournament.uniqueId) > -1 ? ' checked' : '';
        return (
            <div key={`${tournament.tournament.uniqueId}_${index}`}>
                <button
                    type="button"
                    className={`dropdown-item${classname}`}
                    onClick={() => itemClickHandler(tournament.tournament.uniqueId)}
                >
                    <span className="checkbox" />
                    {flagImg(tournament)}
                    <div className="col tournament-name px-2">
                        <strong>
                            <Trans>{tournament.category.name}</Trans>
                        </strong>{' '}
                        - {tournament.tournament.name[language]}
                    </div>
                </button>
                <hr className="separator" />
            </div>
        );
    });
};

export default withTranslation('translations')(Headertabs);

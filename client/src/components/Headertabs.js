import React, { PureComponent } from 'react';
import moment from 'moment';
import DayPicker from 'react-day-picker';
import { Trans, withTranslation } from 'react-i18next';
import 'moment/locale/tr';
import MomentLocaleUtils from 'react-day-picker/moment';
import Icon from './common/Icon';
import { flagImg } from '../Helper';

class Headertabs extends PureComponent {
    constructor(props) {
        super(props);
        const { filteredTournaments, todaysDateByUrl } = this.props;
        this.state = {
            isFilterDropdown: false,
            filteredTournamentsLocale: filteredTournaments,
            isSportDropdown: false,
            isDateDropdown: false,
            selectedDay: todaysDateByUrl || moment().format('YYYY-MM-DD')
        };
    }

    clearFilter() {
        const { updateParentState } = this.props;
        this.setState(
            {
                filteredTournamentsLocale: [],
                isFilterDropdown: false
            },
            () => {
                updateParentState(
                    {
                        filteredTournaments: []
                    },
                    true
                );
            }
        );
    }

    applyFilter() {
        const { updateParentState } = this.props;
        const { filteredTournamentsLocale } = this.state;
        this.setState({ isFilterDropdown: false }, () => {
            updateParentState({ filteredTournaments: filteredTournamentsLocale }, true);
        });
    }

    filterItemClickHandler(id) {
        const { filteredTournamentsLocale } = this.state;
        const newState = [...filteredTournamentsLocale];
        const i = newState.indexOf(id);

        if (i < 0) newState.push(id);
        else newState.splice(i, 1);

        this.setState({
            filteredTournamentsLocale: newState
        });
    }

    toggleLive() {
        const { updateParentState, isLive } = this.props;
        this.setState({
            isFilterDropdown: false,
            isSportDropdown: false,
            isDateDropdown: false
        }); // close other dropdowns
        updateParentState({ isLive: !isLive }, true);
    }

    openFilterDropdown() {
        const { isFilterDropdown } = this.state;
        this.setState({
            isFilterDropdown: !isFilterDropdown,
            isSportDropdown: false,
            isDateDropdown: false
        });
    }

    openSportDropdown() {
        const { isSportDropdown } = this.state;
        this.setState({
            isSportDropdown: !isSportDropdown,
            isFilterDropdown: false,
            isDateDropdown: false
        });
    }

    openDateDropdown() {
        const { isDateDropdown } = this.state;
        this.setState({
            isDateDropdown: !isDateDropdown,
            isSportDropdown: false,
            isFilterDropdown: false
        });
    }

    handleSelectedDay(day) {
        const { t, initGetData, updateParentState } = this.props;
        const { selectedDay: selectedDayState, filteredTournamentsLocale } = this.state;
        const selectedDay = moment(day).format('YYYY-MM-DD');
        if (selectedDay !== selectedDayState) {
            initGetData({
                api: `/api/homepage/list/${selectedDay}`,
                today: moment(0, 'HH').diff(selectedDay, 'days') === 0 ? 1 : 0,
                page: 'homepage'
            });
            const url =
                moment().format('DD') === moment(selectedDay).format('DD')
                    ? '/'
                    : `/${t('matches')}/${t('date')}-${selectedDay}`;
            window.history.pushState(selectedDay, `UltraSkor - ${selectedDay}`, url);
        }

        if (filteredTournamentsLocale.length > 0) {
            updateParentState(
                {
                    filteredTournaments: []
                },
                true
            );
        }

        this.setState({
            selectedDay,
            isDateDropdown: false,
            filteredTournamentsLocale: []
        });
    }

    render() {
        const { i18n, isLive, filteredTournaments, mainData } = this.props;
        const {
            isSportDropdown,
            selectedDay,
            isDateDropdown,
            isFilterDropdown,
            filteredTournamentsLocale
        } = this.state;
        moment.locale(i18n.language === 'tr' ? 'tr-TR' : 'en-US');
        return (
            <ul className="header-tabs row">
                <li className="col p-0">
                    <div
                        role="button"
                        className="header-tabs-container"
                        onKeyPress={this.openSportDropdown.bind(this)}
                        onClick={this.openSportDropdown.bind(this)}
                        tabIndex="0"
                    >
                        <Icon name="far fa-futbol mr-2" />
                        Futbol
                        <Icon name={`ml-2 fas fa-angle-${isSportDropdown ? 'up' : 'down'}`} />
                    </div>
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

                <li className={`col col-live p-0${isLive ? ' active' : ''}`}>
                    <div className="header-tabs-container justify-content-center" onClick={this.toggleLive.bind(this)}>
                        <Icon name="far fa-clock mr-1" /> <Trans>Live</Trans>
                    </div>
                </li>
                <li className="col col-date p-0">
                    <div
                        className="header-tabs-container justify-content-end"
                        onClick={this.openDateDropdown.bind(this)}
                    >
                        {moment(selectedDay).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') ? (
                            <Trans>Today</Trans>
                        ) : (
                            <div className="selected-date">
                                <span>{moment(selectedDay).format('DD')}</span>
                                <span>{moment(selectedDay).format('MMM')}</span>
                            </div>
                        )}
                        <Icon name="mx-2 fas fa-angle-down" />
                    </div>
                    {isDateDropdown ? (
                        <DayPicker
                            onDayClick={day => this.handleSelectedDay(day)}
                            firstDayOfWeek={1}
                            selectedDays={new Date(selectedDay)}
                            locale={i18n.language}
                            localeUtils={MomentLocaleUtils}
                        />
                    ) : null}
                </li>
                <li className={`col col-filter p-0${filteredTournaments.length > 0 ? ' active' : ''}`}>
                    <div
                        className="header-tabs-container justify-content-center"
                        onClick={this.openFilterDropdown.bind(this)}
                    >
                        <Icon name="ml-1 fas fa-filter" />
                    </div>
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
                                    filterItemClickHandler={id => this.filterItemClickHandler(id)}
                                />
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="confirm-container row m-0">
                            <div className="col filter-btn filter-okay" onClick={this.applyFilter.bind(this)}>
                                <Trans>Apply</Trans> (<strong>{filteredTournamentsLocale.length}</strong>)
                            </div>
                            <div className="col filter-btn filter-clear" onClick={this.clearFilter.bind(this)}>
                                <Trans>Clear</Trans>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        );
    }
}

const FilterItems = props => {
    let index = 1;
    return props.mainData.map(tournament => {
        index += 1;
        return (
            <div key={`${tournament.tournament.uniqueId}_${index}`}>
                <div
                    className={`dropdown-item${
                        props.filteredTournamentsLocale.indexOf(tournament.tournament.uniqueId) > -1 ? ' checked' : ''
                    }`}
                    onClick={() => props.filterItemClickHandler(tournament.tournament.uniqueId)}
                >
                    <span className="checkbox" />
                    {flagImg(tournament)}
                    <div className="col tournament-name px-2">
                        <strong>
                            <Trans>{tournament.category.name}</Trans>
                        </strong>{' '}
                        - {tournament.tournament.name[props.i18n.language]}
                    </div>
                </div>
                <hr className="separator" />
            </div>
        );
    });
};

export default withTranslation('translations')(Headertabs);

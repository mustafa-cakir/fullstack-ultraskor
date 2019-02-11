import React, {Component} from 'react';
import Icon from "./common/Icon";
import DayPicker from "react-day-picker";
import moment from "moment";
import {Trans, withNamespaces} from "react-i18next";
import 'moment/locale/tr';
import MomentLocaleUtils from 'react-day-picker/moment';
import {flagImg} from "../Helper";

class Headertabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFilterDropdown: false,
            filteredItems: [],
            isLive: false,
            isSportDropdown: false,
            isDateDropdown: false,
            selectedDay: this.props.todaysDateByUrl || moment().format('YYYY-MM-DD'),
        };
    }

    componentDidMount() {
        const persistState = sessionStorage.getItem('HeadertabsState');
        if (persistState) {
            try {
                this.setState(JSON.parse(persistState));
            } catch (e) {
                console.log("Prev state can't implemented, something went seriously wrong!");
            }
        }
    }

    setSessionStorage() {
        const {...obj} = this.state;
        obj.isSportDropdown = false;
        obj.isFilterDropdown = false;
        obj.isDateDropdown = false;
        delete obj.selectedDay;
        sessionStorage.setItem('HeadertabsState', JSON.stringify(obj));
    }

    componentDidUpdate(prevProps) {
        if (this.props.orjData && !this.props.orjData.error && prevProps.orjData !== this.props.orjData) {
            if (this.state.isLive) {
                this.applyLiveHandler(false);
            }
            if (this.state.filteredItems.length > 0) {
                this.applyFilter();
            }

        }
    }

    clearFilter() {
        this.setState({
            filteredItems: [],
            isFilterDropdown: false
        }, this.setSessionStorage);
        this.props.updateParentState({
            mainData: this.props.orjData
        }).then(() => {
            if (this.state.isLive) {
                this.applyLiveHandler(false)
            }
        });
    }

    applyFilter(click) {
        if (click) this.setState({isFilterDropdown: false});
        if (this.state.filteredItems.length > 0) {
            let LiveMatches = JSON.parse(JSON.stringify(this.props.orjData));
            //let LiveMatches = cloneDeep(this.props.orjData);  // requires installing lodash
            LiveMatches.sportItem.tournaments = LiveMatches.sportItem.tournaments.filter((tournament) => {
                return this.state.filteredItems.indexOf(tournament.tournament.id) > -1
            });
            this.props.updateParentState({
                mainData: LiveMatches
            }).then(() => {
                this.setSessionStorage();
                if (this.state.isLive) {
                    this.applyLiveHandler(false);
                }
            });
        } else {
            this.clearFilter();
        }
    }

    filterItemClickHandler(el) {
        let item = el.currentTarget;
        item.classList.toggle('checked');

        let newfilteredItems = [...this.state.filteredItems],
            id = parseInt(el.currentTarget.getAttribute('data-id'));

        if (newfilteredItems.indexOf(id) === -1) {
            newfilteredItems.push(id);
        } else {
            newfilteredItems = newfilteredItems.filter(x => x !== id);
        }
        this.setState({filteredItems: newfilteredItems});
    }

    applyLiveHandler(livePrevState, clicked = false) {
        if (livePrevState === false) {
            let LiveMatches = JSON.parse(JSON.stringify(this.props.mainData));
            //let LiveMatches = cloneDeep(this.props.mainData);   // requires installing lodash
            LiveMatches.sportItem.tournaments = LiveMatches.sportItem.tournaments.reduce(function (whole, tournament) {
                tournament.events = tournament.events.filter((event) => {
                    return event.status.type === "inprogress";
                });
                tournament.events.forEach(() => {
                    if (whole.indexOf(tournament) < 0) whole.push(tournament);
                });
                return whole;
            }, []);
            this.props.updateParentState({
                mainData: LiveMatches
            });
        } else {
            if (this.state.filteredItems.length > 0) {
                this.applyFilter(clicked);
            } else {
                this.props.updateParentState({
                    mainData: this.props.orjData
                });
            }
        }
    }

    toggleLive() {
        let livePrevState = this.state.isLive;
        this.setState({isFilterDropdown: false, isSportDropdown: false, isDateDropdown: false}); // close other dropdowns
        this.applyLiveHandler(livePrevState, true);
        this.setState({isLive: !livePrevState}, this.setSessionStorage);
    }

    openFilterDropdown() {
        this.setState({
            isFilterDropdown: !this.state.isFilterDropdown,
            isSportDropdown: false,
            isDateDropdown: false
        }, this.setSessionStorage);
    }

    openSportDropdown() {
        this.setState({
            isSportDropdown: !this.state.isSportDropdown,
            isFilterDropdown: false,
            isDateDropdown: false
        }, this.setSessionStorage);
    }

    openDateDropdown() {
        this.setState({
            isDateDropdown: !this.state.isDateDropdown,
            isSportDropdown: false,
            isFilterDropdown: false
        });
    }

    handleSelectedDay(day) {
        const {t} = this.props;
        let selectedDay = moment(day).format('YYYY-MM-DD');
        if (selectedDay !== this.state.selectedDay) {
            this.props.initGetData({
                api: '/football//' + selectedDay + '/json',
	            page: "homepage"
            });
            let url = (moment().format('DD') === moment(selectedDay).format('DD')) ? "/" : `/${t('matches')}/${t('date')}-${selectedDay}`
            window.history.pushState(selectedDay, `UltraSkor - ${selectedDay}`, url);
        }
        this.setState({
            selectedDay: selectedDay,
            isDateDropdown: false,
            isLive: false,
            filteredItems: []
        }, this.setSessionStorage);
    }

    render() {
        const {i18n} = this.props;
        moment.locale((i18n.language === "tr") ? "tr-TR" : "en-US");
        return (
            <ul className="header-tabs row">
                <li className="col p-0">
                    <div
                        className="header-tabs-container"
                        onClick={this.openSportDropdown.bind(this)}
                        tabIndex="0">
                        <Icon name="far fa-futbol mr-2"/>Futbol<Icon
                        name={"ml-2 fas fa-angle-" + (this.state.isSportDropdown ? 'up' : 'down')}/>
                    </div>
                    <div className={"dropdown-menu sports left" + (this.state.isSportDropdown ? ' show' : '')}
                         aria-labelledby="dropdownMenuButton">
                        <a className="dropdown-item" href="/"><Icon name={"far fa-futbol"}/> Futbol</a>
                        <hr className="separator"/>
                        <a className="dropdown-item" href="/"><Icon name={"fas fa-basketball-ball"}/> Basketball</a>
                        <hr className="separator"/>
                        <a className="dropdown-item" href="/"><Icon name={"fas fa-table-tennis"}/> Tennis</a>
                        <hr className="separator"/>
                        <a className="dropdown-item" href="/"><Icon name={"fas fa-baseball-ball"}/> Baseball</a>
                        <hr className="separator"/>
                        <a className="dropdown-item" href="/"><Icon name={"fas fa-football-ball"}/> Amr.
                            Football</a>
                        <hr className="separator"/>
                        <a className="dropdown-item" href="/"><Icon name={"fas fa-football-ball"}/> Rugby</a>
                        <hr className="separator"/>
                        <a className="dropdown-item" href="/"><Icon name={"fas fa-hockey-puck"}/> Hokey</a>
                        <hr className="separator"/>
                        <a className="dropdown-item" href="/"><Icon name={"fas fa-volleyball-ball"}/> Voleyball</a>
                    </div>
                </li>

                <li className={"col col-live p-0" + (this.state.isLive ? ' active' : '')}>
                    <div className="header-tabs-container justify-content-center"
                         onClick={this.toggleLive.bind(this)}>
                        <Icon name="far fa-clock mr-1"/> <Trans>Live</Trans>
                    </div>
                </li>
                <li className="col col-date p-0">
                    <div className="header-tabs-container justify-content-end"
                         onClick={this.openDateDropdown.bind(this)}>
                        {(moment(this.state.selectedDay).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) ?
                            <Trans>Today</Trans> :
                            <div className={"selected-date"}>
                                <span>{moment(this.state.selectedDay).format("DD")}</span><span>{moment(this.state.selectedDay).format("MMM")}</span>
                            </div>}
                        <Icon name="mx-2 fas fa-angle-down"/>
                    </div>
                    {this.state.isDateDropdown ? (
                        <DayPicker
                            onDayClick={this.handleSelectedDay.bind(this)}
                            firstDayOfWeek={1}
                            selectedDays={new Date(this.state.selectedDay)}
                            locale={i18n.language}
                            localeUtils={MomentLocaleUtils}
                        />
                    ) : (
                        null
                    )}
                </li>
                <li className={"col col-filter p-0" + (this.state.filteredItems.length > 0 ? ' active' : '')}>
                    <div className="header-tabs-container justify-content-center"
                         onClick={this.openFilterDropdown.bind(this)}>
                        <Icon name="ml-1 fas fa-filter"/>
                    </div>
                    <div className={"dropdown-menu filters right" + (this.state.isFilterDropdown ? ' show' : '')}
                         aria-labelledby="dropdownMenuButton">
                        <div className="list-container">
                            {this.state.isFilterDropdown ? <FilterItems
                                filterItemClickHandler={this.filterItemClickHandler.bind(this)} {...this.props} {...this.state}/> : ''}
                        </div>
                        <div className="confirm-container row m-0">
                            <div className="col filter-btn filter-okay" onClick={this.applyFilter.bind(this)}>
                                <Trans>Apply</Trans> (<strong>{this.state.filteredItems.length}</strong>)
                            </div>
                            <div className="col filter-btn filter-clear" onClick={this.clearFilter.bind(this)}>
                                <Trans>Clear</Trans>
                            </div>

                        </div>
                    </div>
                </li>
            </ul>
        )
    }
}

const FilterItems = props => {
    let FilterItems = [];
    if (props.orjData) {
        props.orjData.sportItem.tournaments.forEach((tournament, i) => {
            FilterItems.push(
                <div key={i}>
                    <div
                        className={"dropdown-item" + (props.filteredItems.indexOf(tournament.tournament.id) > -1 ? " checked" : "")}
                        data-id={tournament.tournament.id}
                        onClick={props.filterItemClickHandler}>
                        <span className="checkbox"/>
                        {flagImg(tournament)}
                        <div className="col tournament-name px-2">
                            <strong><Trans>{tournament.category.name}</Trans></strong> - {tournament.tournament.name}</div>
                    </div>
                    <hr className="separator"/>
                </div>
            )
        });
    }
    return FilterItems;

};

export default withNamespaces('translations')(Headertabs)

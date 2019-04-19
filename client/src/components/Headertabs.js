import React, {PureComponent} from 'react';
import Icon from "./common/Icon";
import DayPicker from "react-day-picker";
import moment from "moment";
import {Trans, withTranslation} from "react-i18next";
import 'moment/locale/tr';
import MomentLocaleUtils from 'react-day-picker/moment';
import {flagImg} from "../Helper";

class Headertabs extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isFilterDropdown: false,
			filteredTournamentsLocale: this.props.filteredTournaments,
			isLive: false,
			isSportDropdown: false,
			isDateDropdown: false,
			selectedDay: this.props.todaysDateByUrl || moment().subtract('1', 'hours').format('YYYY-MM-DD'),
		};
	}

	clearFilter() {
		this.setState({
			filteredTournamentsLocale: [],
			isFilterDropdown: false
		}, () => {
			this.props.updateParentState({
				filteredTournaments: []
			}, true);
		});
	}

	applyFilter() {
		this.setState({
			isFilterDropdown: false
		}, () => {
			this.props.updateParentState({
				filteredTournaments : this.state.filteredTournamentsLocale
			}, true)
		});
	}

	filterItemClickHandler(id) {
		let newState = [...this.state.filteredTournamentsLocale],
			i = newState.indexOf(id);

		i < 0 ? newState.push(id) : newState.splice(i,1);

		this.setState({
			filteredTournamentsLocale: newState
		});
	}


	toggleLive() {
		this.setState({isFilterDropdown: false, isSportDropdown: false, isDateDropdown: false}); // close other dropdowns
		this.props.updateParentState({
			isLive: !this.props.isLive
		}, true);
	}

	openFilterDropdown() {
		this.setState({
			isFilterDropdown: !this.state.isFilterDropdown,
			isSportDropdown: false,
			isDateDropdown: false
		});
	}

	openSportDropdown() {
		this.setState({
			isSportDropdown: !this.state.isSportDropdown,
			isFilterDropdown: false,
			isDateDropdown: false
		});
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
				today: moment(0, "HH").diff(selectedDay, 'days') === 0 ? 1 : 0,
				page: "homepage"
			});
			let url = (moment().format('DD') === moment(selectedDay).format('DD')) ? "/" : `/${t('matches')}/${t('date')}-${selectedDay}`
			window.history.pushState(selectedDay, `UltraSkor - ${selectedDay}`, url);
		}

		if (this.state.filteredTournamentsLocale.length > 0) {
			this.props.updateParentState({
				filteredTournaments: []
			}, true);
		}

		this.setState({
			selectedDay: selectedDay,
			isDateDropdown: false,
			isLive: false,
			filteredTournamentsLocale: []
		});
	}

	render() {
		//console.log(this.state.filteredTournamentsLocale);
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
						<a className="dropdown-item soon" href="/"><Icon name={"fas fa-basketball-ball"}/> Basketball<small> - <Trans>very soon</Trans></small></a>
						<hr className="separator"/>
						<a className="dropdown-item soon" href="/"><Icon name={"fas fa-table-tennis"}/> Tennis<small> - <Trans>soon</Trans></small></a>
						<hr className="separator"/>
						<a className="dropdown-item soon" href="/"><Icon name={"fas fa-baseball-ball"}/> Baseball<small> - <Trans>soon</Trans></small></a>
						<hr className="separator"/>
						<a className="dropdown-item soon" href="/"><Icon name={"fas fa-football-ball"}/> Amr. Football <small> - <Trans>soon</Trans></small></a>
						<hr className="separator"/>
						<a className="dropdown-item soon" href="/"><Icon name={"fas fa-football-ball"}/> Rugby<small> - <Trans>soon</Trans></small></a>
						<hr className="separator"/>
						<a className="dropdown-item soon" href="/"><Icon name={"fas fa-hockey-puck"}/> Hokey<small> - <Trans>soon</Trans></small></a>
						<hr className="separator"/>
						<a className="dropdown-item soon" href="/"><Icon name={"fas fa-volleyball-ball"}/> Voleyball<small> - <Trans>soon</Trans></small></a>
					</div>
				</li>

				<li className={"col col-live p-0" + (this.props.isLive ? ' active' : '')}>
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
				<li className={"col col-filter p-0" + (this.props.filteredTournaments.length > 0 ? ' active' : '')}>
					<div className="header-tabs-container justify-content-center"
					     onClick={this.openFilterDropdown.bind(this)}>
						<Icon name="ml-1 fas fa-filter"/>
					</div>
					<div className={"dropdown-menu filters right" + (this.state.isFilterDropdown ? ' show' : '')}
					     aria-labelledby="dropdownMenuButton">
						<div className="list-container">
							{this.state.isFilterDropdown ? (
								<FilterItems
									filteredTournamentsLocale={this.state.filteredTournamentsLocale}
									mainData={this.props.mainData}
									filterItemClickHandler={this.filterItemClickHandler.bind(this)}/>
							) : ''}
						</div>
						<div className="confirm-container row m-0">
							<div className="col filter-btn filter-okay" onClick={this.applyFilter.bind(this)}>
								<Trans>Apply</Trans> (<strong>{this.state.filteredTournamentsLocale.length}</strong>)
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
	return props.mainData.map((tournament, index) => {
		return (
			<div key={index}>
				<div
					className={"dropdown-item" + (props.filteredTournamentsLocale.indexOf(tournament.tournament.uniqueId) > -1 ? " checked" : "")}
					onClick={() => props.filterItemClickHandler(tournament.tournament.uniqueId)}>
					<span className="checkbox"/>
					{flagImg(tournament)}
					<div className="col tournament-name px-2">
						<strong><Trans>{tournament.category.name}</Trans></strong> - <Trans>{tournament.tournament.name}</Trans>
					</div>
				</div>
				<hr className="separator"/>
			</div>
		)
	})
}

export default withTranslation('translations')(Headertabs)

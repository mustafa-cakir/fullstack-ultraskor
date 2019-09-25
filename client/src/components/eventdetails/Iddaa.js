import React, {PureComponent} from 'react';
import IddaLogo from "./../../assets/images/icon-iddaa.png";
import IddaLogo2 from "./../../assets/images/icon-iddaa2.png";
import {Trans, withTranslation} from "react-i18next";
import Icon from "../common/Icon";
import Loading from "../common/Loading";
import {lockedOddsPlaceholder, marketGroups} from "../../Helper";

class Iddaa extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			tabIndex: 0,
			isDropdown: false,
			selectedGroup: {
				"id": 1,
				"name": "All Bets",
				"priority": 1,
				"markets": []
			},
			iddaaFullMarketData: null,
			error: null
		};
		this.timeout = null;
		this.tabSwitcherHandler = this.tabSwitcherHandler.bind(this);
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	componentDidMount() {
		this.initGetIddaaOdds();
	}

	componentDidUpdate() {
		setTimeout(() => {
			this.props.swipeAdjustHeight();
		}, 100);
	}

	initGetIddaaOdds = () => {
		fetch(`/api/iddaaOdds/${this.props.iddaaMatchData.eid}${this.props.eventData.event.status.type === "inprogress" ? "/live" : ""}`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				// res.m = [];
				this.setState({
					iddaaFullMarketData: res,
					loading: false,
					...(!res.m || res.m.length === 0 && {
						selectedGroup: {
							"id": 1,
							"name": "All Bets",
							"priority": 1,
							"markets": []
						}
					})
				});
				if (this.props.eventData.event.status.type === "inprogress" && res.min) {
					this.timeout = setTimeout(() => {
						this.initGetIddaaOdds();
					}, 5000);
				}
			})
			.catch(err => {
				this.setState({
					error: err.toString(),
					loading: false
				});
			});
	};

	tabSwitcherHandler(tabIndex) {
		this.setState({
			tabIndex: tabIndex
		});
	}

	clickGroupHandler(group) {
		this.setState({
			selectedGroup: group
		});
	}

	getCountByGroup(group) {
		const {iddaaFullMarketData} = this.state;
		const {markets} = group;
		let count = 0;

		markets.forEach(market => {
			count += iddaaFullMarketData.m.filter(x => x.muk === market).length;
		});

		if (group.id === 1) count = iddaaFullMarketData.m.length;

		return count;
	}


	render() {

		const {matchTextInfo, eventData, t, iddaaMatchData} = this.props;
		const {iddaaFullMarketData, loading, selectedGroup, isDropdown, error} = this.state;

		return (
			<div>
				<div className="iddaa container">
					<div className="white-box mt-2 pb-2">
						<ul className="horizontal-tab">
							<li className={this.state.tabIndex === 0 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(0)}>
                                <span><img src={IddaLogo} className="tab-logo"
                                           alt="Iddaa Analiz, Bahis Analiz"/>
                                           <Trans>Iddaa Odds</Trans> {iddaaFullMarketData && iddaaFullMarketData.m &&
	                                <em>({iddaaFullMarketData.m.length})</em>}
                                </span>
							</li>
							<li className={this.state.tabIndex === 1 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(1)}>
								<span><img src={IddaLogo2} className="tab-logo"
								           alt="Iddaa Oranlari"/> <Trans>Iddaa Analyze</Trans></span>
							</li>
						</ul>
						{this.state.tabIndex === 0 ? (
							<div className="tab-container">
								{loading ? <Loading type="inside"/> : (
									<>
										{iddaaFullMarketData ? (
											<div className="iddaa-body">
												<div className="row align-items-center row-dropdown">
													<div className="col p-0 col-6 col-md-3">
														{iddaaFullMarketData.m && iddaaFullMarketData.m.length > 0 && (
															<div className={"pure-dropdown" + (isDropdown ? " open" : "")}
															     onClick={() => this.setState({isDropdown: !isDropdown})}>
																<Trans>{selectedGroup.name}</Trans> ({this.getCountByGroup(selectedGroup)})
																<Icon name="fas fa-caret-down"/>
																<div className="dropdown">
																	<ul>
																		{marketGroups.map(group => {
																			const count = this.getCountByGroup(group);
																			if (count < 1) return null;
																			return (
																				<li key={group.id}
																				    className={group.name === selectedGroup.name ? "active this-round" : ""}
																				    onClick={() => this.clickGroupHandler(group)}
																				>
																					<span><Trans>{group.name}</Trans> ({count})</span>
																				</li>
																			)
																		})}
																	</ul>
																</div>
															</div>
														)}
													</div>
													<div
														className="col">{eventData.event.status.type === "inprogress" && iddaaFullMarketData.min && (
														<div className="iddaa-live-text"><span
															className="live-pulse"/> <Trans>Live Iddaa Odds</Trans>
														</div>
													)}
													</div>
												</div>


												<IddaaContainer
													iddaaMatchData={iddaaMatchData}
													selectedGroup={selectedGroup}
												                iddaaFullMarketData={iddaaFullMarketData} t={t}/>
											</div>
										) : <PrintErrorOrGetFromParent iddaaMatchData={iddaaMatchData}/>}
									</>
								)}
							</div>
						) : ""}
						{(this.state.tabIndex === 1) ?
							<MatchTextInfo matchTextInfo={matchTextInfo}
							               swipeAdjustHeight={this.props.swipeAdjustHeight}/> : ""}
						{this.state.tabIndex === 2 ? (
							<div className="iddaa-notfound"><Trans>Coming soon</Trans>.</div>
						) : ""}
					</div>
				</div>
			</div>
		)
	}
}

const PrintErrorOrGetFromParent = ({iddaaMatchData}) => {
	if (iddaaMatchData && iddaaMatchData.m && iddaaMatchData.m.length > 0) {
		return <IddaaContainer iddaaFullMarketData={iddaaMatchData}/>
	}

	return <div className="iddaa-notfound"><Trans>Unfortunately, this event doesn't
		have Iddaa bettings odds</Trans> :(</div>
};

const IddaaContainer = props => {
	const {iddaaFullMarketData, selectedGroup} = props;
	const {m} = iddaaFullMarketData;

	let markets = selectedGroup && selectedGroup.id > 1 ? m.filter(x => selectedGroup.markets.indexOf(x.muk) > -1) : m;

	if (markets.length === 0) { markets = lockedOddsPlaceholder}

	return markets.map(market => {
		const mbs = market.mbs || props.iddaaMatchData.m[0].mbs;
		return (
			<div className="row iddaa-container" key={market.mid || Math.random()}>
				<div className="col col-labels">
					<div className="row m-0">
						<div className="col col-mbs p-0"><span
							className={"mbs mbs-" + mbs}>{mbs}</span>
						</div>
						<div className="col p-0"> {market.mn}</div>
					</div>

				</div>
				<div className="col col-8 col-right px-0">
					<div className="row bets-values text-center">
						{market.o.map(odd => {
							return (
								<div key={odd.ov || Math.random()}
								     className={`col${market.o.length > 4 ? " col-4" : ""}
								        ${odd.locked ? " locked" : ""}`}>
									<span>{odd.ona}</span>
									{odd.locked && <i className="fas fa-lock"/>}
									{odd.lock}
									{odd.odd > 1 ? odd.odd.toFixed(2) : "-"}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		)
	});
};

class MatchTextInfo extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showMore: false
		}
	}

	componentDidUpdate() {
		this.props.swipeAdjustHeight()
	};

	showMoreClickHandler() {
		this.setState({
			showMore: !this.state.showMore
		})
	}

	render() {
		const {matchTextInfo} = this.props;
		if (!matchTextInfo || matchTextInfo.length === 0) {
			return <div className="iddaa-notfound"><Trans>Unfortunately, this event doesn't have any Iddaa
				Analyze</Trans> :(</div>
		}
		let generalInfo = matchTextInfo.textList.filter(item => {
			return item.smartType === "SmartList" || item.smartType === "Smartist"
		});

		if (generalInfo.length === 0) {
			generalInfo = matchTextInfo.textList.filter(item => {
				return item.textGroupName !== "Ev Sahibi Takım" && item.textGroupName !== "Misafir Takım";
			});
		}

		return (
			<div className="match-text-info">
				{generalInfo.map((item, index) =>
					<React.Fragment key={index}>
						<p className={index >= 4 && !this.state.showMore ? "d-none" : ""}>
							{item.textTitle ? <strong>{item.textTitle}</strong> : ""}
							<Icon name="fa fa-angle-right"/> {item.textValue}
						</p>
						{index === 4 && !this.state.showMore ?
							<div className="show-more" onClick={this.showMoreClickHandler.bind(this)}><Trans>Show
								More</Trans> <Icon name="fa fa-angle-down"/></div> : ""}
					</React.Fragment>
				)}
			</div>
		);
	}
}

export default withTranslation('translations')(Iddaa)

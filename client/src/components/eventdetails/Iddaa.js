import React, {PureComponent} from 'react';
import IddaLogo from "./../../assets/images/icon-iddaa.png";
import IddaLogo2 from "./../../assets/images/icon-iddaa2.png";
import {Trans, withTranslation} from "react-i18next";
import Icon from "../common/Icon";
import Loading from "../common/Loading";
import {marketGroups} from "../../Helper";

class Iddaa extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			tabIndex: 0,
			selectedGroup: {
				"id": 1,
				"name": "Tüm Oranlar",
				"priority": 1,
				"markets": []
			},
			IddaaFullMarketData: null
		};
		this.tabSwitcherHandler = this.tabSwitcherHandler.bind(this);
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
		fetch(`/api/iddaaOdds/${this.props.iddaaMatchData.id}`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				if (res.marketList) {
					res.marketList = Object.keys(res.marketList).map(function (key) {
						return res.marketList[key];
					});
					this.setState({
						IddaaFullMarketData: res,
						loading: false
					})
				}
			})
			.catch(err => {
				this.setState({
					IddaaFullMarketData: {error: err.toString()},
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
		const {IddaaFullMarketData} = this.state;
		const {markets} = group;
		let count = 0;

		markets.forEach(market => {
			count += IddaaFullMarketData.marketList.filter(x => x.name === market).length;
		});

		if (group.id === 1) count = IddaaFullMarketData.marketList.length;

		return count;
	}

	render() {

		const {matchTextInfo, eventData, t} = this.props;
		const {IddaaFullMarketData, loading, selectedGroup} = this.state;
		return (
			<div>
				<div className="iddaa container">
					<div className="white-box mt-2 pb-2">
						<ul className="horizontal-tab">
							<li className={this.state.tabIndex === 0 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(0)}>
                                <span><img src={IddaLogo} className="tab-logo"
                                           alt="Iddaa Analiz, Bahis Analiz"/>
                                           <Trans>Iddaa Odds</Trans> {IddaaFullMarketData &&
	                                <em>({IddaaFullMarketData.marketCount})</em>}
                                </span>
							</li>
							<li className={this.state.tabIndex === 1 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(1)}>
								<span><img src={IddaLogo2} className="tab-logo"
								           alt="Iddaa Oranlari"/> <Trans>Iddaa Analyze</Trans></span>
							</li>
							{/*<li className={this.state.tabIndex === 2 ? "active" : ""}*/}
							{/*onClick={() => this.tabSwitcherHandler(2)}>*/}
							{/*<span><Icon name="fas fa-chart-line"/><Trans>International Bets</Trans></span>*/}
							{/*</li>*/}
						</ul>
						{this.state.tabIndex === 0 ? (
							<div className="tab-container">
								{loading ? <Loading type="inside"/> : (
									<>
										{IddaaFullMarketData ? (
											<div className="iddaa-body">
												{eventData.event.status.type === "inprogress" && (
													<div className="iddaa-live-text"><span
														className="live-pulse"/> Canlı Iddaa Oranları</div>
												)}
												<div className="iddaa-groups-wrapper">
													<ul className="iddaa-groups">
														{marketGroups.map(group => {
															const count = this.getCountByGroup(group);
															if (count < 1) return null;
															return (
																<li className={group.id === selectedGroup.id ? "active" : ""}
																    key={group.id}
																    onClick={() => this.clickGroupHandler(group)}>
																	{group.name} ({count})
																</li>
															)
														})}
													</ul>
												</div>

												<IddaaContainer selectedGroup={selectedGroup}
												                IddaaFullMarketData={IddaaFullMarketData} t={t}/>
											</div>
										) : <div className="iddaa-notfound"><Trans>Unfortunately, this event doesn't
											have Iddaa bettings odds</Trans> :(</div>}
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

const IddaaContainer = props => {
	const {IddaaFullMarketData, selectedGroup} = props;
	const isLocked = IddaaFullMarketData.bettingStatus === -1;

	let markets = IddaaFullMarketData.marketList.sort((a, b) => a.typePriority - b.typePriority);
	if (selectedGroup.id > 1) {
		markets = markets.filter(x => selectedGroup.markets.indexOf(x.name) > -1);
	}

	return markets.map(market => {
		return (
			<div className="row iddaa-container" key={market.id}>
				<div className="col col-labels">
					<div className="row m-0">
						<div className="col col-mbs p-0"><span
							className={"mbs mbs-" + market.minCombinCount}>{market.minCombinCount}</span>
						</div>
						<div className="col p-0"> {market.sgName}</div>
					</div>

				</div>
				<div className="col col-8 col-right px-0">
					<div className="row bets-values text-center">
						{market.outcomeList.map(odd => {
							return (
								<div key={odd.oddVersion}
								     className={`col${market.outcomeCount > 4 ? " col-4" : ""}
								        ${odd.fixedOddsWeb && odd.fixedOddsWeb === 1 ? " locked" : ""}`}>
									<span>{odd.outcomeLabel}</span>
									{isLocked && odd.fixedOddsWeb > 1 && <i className="fas fa-lock"/>}
									{odd.fixedOddsWeb > 1 ? odd.fixedOddsWeb.toFixed(2) : "-"}
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

import React, {Component} from 'react';
import Loading from "./../Loading";
import IddaLogo from "./../../assets/images/icon-iddaa.png";
import IddaLogo2 from "./../../assets/images/icon-iddaa2.png";
import {Trans, withNamespaces} from "react-i18next";

class Bets extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tabIndex: 0
		};
		this.tabSwitcherHandler = this.tabSwitcherHandler.bind(this);
	}

	tabSwitcherHandler(tabIndex) {
		this.setState({
			tabIndex: tabIndex
		})
	}

	render() {

		const {provider3MatchData} = this.props;
		console.log(provider3MatchData);
		//if (!provider3MatchData) return <Loading type="inside"/>;

		return (
			<div>
				<div className="bets container">
					<div className="white-box mt-2 pb-2">
						<ul className="horizontal-tab">
							<li className={this.state.tabIndex === 0 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(0)}>
								<span><img src={IddaLogo} className="tab-logo" alt="Iddaa Logo"/> Iddaa</span>
							</li>
							<li className={this.state.tabIndex === 1 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(1)}>
								<span><img src={IddaLogo} className="tab-logo" alt="International Bets Logo"/><Trans>International Bets</Trans></span>
							</li>
						</ul>
						{this.state.tabIndex === 0 ? (
							<div>
								{provider3MatchData ? (
									<div className="iddaa-body">
										<div className="row iddaa-bar">
											<div className="col text-bold">
												<img src={IddaLogo2} className="tab-logo" alt="Iddaa Logo"/> 212
											</div>
											<div className="col text-right text-bold">MBS: 2</div>
										</div>
										<IddaaList provider3MatchData={provider3MatchData}/>
									</div>
								) : <div>Iddaa oranlari bilgisi bulunamadi</div>}
							</div>
						) : ""}
						{this.state.tabIndex === 1 ? (
							<div>heyooo</div>
						) : ""}
					</div>
					AwayTeam: {provider3MatchData ? provider3MatchData.awayTeamName : ""}
				</div>
			</div>
		)
	}
}

const IddaaList = props => {
	const {provider3MatchData} = props;
	const iddaa = [
		{
			label: "Maç Sonucu",
			odds: [
				{label: "1", key: "F_1"},
				{label: "0", key: "F_X"},
				{label: "2", key: "F_1"},
			]
		},
		{
			label: "1.5 A/Ü",
			odds: [
				{label: "Alt", key: "F15_U"},
				{label: "Üst", key: "F15_O"},
			]
		},
		{
			label: "2.5 A/Ü",
			odds: [
				{label: "Alt", key: "UNDER"},
				{label: "Üst", key: "OVER"},
			]
		},
		{
			label: "3.5 A/Ü",
			odds: [
				{label: "Alt", key: "F35_U"},
				{label: "Üst", key: "F35_O"},
			]
		},
		{
			label: "Hand. MS",
			odds: [
				{label: "1", key: "H_1", handicapHome: true},
				{label: "X", key: "H_X"},
				{label: "2", key: "H_2", handicapAway: true},
			]
		},

		{
			label: "IY A/Ü",
			odds: [
				{label: "1,5 Alt", key: "H15_U"},
				{label: "1,5 Üst", key: "H15_O"},
			]
		},
		{
			label: "MS Tek/Çift",
			odds: [
				{label: "Tek", key: "F_O"},
				{label: "Çift", key: "F_E"},
			]
		},
		{
			label: "MS Tek/Çift",
			odds: [
				{label: "Tek", key: "F_O"},
				{label: "Çift", key: "F_E"},
			]
		},
	];

	let html = [];
	iddaa.map((item, index) => {
		html.push(
			<div className="row bets-container" key={index}>
				<div className="col col-4 left-label pr-0">{item.label}</div>
				<div className="col col-8 right-bets px-0">
					<div className="row bets-values text-center">
						{item.odds.map((odd, index) => {
							let col = (item.odds.length >= 3) ? "col col-4" : "col";
							return (
								<div key={index} className={col}>
									<span>{odd.label} {odd.handicapHome ? provider3MatchData.h1Handicap : odd.handicapAway ? parseFloat(provider3MatchData.h1Handicap) * -1 : ""}</span>
									{provider3MatchData.odds[odd.key]}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		)
	});
	return html;
};

export default withNamespaces('translations')(Bets)

import React, {Component} from 'react';
import IddaLogo from "./../../assets/images/icon-iddaa.png";
import IddaLogoBig from "./../../assets/images/icon-iddaa2.png";
import {Trans, withTranslation} from "react-i18next";
import Icon from "../common/Icon";

class Iddaa extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tabIndex: 0
		};
		this.tabSwitcherHandler = this.tabSwitcherHandler.bind(this);
	}

    componentDidUpdate() {
        setTimeout(() => {
            this.props.swipeAdjustHeight();
        }, 100);
    }

	tabSwitcherHandler(tabIndex) {
		this.setState({
			tabIndex: tabIndex
		});
	}

	render() {

		const {provider3MatchData, matchTextInfo, t} = this.props;
		console.log(matchTextInfo);
		//if (!provider3MatchData) return <Loading type="inside"/>;

		return (
			<div>
				<div className="iddaa container">
					<div className="white-box mt-2 pb-2">
						<ul className="horizontal-tab">
                            <li className={this.state.tabIndex === 0 ? "active" : ""}
                                onClick={() => this.tabSwitcherHandler(0)}>
                                <span><img src={IddaLogo} className="tab-logo" alt="Iddaa Logo"/> Iddaa Tahminleri</span>
                            </li>
                            <li className={this.state.tabIndex === 1 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(1)}>
								<span><img src={IddaLogo} className="tab-logo" alt="Iddaa Logo"/> Iddaa Oranlari</span>
							</li>
							<li className={this.state.tabIndex === 2 ? "active" : ""}
							    onClick={() => this.tabSwitcherHandler(2)}>
								<span><Icon name="fas fa-chart-line"/><Trans>International Bets</Trans></span>
							</li>
						</ul>
                        {(this.state.tabIndex === 1 && matchTextInfo) ? <MatchTextInfo matchTextInfo={matchTextInfo} /> : ""}
						{this.state.tabIndex === 2 ? (
							<div>
								{provider3MatchData ? (
									<div className="iddaa-body">
										<div className="row iddaa-bar">
											<div className="col text-bold">
												<img src={IddaLogoBig} className="tab-logo" alt="Iddaa Logo"/> {provider3MatchData.code}
											</div>
											<div className="col text-right text-bold">MBS: {provider3MatchData.mbc}</div>
										</div>
										<IddaaContainer provider3MatchData={provider3MatchData} t={t}/>
									</div>
                                ) : <div className="iddaa-notfound"><Trans>Malesef Iddaa oranları bilgisi bulunamadı</Trans> :(</div>}
							</div>
						) : ""}
						{this.state.tabIndex === 3 ? (
                            <div className="iddaa-notfound"><Trans>Coming soon</Trans>.</div>
						) : ""}
					</div>
				</div>
			</div>
		)
	}
}

const MatchTextInfo = props => {
    const {matchTextInfo, tab} = props;
    let filterBy = "Aralarında Oynanan Maçlar";

    let generalInfo = matchTextInfo.textList.filter(item => {
        return item.textGroupName === filterBy
    });

    return (
        <div className="iddaa-text-info">
            {generalInfo.map((item, index) =>
                <p key={index}>
                    {item.textValue}
                </p>
            )}
        </div>
    );
};


const IddaaContainer = props => {
	const {provider3MatchData, t} = props;
	const iddaaMap = [
		{
			label: t("FT Result"),
			odds: [
				{label: "1", key: "F_1"},
				{label: "0", key: "F_X"},
				{label: "2", key: "F_2"},
			]
		},
        {
            label: t("2.5 U/O"),
            odds: [
                {label: "2.5 Alt", key: "UNDER"},
                {label: "2.5 Üst", key: "OVER"},
            ]
        },
		{
			label: t("1.5 U/O"),
			odds: [
				{label: "1.5 Alt", key: "F15_U"},
				{label: "1.5 Üst", key: "F15_O"},
			]
		},
		{
			label: t("3.5 U/O"),
			odds: [
				{label: "3.5 Alt", key: "F35_U"},
				{label: "3.5 Üst", key: "F35_O"},
			]
		},
        {
            label: t("Double Chance"),
            odds: [
                {label: "1X", key: "DC_1X"},
                {label: "12", key: "DC_12"},
                {label: "X2", key: "DC_X2"},
            ]
        },
		{
			label: t("Handicap FT"),

			odds: [
				{label: "1", key: "H_1", handicapHome: true},
				{label: "X", key: "H_X"},
				{label: "2", key: "H_2", handicapAway: true},
			]
		},
        {
            label: t("HT Result"),
            odds: [
                {label: "1", key: "S_1"},
                {label: "X", key: "S_X"},
                {label: "2", key: "S_2"},
            ]
        },
        {
            label: t("HT Double Chance"),
            odds: [
                {label: "1X", key: "FHDC_1X"},
                {label: "12", key: "FHDC_12"},
                {label: "X2", key: "FHDC_X2"},
            ]
        },
		{
			label: t("HT 1.5 U/O"),
			odds: [
				{label: "1,5 Alt", key: "H15_U"},
				{label: "1,5 Üst", key: "H15_O"},
			]
		},
        {
            label: t("2. Half Result"),
            odds: [
                {label: "1", key: "SH_1"},
                {label: "X", key: "SH_X"},
                {label: "2", key: "SH_2"},
            ]
        },
		{
			label: t("Odd/Even"),
			odds: [
				{label: "Tek", key: "F_O"},
				{label: "Çift", key: "F_E"},
			]
		},
		{
			label: t("Total Goal"),
            col: "col-3",
			odds: [
				{label: "0-1", key: "GS_01"},
				{label: "2-3", key: "GS_23"},
				{label: "4-6", key: "GS_46"},
				{label: "7+", key: "GS_7P"},
			]
		},
        {
            label: t("HT / FT"),
            col: "col-4",
            odds: [
                {label: "1/1", key: "SF_11"},
                {label: "X/1", key: "SF_X1"},
                {label: "2/1", key: "SF_21"},
                {label: "1/X", key: "SF_1X"},
                {label: "X/X", key: "SF_XX"},
                {label: "2/X", key: "SF_2X"},
                {label: "1/2", key: "SF_12"},
                {label: "X/2", key: "SF_X2"},
                {label: "2/2", key: "SF_22"},
            ]
        },
        {
            label: t("Match Score - 1"),
            col: "col-4",
            odds: [
                {label: "1 - 0", key: "SC_10"},
                {label: "2 - 0", key: "SC_20"},
                {label: "3 - 0", key: "SC_30"},
                {label: "4 - 0", key: "SC_40"},
                {label: "5+ - 0", key: "SC_50"},
                {label: "2 - 1", key: "SC_21"},
                {label: "3 - 1", key: "SC_31"},
                {label: "4 - 1", key: "SC_41"},
                {label: "5+ - 1", key: "SC_51"},
                {label: "3 - 2", key: "SC_32"},
                {label: "4 - 2", key: "SC_42"},
                {label: "5+ - 2", key: "SC_52"},
                {label: "4 - 3", key: "SC_43"},
                {label: "5+ - 3", key: "SC_53"},
                {label: "5+ - 4", key: "SC_54"},
            ]
        },
        {
            label: t("Match Score - X"),
            col: "col-4",
            odds: [
                {label: "0 - 0", key: "SC_00"},
                {label: "1 - 1", key: "SC_11"},
                {label: "2 - 2", key: "SC_22"},
                {label: "3 - 3", key: "SC_33"},
                {label: "4 - 4", key: "SC_44"},
                {label: "5+ - 5+", key: "SC_55"},
            ]
        },
        {
            label: t("Match Score - 2"),
            col: "col-4",
            odds: [
                {label: "0 - 1", key: "SC_01"},
                {label: "0 - 2", key: "SC_02"},
                {label: "0 - 3", key: "SC_03"},
                {label: "0 - 4", key: "SC_04"},
                {label: "0 - 5+", key: "SC_05"},
                {label: "1 - 2", key: "SC_12"},
                {label: "1 - 3", key: "SC_13"},
                {label: "1 - 4", key: "SC_14"},
                {label: "1 - 5+", key: "SC_15"},
                {label: "2 - 3", key: "SC_23"},
                {label: "2 - 4", key: "SC_24"},
                {label: "2 - 5+", key: "SC_25"},
                {label: "3 - 4", key: "SC_34"},
                {label: "3 - 5+", key: "SC_35"},
                {label: "4 - 5+", key: "SC_45"},
            ]
        },

	];

    return iddaaMap.map((item, index) => {
        return (
            <div className="row iddaa-container" key={index}>
                <div className="col col-labels pr-0">{item.label}</div>
                <div className="col col-8 col-right px-0">
                    <div className="row bets-values text-center">
                        {item.odds.map((odd, index) => {
                            return (
                                <div key={index} className={"col " + (item.odds.length === 3 ? "col-4" : item.col ? item.col : "")}>
                                    <span>{odd.label} {provider3MatchData.h1Handicap ? <i className="handicap">{odd.handicapHome ? provider3MatchData.h1Handicap : odd.handicapAway ? parseFloat(provider3MatchData.h1Handicap) * -1 : ""}</i>: "" }</span>
                                    {provider3MatchData.odds[odd.key] || "-"}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    });
};

export default withTranslation('translations')(Iddaa)

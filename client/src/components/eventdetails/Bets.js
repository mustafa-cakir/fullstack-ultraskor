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

        const iddaa = [
            {
                label: "Maç Sonucu",
                ods: [
                    {label: "1", key: "F_1"},
                    {label: "0", key: "F_X"},
                    {label: "2", key: "F_1"},
                ]
            },
            {
                label: "2.5 A/Ü",
                ods: [
                    {label: "Alt", key: "UNDER"},
                    {label: "Üst", key: "OVER"},
                ]
            },

        ];

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
                                        <IddaaList data="heyoo"/>
                                        <div className="row bets-container">
                                            <div className="col col-4 left-label pr-0">Maç Sonucu</div>
                                            <div className="col col-8 right-bets px-0">
                                                <div className="row bets-values text-center">
                                                    <div className="col col-4">
                                                        <span>1</span>{provider3MatchData.odds.F_1}</div>
                                                    <div className="col col-4">
                                                        <span>X</span>{provider3MatchData.odds.F_X}</div>
                                                    <div className="col col-4">
                                                        <span>2</span>{provider3MatchData.odds.F_2}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row bets-container align-items-center">
                                            <div className="col col-4 left-label pr-0">2.5 A/Ü</div>
                                            <div className="col col-8 right-bets px-0">
                                                <div className="row bets-values text-center">
                                                    <div className="col"><span>Alt</span>{provider3MatchData.odds.UNDER}
                                                    </div>
                                                    <div className="col"><span>Üst</span>{provider3MatchData.odds.OVER}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
  const {data} = props;

  return (
      <div>
          iddaa listesi buraya
      </div>
  )
};

export default withNamespaces('translations')(Bets)

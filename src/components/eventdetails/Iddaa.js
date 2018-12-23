import React, {Component} from 'react';
import Loading from "./../Loading";
import IddaLogo from "./../../assets/images/icon-iddaa.png";
import IddaLogo2 from "./../../assets/images/icon-iddaa2.png";
import {Trans, withNamespaces} from "react-i18next";

class Iddaa extends Component {
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
        const {t, srMatchData} = this.props;
        if (!srMatchData) return <Loading type="inside"/>;
        console.log(srMatchData);
        return (
            <div>
                <div className="iddaa container">
                    <div className="white-box mt-2 pb-2">
                        <ul className="horizontal-tab">
                            <li className={this.state.tabIndex === 0 ? "active" : ""}
                                onClick={() => this.tabSwitcherHandler(0)}><span><Trans><img src={IddaLogo} className="idda-logo" alt="Iddaa Logo"/> Iddaa</Trans></span></li>
                            <li className={this.state.tabIndex === 1 ? "active" : ""}
                                onClick={() => this.tabSwitcherHandler(1)}><span><Trans>Int. Bets</Trans></span></li>
                        </ul>
                        <div className="body2">
                            <div className="row iddaa-bar">
                                <div className="col"><img src={IddaLogo2} className="idda-logo" alt="Iddaa Logo"/> 212</div>
                                <div className="col text-right">MBS: 2</div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withNamespaces('translations')(Iddaa)

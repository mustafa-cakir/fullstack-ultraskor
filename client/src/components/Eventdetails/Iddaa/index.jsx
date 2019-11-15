import React, { useState } from "react";
import { Trans } from "react-i18next";
import IddaLogo from "../../../assets/images/icon-iddaa.png";
import IddaLogo2 from "../../../assets/images/icon-iddaa2.png";
import Markets from "./Markets";
import Icon from "../../common/Icon";

const Iddaa = ({ iddaaData, updateAutoHeight, textList, isLive }) => {
    const [tabIndex, setTabIndex] = useState(0);

    const tabClickHandler = newIndex => {
        setTabIndex(newIndex);
        updateAutoHeight();
    };

    return (
        <div>
            <div className="iddaa container">
                <div className="white-box mt-2 pb-2">
                    <ul className="horizontal-tab">
                        <button
                            type="button"
                            className={tabIndex === 0 ? "active" : ""}
                            onClick={() => tabClickHandler(0)}
                        >
                            <span>
                                <img src={IddaLogo} className="tab-logo" alt="Iddaa Analiz, Bahis Analiz" />
                                <Trans>Iddaa Odds</Trans> {iddaaData.length > 0 && <em>({iddaaData.length})</em>}
                            </span>
                        </button>
                        <button
                            type="button"
                            className={tabIndex === 1 ? "active" : ""}
                            onClick={() => tabClickHandler(1)}
                        >
                            <span>
                                <img src={IddaLogo2} className="tab-logo" alt="Iddaa Oranlari" />{" "}
                                <Trans>Iddaa Analyze</Trans>
                            </span>
                        </button>
                    </ul>
                    {tabIndex === 0 && (
                        <div className="tab-container">
                            <div className="pre-iddaa">
                                <div className="title">
                                    <div className="row">
                                        <div className="col">
                                            <Trans>All Odds</Trans>
                                        </div>
                                        <div className="col">
                                            {isLive && (
                                                <div className="iddaa-live-text text-right">
                                                    <span className="live-pulse" /> <Trans>Live Iddaa Odds</Trans>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pre-iddaa-container">
                                    <Markets markets={iddaaData} />
                                </div>
                            </div>
                        </div>
                    )}

                    {tabIndex === 1 && <MatchTextInfo textList={textList} />}
                </div>
            </div>
        </div>
    );
};

const MatchTextInfo = ({ textList }) => {
    if (!textList || textList.length < 0) return <div>Malesef bu maç için Iddaa Analiz bilgisi bulunamadı.</div>;
    return (
        <div className="match-text-info">
            {textList.map(item => (
                <p key={item.textValue}>
                    <Icon name="fa fa-angle-right" /> {item.textValue}
                </p>
            ))}
        </div>
    );
};

export default Iddaa;

import React from 'react';
import IddaLogo from "../../assets/images/icon-iddaa.png";
import {Trans, withTranslation} from "react-i18next";

const PreIddaa = ({iddaaMatchData, swipeByTabName, t}) => {
	if (!iddaaMatchData) return false;
	iddaaMatchData.marketList = Object.keys(iddaaMatchData.marketList).map(function (key) {
		return iddaaMatchData.marketList[key];
	});

	const markets = iddaaMatchData.marketList.sort((a, b) => a.typePriority - b.typePriority);
	return (
		<div className="pre-iddaa">
			<div className="title">
				<img src={IddaLogo} className="title-logo" alt="Iddaa Oranlari, Iddaa Tahminleri"/> <Trans>Live Iddaa Odds</Trans>

			</div>
			<div className="pre-iddaa-container" onClick={() => swipeByTabName(t('Iddaa'))}>
				{markets.map(market => {
					// if (market.name !== "1-1") return false;
					return (<div key={market.id} className="item">
						<div className="row align-items-center">
							<div className="col col-4 item-title">
								{market.sgName}
							</div>
							<div className="col col-mbs"><span
								className={"mbs mbs-" + market.minCombinCount}>{market.minCombinCount}</span></div>
							<div className="col px-1 pr-2">
								<div className="row row-odds">
									{market.outcomeList.map(odd => (
										<div key={odd.oddVersion} className="col">
											<div className="odd-box">
												<div className="odd-box-name">{odd.outcomeName}</div>
												<div className="odd-box-value">{odd.fixedOddsWeb.toFixed(2)}</div>
											</div>
										</div>))}
								</div>
							</div>
						</div>
					</div>)
				})}
			</div>
			<div  onClick={() => swipeByTabName(t('Iddaa'))} className="pre-iddaa-link text-center"><span><Trans>See All Live Iddaa Odds</Trans> <i className="fas fa-angle-right"/></span>
			</div>
		</div>
	);
};

export default withTranslation('translations')(PreIddaa);

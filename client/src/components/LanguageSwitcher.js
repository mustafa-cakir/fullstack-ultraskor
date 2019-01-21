import React, {Component} from 'react';
import i18n from "i18next";
import {HelperTranslateUrlTo} from "../Helper";


class LanguageSwitcher extends Component {
	render() {
		const {language} = i18n;
		return (
			<div className="language-switcher">
				<a href={HelperTranslateUrlTo('tr')} className={"btn " + (language === "tr" ? "active" : "")}
				   alt="Dili Türkçe'ye çevirebilirsiniz">Türkçe</a>
				<a href={HelperTranslateUrlTo('en')} className={"btn " + (language === "en" ? "active" : "")}
				   alt="Change language to English">English</a>
			</div>
		)
	}
}

export default LanguageSwitcher

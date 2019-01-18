import React, {Component} from 'react';
import i18n from "i18next";

const urlTranslate = {
	toEnglish: {
		"mac":"match",
		"canli-skor":"live-score",
	},
	toTurkish: {
		"/en": "",
		"match/":"mac/",
		"live-score-":"canli-skor-",
	}
};

const replaceAll = (str,mapObj) => {
	const re = new RegExp(Object.keys(mapObj).join("|"),"gi");
	return str.replace(re, function(matched){
		return mapObj[matched.toLowerCase()];
	});
};

const englishUrl = () => {
	let url = window.location.origin;
	let pathname = window.location.pathname;
	if (pathname.split('/')[1] !== "en") {
		pathname = replaceAll(pathname, urlTranslate.toEnglish);
		url += '/en' + pathname;
	} else {
		url += pathname;
	}
	return url;
};

const turkishUrl = () => {
	let url = window.location.origin;
	let pathname = window.location.pathname;
	if (pathname.split('/')[1] === "en") {
		pathname = replaceAll(pathname, urlTranslate.toTurkish);
		url += pathname;
	} else {
		url += pathname;
	}
	return url;
};


class LanguageSwitcher extends Component {
	render() {
		const { language } = i18n;
		return (
			<div className="language-switcher">
				<a href={turkishUrl()} className={"btn " + (language === "tr" ? "active" : "")} alt="Dili Türkçe'ye çevirebilirsiniz">Türkçe</a>
				<a href={englishUrl()} className={"btn " + (language === "en" ? "active" : "")} alt="Change language to English">English</a>
			</div>
		)
	}
}

export function LanguageUrlHandler(to) {
	return to === "en" ? englishUrl() : turkishUrl();
}

export default LanguageSwitcher

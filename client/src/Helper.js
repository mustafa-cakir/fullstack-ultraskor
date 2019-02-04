//import React, {Component} from 'react';
//import i18n from "i18next";

import React from "react";

class TranslateUrlHandler {
	constructor() {
		this.regEx = {
			toEnglish: {
				"mac": "match",
				"canli-skor": "live-score",
			},
			toTurkish: {
				"/en": "",
				"match/": "mac/",
				"live-score-": "canli-skor-",
			}
		}
	}

	replaceAll(str, mapObj) {
		const re = new RegExp(Object.keys(mapObj).join("|"), "gi");
		return str.replace(re, function (matched) {
			return mapObj[matched.toLowerCase()];
		});
	};

	toEnglish() {
		let url = window.location.origin;
		let pathname = window.location.pathname;
		if (pathname.split('/')[1] !== "en") {
			pathname = this.replaceAll(pathname, this.regEx.toEnglish);
			url += '/en' + pathname;
		} else {
			url += pathname;
		}
		return url;
	}

	toTurkish() {
		let url = window.location.origin;
		let pathname = window.location.pathname;
		if (pathname.split('/')[1] === "en") {
			pathname = this.replaceAll(pathname, this.regEx.toTurkish);
			url += pathname;
		} else {
			url += pathname;
		}
		return url;
	}
}

class UpdateMetaHandler {
	constructor() {
		this.els = {
			canonical: document.querySelector('[data-meta="canonical"]'),
			description: document.querySelector('[data-meta="description"]'),
			keywords: document.querySelector('[data-meta="keywords"]'),
			alternate: document.querySelector('[data-meta="alternate"]')
		}
	}
	update(props) {
		const {title, canonical, description, keywords, alternate, hrefLang} = props;

		if (title) document.title = title;
		if (canonical) this.els.canonical.setAttribute("href", canonical);
		if (description) this.els.description.setAttribute("content", description);
		if (keywords) this.els.keywords.setAttribute("content", keywords);
		if (alternate) this.els.alternate.setAttribute("href", alternate);
		if (hrefLang) this.els.alternate.setAttribute("hrefLang", hrefLang);
	}
}

export function HelperTranslateUrlTo(to) {
	const translateUrlInstance = new TranslateUrlHandler();
	return (to === "en" ? translateUrlInstance.toEnglish() : translateUrlInstance.toTurkish());
}

export function HelperUpdateMeta(props) {
	const updateMetaInstance = new UpdateMetaHandler();
	updateMetaInstance.update(props);
}

export function flagImg(tournament) {
	let uniqueTournamentImages = [7, 11, 384, 480, 679];
	if (uniqueTournamentImages.indexOf(tournament.tournament.uniqueId) > -1) {
		return (
			<div className="col flag-img">
				<img
					src={"/static/media/" + tournament.tournament.uniqueId + ".png"}
					alt={tournament.tournament.name}/>
			</div>
		)
	} else {
		return (
			<div className={"col flag flag-" + tournament.category.flag}/>
		)
	}
}

export function generateSlug(text) {
	const a = 'çıüğöşàáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
	const b = 'ciugosaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
	const p = new RegExp(a.split('').join('|'), 'g')

	return text.toString().toLowerCase()
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(p, c =>
			b.charAt(a.indexOf(c)))     // Replace special chars
		.replace(/&/g, '-and-')         // Replace & with 'and'
		.replace(/[^\w-]+/g, '')       // Remove all non-word chars
		.replace(/--+/g, '-')         // Replace multiple - with single -
		.replace(/^-+/, '')             // Trim - from start of text
		.replace(/-+$/, '')             // Trim - from end of text
}

//import React, {Component} from 'react';
//import i18n from "i18next";

import React from "react";

class TranslateUrlHandler {
	constructor() {
		this.regEx = {
			toEnglish: {
				"/mac/": "/match/",
				"canli-skor-": "live-score-",
				"/lig/": "/league/",
				"-puan-durumu-": "-standing-",
				"-sezon-": "-season-",
				"/maclar/": "/matches/",
				"tarih-": "date-",
                "/takim/": "/team/"

			},
			toTurkish: {
				"/en": "",
				"/match/": "/mac/",
				"live-score-": "canli-skor-",
				"/league/": "/lig/",
				"-standing-": "-puan-durumu-",
				"-season-": "-sezon-",
				"/matches/": "/maclar/",
				"date-": "tarih-",
                "/team/": "/takim/"
			}
		}
	}

	replaceAll(str, mapObj) {
		const re = new RegExp(Object.keys(mapObj).join("|"), "gi");
		return str.replace(re, function (matched) {
			return mapObj[matched.toLowerCase()];
		});
	};

	toEnglish(force) {
		let url = window.location.origin;
		let pathname = window.location.pathname;
        if (force) {
            url += this.replaceAll(pathname, this.regEx.toEnglish);
        } else {
            if (pathname.split('/')[1] !== "en") {
                pathname = this.replaceAll(pathname, this.regEx.toEnglish);
                url += '/en' + pathname;
            } else {
                url += pathname;
            }
        }
		return url;
	}

	toTurkish(force) {
		let url = window.location.origin;
		let pathname = window.location.pathname;
		if (force) {
            url += this.replaceAll(pathname, this.regEx.toTurkish);
        } else {
            if (pathname.split('/')[1] === "en") {
                pathname = this.replaceAll(pathname, this.regEx.toTurkish);
                url += pathname;
            } else {
                url += pathname;
            }
        }
		return url;
	}
}

class UpdateMetaHandler {
	constructor() {
		this.els = {
			canonical: document.querySelector('[data-meta="canonical"]'),
			alternate: document.querySelector('[data-meta="alternate"]'),
			description: document.querySelector('[data-meta="description"]'),
			keywords: document.querySelector('[data-meta="keywords"]'),
		}
	}

	update(props) {
		const {title, canonical, description, keywords, alternate, hrefLang} = props;

		if (canonical) {
			if (this.els.canonical) {
				this.els.canonical.setAttribute("href", canonical);
			} else {
				let link = document.createElement('link');
				link.rel = "canonical";
				link.href = canonical;
				link.setAttribute('data-meta', 'canonical');
				document.getElementsByTagName('head')[0].appendChild(link);
			}
		}
		if (alternate && hrefLang) {
			if (this.els.alternate) {
				this.els.alternate.href = alternate;
				this.els.alternate.setAttribute("hreflang", hrefLang);
			} else {
				let link = document.createElement('link');
				link.rel = "alternate";
				link.href = alternate;
				link.setAttribute('hreflang', hrefLang);
				link.setAttribute('data-meta', 'alternate');
				document.getElementsByTagName('head')[0].appendChild(link);
			}
		}

		if (title) document.title = title;
		if (description) this.els.description.content = description;
		if (keywords) this.els.keywords.content = keywords;
	}
}

export function HelperTranslateUrlTo(to, force = false) {
	const translateUrlInstance = new TranslateUrlHandler();
	return (to === "en" ? translateUrlInstance.toEnglish(force) : translateUrlInstance.toTurkish(force));
}

export function HelperUpdateMeta(props) {
	const updateMetaInstance = new UpdateMetaHandler();
	updateMetaInstance.update(props);
}

export function flagImg(tournament) {
    const storedCustomLogos = [7, 27];
    const customLogos = [11, 384, 480, 679];

    if (storedCustomLogos.indexOf(tournament.tournament.uniqueId) > -1) {
        return (
            <div className="col flag-img">
                <img
                    src={"/static/media/" + tournament.tournament.uniqueId + ".png"}
                    alt={tournament.tournament.name}/>
            </div>
        )
    } else if (customLogos.indexOf(tournament.tournament.uniqueId) > -1) {
        return (
            <div className="col flag-img">
                <img
                    src={`${window.ImageServer}/images/u-tournament/${tournament.tournament.uniqueId}.png`}
                    alt={tournament.tournament.name}/>
            </div>
        )
    } else {
        return (
            <div className={"col flag flag-" + tournament.category.flag}/>
        )
    }
}

export function ratingClass(value) {
    value = Number(value);
    if (value > 8.0) {
        return "amazing bg";
    } else if (value > 7.5) {
        return "great bg";
    } else if (value > 6.9) {
        return "good bg"
    } else if (value > 5.9) {
        return "mediocre bg";
    } else if (value > 4.9) {
        return "underwhelming bg";
    } else {
        return "unrated bg";
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

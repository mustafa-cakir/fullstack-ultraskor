import React from 'react';

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

export function Throttle(func, wait, options) {
	let context;
	let args;
	let result;
	let timeout = null;
	let previous = 0;
	if (!options) options = {};
	const later = () => {
		previous = options.leading === false ? 0 : Date.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};
	return function () {
		const now = Date.now();
		if (!previous && options.leading === false) previous = now;
		const remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
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

export function getQueryStringFromUrl(key) {
	key = key.replace(/[[\]]/g, '\\$&');
	let url = window.location.href,
		regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);

	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function updateQueryString(key, value) {
	let uri = window.location.href,
		re = new RegExp("([?&])" + key + "=.*?(&|$)", "i"),
		separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	}
	else {
		return uri + separator + key + "=" + value;
	}
}

export function storeScrollY() {
	try {
		sessionStorage.setItem('ultraskor_homepage_scrollY', window.scrollY)
	} catch (err) {
		console.log('error setting to sessionStorage', err);
	}
}

export function restoreScrollY() {
	let prev_scrollY;
	try {
		prev_scrollY = sessionStorage.getItem('ultraskor_homepage_scrollY')
	} catch (err) {
		console.log('error setting to sessionStorage', err);
	}
	if (prev_scrollY) {
		window.scroll(0, prev_scrollY)
	}
}

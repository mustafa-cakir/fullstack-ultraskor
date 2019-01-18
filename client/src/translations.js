import i18n from "i18next";
import {reactI18nextModule} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import tr from "./languages/tr.json";
import en from "./languages/en.json";


const lngDetector = new LanguageDetector();
lngDetector.addDetector({
	name: 'myCustomDetector',

	lookup(options) {
		const lng = window.location.pathname.split('/')[1];
		// options -> are passed in options
		return lng === "en" ? "en" : "tr";
	},

	cacheUserLanguage(lng, options) {
		//console.log(lng, options);
		// options -> are passed in options
		// lng -> current language, will be called after init and on changeLanguage

		// store it
	}
});


const detectOptions = {
	// order and from where user language should be detected
	//order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
	order: ['myCustomDetector'],

	// keys or params to lookup language from
	lookupQuerystring: 'lng',
	lookupCookie: 'i18next',
	lookupLocalStorage: 'i18nextLng',
	lookupFromPathIndex: 0,
	lookupFromSubdomainIndex: 0,

	// cache user language on
	//caches: ['localStorage', 'cookie'],
	//excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

	// optional expire and domain for set cookie
	//cookieMinutes: 10,
	//cookieDomain: 'myDomain',

	// optional htmlTag with lang attribute, the default is:
	htmlTag: document.documentElement
};

i18n.use(reactI18nextModule).use(lngDetector).init({
	detection: detectOptions,
	resources: {
		tr: {translations: tr},
		en: {translations: en}
	},
	fallbackLng: 'en',
	debug: false,

	//defaultLocale: "tr-TR",
	// have a common namespace used around the full app
	ns: ["translations"],
	defaultNS: "translations",

	keySeparator: false, // we use content as keys

	interpolation: {
		escapeValue: false, // not needed for react!!
		formatSeparator: ","
	},

	react: {
		wait: true
	}
});

export default i18n;

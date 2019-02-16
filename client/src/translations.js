import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import tr from "./languages/tr.json";
import en from "./languages/en.json";

const lngDetector = new LanguageDetector();
lngDetector.addDetector({
	name: 'myCustomDetector',

	lookup(options) {
		const lng = window.location.pathname.split('/')[1] === "en" ? "en" : "tr";
		document.documentElement.lang = lng;
		return lng;
	}
});

const detectOptions = {
	order: ['myCustomDetector'],
};

i18n.use(initReactI18next).use(lngDetector).init({
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

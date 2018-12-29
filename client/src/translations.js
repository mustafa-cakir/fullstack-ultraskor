import i18n from "i18next";
import {reactI18nextModule} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import tr from "./languages/tr.json";
import en from "./languages/en.json";

i18n.use(reactI18nextModule).use(LanguageDetector).init({
    resources: {
        tr : { translations: tr },
        en : {translations: en}
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
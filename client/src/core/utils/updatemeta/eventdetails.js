import moment from "moment";
import i18n from "i18next";
import { HelperTranslateUrlTo, HelperUpdateMeta } from "../helper";

const { language } = i18n;

const UpdateMetaEventdetails = (eventData, t) => {
    if (language === "en") {
        if (window.location.pathname.split("/")[2] === "mac") window.location.href = HelperTranslateUrlTo("en", true);

        HelperUpdateMeta({
            title: `${
                typeof eventData.event.scores.home !== "undefined" && typeof eventData.event.scores.away !== "undefined"
                    ? `Live: ${eventData.event.scores.home} - ${eventData.event.scores.away} | `
                    : ""
            }${t(eventData.event.teams.home.name)} - ${t(eventData.event.teams.away.name)}
            Live Scores, Highlights, Lineups, Odds and Live Match Stats`,
            canonical: window.location.href,
            description: `${eventData.event.tournament.name} Match Report and Live Scores for ${
                eventData.event.name
            } on ${moment(eventData.event.startTimestamp).format("ll")} at ${moment(
                eventData.event.startTimestamp
            ).format("HH:mm")}, including lineups, all goalsö live odds and incidents`,
            keywords: `${eventData.event.teams.home.slug} match results, ${eventData.event.teams.away.slug} match results, ${eventData.event.tournament.slug} results, ${eventData.event.slug} lineup, ${eventData.event.slug} results, fixtures`,
            alternate: HelperTranslateUrlTo("tr"),
            hrefLang: "tr"
        });
    } else if (language === "tr") {
        if (window.location.pathname.split("/")[1] === "match") window.location.href = HelperTranslateUrlTo("tr", true);
        HelperUpdateMeta({
            title: `${
                typeof eventData.event.scores.home !== "undefined" && typeof eventData.event.scores.away !== "undefined"
                    ? `Canlı: ${eventData.event.scores.home} - ${eventData.event.scores.away}`
                    : ""
            }${t(eventData.event.teams.home.name)} - ${t(eventData.event.teams.away.name)} 
            Maçı Canlı Skor, Maç Özeti, Iddaa Oranları ve Kadrolar için tıklayın`,
            canonical: window.location.href,
            description: `${eventData.event.tournament.name}, ${eventData.event.name} (${moment(
                eventData.event.startTimestamp * 1e3
            ).format("LL")}, saat: ${moment(eventData.event.startTimestamp * 1e3).format(
                "HH:mm"
            )}) maçının canlı skorlarını ve canlı İddaa oranlarını takip edebilirsiniz. İşte ${
                eventData.event.name
            } maçının canlı anlatımı, ilk 11 leri ve maça dair istatistikler...`,
            keywords: `${eventData.event.teams.home.slug} mac sonuclari, ${eventData.event.teams.away.slug} mac sonuclari, ${eventData.event.tournament.slug} sonuclari, ${eventData.event.slug} macinin sonucu, ultraskor, canli maclar, iddaa sonuclari`,
            alternate: HelperTranslateUrlTo("en"),
            hrefLang: "en"
        });
    }
};

export default UpdateMetaEventdetails;

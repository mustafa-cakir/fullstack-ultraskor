import moment from "moment";
import i18n from "i18next";
import { HelperTranslateUrlTo, HelperUpdateMeta } from "../helper";
import { isEmpty } from "../index";

const { language } = i18n;

const UpdateMetaEventdetails = eventData => {
    if (language === "en") {
        if (window.location.pathname.split("/")[2] === "mac") window.location.href = HelperTranslateUrlTo("en", true);
        HelperUpdateMeta({
            title: `Live: ${!isEmpty(eventData.event.scores) ? eventData.event.scores.home : " "} - ${
                !isEmpty(eventData.event.scores) ? eventData.event.scores.away : " "
            } | ${eventData.event.name} Live Scores Coverage - See highlights and match statistics`,
            canonical: window.location.href,
            description: `${eventData.event.tournament.name} Match Report and Live Scores for ${
                eventData.event.name
            } on ${moment(eventData.event.startTimestamp).format("ll")} at ${moment(
                eventData.event.startTimestamp
            ).format("HH:mm")}, including lineups, all goals and incidents`,
            keywords: `${eventData.event.teams.home.slug} match results, ${eventData.event.teams.away.slug} match results, ${eventData.event.tournament.slug} results, ${eventData.event.slug} lineup, ${eventData.event.slug} results, fixtures`,
            alternate: HelperTranslateUrlTo("tr"),
            hrefLang: "tr"
        });
    } else if (language === "tr") {
        if (window.location.pathname.split("/")[1] === "match") window.location.href = HelperTranslateUrlTo("tr", true);
        HelperUpdateMeta({
            title: `Canlı: ${!isEmpty(eventData.event.scores) ? eventData.event.scores.home : " "} - ${
                !isEmpty(eventData.event.scores) ? eventData.event.scores.away : " "
            } | ${eventData.event.name} Maçı canlı skor burada - Maç özeti ve goller için tıklayın`,
            canonical: window.location.href,
            description: `${eventData.event.tournament.name}, ${eventData.event.name} (${moment(
                eventData.event.startTimestamp * 1e3
            ).format("LL")}, saat: ${moment(eventData.event.startTimestamp * 1e3).format(
                "HH:mm"
            )}) maçının canlı skorlarını takip edebilirsiniz. İşte ${
                eventData.event.name
            } maçının canlı anlatımı, ilk 11 leri ve maça dair istatistikler...`,
            keywords: `${eventData.event.teams.home.slug} mac sonuclari, ${eventData.event.teams.away.slug} mac sonuclari, ${eventData.event.tournament.slug} sonuclari, ${eventData.event.slug} macinin sonucu, ultraskor, canli maclar, iddaa sonuclari`,
            alternate: HelperTranslateUrlTo("en"),
            hrefLang: "en"
        });
    }
};

export default UpdateMetaEventdetails;

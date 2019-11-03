import i18n from "i18next";
import { HelperTranslateUrlTo, HelperUpdateMeta } from "../helper";

const { language } = i18n;

const UpdateMetaTeam = (teamInfoData, t) => {
    if (language === "en") {
        if (window.location.pathname.split("/")[2] === "takim") window.location.href = HelperTranslateUrlTo("en", true);
        HelperUpdateMeta({
            title: `${teamInfoData.team.name} Live Match Results, League Fixtures, Weekly Highlights and Lineups - UltraSkor`,
            canonical: window.location.href,
            description: `See ${t(teamInfoData.team.name)} live match results, watch ${t(
                teamInfoData.team.mediumname
            )} highlights, see league fixtures and follow the transfer news for ${t(teamInfoData.team.name)}. See ${t(
                teamInfoData.manager.name
            )}'s possible lineups for the upcoming match`,
            keywords: `${t(teamInfoData.team.name)} fixtures, ${t(teamInfoData.team.mediumname)} match results, ${t(
                teamInfoData.team.name
            )} highlights, ${t(teamInfoData.team.name)} transfer news, lineups, league fixtures, ${t(
                teamInfoData.team.mediumname
            )} highlights`,
            alternate: HelperTranslateUrlTo("tr"),
            hrefLang: "tr"
        });
    } else if (language === "tr") {
        if (window.location.pathname.split("/")[1] === "team") window.location.href = HelperTranslateUrlTo("tr", true);
        HelperUpdateMeta({
            title: `${t(teamInfoData.team.name)} Fikstür, Kadro, Puan Durumu ve Maç Özetleri - UltraSkor.com`,
            canonical: window.location.href,
            description: `${t(teamInfoData.manager.name)} yönetimindeki ${t(teamInfoData.team.name)} takımının ${
                teamInfoData.stadium.country
            } ligindeki fikstür ve muhtemel kadroları görebilir, iddaa maç sonuçları ve transfer haberlerini takip edebilir, ${t(
                teamInfoData.team.mediumname
            )} takımının maç özetlerini izleyebilirsiniz.`,
            keywords: `${t(teamInfoData.team.name)} mac fiksturu, ${t(
                teamInfoData.team.mediumname
            )} maç sonuşları, lig fikstürü, haftalık lig fikstürü, ${t(teamInfoData.team.name)} maç özetleri, ${t(
                teamInfoData.team.name
            )} haftanın takımı, ${t(teamInfoData.team.mediumname)} gol krallığı`,
            alternate: HelperTranslateUrlTo("en"),
            hrefLang: "en"
        });
    }
};

export default UpdateMetaTeam;

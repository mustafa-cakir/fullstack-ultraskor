import i18n from 'i18next';
import { HelperTranslateUrlTo, HelperUpdateMeta } from '../helper';

const { language } = i18n;

const UpdateMetaLeague = (leagueData, t) => {
    if (language === 'en') {
        if (window.location.pathname.split('/')[2] === 'lig') window.location.href = HelperTranslateUrlTo('en', true);
        HelperUpdateMeta({
            title: `${leagueData.uniqueTournament.name} Standings, League Fixtures, ${leagueData.uniqueTournament.name} Weekly Highlights - UltraSkor`,
            canonical: window.location.href,
            description: `Follow live results for ${t(leagueData.category.name)} - ${t(
                leagueData.uniqueTournament.name
            )}, see the team of the week, watch weekly highlights and see the upcoming weeks' league fixtures.`,
            keywords: `${t(leagueData.uniqueTournament.name)} weekly results, league fixture, weekly fixtures, ${t(
                leagueData.uniqueTournament.name
            )} highlights, ${t(leagueData.uniqueTournament.name)} team of the week, ${t(
                leagueData.uniqueTournament.name
            )} top scorers, league stats`,
            alternate: HelperTranslateUrlTo('tr'),
            hrefLang: 'tr',
        });
    } else if (language === 'tr') {
        if (window.location.pathname.split('/')[1] === 'league')
            window.location.href = HelperTranslateUrlTo('tr', true);
        HelperUpdateMeta({
            title: `${t(leagueData.uniqueTournament.name)} Puan Durumu, Lig Fikstürü, ${t(
                leagueData.uniqueTournament.name
            )} Maç Özetleri - UltraSkor.com`,
            canonical: window.location.href,
            description: `${t(leagueData.category.name)} - ${t(
                leagueData.uniqueTournament.name
            )} canlı puan durumunu kontrol edebilir, haftanin takmini görebilir, maç özetlerini izleyebilirsiniz ve gelecek haftalarin fikstürlerine göz gezdirebilirsiniz.`,
            keywords: `${t(
                leagueData.uniqueTournament.name
            )} haftalık sonuclar, lig fikstürü, haftalık lıg fikstürü, ${t(
                leagueData.uniqueTournament.name
            )} özetleri, ${t(leagueData.uniqueTournament.name)} haftanın takımı, ${t(
                leagueData.uniqueTournament.name
            )} gol krallığı`,
            alternate: HelperTranslateUrlTo('en'),
            hrefLang: 'en',
        });
    }
};

export default UpdateMetaLeague;

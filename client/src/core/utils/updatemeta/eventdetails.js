import moment from 'moment';
import i18n from 'i18next';
import { HelperTranslateUrlTo, HelperUpdateMeta } from '../helper';

const { language } = i18n;

const UpdateMetaEventdetails = (eventData, t) => {
    if (language === 'en') {
        if (window.location.pathname.split('/')[2] === 'mac') window.location.href = HelperTranslateUrlTo('en', true);

        let title = `${t(eventData.event.teams.home.name)} - ${t(
            eventData.event.teams.away.name
        )} Live Scores, Highlights, Lineups, Odds and Live Match Stats`;
        let description = `${eventData.event.tournament.name} Match Report and Live Scores for ${
            eventData.event.name
        } on ${moment(eventData.event.startTimestamp).format('ll')} at ${moment(eventData.event.startTimestamp).format(
            'HH:mm'
        )}, including lineups, all goalsö live odds and incidents`;

        if (typeof eventData.event.scores.home !== 'undefined' && typeof eventData.event.scores.away !== 'undefined') {
            title = `Live: ${eventData.event.scores.home} - ${eventData.event.scores.away} | 
            ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} Live Scores, Highlights, Lineups, Odds and Live Match Stats`;
        }
        if (eventData.event.status.code === 100) {
            title = `Match Result: ${eventData.event.scores.home} - ${eventData.event.scores.away} | 
            ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} Live Scores, Highlights, Lineups, Odds and Match Stats`;
        }
        if (eventData.event.status.code === 60) {
            title = `Match Suspended: ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} has been suspended. To learn why this match has been suspended click here`;
            description = `${eventData.event.name} game has been suspended. The game in ${
                eventData.event.tournament.name
            } was supposed to tart on ${moment(eventData.event.startTimestamp).format('LL')} at ${moment(
                eventData.event.startTimestamp
            ).format(
                'HH:mm'
            )} but it has been suspended. Click to learn more about why the match was suspended, when it is going to be played, match lineups, odds and reviews.`;
        }
        if (eventData.event.status.code === 70) {
            title = `Match Canceled: ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} has been canceled. To learn why this match has been canceled click here`;
            description = `${eventData.event.name} game has been suspended. The game in ${
                eventData.event.tournament.name
            } was supposed to tart on ${moment(eventData.event.startTimestamp).format('LL')} at ${moment(
                eventData.event.startTimestamp
            ).format(
                'HH:mm'
            )} but it has been canceled. Click to learn more about why the match was canceled, when it is going to be played, match lineups, odds and reviews.`;
        }

        HelperUpdateMeta({
            title,
            canonical: window.location.href,
            description,
            keywords: `${eventData.event.teams.home.slug} match results, ${eventData.event.teams.away.slug} match results, ${eventData.event.tournament.slug} results, ${eventData.event.slug} lineup, ${eventData.event.slug} results, fixtures`,
            alternate: HelperTranslateUrlTo('tr'),
            hrefLang: 'tr',
        });
    } else if (language === 'tr') {
        if (window.location.pathname.split('/')[1] === 'match') window.location.href = HelperTranslateUrlTo('tr', true);

        let title = `${t(eventData.event.teams.home.name)} - ${t(
            eventData.event.teams.away.name
        )} Maçı Canlı Skor, Maç Özeti, Iddaa Oranları ve Kadrolar için tıklayın`;
        let description = `${eventData.event.tournament.name}, ${eventData.event.name} (${moment(
            eventData.event.startTimestamp
        ).format('LL')}, saat: ${moment(eventData.event.startTimestamp).format(
            'HH:mm'
        )}) maçının canlı skorlarını ve canlı İddaa oranlarını takip edebilirsiniz. İşte ${
            eventData.event.name
        } maçının canlı anlatımı, ilk 11 leri ve maça dair istatistikler...`;

        if (typeof eventData.event.scores.home !== 'undefined' && typeof eventData.event.scores.away !== 'undefined') {
            title = `Canlı: ${eventData.event.scores.home} - ${eventData.event.scores.away} | 
            ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} Maçı Canlı Skor, Maç Özeti, Iddaa Oranları ve Kadrolar için tıklayın`;
        }

        if (eventData.event.status.code === 100) {
            title = `Maç Sonucu: ${eventData.event.scores.home} - ${eventData.event.scores.away} |
            ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} Maç Özetleri, Iddaa Oranları, Goller ve Kadrolar için tıklayın`;
        }
        if (eventData.event.status.code === 60) {
            title = `Maç Ertelendi: ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} maçı ertelendi. Maçın neden ertelendiğini öğrenmek için lütfen tıklayın`;
            description = `${eventData.event.name} maçı ertelendi. ${eventData.event.tournament.name}, ${moment(
                eventData.event.startTimestamp
            ).format('LL')}, saat: ${moment(eventData.event.startTimestamp).format(
                'HH:mm'
            )} tarihinde oynanması gereken maç ertelendi. Peki maç neden ertelendi ve ne zaman oynanacak? Maçının İddaa oranlarını, ertelenme sebebini ve ne zaman oynanacağını öğrenmek için tıklayın.`;
        }
        if (eventData.event.status.code === 70) {
            title = `Maç Iptal Edildi: ${t(eventData.event.teams.home.name)} - ${t(
                eventData.event.teams.away.name
            )} maçı iptal edildi. Maçın neden iptal edildiğini öğrenmek için lütfen tıklayın`;
            description = `${eventData.event.name} maçı ertelendi. ${eventData.event.tournament.name}, ${moment(
                eventData.event.startTimestamp
            ).format('LL')}, saat: ${moment(eventData.event.startTimestamp).format(
                'HH:mm'
            )} tarihinde oynanması gereken maç iptal edildi. Peki maç neden ertelendi ve ne zaman oynanacak? Maçının İddaa oranlarını, iptal edilme sebebini ve ne zaman oynanacağını öğrenmek için tıklayın.`;
        }

        HelperUpdateMeta({
            title,
            canonical: window.location.href,
            description,
            keywords: `${eventData.event.teams.home.slug} mac sonuclari, ${eventData.event.teams.away.slug} mac sonuclari, ${eventData.event.tournament.slug} sonuclari, ${eventData.event.slug} macinin sonucu, ultraskor, canli maclar, iddaa sonuclari`,
            alternate: HelperTranslateUrlTo('en'),
            hrefLang: 'en',
        });
    }
};

export default UpdateMetaEventdetails;

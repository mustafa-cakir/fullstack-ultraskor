import moment from 'moment';
import i18n from 'i18next';
import { HelperTranslateUrlTo, HelperUpdateMeta } from '../helper';

const { language } = i18n;

const UpdateMetaHomepage = date => {
    if (language === 'en') {
        const title = date
            ? `UltraSkor - Results & Matches on ${moment(date, 'YYYY-MM-DD').format(
                  'dddd, MMMM DD, YYYY'
              )}. See all Scores, Results, Stats and Match Highlights`
            : 'Live Score, Match Results and League Fixtures - UltraSkor | (No Ads) ';

        const description = date
            ? `No Ads. Get the football coverages for the matches on ${moment(date, 'YYYY-MM-DD').format(
                  'dddd, MMMM DD, YYYY'
              )}. See results, league standings and watch highlights`
            : 'No Ads. Get the live football scores update, see football match results, match fixtures and match highlights from all around the world';

        const keywords = date
            ? `${moment(date, 'YYYY-MM-DD')
                  .format('dddd')
                  .toLowerCase()} matches, ${moment(date, 'YYYY-MM-DD')
                  .format('DD MMMM dddd')
                  .toLowerCase()} match results, `
            : '';

        HelperUpdateMeta({
            title,
            canonical: window.location.href,
            description,
            keywords: `${keywords}live scores, live football results, match results, football fixtures, eufa champions league results, highlights`,
            alternate: date ? HelperTranslateUrlTo('tr') : 'https://www.ultraskor.com',
            hrefLang: 'tr'
        });
    } else {
        const title = date
            ? `UltraSkor - ${moment(date, 'YYYY-MM-DD').format(
                  'DD MMMM dddd'
              )} Günü Oynanan Tüm Maçlar burada. Sonuçlar, İstatistikler ve Maç Özetleri için tıklayın.`
            : 'Canlı Skor, Canlı Maç Sonuçları, İddaa Sonuçları - UltraSkor | (Reklamsız)';

        const description = date
            ? `Tamamen reklamsız olarak, ${moment(date, 'YYYY-MM-DD').format(
                  'DD MMMM dddd'
              )} günü oynanmış tüm maçların sonuçlarını, lig puan durumlarını ve fikstürlerini takip edebilir, maç özetlerini izleyebilirsiniz.`
            : 'Reklamsız olarak canli maç skorlarını takip edebilir, biten maçların sonuçlarını, istatistiklerini görebilir, iddaa bültenlerini ve biten iddaa maç sonuçlarını görebilirsiniz.';

        const keywords = date
            ? `${moment(date, 'YYYY-MM-DD')
                  .format('dddd')
                  .toLowerCase()} maçları, ${moment(date, 'YYYY-MM-DD')
                  .format('DD MMMM dddd')
                  .toLowerCase()} maç sonucları, `
            : '';

        HelperUpdateMeta({
            title,
            canonical: window.location.href,
            description,
            keywords: `${keywords}canlı skor, mac sonuclari, ultraskor, sonuclar, iddaa sonuclari, maç özetleri`,
            alternate: date ? HelperTranslateUrlTo('en') : 'https://www.ultraskor.com/en',
            hrefLang: 'en'
        });
    }
};

export default UpdateMetaHomepage;

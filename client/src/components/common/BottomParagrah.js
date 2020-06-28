import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import i18n from 'i18next';
import { withTranslation, Trans } from 'react-i18next';
import iconIOS from '../../assets/images/app-stores-ios.png';
import iconPlay from '../../assets/images/app-stores-play.png';
import Icon from './Icon';
import { generateSlug } from '../../core/utils/helper';

class BottomParagrah extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            expand: /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(navigator.userAgent),
            popularEvents: null,
        };
        this.clickHandlerExpand = this.clickHandlerExpand.bind(this);
    }

    componentDidMount() {
        this.initGetData();
    }

    initGetData() {
        fetch(`/api/partial/footer/popularevents`)
            .then((res) => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then((res) => {
                if (res.length < 1) throw Error(`Can't retrieve information from server`);

                this.setState({
                    popularEvents: res,
                });
            })
            .catch((err) => {
                this.setState({
                    popularEvents: { error: err.toString() },
                });
            });
    }

    clickHandlerExpand() {
        this.setState({ expand: true });
    }

    render() {
        const { popularEvents } = this.state;
        const { t } = this.props;

        return (
            <article className="bottom-paragraph">
                <div className="container">
                    <div className="row">
                        <div className="col col-12 col-md-6 col-popular-games">
                            <h1 className="popular-matches-title">
                                <Trans>Featured Matches</Trans>
                            </h1>
                            {popularEvents && popularEvents.length > 0 ? (
                                <ul className="popular-matches-ul">
                                    {popularEvents.map((event, index) => (
                                        <li key={index}>
                                            <Icon name="fas fa-chevron-right" />{' '}
                                            <Link
                                                to={{
                                                    pathname: `/${t('match')}/${generateSlug(
                                                        t(event.teams.home.name) + '-' + t(event.teams.home.name)
                                                    )}-${t('live-score')}-${event.id}`,
                                                    state: { isPrev: true },
                                                }}
                                                title={`${t(event.teams.home.name)} - ${t(event.teams.away.name)}  ${t(
                                                    'click for live scores, lineup and stats'
                                                )}`}
                                            >
                                                {event.teams.home.name} - {event.teams.away.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                ''
                            )}
                            <h1 className="popular-leagues-title">
                                <Trans>Popular Leagues</Trans>
                            </h1>
                            <ul className="popular-leagues-ul">
                                {popularLeagues.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={{
                                                pathname: `/${t('league')}/${generateSlug(
                                                    t(item.country)
                                                )}-${generateSlug(t(item.name))}${t('-standing-')}${item.uniqueId}${t(
                                                    '-season-'
                                                )}${item.seasonId ? item.seasonId : '0'}`,
                                                state: { isPrev: true },
                                            }}
                                            title={`${t(item.country)} - ${t(item.name)} ${t(
                                                'click for standings, highlights and league fixtures'
                                            )}`}
                                        >
                                            <img
                                                src={
                                                    window.ImageServer +
                                                    '/images/u-tournament/' +
                                                    item.uniqueId +
                                                    '.png'
                                                }
                                                alt={`${t(item.country)} - ${t(item.name)} ${t(
                                                    'click for standings, highlights and league fixtures'
                                                )}`}
                                            />
                                            {item.country !== 'World' ? t(item.country) + ' - ' : ''}
                                            {t(item.name)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="app-download-title">
                                <Trans>Our Mobile Apps will be available soon...</Trans>
                            </div>
                            <img className="app-download-icon ios" src={iconIOS} alt="Get our app on App Store" />
                            <img className="app-download-icon ios" src={iconPlay} alt="Get our app on App Store" />
                        </div>
                        <div className={'col col-12 col-md-6 col-about-us ' + (!this.state.expand ? 'shrink' : '')}>
                            {i18n.language === 'en' ? englishSeoText() : turkishSeoText()}
                            {!this.state.expand ? (
                                <div className="readmore" onClick={this.clickHandlerExpand}>
                                    <Icon name="fas fa-chevron-down" /> <Trans>Read more</Trans>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </article>
        );
    }
}

const popularLeagues = [
    {
        name: 'UEFA Champions League',
        country: 'World',
        seasonId: 23766,
        uniqueId: 7,
    },
    {
        name: 'UEFA Europa League',
        country: 'World',
        seasonId: 23755,
        uniqueId: 679,
    },
    {
        name: 'Süper Lig',
        country: 'Turkey',
        seasonId: 24407,
        uniqueId: 52,
    },
    {
        name: 'Premier League',
        country: 'England',
        seasonId: 23776,
        uniqueId: 17,
    },
    {
        name: 'LaLiga',
        country: 'Spain',
        seasonId: 24127,
        uniqueId: 8,
    },
    {
        name: 'Bundesliga',
        country: 'Germany',
        seasonId: 23538,
        uniqueId: 35,
    },
    {
        name: 'Serie A',
        country: 'Italy',
        seasonId: 24644,
        uniqueId: 23,
    },
    {
        name: 'Ligue 1',
        country: 'France',
        seasonId: 23872,
        uniqueId: 34,
    },
    {
        name: 'Eredivisie',
        country: 'Netherlands',
        seasonId: 23873,
        uniqueId: 37,
    },
    {
        name: 'Primeira Liga',
        country: 'Portugal',
        seasonId: 24150,
        uniqueId: 238,
    },
    {
        name: 'Premier Liga',
        country: 'Russia',
        seasonId: 23682,
        uniqueId: 203,
    },
    {
        name: 'Championship',
        country: 'England',
        seasonId: 23976,
        uniqueId: 18,
    },
];

const englishSeoText = () => {
    return (
        <>
            <h1>Live Score, Match Results and League Fixtures - UltraSkor</h1>

            <p>
                On Ultrascore, you can get live coverage for football matches from more than 1000 worldside soccer
                leagues, tournaments with live updated goal results, live scores, incidents, first half and full time
                results, statistics, league tables, video hightlights, fixtures, booking stats, substitutions, live
                match stats, and live streams.
            </p>

            <h2>Live Match Tracking</h2>
            <p>
                Through the Match Live tab on the match detail page, you can follow the match with animattio supported
                live narration as if you are watching it on TV
            </p>

            <h2>Bettings Odds, Betting Analysis ve Betting Forecast</h2>
            <p>
                By clicking on Iddaa icon in the match detail screen; you can get the most accured betting analysises
                which are genrated by combining a lot of statistics about home and away teams previous results data.
            </p>

            <h2>Injured and Suspended List</h2>
            <p>
                On the Match detail page, you can get the list of red cards injured, crippled, off-board, missing,
                suspended and suspicious players prior to game kickoff
            </p>

            <h2>League Standings / League Tables</h2>
            <p>
                As well as the popular leagues such as, English Premier League, Spanish La Liga, Italian Serie A,
                Turkish Super League, Bundesliga and French Ligue 1, we also provide live coverages and league standings
                for UEFA Champions League, Europa League, World Cup and live match scores in international tournaments
                like the European Championship
            </p>

            <h2>Live Matches, Previous / Upcoming Matches and Filters</h2>
            <p>
                By clicking on the live icon, you can list of the only live matches. There is an option to select All or
                Live football matches. By click the filter icon, you can filter out only the leagues you want to follow.
                By changing the date on the calendar icon, you can see the previous dates' games, or upcoming games
            </p>

            <h2>Live Refresh</h2>
            <p>
                You don't have to manually refresh any page. Scores, bookings, minutes are all automatically refreshed
            </p>
        </>
    );
};

const turkishSeoText = () => {
    return (
        <>
            <h1>Canlı Skor, Canlı Maç Sonuçları, İddaa Sonuçları - UltraSkor</h1>
            <p>
                Ultraskor canlı skorlar sayfalarında 1000’den fazla lig ve kupada oynanan 75000’in üzerindeki futbol
                maçlarının hızlı ve doğru şekilde; gol dakikalarını, ilk yarı ve maç sonuçlarını, gol atan ve asist
                yapan oyuncularını, kırmızı ve sarı kartlarını, oyuncu değişikliklerini, canlı maç istatistiklerini ve
                canlı yayınlarını bulabilirsiniz.
            </p>

            <h2>Iddaa Bültenleri</h2>
            <p>
                İddaa bültenindeki maçların kodlarını ve karşılaşmaların başlama saatlerini görebilir, canlı maçların
                dakika ve skor bilgisini canlı olarak takip edebilirsiniz.
            </p>

            <h2>Canlı Maç Anlatımı</h2>
            <p>
                Maç detay sayfasındaki Canlı Maç Anlatımı sekmesinden, maçı TV'den izliyormuş gibi animasyon destekli
                canlı anlatım ile maçı takip edebilirsiniz.
            </p>

            <h2>Iddaa Oranları, Iddaa Analizleri ve Iddaa Tahminleri</h2>
            <p>
                Maç detay ekranındaki iddaa simgesine tıklayarak, maçın iddaa oranlarını ve iddaa analizlerini
                görebilirsiniz. Iddaa analizleri bölümünden, bir çok istatistiğin birleştirilerek oluşturulduğu iddaa
                tahmin ve analizlerini, iddaa yapmadan önce mutlaka okumlısınız.
            </p>

            <h2>Sakat ve Cezalı Listesi</h2>
            <p>
                Maç detay sayfasındaki Sakat ve Cezalılar sekmesinden, kırmızı kart cezalısı, sakat, kadro dışı ve
                oynaması şüpheli oyuncuları görebilirsiniz.
            </p>

            <h2>Lig Puan Durumları</h2>
            <p>
                Türkiye Süper Lig, İngiltere Premier Lig, İspanya La Liga, İtalya Serie A, Bundesliga ve Fransa Ligue 1
                gibi popüler liglerin yanısıra UEFA Şampiyonlar Ligi, Avrupa Ligi, Dünya Kupası ve Avrupa Şampiyonası
                gibi uluslararası turnuvalarında canlı maç skorlarını, puan durumlarını ve özetlerini takip
                edebilirsiniz.
            </p>

            <h2>Canlı Maçlar, Geçmiş/Gelecek Maçlar ve Filtrelemeler</h2>
            <p>
                Canlı simgesine tıklayarak, ekranda sadace canlı maçların listelenmesi, filtre icondan sadace
                istediğiniz lige ait maçların listelenmesi, takvim simgesinden tarihi değiştirerek oynanmış maçları veya
                ileri tarihte oynanacak maçları görüntüleyebilirsiniz.
            </p>

            <h2>Otomatik Yenileme</h2>
            <p>
                Maçlardaki dakika, skor ve kırmızı kart bilgilerinin ekrana yansıması için sayfayı yenilemenize gerek
                yoktur. Sayfalar otomatik olarak güncellenmektedir.
            </p>
        </>
    );
};

export default withTranslation('translations')(BottomParagrah);

import React, { useReducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { withTranslation } from 'react-i18next';
import { Tabs, Tab } from '@material-ui/core';
import { Swiper, Slide } from 'react-dynamic-swiper';
import 'react-dynamic-swiper/lib/styles.css';
import Errors from '../common/Errors';
import Loading from '../common/Loading';
import Summary from './Summary';
import LiveTracker from './LiveTracker';
import { appendValueToArray } from '../../core/utils/helper';
import H2h from './H2h';
import Stats from './Stats';
import Scoreboard from './Scoreboard';
import Lineups from './Lineups';
import Injuries from './Injuries';
import Standings from './Standings';
import UpdateMetaEventdetails from '../../core/utils/updatemeta/eventdetails';
import Footer from '../common/Footer';

const Eventdetails = ({ t, i18n }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        tabIndex: 0,
        clickedTabIndex: [0],
        data: null,
        error: null,
        isLoading: true,
        swiper: null
    });

    const { language } = i18n;
    const { tabIndex, clickedTabIndex, data, error, isLoading, swiper } = state;
    const params = useParams();
    const { eventid } = params;

    const getData = useCallback(() => {
        setState({
            tabIndex: 0,
            clickedTabIndex: [0],
            data: null,
            error: null,
            isLoading: true,
            swiper: null
        });
        axios
            .get(`/api/eventdetails/${eventid}/${language}`)
            .then(res => {
                setState({
                    data: res.data,
                    isLoading: false,
                    error: null
                });
                UpdateMetaEventdetails(res.data);
            })
            .catch(err => {
                setState({
                    error: err,
                    isLoading: false
                });
            });
    }, [eventid, language]);

    useEffect(() => {
        getData();
    }, [getData]);

    const updateAutoHeight = useCallback(() => {
        setTimeout(() => {
            swiper.updateAutoHeight();
        });
    }, [swiper]);

    if (error) return <Errors message={error} />;
    if (isLoading || !data) return <Loading />;

    const { event, ids, textList } = data;
    const { injuries, teams, stats, isStanding, isLineups } = event;
    const slides = [];

    const swipeByTabId = tabId => {
        const targetIndex = slides.findIndex(x => x.id === tabId);
        swiper.slideTo(targetIndex);
    };

    slides.push({
        id: 0,
        label: t('Summary'),
        Component: Summary,
        props: {
            data,
            swipeByTabId
        }
    });

    if (ids.id_sp)
        slides.push({
            id: 1,
            label: t('Live Tracker'),
            Component: LiveTracker,
            props: {
                id: ids.id_sp
            }
        });

    if (stats)
        slides.push({
            id: 2,
            label: t('Stats'),
            Component: Stats,
            props: {
                stats
            }
        });

    if (isLineups)
        slides.push({
            id: 3,
            label: t('Lineup'),
            Component: Lineups,
            props: {
                id: event.id,
                teams,
                updateAutoHeight
            }
        });

    if (injuries)
        slides.push({
            id: 4,
            label: t('Injuries & Susp.'),
            Component: Injuries,
            props: {
                teams,
                injuries
            }
        });

    if (isStanding)
        slides.push({
            id: 5,
            label: t('Standing'),
            Component: Standings,
            props: {
                event,
                updateAutoHeight
            }
        });

    if (teams)
        slides.push({
            id: 6,
            label: t('Head To Head'),
            Component: H2h,
            props: {
                id: event.id,
                teams,
                textList,
                updateAutoHeight
            }
        });

    const handleTabChange = (e, value) => {
        if (swiper) swiper.slideTo(value);
        setState({
            tabIndex: value,
            clickedTabIndex: appendValueToArray(clickedTabIndex, slides[value] ? slides[value].id : 0)
        });
    };

    const onInitSwiper = swiperInstance => {
        setState({
            swiper: swiperInstance
        });
        swiperInstance.on('slideChange', () => {
            setState({
                tabIndex: swiperInstance.activeIndex,
                clickedTabIndex: appendValueToArray(
                    clickedTabIndex,
                    slides[swiperInstance.activeIndex] ? slides[swiperInstance.activeIndex].id : 0
                )
            });
        });
    };

    return (
        <div className="event-details">
            <Scoreboard event={event} />
            <div className="middle-tabs">
                <div className="container">
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        variant="scrollable"
                        indicatorColor="secondary"
                        textColor="secondary"
                    >
                        {slides.map(({ label }) => (
                            <Tab label={label} key={label} />
                        ))}
                    </Tabs>
                </div>
            </div>
            <Swiper
                swiperOptions={{
                    slidesPerView: 1,
                    autoHeight: true
                }}
                navigation={false}
                pagination={false}
                onInitSwiper={onInitSwiper}
            >
                {slides.map(({ label, Component, props, id }) => {
                    return (
                        <Slide key={label}>
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <Component hasActived={clickedTabIndex.indexOf(id) > -1} {...props} />
                        </Slide>
                    );
                })}
            </Swiper>
            {event && (
                <>
                    {language === 'tr' ? (
                        <p className="bottom-text">
                            {event.tournament.name} ligindeki {event.teams.home.name} {event.teams.away.name} canlı skor
                            ve canlı maç izle {moment(event.startTimestamp).format('DD.MM.YYYY')} tarihinde, saat{' '}
                            {moment(event.startTimestamp).format('HH:mm')} 'te başlayacaktır. Maçın oynanacağı stadyum{' '}
                            {event.venue && event.venue.stadium ? event.venue.stadium.name : ''},{' '}
                            {event.venue && event.venue.city ? event.venue.city.name : ''},{' '}
                            {event.venue && event.venue.country ? event.venue.country.name : ''}. Maçı{' '}
                            {event.referee ? event.referee.name : ''} yönetecek.
                            <strong>
                                {event.tournament.name} liginda oynanan {event.name} karşılaşması
                            </strong>
                            na ait canlı maç sonucu, istatistikler, topla oynama yüzdeleri, golleri, sarı ve kırmızı
                            kartları, TV yayıncılarını, takımların ılk onbir ve diziliş bilgilerini, yedek oyunlaarını,
                            hakemlerin kim olduğu bilgilerine ulaşabilirsiniz. Ayrıca bu sayfada,{' '}
                            <strong>
                                {event.tournament.name} liginde oynanan {event.name} maç hangi kanalda?
                            </strong>
                            , <strong>{event.name} maç özetleri</strong> ve{' '}
                            <strong>{event.teams.home.name} canlı maç sonuçları</strong> gibi sorulara da cevaplar
                            bulabilirsiniz.
                            {event.teams.home.name} takımının teknik patronu{' '}
                            {event.managerDuel ? event.managerDuel.homeManager.name : ''} ve {event.teams.away.name}{' '}
                            takımı teknik patronu {event.managerDuel ? event.managerDuel.awayManager.name : ''}{' '}
                            tarafından ilk onbirler açıklandığı anda, bu sayfada yayınlancaktır. Kesin onbirlerin
                            açıklanması genellikle maça bir saat kala yapılmaktadır. {event.name} karşılaşması İddaa
                            programında yer alıyor ise bu karşılaşma için açıklanmış İddaa oranların görebilir ve maç
                            başladığı anda <strong>Canlı İddaa</strong> oranlarını takip edebilirsiniz. Yasalar gereği
                            sitemiz malesef <strong>{event.name} Canlı İzle</strong> linkleri içermemektedir. Fakat{' '}
                            <strong>Canlı Maç Takibi</strong> sekmesinden maçı canlı izlermiş gibi animasyonlu
                            gösterimlerinde yardımıyla, maçı saniye saniye takip edebilirsiniz.
                            <strong>Takım karşılaştırma</strong> sekmesinden
                            {event.teams.home.name} ile {event.teams.away.name} takımlarının birbirleriyle ve başka
                            takımlar ile yaptıkları maçların sonuçlarını görebilir ve karşılaştırma yapabilirsiniz.
                        </p>
                    ) : (
                        <p className="bottom-text">
                            {event.teams.home.name} {event.teams.away.name} live score and online live streaming starts
                            on {moment(event.startTimestamp).format('DD.MM.YYYY')}. at{' '}
                            {moment(event.startTimestamp).format('HH:mm')} at{' '}
                            {event.venue && event.venue.stadium ? event.venue.stadium.name : ''} stadium,{' '}
                            {event.venue && event.venue.city ? event.venue.city.name : ''},{' '}
                            {event.venue && event.venue.country ? event.venue.country.name : ''} in{' '}
                            {event.tournament.name}. The referee of the match will be{' '}
                            {event.referee ? event.referee.name : ''}. On our match details page, you can follow the{' '}
                            <strong>{event.category.name} live scores</strong> that is being played in{' '}
                            {event.tournament.name}. Within this page, you will find live scores, live stats, ball
                            possessions, goals, yellow and/or red cards, substitutions, lineups and referee
                            informations. Additionally, within this page you can get further details about{' '}
                            <strong>{event.name} live stream, watch live</strong>. We will publish the confirmed lineups
                            and formations as soon as {event.managerDuel ? event.managerDuel.homeManager.name : ''}, who
                            is the manager of {event.teams.home.name}, and{' '}
                            {event.managerDuel ? event.managerDuel.awayManager.name : ''}, who is the manager of{' '}
                            {event.teams.away.name} declare them. Unfortunatelly, due to law enforcements, our website
                            doesn't include <strong>Live Streaming links for {event.name}</strong> but throught our
                            animation powered <strong>Live Tracking</strong> page, you can follow the game seconds by
                            seconds as if you are watching live. Through H2h tab, you can compare{' '}
                            {event.teams.home.name} and {event.teams.away.name} by looking at their h2h matches, and
                            matches they played against other teams.
                        </p>
                    )}
                </>
            )}
            <Footer />
        </div>
    );
};

export default withTranslation('translations')(Eventdetails);

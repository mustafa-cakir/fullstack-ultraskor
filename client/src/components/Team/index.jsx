import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import { withTranslation, Trans } from 'react-i18next';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { Swiper, Slide } from 'react-dynamic-swiper';
import { Tabs, Tab } from '@material-ui/core';
import Fixture from './Fixture';
import { HelperTranslateUrlTo, HelperUpdateMeta } from '../../core/utils/helper';

let swiper;
const Team = ({ t, i18n }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        infoData: null,
        isLoading: true,
        error: null,
        tabIndex: 0,
        clickedTabIndex: [0]
    });
    const { infoData, isLoading, error, tabIndex, clickedTabIndex } = state;

    const { language } = i18n;
    const params = useParams();
    let { teamId } = params;
    const paramArr = teamId.split('-');
    teamId = paramArr[paramArr.length - 1];

    const updateMeta = teamInfoData => {
        if (language === 'en') {
            if (window.location.pathname.split('/')[2] === 'takim')
                window.location.href = HelperTranslateUrlTo('en', true);
            HelperUpdateMeta({
                title: `${teamInfoData.team.name} Live Match Results, League Fixtures, Weekly Highlights and Lineups - UltraSkor`,
                canonical: window.location.href,
                description: `See ${t(teamInfoData.team.name)} live match results, watch ${t(
                    teamInfoData.team.mediumname
                )} highlights, see league fixtures and follow the transfer news for ${t(
                    teamInfoData.team.name
                )}. See ${t(teamInfoData.manager.name)}'s possible lineups for the upcoming match`,
                keywords: `${t(teamInfoData.team.name)} fixtures, ${t(teamInfoData.team.mediumname)} match results, ${t(
                    teamInfoData.team.name
                )} highlights, ${t(teamInfoData.team.name)} transfer news, lineups, league fixtures, ${t(
                    teamInfoData.team.mediumname
                )} highlights`,
                alternate: HelperTranslateUrlTo('tr'),
                hrefLang: 'tr'
            });
        } else if (i18n.language === 'tr') {
            if (window.location.pathname.split('/')[1] === 'team')
                window.location.href = HelperTranslateUrlTo('tr', true);
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
                alternate: HelperTranslateUrlTo('en'),
                hrefLang: 'en'
            });
        }
    };

    useEffect(() => {
        axios
            .get(`/api/team/info/${language}/${teamId}`)
            .then(res => {
                setState({
                    infoData: res.data,
                    isLoading: false,
                    error: null
                });
                updateMeta(res.data);
            })
            .catch(err => {
                setState({
                    error: t('Something went wrong'),
                    isLoading: false
                });
            });
    }, []);
    const handleTabChange = (e, value) => {
        if (swiper) swiper.slideTo(value);
        setState({
            tabIndex: value
        });
    };

    const updateAutoHeight = () => {
        console.log(swiper);
        setTimeout(() => {
            swiper.updateAutoHeight();
        });
    };

    const onInitSwiper = swiperInstance => {
        console.log('heyoo');
        swiper = swiperInstance;
        swiperInstance.on('slideChange', () => {
            setState({
                tabIndex: swiperInstance.activeIndex
            });
        });
    };

    const slides = [];

    slides.push({
        id: 0,
        label: t('Fixture'),
        Component: Fixture,
        props: {
            teamId,
            updateAutoHeight
        }
    });

    return (
        <div className="team-details">
            <div className="team-details-info">
                {infoData && (
                    <>
                        <div className="top">
                            <div className="top-team-logo">
                                <img
                                    src={`${window.ImageServer}/images/team-logo/football_${teamId}.png`}
                                    className="img"
                                    alt={infoData.team.mediumname}
                                />
                            </div>
                        </div>
                        <div className="bottom" style={{ color: `#${infoData.homejersey.number}` }}>
                            <span className="bg" style={{ background: `#${infoData.homejersey.base}` }} />
                            <div className="bg-over">
                                <h1>{infoData.team.mediumname}</h1>
                                <div className="text">
                                    <strong>
                                        <Trans>Manager</Trans>:
                                    </strong>{' '}
                                    {infoData.manager.name}
                                    <br />
                                    <small>
                                        (<Trans>Contract Since</Trans>:{' '}
                                        {moment(infoData.manager.membersince.date, 'DD/MM/YYYY').format('MMMM YYYY')})
                                    </small>
                                </div>
                                <div className="text">
                                    <strong>
                                        <Trans>Stadium</Trans>:
                                    </strong>{' '}
                                    {infoData.stadium.name}{' '}
                                    <small>
                                        (<Trans>Capacity</Trans>: {infoData.stadium.capacity}})
                                    </small>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

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
            {infoData && (
                <>
                    {language === 'tr' ? (
                        <p className="bottom-text">
                            Fikstür sayfamızdan {infoData.team.name} takımının {infoData.stadium.country} liginde bu
                            sezona ve geçmiş sezonlar ait maç fikstürlerine kolayca ulaşabilirsiniz. Fikstür seçimi
                            yaptığınızda {infoData.team.name} takımının turnuva ve kupalarda aldığı sonuçlar karşınıza
                            gelecektir. Dilerseniz {infoData.manager.name} yönetimindeki {infoData.team.name} takımının
                            ideal onbirini, geçmiş maçlarını, gelecek maçlarına, takım kadrosuna,{' '}
                            {infoData.stadium.name} stadyumundaki iç saha performansına göz atabilirsiniz.
                        </p>
                    ) : (
                        <p className="bottom-text">
                            Through our fixture page, you can follow {infoData.team.name}'s previous and upcoming
                            matches, see the results, watch highlights, see {infoData.manager.name}'s possible lineups
                            for the upcoming match. and see all the stats. After you make a selection, you will get the
                            latest live results of
                            {infoData.team.name}. You can also see the performance of {infoData.team.name} in the{' '}
                            {infoData.stadium.name} stadium.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default withTranslation('translations')(Team);

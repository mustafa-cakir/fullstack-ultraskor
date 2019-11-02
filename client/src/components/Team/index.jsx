import React, { useEffect, useReducer } from "react";
import axios from "axios";
import { withTranslation, Trans } from "react-i18next";
import moment from "moment";
import { useParams } from "react-router-dom";
import { Swiper, Slide } from "react-dynamic-swiper";
import { Tabs, Tab } from "@material-ui/core";
import Fixture from "./Fixture";
import UpdateMetaTeam from "../../core/utils/updatemeta/team";
import Footer from "../common/Footer";
import { invertColor } from "../../core/utils";

let swiper;
const Team = ({ t, i18n }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        infoData: null,
        isLoading: true,
        error: null,
        tabIndex: 0,
        clickedTabIndex: [0]
    });
    const { infoData, tabIndex, clickedTabIndex } = state;

    const { language } = i18n;
    const params = useParams();
    let { teamId } = params;
    const paramArr = teamId.split("-");
    teamId = paramArr[paramArr.length - 1];

    useEffect(() => {
        axios
            .get(`/api/team/info/${language}/${teamId}`)
            .then(res => {
                setState({
                    infoData: res.data,
                    isLoading: false,
                    error: null
                });
                UpdateMetaTeam(res.data, t);
            })
            .catch(() => {
                setState({
                    error: t("Something went wrong"),
                    isLoading: false
                });
            });
    }, [language, t, teamId]);
    const handleTabChange = (e, value) => {
        if (swiper) swiper.slideTo(value);
        setState({
            tabIndex: value
        });
    };

    const updateAutoHeight = () => {
        setTimeout(() => {
            swiper.updateAutoHeight();
        });
    };

    const onInitSwiper = swiperInstance => {
        swiper = swiperInstance;
        swiperInstance.on("slideChange", () => {
            setState({
                tabIndex: swiperInstance.activeIndex
            });
        });
    };

    const slides = [];

    slides.push({
        id: 0,
        label: t("Fixture"),
        Component: Fixture,
        props: {
            teamId,
            updateAutoHeight
        }
    });

    return (
        <div className="team-details">
            <div className="team-details-info">
                {infoData && infoData.team && (
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
                        <div
                            className="bottom"
                            style={{
                                color: `${infoData.homejersey ? invertColor(infoData.homejersey.base, true) : "#000"}`
                            }}
                        >
                            <span
                                className="bg"
                                style={{ background: `#${infoData.homejersey ? infoData.homejersey.base : "fff"}` }}
                            />
                            <div className="bg-over">
                                <h1>{infoData.team.mediumname}</h1>
                                {infoData.manager && (
                                    <div className="text">
                                        <strong>
                                            <Trans>Manager</Trans>:
                                        </strong>{" "}
                                        {infoData.manager.name}
                                        <br />
                                        <small>
                                            (<Trans>Contract Since</Trans>:{" "}
                                            {moment(infoData.manager.membersince.date, "DD/MM/YYYY").format(
                                                "MMMM YYYY"
                                            )}
                                            )
                                        </small>
                                    </div>
                                )}
                                {infoData.stadium && (
                                    <div className="text">
                                        <strong>
                                            <Trans>Stadium</Trans>:
                                        </strong>{" "}
                                        {infoData.stadium.name}{" "}
                                        <small>
                                            (<Trans>Capacity</Trans>: {infoData.stadium.capacity}})
                                        </small>
                                    </div>
                                )}
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
            <div className="swiper-container">
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
            </div>
            {infoData && infoData.team && (
                <>
                    {language === "tr" ? (
                        <p className="bottom-text">
                            Fikstür sayfamızdan {infoData.team.name} takımının {infoData.stadium.country} liginde bu
                            sezona ve geçmiş sezonlar ait maç fikstürlerine kolayca ulaşabilirsiniz. Fikstür seçimi
                            yaptığınızda {infoData.team.name} takımının turnuva ve kupalarda aldığı sonuçlar karşınıza
                            gelecektir. Dilerseniz {infoData.manager ? infoData.manager.name : ""} yönetimindeki{" "}
                            {infoData.team.name} takımının ideal onbirini, geçmiş maçlarını, gelecek maçlarına, takım
                            kadrosuna, {infoData.stadium ? infoData.stadium.name : ""} stadyumundaki iç saha
                            performansına göz atabilirsiniz.
                        </p>
                    ) : (
                        <p className="bottom-text">
                            Through our fixture page, you can follow {infoData.team.name}'s previous and upcoming
                            matches, see the results, watch highlights, see{" "}
                            {infoData.manager ? infoData.manager.name : ""}'s possible lineups for the upcoming match.
                            and see all the stats. After you make a selection, you will get the latest live results of
                            {infoData.team.name}. You can also see the performance of {infoData.team.name} in the{" "}
                            {infoData.stadium ? infoData.stadium.name : ""} stadium.
                        </p>
                    )}
                </>
            )}
            <Footer />
        </div>
    );
};

export default withTranslation("translations")(Team);

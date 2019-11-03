import React from "react";
import i18n from "i18next";
import moment from "moment";
import AdSense from "react-adsense";
import PressureGraph from "../PressureGraph";
import Bestplayer from "../BestPlayer";
import PreIddaa from "../Preiddaa";
import Incidents from "../Incidents";
import MatchInfo from "../MatchInfo";

const Summary = ({ data, iddaaData, swipeByTabId }) => {
    const { event } = data;
    const { language } = i18n;
    const isLive = event.status.type === "inprogress";

    return (
        <div className="swipe-content summary">
            <div className="event-details-summary">
                <div className="container">
                    <div className="white-box mt-2 pb-2">
                        <PressureGraph event={event} />
                        <Bestplayer event={event} swipeByTabId={swipeByTabId} />

                        <div className="my-3">
                            <AdSense.Google
                                client="ca-pub-6710014394558585"
                                slot="8431699183"
                                style={{ display: "block", textAlign: "center" }}
                                layout="in-article"
                                format="fluid"
                            />
                        </div>

                        {iddaaData && <PreIddaa isLive={isLive} iddaaData={iddaaData} swipeByTabId={swipeByTabId} />}
                        <Incidents incidents={event.incidents} />
                    </div>
                    <MatchInfo eventData={data} />
                </div>
            </div>
            {event && (
                <>
                    {language === "tr" ? (
                        <p className="bottom-text">
                            {event.tournament.name} ligindeki {event.teams.home.name} {event.teams.away.name} canlı skor
                            ve canlı maç izle {moment(event.startTimestamp).format("DD.MM.YYYY")} tarihinde, saat{" "}
                            {moment(event.startTimestamp).format("HH:mm")} 'te başlayacaktır. Maçın oynanacağı stadyum{" "}
                            {event.venue && event.venue.stadium ? event.venue.stadium.name : ""},{" "}
                            {event.venue && event.venue.city ? event.venue.city.name : ""},{" "}
                            {event.venue && event.venue.country ? event.venue.country.name : ""}. Maçı{" "}
                            {event.referee ? event.referee.name : ""} yönetecek.
                            <strong>
                                {event.tournament.name} liginda oynanan {event.name} karşılaşması
                            </strong>
                            na ait canlı maç sonucu, istatistikler, topla oynama yüzdeleri, golleri, sarı ve kırmızı
                            kartları, TV yayıncılarını, takımların ılk onbir ve diziliş bilgilerini, yedek oyunlaarını,
                            hakemlerin kim olduğu bilgilerine ulaşabilirsiniz. Ayrıca bu sayfada,{" "}
                            <strong>
                                {event.tournament.name} liginde oynanan {event.name} maç hangi kanalda?
                            </strong>
                            , <strong>{event.name} maç özetleri</strong> ve{" "}
                            <strong>{event.teams.home.name} canlı maç sonuçları</strong> gibi sorulara da cevaplar
                            bulabilirsiniz.
                            {event.teams.home.name} takımının teknik patronu{" "}
                            {event.managerDuel ? event.managerDuel.homeManager.name : ""} ve {event.teams.away.name}{" "}
                            takımı teknik patronu {event.managerDuel ? event.managerDuel.awayManager.name : ""}{" "}
                            tarafından ilk onbirler açıklandığı anda, bu sayfada yayınlancaktır. Kesin onbirlerin
                            açıklanması genellikle maça bir saat kala yapılmaktadır. {event.name} karşılaşması İddaa
                            programında yer alıyor ise bu karşılaşma için açıklanmış İddaa oranların görebilir ve maç
                            başladığı anda <strong>Canlı İddaa</strong> oranlarını takip edebilirsiniz. Yasalar gereği
                            sitemiz malesef <strong>{event.name} Canlı İzle</strong> linkleri içermemektedir. Fakat{" "}
                            <strong>Canlı Maç Takibi</strong> sekmesinden maçı canlı izlermiş gibi animasyonlu
                            gösterimlerinde yardımıyla, maçı saniye saniye takip edebilirsiniz.
                            <strong>Takım karşılaştırma</strong> sekmesinden
                            {event.teams.home.name} ile {event.teams.away.name} takımlarının birbirleriyle ve başka
                            takımlar ile yaptıkları maçların sonuçlarını görebilir ve karşılaştırma yapabilirsiniz.
                        </p>
                    ) : (
                        <p className="bottom-text">
                            {event.teams.home.name} {event.teams.away.name} live score and online live streaming starts
                            on {moment(event.startTimestamp).format("DD.MM.YYYY")}. at{" "}
                            {moment(event.startTimestamp).format("HH:mm")} at{" "}
                            {event.venue && event.venue.stadium ? event.venue.stadium.name : ""} stadium,{" "}
                            {event.venue && event.venue.city ? event.venue.city.name : ""},{" "}
                            {event.venue && event.venue.country ? event.venue.country.name : ""} in{" "}
                            {event.tournament.name}. The referee of the match will be{" "}
                            {event.referee ? event.referee.name : ""}. On our match details page, you can follow the{" "}
                            <strong>{event.category.name} live scores</strong> that is being played in{" "}
                            {event.tournament.name}. Within this page, you will find live scores, live stats, ball
                            possessions, goals, yellow and/or red cards, substitutions, lineups and referee
                            informations. Additionally, within this page you can get further details about{" "}
                            <strong>{event.name} live stream, watch live</strong>. We will publish the confirmed lineups
                            and formations as soon as {event.managerDuel ? event.managerDuel.homeManager.name : ""}, who
                            is the manager of {event.teams.home.name}, and{" "}
                            {event.managerDuel ? event.managerDuel.awayManager.name : ""}, who is the manager of{" "}
                            {event.teams.away.name} declare them. Unfortunatelly, due to law enforcements, our website
                            doesn't include <strong>Live Streaming links for {event.name}</strong> but throught our
                            animation powered <strong>Live Tracking</strong> page, you can follow the game seconds by
                            seconds as if you are watching live. Through H2h tab, you can compare{" "}
                            {event.teams.home.name} and {event.teams.away.name} by looking at their h2h matches, and
                            matches they played against other teams.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default Summary;

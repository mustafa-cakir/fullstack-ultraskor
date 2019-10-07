import React from 'react';
import { Trans, withTranslation } from 'react-i18next';

import moment from 'moment';

const MatchInfo = ({ event, textList, t, i18n }) => {
    const { language } = i18n;

    // let tournament, country, city, stadium, capacity, attendance, date, referee, broadcast;
    const tournament = event.tournament ? event.tournament.name : null;
    const attendance = event.attendance ? event.attendance.toLocaleString() : null;
    const date = moment(event.startTimestamp * 1000).format('DD MMM YYYY, HH:mm');
    const referee = event.referee ? event.referee.name : null;
    const country = event.venue && event.venue.country ? event.venue.country.name : null;
    const city = event.venue && event.venue.city ? event.venue.city.name : null;
    const stadium = event.venue && event.venue.stadium ? event.venue.stadium.name : null;
    const capacity =
        event.venue && event.venue.stadium && event.venue.stadium.capacity
            ? event.venue.stadium.capacity.toLocaleString()
            : null;

    return (
        <div className="white-box mt-2">
            <h1 className="title">
                {t(event.teams.home.name)} - {t(event.teams.away.name)} <Trans>Match Information</Trans>
            </h1>
            {textList ? <MatchTextInfo textList={textList} /> : ''}
            {language === 'tr' ? (
                <p className="match-facts">
                    Başlama düdüğünden itibaren Ultraskor.com{' '}
                    <a
                        href={window.location.href}
                        title={`${t(event.teams.home.name)} - ${t(event.teams.away.name)} canlı skor ve maç sonucu`}
                    >
                        {t(event.teams.home.name)} - {t(event.teams.away.name)} maç sonucu
                    </a>{' '}
                    sayfasindan maçın canlı skorunu, istatiklerini, kadrolarını ve canlı puan durumunu anlık olarak
                    takip edebilirsiniz.
                </p>
            ) : (
                <p>
                    You can track the live score, stats, lineups and live standings on UltraSkor.com's{' '}
                    <a
                        href={window.location.href}
                        title={`${t(event.teams.home.name)} - ${t(event.teams.away.name)} live score and match result`}
                    >
                        {t(event.teams.home.name)} - {t(event.teams.away.name)}
                    </a>{' '}
                    match details page.
                </p>
            )}

            <div className="body">
                <div className="row">
                    <div className="col col-3 f-500 text-right pr-0">
                        <Trans>Date</Trans>
                    </div>
                    <div className="col col-7">{date}</div>
                </div>
                {tournament && (
                    <div className="row">
                        <div className="col col-3 f-500 text-right pr-0">
                            <Trans>Tournament</Trans>
                        </div>
                        <div className="col col-7">{tournament}</div>
                    </div>
                )}
                {country ||
                    (city && (
                        <div className="row">
                            <div className="col col-3 f-500 text-right pr-0">
                                <Trans>Location</Trans>
                            </div>
                            <div className="col col-7">
                                {country || ''}, {city || ''}
                            </div>
                        </div>
                    ))}
                {stadium && (
                    <div className="row">
                        <div className="col col-3 f-500 text-right pr-0">
                            <Trans>Stadium</Trans>
                        </div>
                        <div className="col col-7">{stadium}</div>
                    </div>
                )}
                {capacity && (
                    <div className="row">
                        <div className="col col-3 f-500 text-right pr-0">
                            <Trans>Capacity</Trans>
                        </div>
                        <div className="col col-7">{capacity}</div>
                    </div>
                )}
                {attendance && (
                    <div className="row">
                        <div className="col col-3 f-500 text-right pr-0">
                            <Trans>Attendance</Trans>
                        </div>
                        <div className="col col-7">{attendance}</div>
                    </div>
                )}
                {referee && (
                    <div className="row">
                        <div className="col col-3 f-500 text-right pr-0">
                            <Trans>Referee</Trans>
                        </div>
                        <div className="col col-7">{referee}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MatchTextInfo = ({ textList }) => {
    const generalInfo = textList.filter(item => {
        return item.textGroupName === 'Maça Giriş';
    });

    return generalInfo.map((item, index) => {
        return index === 0 ? (
            <h2 className="desc provider2-data" key={Math.random()}>
                {item.textValue}
            </h2>
        ) : (
            <p className="provider2-data" key={Math.random()}>
                {item.textValue}
            </p>
        );
    });
};

export default withTranslation('translations')(MatchInfo);

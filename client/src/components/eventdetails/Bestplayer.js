import React, {Component} from 'react';
import Icon from "../Icon";
import {Trans, withNamespaces} from "react-i18next";

class Bestplayer extends Component {
    static ratingClass(value) {
        value = Number(value);
        if (value > 8.0) {
            return "amazing bg";
        } else if (value > 7.5) {
            return "great bg";
        } else if (value > 6.9) {
            return "good bg"
        } else if (value > 5.9) {
            return "mediocre bg";
        } else if (value > 4.9) {
            return "underwhelming bg";
        } else {
            return "unrated";
        }
    }

    render() {
        const {eventData, swipeByTabName, t} = this.props;
        if (
            !eventData.event
            || !eventData.event.bestAwayTeamPlayer
            || !eventData.event.bestHomeTeamPlayer
        ) return false;
        return (
            <div className="best-player">
                <div className="best-player-title text-center"><Trans>Best Players</Trans></div>
                <div className="best-player-container mt-2 mb-2">
                    <div className="row m-0 align-items-center">
                        <div className="p-0 col col-img"><img
                            src={"https://www.sofascore.com/images/player/image_" + eventData.event.bestHomeTeamPlayer.player.id + ".png"}
                            alt={eventData.event.bestHomeTeamPlayer.player.name}/></div>
                        <div className="col col-text">
                            <div
                                className={"text-bold rating " + Bestplayer.ratingClass(eventData.event.bestHomeTeamPlayer.value)}>{eventData.event.bestHomeTeamPlayer.value}</div>
                            <div className="name">{eventData.event.bestHomeTeamPlayer.player.shortName}</div>
                        </div>
                        <div className="col col-text text-right align-items-end">
                            <div
                                className={"text-bold rating " + Bestplayer.ratingClass(eventData.event.bestAwayTeamPlayer.value)}>{eventData.event.bestAwayTeamPlayer.value}</div>
                            <div className="name">{eventData.event.bestAwayTeamPlayer.player.shortName}</div>
                        </div>
                        <div className="p-0 col col-img text-right"><img
                            src={"https://www.sofascore.com/images/player/image_" + eventData.event.bestAwayTeamPlayer.player.id + ".png"}
                            alt={eventData.event.bestAwayTeamPlayer.player.name}/></div>
                    </div>
                </div>
                <div className={"best-player-link text-center mb-4"} onClick={() => swipeByTabName(t('Lineup'))}><span><Trans>See all</Trans> <Icon
                    name="fas fa-angle-right"/></span>
                </div>
            </div>
        )
    }
}

export default withNamespaces('translations')(Bestplayer)

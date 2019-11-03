import React from "react";
import { withTranslation, Trans } from "react-i18next";
import Icon from "../../common/Icon";
import { printImageSrc } from "../../../core/utils";
import { ratingClass } from "../../../core/utils/helper";

const BestPlayer = ({ event, swipeByTabId }) => {
    if (!event || !event.bestAwayTeamPlayer || !event.bestHomeTeamPlayer) return false;
    return (
        <div
            className="best-player"
            onClick={() => swipeByTabId(3)}
            onKeyPress={() => swipeByTabId(3)}
            tabIndex={1}
            role="button"
        >
            <div className="best-player-title text-center">
                <Trans>Best Players</Trans>
            </div>
            <div className="best-player-container mt-2 mb-2">
                <div className="row m-0 align-items-center">
                    <div className="p-0 col col-img">
                        <img
                            src={printImageSrc(`/images/player/image_${event.bestHomeTeamPlayer.player.id}.png`)}
                            alt={event.bestHomeTeamPlayer.player.name}
                        />
                    </div>
                    <div className="col col-text">
                        <div className={`text-bold rating ${ratingClass(event.bestHomeTeamPlayer.value)}`}>
                            {event.bestHomeTeamPlayer.value}
                        </div>
                        <div className="name">{event.bestHomeTeamPlayer.player.shortName}</div>
                    </div>
                    <div className="col col-text text-right align-items-end">
                        <div className={`text-bold rating ${ratingClass(event.bestAwayTeamPlayer.value)}`}>
                            {event.bestAwayTeamPlayer.value}
                        </div>
                        <div className="name">{event.bestAwayTeamPlayer.player.shortName}</div>
                    </div>
                    <div className="p-0 col col-img text-right">
                        <img
                            src={printImageSrc(`/images/player/image_${event.bestAwayTeamPlayer.player.id}.png`)}
                            alt={event.bestAwayTeamPlayer.player.name}
                        />
                    </div>
                </div>
            </div>
            <div className="best-player-link text-center">
                <span>
                    <Trans>See all</Trans> <Icon name="fas fa-angle-right" />
                </span>
            </div>
        </div>
    );
};

export default withTranslation("translations")(BestPlayer);

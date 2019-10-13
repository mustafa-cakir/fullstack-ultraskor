import React from 'react';
import { withTranslation, Trans } from 'react-i18next';
import Icon from '../../common/Icon';
import { printImageSrc } from '../../../core/utils';

const BestPlayer = ({ event, swiper }) => {
    if (!event || !event.bestAwayTeamPlayer || !event.bestHomeTeamPlayer) return false;

    const printRatingClassName = value => {
        value = Number(value);
        switch (value) {
            case value > 8.0:
                return 'amazing bg';
            case value > 7.5:
                return 'great bg';
            case value > 6.9:
                return 'good bg';
            case value > 5.9:
                return 'mediocre bg';
            case value > 4.9:
                return 'underwhelming bg';
            default:
                return 'unrated';
        }
    };

    return (
        <div className="best-player" onClick={() => swiper.slideTo(1)}>
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
                        <div className={`text-bold rating ${printRatingClassName(event.bestHomeTeamPlayer.value)}`}>
                            {event.bestHomeTeamPlayer.value}
                        </div>
                        <div className="name">{event.bestHomeTeamPlayer.player.shortName}</div>
                    </div>
                    <div className="col col-text text-right align-items-end">
                        <div className={`text-bold rating ${printRatingClassName(event.bestAwayTeamPlayer.value)}`}>
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
            <div className="best-player-link text-center mb-4">
                <span>
                    <Trans>See all</Trans> <Icon name="fas fa-angle-right" />
                </span>
            </div>
        </div>
    );
};

export default withTranslation('translations')(BestPlayer);

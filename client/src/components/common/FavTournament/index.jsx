import React from 'react';
import { Trans } from 'react-i18next';
import Icon from '../Icon';
import Event from '../Event';
import Errors from '../Errors';

const FavTournament = ({ favEvents, tournaments, isLive, updateParentState, isFav }) => {
    let index = 0;
    return (
        <>
            {tournaments.map(tournament => {
                return tournament.events.map(event => {
                    if (isLive && event.status.type !== 'inprogress') return false;
                    if (favEvents.indexOf(event.id) < 0) return false;
                    index += 1;
                    return (
                        <React.Fragment key={`fav_${event.id}`}>
                            {index === 1 && (
                                <div className="tournament-title">
                                    <Icon name="fas fa-star event-fav-color" />
                                    <div className="col tournament-name px-2">
                                        <strong>
                                            <Trans>My Favorites</Trans>
                                        </strong>
                                    </div>
                                </div>
                            )}
                            <Event
                                customClass="fav-event"
                                index={index}
                                favEvents={favEvents}
                                favContainer
                                event={event}
                                updateParentState={updateParentState}
                            />
                        </React.Fragment>
                    );
                });
            })}
            {index === 0 && isFav && <Errors type="no-fav-game" />}
        </>
    );
};

export default FavTournament;

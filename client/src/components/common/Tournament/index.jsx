import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { flagImg, generateSlug, isMatchLive, qsStringifier, storeScrollY } from '../../../core/utils/helper';
import Event from '../Event';
import Errors from '../Errors';

const Tournament = ({
    isLive,
    filteredTournaments,
    isLazyLoad,
    lazyLoadCount,
    favEvents,
    favEventsList,
    selectedId,
    selected,
    from,
    updateParentState,
    tournaments
}) => {
    let tournamentCount = 0;
    const [t] = useTranslation();
    const history = useHistory();

    const lazyLoadLoadMoreBtn = () => {
        const newLazyLoadCount = parseFloat(lazyLoadCount) + 10;
        history.replace({
            search: qsStringifier({ load: newLazyLoadCount })
        });
        updateParentState({
            lazyLoadCount: newLazyLoadCount
        });
    };

    return (
        <>
            {tournaments.map((tournament, index) => {
                if (isLive) {
                    const isAnyLive = tournament.matches.findIndex(match => isMatchLive(match));
                    if (isAnyLive < 0) return false;
                }

                if (filteredTournaments && filteredTournaments.length > 0) {
                    if (filteredTournaments.indexOf(tournament._id) < 0) return false;
                }

                if (isLazyLoad && !isLive && filteredTournaments.length < 1) {
                    if (index === parseFloat(lazyLoadCount)) {
                        return (
                            <div className="load-more-homepage-container">
                                <button type="button" onClick={lazyLoadLoadMoreBtn} className="load-more-homepage">
                                    <i className="fas" />
                                    <Trans>Load more</Trans>
                                </button>
                            </div>
                        );
                    }
                    if (index > parseFloat(lazyLoadCount)) {
                        return false;
                    }
                }
                tournamentCount += 1;
                return tournament.matches.length > 0 ? (
                    <React.Fragment key={`${tournament._id}_${tournamentCount}`}>
                        <div className="tournament-title">
                            {flagImg(tournament)}
                            <Link
                                onClick={storeScrollY}
                                to={{
                                    pathname: `/${t('league')}/${generateSlug(tournament.name)}${t('-standing-')}${
                                        tournament._id
                                    }${t('-season-')}${tournament.seasonid}`,
                                    state: { isPrev: true }
                                }}
                                className="col tournament-name"
                                title={`${tournament.name} - ${t(
                                    'click for standings, highlights and league fixtures'
                                )}`}
                            >
                                {tournament.country && (
                                    <strong>
                                        <Trans>{tournament.country.name}</Trans> -{' '}
                                    </strong>
                                )}
                                {tournament.name}
                            </Link>
                        </div>

                        {tournament.matches.map((event, k) => {
                            if (isLive && event.matchstatus !== 'live') return false;
                            return (
                                <Event
                                    key={event._id}
                                    favEvents={favEvents || []}
                                    favEventsList={favEventsList}
                                    index={k}
                                    selectedId={selectedId}
                                    selected={selected}
                                    from={from}
                                    event={event}
                                    updateParentState={updateParentState}
                                />
                            );
                        })}
                        {/* {page === "homepage" && tournamentCount === 2 && ( */}
                        {/*    <AdSense.Google */}
                        {/*        client="ca-pub-6710014394558585" */}
                        {/*        slot="6963275666" */}
                        {/*        style={{ display: "block" }} */}
                        {/*        layoutKey="-fb+5w+4e-db+86" */}
                        {/*        format="fluid" */}
                        {/*    /> */}
                        {/* )} */}
                    </React.Fragment>
                ) : (
                    ''
                );
            })}
            {tournamentCount < 1 ? <Errors type="no-matched-game" /> : ''}
        </>
    );
};

export default Tournament;

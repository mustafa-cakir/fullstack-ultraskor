import React, { Component } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
// import AdSense from "react-adsense";
import { generateSlug, flagImg, updateQueryString, storeScrollY, isMatchLive } from '../../core/utils/helper';
import Event from './Event';

import Errors from './Errors';

class Tournament extends Component {
    lazyLoadLoadMoreBtn() {
        const { lazyLoadCount, updateParentState } = this.props;
        const newLazyLoadCount = parseFloat(lazyLoadCount) + 10;
        const newUrl = updateQueryString('load', newLazyLoadCount);

        if (window.history.replaceState) {
            window.history.replaceState('data', `${document.title} - ${newLazyLoadCount}`, newUrl);
        }

        updateParentState({
            lazyLoadCount: newLazyLoadCount
        });
    }

    render() {
        const {
            t,
            isLive,
            filteredTournaments,
            isLazyLoad,
            lazyLoadCount,
            favEvents,
            favEventsList,
            selectedId,
            selected,
            from,
            updateParentState
        } = this.props;
        let tournamentCount = 0;
        const { tournaments, i18n } = this.props;
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
                                <div
                                    role="button"
                                    tabIndex={1}
                                    key="more"
                                    onKeyPress={this.lazyLoadLoadMoreBtn.bind(this)}
                                    onClick={this.lazyLoadLoadMoreBtn.bind(this)}
                                    className="load-more-homepage"
                                >
                                    <i className="fas" />
                                    <Trans>Load more</Trans>
                                </div>
                            );
                        }
                        if (index > parseFloat(lazyLoadCount)) {
                            return false;
                        }
                    }
                    tournamentCount += 1;
                    return tournament.events.length > 0 ? (
                        <React.Fragment key={`${tournament.tournament.uniqueId}_${tournamentCount}`}>
                            <div className="tournament-title">
                                {flagImg(tournament)}
                                <Link
                                    onClick={storeScrollY}
                                    to={{
                                        pathname: `/${t('league')}/${generateSlug(
                                            t(tournament.category.name)
                                        )}-${generateSlug(
                                            tournament.tournament.name[i18n.language]
                                                ? tournament.tournament.name[i18n.language]
                                                : tournament.tournament.name
                                        )}${t('-standing-')}${tournament.tournament.uniqueId}${t('-season-')}${
                                            tournament.season ? tournament.season.id : '0'
                                        }`,
                                        state: { isPrev: true }
                                    }}
                                    className="col tournament-name"
                                    title={`${t(tournament.category.name)} - ${
                                        tournament.tournament.name[i18n.language]
                                    }  ${t('click for standings, highlights and league fixtures')}`}
                                >
                                    <strong>
                                        <Trans>{tournament.category.name}</Trans>
                                    </strong>{' '}
                                    - {tournament.tournament.name[i18n.language]}
                                </Link>
                            </div>

                            {tournament.events.map((event, k) => {
                                if (isLive && event.status.type !== 'inprogress') return false;
                                return (
                                    <Event
                                        key={event.id}
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
    }
}

export default withTranslation('translations')(Tournament);

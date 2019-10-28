import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';
import update from 'react-addons-update';
import { generateSlug, storeScrollY } from '../../core/utils/helper';
import { askForPermissioToReceiveNotifications } from '../../core/utils/web-push';
import Icon from './Icon';

class Event extends Component {
    constructor(props) {
        super(props);
        this.homeTeamEl = React.createRef();
        this.awayTeamEl = React.createRef();
        this.state = {
            favEventLoading: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { event, favEvents, favEventLoading } = this.props;
        return (
            event.status.type !== nextProps.event.status.type ||
            event.statusBoxContent !== nextProps.event.statusBoxContent ||
            event.redCards.home !== nextProps.event.redCards.home ||
            event.teams.home.name !== nextProps.event.teams.home.name ||
            event.teams.away.name !== nextProps.event.teams.away.name ||
            event.redCards.away !== nextProps.event.redCards.away ||
            event.scores.away !== nextProps.event.scores.away ||
            event.scores.home !== nextProps.event.scores.home ||
            event.status.code !== nextProps.event.status.code ||
            event.startTimestamp !== nextProps.event.startTimestamp ||
            favEvents.length !== nextProps.favEvents.length ||
            favEventLoading !== nextState.favEventLoading
        );
    }

    componentDidUpdate(prevProps) {
        const { event } = this.props;
        if (event.teams.home.name !== prevProps.event.teams.home.name) return false;

        if (prevProps.event.scores.away !== event.scores.away) {
            if (typeof prevProps.event.scores.away === 'undefined') {
                return false;
            }
            if (!this.awayTeamEl.current) return false;

            this.awayTeamEl.current.classList.add('flash-blinker-5');
            clearTimeout(this.liveBlinkerTimeout);
            this.liveBlinkerTimeout = setTimeout(() => {
                if (!this.awayTeamEl) return false;
                if (!this.awayTeamEl.current) return false;
                this.awayTeamEl.current.classList.remove('flash-blinker-5');
                return false;
            }, 10000);
        }

        if (event.scores.home !== prevProps.event.scores.home) {
            if (typeof prevProps.event.scores.home === 'undefined') return false;
            if (!this.homeTeamEl.current) return false;
            this.homeTeamEl.current.classList.add('flash-blinker-5');
            clearTimeout(this.liveBlinkerTimeout);
            this.liveBlinkerTimeout = setTimeout(() => {
                if (!this.homeTeamEl) return false;
                if (!this.homeTeamEl.current) return false;
                this.homeTeamEl.current.classList.remove('flash-blinker-5');
                return false;
            }, 10000);
        }
        return false;
    }

    componentWillUnmount() {
        clearTimeout(this.liveBlinkerTimeout);
    }

    isInProgress() {
        let text;
        const liveBlinkerCodes = [6, 7];
        const { from, event } = this.props;
        switch (event.status.type) {
            case 'inprogress':
                text = (
                    <div className="col event-time pr-0 pl-2 red font-weight-bold">
                        <Trans>{event.statusBoxContent}</Trans>
                        {event.status.code === 6 ? '' : ''}
                        {liveBlinkerCodes.indexOf(event.status.code) > -1 ? (
                            // eslint-disable-next-line react/no-unescaped-entities
                            <span className="live-blinker">'</span>
                        ) : (
                            ''
                        )}
                    </div>
                );
                break;
            case 'notstarted':
                text = (
                    <div className="col event-time pr-0 pl-2 full-time font-weight-bold">
                        <div className="day">
                            {moment(event.startTimestamp).isSame(moment(), 'day') ? (
                                <Trans>Today</Trans>
                            ) : (
                                <span>{moment(event.startTimestamp).format('D MMM')}</span>
                            )}
                        </div>
                        {moment(event.startTimestamp).format('HH:mm')}
                    </div>
                );
                break;
            case 'canceled':
                text = (
                    <div className="col event-time pr-0 pl-2 red small-text line-clamp">
                        <Trans>Cancelled</Trans>
                    </div>
                );
                break;
            case 'postponed':
                text = (
                    <div className="col event-time pr-0 pl-2 red small-text line-clamp">
                        <Trans>Postponed</Trans>
                    </div>
                );
                break;
            case 'interrupted':
                text = (
                    <div className="col event-time pr-0 pl-2 red small-text line-clamp">
                        <Trans>Interrupted</Trans>
                    </div>
                );
                break;
            default:
                text =
                    from === 'h2h' || from === 'fixture' ? (
                        <div className="col event-time pr-0 pl-2 full-time in-the-past">
                            {moment(event.startTimestamp).format('DD.MM.YY')}
                        </div>
                    ) : (
                        <div className="col event-time pr-0 pl-2 full-time font-weight-bold">
                            <Trans>FT</Trans>
                        </div>
                    );
        }
        return text;
    }

    favClickHandler() {
        const { event, favEvents, favEventsList } = this.props;
        const { id: eventId } = event;

        let newFavEvents = [];
        let newFavEventsList = [];
        const method = favEvents.indexOf(eventId) < 0 ? 'subscribeToTopic' : 'unsubscribeFromTopic';

        if (method === 'subscribeToTopic') {
            newFavEvents = update(favEvents, { $push: [eventId] });
            newFavEventsList = update(favEventsList, { $push: [event] });
        } else {
            newFavEvents = favEvents.filter(item => item !== eventId);
            newFavEventsList = favEventsList.filter(item => item !== event);
        }

        this.setState({ favEventLoading: true });

        askForPermissioToReceiveNotifications().then(token => {
            const { updateParentState } = this.props;
            fetch(`/api/webpush`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: [token],
                    topic: `/topics/match_${eventId}`,
                    method
                })
            })
                .then(res => {
                    if (res.status === 200) {
                        this.setState({ favEventLoading: false });
                        return res;
                    }
                    throw Error(`Can't retrieve information from server, ${res}`);
                })
                .then(() => {
                    console.log(`Successfully ${method} for /topics/match_${eventId}`);
                    updateParentState(
                        {
                            favEvents: newFavEvents,
                            favEventsList: newFavEventsList
                        },
                        true
                    );
                })
                .catch(err => {
                    // error
                    this.setState({ favEventLoading: false });
                    updateParentState(
                        {
                            favEvents: newFavEvents,
                            favEventsList: newFavEventsList
                        },
                        true
                    );
                    console.log(`Failed to ${method} for /topics/match_${eventId} - Message returned: ${err}`);
                });
        });
    }

    render() {
        const { event, t, from, selected, selectedId, favEvents, index, favContainer } = this.props;
        const { favEventLoading } = this.state;
        const favActive = favEvents.indexOf(event.id) > -1;
        return (
            <div className={`event-container${index % 2 === 0 ? ' ' : ' bg-gray'}`}>
                {this.isInProgress()}
                <Link
                    onClick={storeScrollY}
                    to={{
                        pathname: `/${t('match')}/${generateSlug(
                            `${t(event.teams.home.name)}-${t(event.teams.away.name)}`
                        )}-${t('live-score')}-${event.id}`,
                        state: { isPrev: true, scrollY: 123 }
                    }}
                    className={`event-link col p-0 row m-0 ${event.winner ? `winner-${event.winner}` : ''}`}
                    title={`${t(event.teams.home.name)} - ${t(event.teams.away.name)}  ${t(
                        'click for live scores, lineup and stats'
                    )}`}
                >
                    <span className="col event-team home text-right pr-0 pl-2">
                        {event.redCards.home > 0 ? <span className="red-card">{event.redCards.home}</span> : ''}
                        {t(event.teams.home.name)}
                    </span>
                    <span
                        className={`col event-score text-center font-weight-bold px-0${
                            event.status.type === 'inprogress' ? ' live' : ''
                        }`}
                    >
                        {typeof event.scores.home !== 'undefined' || typeof event.scores.away !== 'undefined' ? (
                            <>
                                <span ref={this.homeTeamEl}>{event.scores.home || 0}</span>
                                <span className="score-separator">:</span>
                                <span ref={this.awayTeamEl}>{event.scores.away || 0}</span>
                            </>
                        ) : (
                            ' - '
                        )}
                    </span>
                    <span className="col event-team away text-left pl-0 pr-2">
                        {event.redCards.away > 0 ? <span className="red-card">{event.redCards.away}</span> : ''}
                        {t(event.teams.away.name)}
                    </span>
                </Link>
                {from === 'h2h' || from === 'fixture' ? (
                    <div className="col event-fav half-time-score pl-0 text-right pr-2">
                        {selected !== 'h2h' ? (
                            <TeamForm selectedId={selectedId} event={event} />
                        ) : (
                            <span>
                                {typeof event.scores.ht.home !== 'undefined' &&
                                    typeof event.scores.ht.away !== 'undefined' &&
                                    `(${event.scores.ht.home || 0} - ${event.scores.ht.away || 0})`}
                            </span>
                        )}
                    </div>
                ) : (
                    <div
                        role="button"
                        tabIndex="1"
                        className="col event-fav pl-0 text-right pr-2"
                        onKeyDown={this.favClickHandler.bind(this)}
                        onClick={this.favClickHandler.bind(this)}
                    >
                        {favEventLoading ? <Icon name="fas fa-spinner fav-loading" /> : ''}
                        {(favContainer || favActive) && <Icon name="fas fa-star active" />}
                        {event.status.type !== 'finished' && <Icon name="far fa-star" />}
                    </div>
                )}
            </div>
        );
    }
}

const TeamForm = props => {
    const { event, selectedId } = props;
    let result = null;
    if (event.winner === 1) {
        result = parseFloat(selectedId) === event.teams.home.id ? 'W' : 'L';
    } else if (event.winner === 2) {
        result = parseFloat(selectedId) === event.teams.home.id ? 'L' : 'W';
    } else if (event.winner === 3) {
        result = 'D';
    }

    return result ? <span className={`team-form team-form-${result}`}>{result}</span> : <span />;
};

export default withTranslation('translations')(Event);

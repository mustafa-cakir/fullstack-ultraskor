import React, { Component, PureComponent } from 'react';
import Loading from '../common/Loading';
import Errors from '../common/Errors';
import Tournament from '../common/Tournament';
import { Trans } from 'react-i18next';
import Icon from '../common/Icon';
import { withTranslation } from 'react-i18next';

class H2h extends Component {
    constructor(props) {
        super(props);
        this.state = {
            h2hData: null,
            tab: 'h2h'
        };
    }

    componentDidMount() {
        const { eventData } = this.props;
        this.initGetData('/event/' + eventData.event.id + '/matches/json');
    }

    componentDidUpdate() {
        this.props.swipeAdjustHeight();
    }

    preProcessData(res) {
        res.h2h.events.tournaments.forEach(tournament => {
            tournament.events = tournament.events.filter(x => x.status.type === 'finished');
        });
        res.home.recent.tournaments.forEach(tournament => {
            tournament.events = tournament.events.filter(x => x.status.type === 'finished');
        });
        res.away.recent.tournaments.forEach(tournament => {
            tournament.events = tournament.events.filter(x => x.status.type === 'finished');
        });
        return res;
    }

    initGetData = api => {
        fetch(`/api/?query=${api}&page=h2h`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then(res => {
                this.setState({
                    h2hData: this.preProcessData(res)
                });
            })
            .catch(err => {
                this.setState({
                    h2hData: { error: err.toString() }
                });
            });
    };

    tabSwitcherHandler(tab) {
        this.setState({
            tab: tab
        });
    }

    render() {
        const { h2hData, tab } = this.state;
        const { t } = this.props;
        if (!h2hData) return <Loading type="inside" />;
        if (h2hData.error) return <Errors type="error" message={h2hData.error} />;
        const { eventData, matchTextInfo } = this.props;
        let tournaments = tab === 'h2h' ? h2hData.h2h.events.tournaments : h2hData[tab].recent.tournaments;
        return (
            <div className="h2h container">
                <div className="white-box mt-2 p-0">
                    <ul className="horizontal-tab pt-4 mb-4">
                        <li className={tab === 'h2h' ? 'active' : ''} onClick={() => this.tabSwitcherHandler('h2h')}>
                            <span className="tab-container">
                                <Trans>H2H</Trans>
                            </span>
                        </li>
                        <li className={tab === 'home' ? 'active' : ''} onClick={() => this.tabSwitcherHandler('home')}>
                            <span className="tab-container">
                                <img
                                    className="team-logo"
                                    alt={t(eventData.event.homeTeam.name)}
                                    src={
                                        window.ImageServer +
                                        '/images/team-logo/football_' +
                                        eventData.event.homeTeam.id +
                                        '.png'
                                    }
                                />
                                <div className="team-name">{t(eventData.event.homeTeam.name)}</div>
                            </span>
                        </li>
                        <li className={tab === 'away' ? 'active' : ''} onClick={() => this.tabSwitcherHandler('away')}>
                            <span className="tab-container">
                                <img
                                    className="team-logo"
                                    alt={t(eventData.event.awayTeam.name)}
                                    src={
                                        window.ImageServer +
                                        '/images/team-logo/football_' +
                                        eventData.event.awayTeam.id +
                                        '.png'
                                    }
                                />
                                <div className="team-name">{t(eventData.event.awayTeam.name)}</div>
                            </span>
                        </li>
                    </ul>
                    <div className="h2h-list">
                        {matchTextInfo ? (
                            <MatchTextInfo
                                matchTextInfo={matchTextInfo}
                                tab={tab}
                                swipeAdjustHeight={this.props.swipeAdjustHeight}
                            />
                        ) : (
                            ''
                        )}
                        <Tournament
                            tournaments={tournaments}
                            from={'h2h'}
                            selected={tab}
                            selectedId={tab === 'home' ? eventData.event.homeTeam.id : eventData.event.awayTeam.id}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

class MatchTextInfo extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showMore: false
        };
    }

    componentDidUpdate() {
        this.props.swipeAdjustHeight();
    }

    showMoreClickHandler() {
        this.setState({
            showMore: !this.state.showMore
        });
    }

    render() {
        const { matchTextInfo, tab } = this.props;
        let filterBy = 'Aralarında Oynanan Maçlar';

        if (tab === 'home') filterBy = 'Ev Sahibi Takım';
        else if (tab === 'away') filterBy = 'Misafir Takım';

        let generalInfo = matchTextInfo.textList.filter(item => {
            return item.textGroupName === filterBy;
        });

        return (
            <div className="match-text-info">
                {generalInfo.map((item, index) => (
                    <React.Fragment key={index}>
                        <p className={index > 2 && !this.state.showMore ? 'd-none' : ''}>
                            <Icon name="fa fa-angle-right" /> {item.textValue}
                        </p>
                        {index === 2 && !this.state.showMore ? (
                            <div className="show-more" onClick={this.showMoreClickHandler.bind(this)}>
                                <Trans>Show More</Trans> <Icon name="fa fa-angle-down" />
                            </div>
                        ) : (
                            ''
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }
}

export default withTranslation('translations')(H2h);

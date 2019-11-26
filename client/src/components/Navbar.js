import React, { Component } from 'react';
import logo from '../assets/images/logo.png';
import Icon from './common/Icon';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';
import LanguageSwitcher from './common/LanguageSwitcher';
import Search from './Search';
import { generateSlug } from '../core/utils/helper';
import iconStandings from '../../src/assets/images/navbar-icon-standings.png';
import iconFixture from '../../src/assets/images/navbar-icon-fixture.png';
import Switch from './common/Switch';
import { scrollTopOnClick } from '../core/utils';

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.headerEl = React.createRef();
        this.goBack = this.goBack.bind(this);
        this.hideSearch = this.hideSearch.bind(this);
        this.state = {
            searchbarOpened: false,
            standingMenuOpened: false,
            fixtureMenuOpened: false,
            redScoreMuted: false,
            redScoreShrinked: false,
            redScoreFavOnly: false
        };
    }

    componentDidMount() {
        this.bodyClassList = document.body.classList;
        this.getFromLocaleStorage();
    }

    toggleSearchBar = () => {
        this.bodyClassList.remove('navbar-opened');
        this.bodyClassList.toggle('searchbar-opened');
        setTimeout(() => {
            if (this.bodyClassList.contains('searchbar-opened')) this.setState({ searchbarOpened: true });
        }, 500);
    };

    toggleNavBar = () => {
        if (this.props.history.location.state && this.props.history.location.state.isPrev) {
            this.goBack();
            scrollTopOnClick();
        } else {
            this.bodyClassList.remove('searchbar-opened');
            this.bodyClassList.toggle('navbar-opened');
        }
    };

    hideSearch = () => {
        this.bodyClassList.remove('searchbar-opened');
        this.setState({ searchbarOpened: false });
    };

    goBack() {
        this.props.history.goBack();
    }

    standingClickHandler() {
        this.setState({
            standingMenuOpened: !this.state.standingMenuOpened,
            fixtureMenuOpened: false
        });
    }

    fixtureClickHandler() {
        this.setState({
            fixtureMenuOpened: !this.state.fixtureMenuOpened,
            standingMenuOpened: false
        });
    }

    getFromLocaleStorage() {
        const persistState = JSON.parse(localStorage.getItem('ultraskor_homepage'));
        if (
            persistState &&
            (persistState.redScoreMuted || persistState.redScoreShrinked || persistState.redScoreFavOnly)
        ) {
            let newState = {};
            if (persistState.redScoreMuted) newState.redScoreMuted = persistState.redScoreMuted;
            if (persistState.redScoreShrinked) newState.redScoreShrinked = persistState.redScoreShrinked;
            if (persistState.redScoreFavOnly) newState.redScoreFavOnly = persistState.redScoreFavOnly;
            this.setState(newState);
        }
    }

    setToLocaleStorage(newState, status) {
        const currentStore = JSON.parse(localStorage.getItem('ultraskor_homepage')) || {};
        currentStore[newState] = status;
        localStorage.setItem('ultraskor_homepage', JSON.stringify(currentStore));
    }

    redScoreMuteClickHandler(e) {
        e.preventDefault();
        let newState = !this.state.redScoreMuted;
        this.setState(
            {
                redScoreMuted: newState
            },
            this.setToLocaleStorage('redScoreMuted', newState)
        );
    }

    redScoreFavOnlyClickHandler(e) {
        e.preventDefault();
        let newState = !this.state.redScoreFavOnly;
        this.setState(
            {
                redScoreFavOnly: newState
            },
            this.setToLocaleStorage('redScoreFavOnly', newState)
        );
    }

    redScoreShrinkedClickHandler(e) {
        e.preventDefault();
        let newState = !this.state.redScoreShrinked;
        this.setState(
            {
                redScoreShrinked: newState
            },
            this.setToLocaleStorage('redScoreShrinked', newState)
        );
    }

    render() {
        const { t } = this.props;
        const isPrev = this.props.history.location.state ? this.props.history.location.state.isPrev === true : false;
        return (
            <header className={'header' + (isPrev ? ' goback-active' : '')} ref={this.headerEl}>
                <div className="header-animation" />
                <div className="container">
                    <div className="row">
                        <div className="col col-menu px-0">
                            <div className="ham-button" onClick={this.toggleNavBar}>
                                <span className="ham-border ham-border-top">
                                    <span className="ham-border-inner ham-border-inner-top" />
                                </span>
                                <span className="ham-border ham-border-bottom">
                                    <span className="ham-border-inner ham-border-inner-bottom" />
                                </span>
                                <span className={'goback-text' + (isPrev ? ' show' : '')}>
                                    <Trans>Back</Trans>
                                </span>
                            </div>
                        </div>
                        <div className="col text-center">
                            <a
                                href="/"
                                className="header-logo"
                                title={t('Match Results, Stats, Live Scores, Match Lineups and Weekend Highlights')}
                                onClick={scrollTopOnClick}
                            >
                                <img src={logo} className="logo" alt={t('UltraSkor - Live Scores')} />
                                <div className="header-title pl-0">
                                    <strong>ultra</strong>skor.com
                                </div>
                            </a>
                        </div>
                        <div className="col col-search px-0">
                            <button className="header-btn" onClick={this.toggleSearchBar}>
                                <Icon name="fas fa-search" />
                            </button>
                        </div>
                    </div>
                </div>
                <ul className="nav-list">
                    <li>
                        <a href="/" className="p-0" title={t('Live Scores')}>
                            <div className="row align-items-center m-0">
                                <div className="col col-icon">
                                    <div className="bg">
                                        <Icon name="fas fa-bullseye" />
                                    </div>
                                </div>
                                <div className="col col-text">
                                    <div className="text">
                                        <Trans>Live Scores</Trans>
                                    </div>
                                    <div className="sub-text">
                                        <Trans>Stay updated and be in the games</Trans>
                                    </div>
                                </div>
                            </div>
                        </a>
                        <hr className="separator" />
                        <div
                            className="row align-items-center m-0 clickable"
                            onClick={this.standingClickHandler.bind(this)}
                        >
                            <div className="col col-icon">
                                <div className="bg">
                                    <img src={iconStandings} alt={t('Live Standings')} />
                                </div>
                            </div>
                            <div className="col col-text">
                                <div className="text">
                                    <Trans>Live Standings</Trans>
                                </div>
                                <div className="sub-text">
                                    <Trans>Live standings of top leagues</Trans>
                                </div>
                            </div>
                            <div className="col col-down">
                                {this.state.standingMenuOpened ? (
                                    <Icon name="fas fa-chevron-up" />
                                ) : (
                                    <Icon name="fas fa-chevron-down" />
                                )}
                            </div>
                        </div>
                        {this.state.standingMenuOpened ? <PopularLeagues t={this.props.t} type="standing" /> : ''}
                        <hr className="separator" />
                        <div
                            className="row align-items-center m-0 clickable"
                            onClick={this.fixtureClickHandler.bind(this)}
                        >
                            <div className="col col-icon">
                                <div className="bg">
                                    <img src={iconFixture} alt={t('Fixtures')} />
                                </div>
                            </div>
                            <div className="col col-text">
                                <div className="text">
                                    <Trans>League Fixtures</Trans>
                                </div>
                                <div className="sub-text">
                                    <Trans>Fixtures of most popular leagues</Trans>
                                </div>
                            </div>
                            <div className="col col-down">
                                {this.state.fixtureMenuOpened ? (
                                    <Icon name="fas fa-chevron-up" />
                                ) : (
                                    <Icon name="fas fa-chevron-down" />
                                )}
                            </div>
                        </div>
                        {this.state.fixtureMenuOpened ? <PopularLeagues t={this.props.t} type="fixture" /> : ''}
                    </li>
                    <li className="separator">
                        <Trans>Settings</Trans>
                    </li>
                    <li>
                        <div className="row align-items-center m-0">
                            <div className="col">
                                <div className="text">
                                    <Trans>RedScore Visibility</Trans>
                                </div>
                                <div className="sub-text">
                                    <Trans>Activate RedScore popup on homepage</Trans>
                                </div>
                            </div>
                            <div className="col col-switch text-right">
                                <Switch
                                    active={!this.state.redScoreShrinked}
                                    handler={this.redScoreShrinkedClickHandler.bind(this)}
                                />
                            </div>
                        </div>
                        <hr className="separator" />
                        <div className="row align-items-center m-0">
                            <div className="col">
                                <div className="text">
                                    <Trans>RedScore Sound</Trans>
                                </div>
                                <div className="sub-text">
                                    <Trans>Play sound when there is an incident</Trans>
                                </div>
                            </div>
                            <div className="col col-switch text-right">
                                <Switch
                                    active={!this.state.redScoreMuted}
                                    handler={this.redScoreMuteClickHandler.bind(this)}
                                />
                            </div>
                        </div>
                        <hr className="separator" />
                        <div className="row align-items-center m-0">
                            <div className="col">
                                <div className="text">
                                    <Trans>RedScore Favorite Only</Trans>
                                </div>
                                <div className="sub-text">
                                    <Trans>Activate RedScore only for favorite matches</Trans>
                                </div>
                            </div>
                            <div className="col col-switch text-right">
                                <Switch
                                    active={this.state.redScoreFavOnly}
                                    handler={this.redScoreFavOnlyClickHandler.bind(this)}
                                />
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="row align-items-center m-0">
                            <div className="col">
                                <Trans>Language</Trans>
                            </div>
                            <div className="col text-right">
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </li>
                </ul>
                <Search hideSearch={this.hideSearch} {...this.state} />
            </header>
        );
    }
}

const PopularLeagues = props => {
    const { t } = props;
    let popularLeagues = [
        {
            name: 'UEFA Champions League',
            country: 'World',
            seasonId: 23766,
            uniqueId: 7
        },
        {
            name: 'UEFA Europa League',
            country: 'World',
            seasonId: 23755,
            uniqueId: 679
        },
        {
            name: 'Süper Lig',
            country: 'Turkey',
            seasonId: 24407,
            uniqueId: 52
        },
        {
            name: 'Premier League',
            country: 'England',
            seasonId: 23776,
            uniqueId: 17
        },
        {
            name: 'LaLiga',
            country: 'Spain',
            seasonId: 24127,
            uniqueId: 8
        },
        {
            name: 'Bundesliga',
            country: 'Germany',
            seasonId: 23538,
            uniqueId: 35
        },
        {
            name: 'Serie A',
            country: 'Italy',
            seasonId: 24644,
            uniqueId: 23
        },
        {
            name: 'Ligue 1',
            country: 'France',
            seasonId: 23872,
            uniqueId: 34
        },
        {
            name: 'Eredivisie',
            country: 'Netherlands',
            seasonId: 23873,
            uniqueId: 37
        },
        {
            name: 'Primeira Liga',
            country: 'Portugal',
            seasonId: 24150,
            uniqueId: 238
        },
        {
            name: 'Premier Liga',
            country: 'Russia',
            seasonId: 23682,
            uniqueId: 203
        },
        {
            name: 'Championship',
            country: 'England',
            seasonId: 23976,
            uniqueId: 18
        }
    ];
    return (
        <ul className="popularLeagues">
            {popularLeagues.map((item, index) => (
                <li key={index}>
                    <Link
                        to={{
                            pathname: `/${t('league')}/${generateSlug(t(item.country))}-${generateSlug(
                                t(item.name)
                            )}${t('-standing-')}${item.uniqueId}${t('-season-')}${item.seasonId ? item.seasonId : '0'}${
                                props.type === 'fixture' ? '/1' : ''
                            }`,
                            state: { isPrev: true }
                        }}
                        onClick={() => {
                            document.body.classList.remove('navbar-opened');
                        }}
                    >
                        <img
                            src={window.ImageServer + '/images/u-tournament/' + item.uniqueId + '.png'}
                            alt={t(item.country) + ' - ' + t(item.name)}
                        />
                        {item.country !== 'World' ? t(item.country) + ' - ' : ''}
                        {t(item.name)}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default withTranslation('translations')(withRouter(Navbar));

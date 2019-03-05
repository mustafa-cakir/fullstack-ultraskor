import React, {Component} from 'react'
import logo from "../logo.png"
import Icon from "./common/Icon";
import Link from "react-router-dom/es/Link";
import {withRouter} from "react-router-dom";
import {Trans, withTranslation} from "react-i18next";
import LanguageSwitcher from "./common/LanguageSwitcher";
import Search from "./Search";
import {generateSlug} from "../Helper";
import iconStandings from "../../src/assets/images/navbar-icon-standings.png"
import iconFixture from "../../src/assets/images/navbar-icon-fixture.png"
import Switch from "./common/Switch";

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
            flashScoreMuted: false,
            flashScoreShrinked: false
        }
    }

    componentDidMount() {
        this.bodyClassList = document.body.classList;
        this.analyzeSessionStorage();
    };

    toggleSearchBar = () => {
        this.bodyClassList.remove('navbar-opened');
        this.bodyClassList.toggle('searchbar-opened');
        setTimeout(() => {
            if (this.bodyClassList.contains('searchbar-opened')) this.setState({searchbarOpened: true});
        }, 500);
    };

    toggleNavBar = () => {
        if (this.props.history.location.state && this.props.history.location.state.isPrev) {
            this.goBack();
        } else {
            this.bodyClassList.remove('searchbar-opened');
            this.bodyClassList.toggle('navbar-opened');
        }
    };

    hideSearch = () => {
        this.bodyClassList.remove('searchbar-opened');
        this.setState({searchbarOpened: false});
    };

    goBack() {
        this.props.history.goBack()
    }

    standingClickHandler() {
        this.setState({
            standingMenuOpened: !this.state.standingMenuOpened,
            fixtureMenuOpened: false
        })
    }

    fixtureClickHandler() {
        this.setState({
            fixtureMenuOpened: !this.state.fixtureMenuOpened,
            standingMenuOpened: false
        })
    }

    analyzeSessionStorage() {
        let storageFlashScoreMuted = JSON.parse(localStorage.getItem('FlashScoreMuted')),
            storageFlashScoreShrinked = JSON.parse(localStorage.getItem('flashScoreShrinked'));

        if (storageFlashScoreShrinked || storageFlashScoreMuted) {
            this.setState({
                flashScoreMuted: storageFlashScoreMuted,
                flashScoreShrinked: storageFlashScoreShrinked
            });
        }
    }

    flashScoreMuteClickHandler(e) {
        e.preventDefault();
        console.log(this.state.flashScoreMuted);
        this.setState({
            flashScoreMuted: !this.state.flashScoreMuted
        }, () => {
            localStorage.setItem('FlashScoreMuted', this.state.flashScoreMuted);
        })
    }

    flashScoreShrinkedClickHandler(e) {
        e.preventDefault();
        this.setState({
            flashScoreShrinked: !this.state.flashScoreShrinked
        }, () => {
            localStorage.setItem('flashScoreShrinked', this.state.flashScoreShrinked);
        })
    }

    render() {
        const {t} = this.props;
        const isPrev = ((this.props.history.location.state) ? this.props.history.location.state.isPrev === true : false);
        return (
            <header className={"header" + (isPrev ? " goback-active" : "")} ref={this.headerEl}>
                <div className="header-animation"/>
                <div className="container">
                    <div className="row">
                        <div className="col col-menu px-0">
                            <div className="ham-button" onClick={this.toggleNavBar}>
                                    <span className="ham-border ham-border-top">
                                         <span className="ham-border-inner ham-border-inner-top"/>
                                    </span>
                                <span className="ham-border ham-border-bottom">
                                        <span className="ham-border-inner ham-border-inner-bottom"/>
                                    </span>
                                <span className={"goback-text" + (isPrev ? " show" : "")}><Trans>Back</Trans></span>
                            </div>
                        </div>
                        <div className="col text-center">
                            <img src={logo} className="logo" alt="Canli Skor"/>
                            <h1 className="header-title pl-0"><Link to="/" title="Canli Skor"><strong>ultra</strong>skor.com</Link>
                            </h1>
                        </div>
                        <div className="col col-search px-0">
                            <button className="header-btn" onClick={this.toggleSearchBar}>
                                <Icon name="fas fa-search"/>
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
                                        <Icon name="fas fa-bullseye"/>
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
                        <hr className="separator"/>
                        <div className="row align-items-center m-0 clickable"
                             onClick={this.standingClickHandler.bind(this)}>
                            <div className="col col-icon">
                                <div className="bg">
                                    <img src={iconStandings} alt={t('Live Standings')}/>
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
                                {this.state.standingMenuOpened ? <Icon name="fas fa-chevron-up"/> :
                                    <Icon name="fas fa-chevron-down"/>}
                            </div>
                        </div>
                        {this.state.standingMenuOpened ? <PopularLeagues t={this.props.t} type="standing"/> : ""}
                        <hr className="separator"/>
                        <div className="row align-items-center m-0 clickable"
                             onClick={this.fixtureClickHandler.bind(this)}>
                            <div className="col col-icon">
                                <div className="bg">
                                    <img src={iconFixture} alt={t('Fixtures')}/>
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
                                {this.state.fixtureMenuOpened ? <Icon name="fas fa-chevron-up"/> :
                                    <Icon name="fas fa-chevron-down"/>}
                            </div>
                        </div>
                        {this.state.fixtureMenuOpened ? <PopularLeagues t={this.props.t} type="fixture"/> : ""}
                    </li>
                    <li className="separator">
                        <Trans>Settings</Trans>
                    </li>
                    <li>
                        <div className="row align-items-center m-0">
                            <div className="col">
                                <div className="text">
                                    <Trans>FlashScore Visibility</Trans>
                                </div>
                                <div className="sub-text">
                                    <Trans>Activate FlashScore popup on homepage</Trans>
                                </div>
                            </div>
                            <div className="col col-switch text-right">
                                <Switch active={!this.state.flashScoreShrinked} handler={this.flashScoreShrinkedClickHandler.bind(this)}/>
                            </div>
                        </div>
                        <hr className="separator"/>
                        <div className="row align-items-center m-0">
                            <div className="col">
                                <div className="text">
                                    <Trans>FlashScore Sound</Trans>
                                </div>
                                <div className="sub-text">
                                    <Trans>Play sound when there is an incident</Trans>
                                </div>
                            </div>
                            <div className="col col-switch text-right">
                                <Switch active={!this.state.flashScoreMuted} handler={this.flashScoreMuteClickHandler.bind(this)}/>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="row align-items-center m-0">
                            <div className="col">
                                <Trans>Language</Trans>
                            </div>
                            <div className="col text-right">
                                <LanguageSwitcher/>
                            </div>
                        </div>
                    </li>
                </ul>
                <Search hideSearch={this.hideSearch} {...this.state}/>
            </header>
        )
    }
}

const PopularLeagues = props => {
    const {t} = props;
    let popularLeagues = [
        {
            name: "UEFA Champions League",
            country: "World",
            seasonId: 17351,
            uniqueId: 7,
        },
        {
            name: "UEFA Europa League",
            country: "World",
            seasonId: 17352,
            uniqueId: 679,
        },
        {
            name: "Süper Lig",
            country: "Turkey",
            seasonId: 17762,
            uniqueId: 52,
        },
        {
            name: "Premier League",
            country: "England",
            seasonId: 17359,
            uniqueId: 17,
        },
        {
            name: "LaLiga",
            country: "Spain",
            seasonId: 18020,
            uniqueId: 8,
        },
        {
            name: "Bundesliga",
            country: "Germany",
            seasonId: 17597,
            uniqueId: 35,
        },
        {
            name: "Serie A",
            country: "Italy",
            seasonId: 17932,
            uniqueId: 23,
        },
        {
            name: "Ligue 1",
            country: "France",
            seasonId: 17279,
            uniqueId: 34,
        },
        {
            name: "Eredivisie",
            country: "Netherlands",
            seasonId: 17353,
            uniqueId: 37,
        },
        {
            name: "Primeira Liga",
            country: "Portugal",
            seasonId: 17714,
            uniqueId: 238,
        },
        {
            name: "Premier Liga",
            country: "Russia",
            seasonId: 17753,
            uniqueId: 203,
        },
        {
            name: "Championship",
            country: "England",
            seasonId: 17473,
            uniqueId: 18,
        }
    ];
    return (
        <ul className="popularLeagues">
            {popularLeagues.map((item, index) =>
                <li key={index}>
                    <Link
                        to={{
                            pathname: `/${t('league')}/${generateSlug(t(item.country))}-${generateSlug(t(item.name))}${t('-standing-')}${item.uniqueId}${t('-season-')}${item.seasonId ? item.seasonId : "0"}${props.type === "fixture" ? "/1" : ""}`,
                            state: {isPrev: true}
                        }} onClick={() => {
                        document.body.classList.remove('navbar-opened')
                    }}>
                        <img
                            src={window.ImageServer + '/images/?url=/u-tournament/' + item.uniqueId + '/logo'}
                            alt={t(item.country) + " - " + t(item.name)}/>
                        {item.country !== "World" ? t(item.country) + " - " : ""}{t(item.name)}
                    </Link>
                </li>
            )}
        </ul>
    );
};

export default withTranslation('translations')(withRouter(Navbar))

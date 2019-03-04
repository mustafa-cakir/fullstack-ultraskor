import React, {Component} from 'react'
import logo from "../logo.png"
import Icon from "./common/Icon";
import Link from "react-router-dom/es/Link";
import {withRouter} from "react-router-dom";
import {Trans, withTranslation} from "react-i18next";
import LanguageSwitcher from "./common/LanguageSwitcher";
import Search from "./Search";
import {generateSlug} from "../Helper";

class Navbar extends Component {

    constructor(props) {
        super(props);
        this.headerEl = React.createRef();
        this.goBack = this.goBack.bind(this);
        this.hideSearch = this.hideSearch.bind(this);
        this.state = {
            searchbarOpened: false,
            standingMenuOpened: false
        }
    }

    componentDidMount() {
        this.bodyClassList = document.body.classList;
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
        console.log('clicked');
        this.setState({standingMenuOpened: !this.state.standingMenuOpened})
    }

    render() {
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
                        <a href="/" className="p-0">
                            <div className="row align-items-center m-0">
                                <div className="col col-icon">
                                    <Icon name="fas fa-bullseye"/>
                                </div>
                                <div className="col col-text">
                                    <div className="text">
                                        <Trans>Live Scores</Trans>
                                    </div>
                                    <div className="sub-text">
                                        Sub-text goes here
                                    </div>
                                </div>
                            </div>
                        </a>
                        <hr className="separator"/>
                        <div className="row align-items-center m-0 clickable"
                             onClick={this.standingClickHandler.bind(this)}>
                            <div className="col col-icon">
                                <Icon name="fas fa-table"/>
                            </div>
                            <div className="col col-text">
                                <div className="text">
                                    <Trans>Standing</Trans>
                                </div>
                                <div className="sub-text">
                                    Sub-text goes here
                                </div>
                            </div>
                            <div className="col col-down">
                                {this.state.standingMenuOpened ?  <Icon name="fas fa-chevron-up"/> :  <Icon name="fas fa-chevron-down"/>}
                            </div>
                        </div>
                        {this.state.standingMenuOpened ? <PopularLeagues t={this.props.t}/> : ""}
                        <hr className="separator"/>
                        <a href="/" className="p-0">
                            <div className="row align-items-center m-0">
                                <div className="col col-icon">
                                    <Icon name="far fa-calendar-alt"/>
                                </div>
                                <div className="col col-text">
                                    <div className="text">
                                        <Trans>Fixture</Trans>
                                    </div>
                                    <div className="sub-text">
                                        Sub-text goes here
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="/">Menu 2</a>
                    </li>
                    <li>
                        <a href="/">Menu 3</a>
                    </li>
                    <li>
                        <a href="/">Menu 4</a>
                    </li>
                    <li>
                        <a href="/">SubMenu 1</a>
                    </li>
                    <li>
                        <a href="/">SubMenu 2</a>
                    </li>
                    <li>
                        <LanguageSwitcher/>
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
        },{
            name: "UEFA Europa League",
            country: "World",
            seasonId: 17352,
            uniqueId: 679,
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
                            pathname: `/${t('league')}/${generateSlug(t(item.country))}-${generateSlug(t(item.name))}${t('-standing-')}${item.uniqueId}${t('-season-')}${item.seasonId ? item.seasonId : "0"}`,
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

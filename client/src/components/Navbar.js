import React, {Component} from 'react'
import logo from "../logo.png"
import Icon from "./common/Icon";
import Link from "react-router-dom/es/Link";
import {withRouter} from "react-router-dom";
import {Trans, withTranslation} from "react-i18next";
import LanguageSwitcher from "./common/LanguageSwitcher";
import Search from "./Search";

class Navbar extends Component {

    constructor(props) {
        super(props);
        this.headerEl = React.createRef();
        this.goBack = this.goBack.bind(this);
        this.hideSearch = this.hideSearch.bind(this);
        this.state = {
            searchbarOpened: false
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
                    <li className="logo"><a href="/">LOGO</a></li>
                    <li><a href="/">Menu 1</a></li>
                    <li><a href="/">Menu 2</a></li>
                    <li><a href="/">Menu 3</a></li>
                    <li><a href="/">Menu 4</a></li>
                    <li><a href="/">SubMenu 1</a></li>
                    <li><a href="/">SubMenu 2</a></li>
                    <li><LanguageSwitcher/></li>
                </ul>
                <Search hideSearch={this.hideSearch} {...this.state}/>
            </header>
        )
    }
}

export default withTranslation('translations')(withRouter(Navbar))

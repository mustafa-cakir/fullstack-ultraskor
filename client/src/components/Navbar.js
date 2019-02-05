import React, {Component} from 'react'
import logo from "../logo.png"
import Icon from "./common/Icon";
import Link from "react-router-dom/es/Link";
import {withRouter} from "react-router-dom";
import {Trans, withNamespaces} from "react-i18next";
import LanguageSwitcher from "./common/LanguageSwitcher";

class Navbar extends Component {

    constructor(props) {
        super(props);
        this.headerEl = React.createRef();
        this.goBack = this.goBack.bind(this);
    }

    componentDidMount() {
        this.searchHandler = this.debounce(this.searchHandler, 300);
        this.bodyClassList = document.body.classList;
    };

    debounce = (cb, delay) => {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                timeout = null;
                cb.apply(context, args);
            }, delay);
        }
    };

    toggleSearchBar = () => {
        this.bodyClassList.remove('navbar-opened');
        this.bodyClassList.toggle('searchbar-opened');
        setTimeout(() => {
            if (this.bodyClassList.contains('searchbar-opened')) this.searchInput.focus();
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

    clearSearch = () => {
        this.searchInput.value = '';
        this.bodyClassList.remove('searchbar-opened');
    };

    onChangeHandler = event => {
        const searchTerm = event.target.value.toLowerCase();
        this.searchHandler(searchTerm);
    };

    searchHandler = searchTerm => {

    };

    goBack() {
        this.props.history.goBack()
    }

    render() {
        const {t} = this.props;
        const isPrev = ((this.props.history.location.state) ? this.props.history.location.state.isPrev === true : false);
        return (
            <header className={"header" + (isPrev ? " goback-active" : "")} ref={this.headerEl}>
                <div className="header-animation" />
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
                            <h1 className="header-title pl-0"><Link to="/" title="Canli Skor"><strong>ultra</strong>skor.com</Link></h1>
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
                <section className="searchbar">
                    <div className="container px-0 position-relative">
                        <Icon name="fas fa-search search-icon"/>
                        <input
                            ref={(input) => {
                                this.searchInput = input;
                            }}
                            placeholder={t("Search...")}
                            className="search-input"
                            onChange={this.onChangeHandler}
                        />
                        <button className="header-btn search-clear-btn" onClick={this.clearSearch}>
                            <div className="close-icon"/>
                        </button>
                    </div>
                </section>
            </header>
        )
    }
}

export default withNamespaces('translations')(withRouter(Navbar))

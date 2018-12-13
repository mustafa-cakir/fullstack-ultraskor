import React, {Component} from 'react'
import logo from "../logo.png"
import Icon from "./Icon";
import Link from "react-router-dom/es/Link";
import {withRouter} from "react-router-dom";

class Navbar extends Component {

    constructor(props) {
        super(props);
        this.headerEl = React.createRef();
        this.goBack = this.goBack.bind(this);
    }

    componentDidMount() {
        this.searchHandler = this.debounce(this.searchHandler, 300);
        this.bodyClassList = document.body.classList;
        console.log(this.props.history);
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
        if (this.searchInput.value.length > 3) {
            this.props.getData({
                api: '/trending/movie/week',
                data: null,
                scrollToTop: true
            });
        }
        this.searchInput.value = '';
        this.bodyClassList.remove('searchbar-opened');
    };

    onChangeHandler = event => {
        const searchTerm = event.target.value.toLowerCase();
        this.searchHandler(searchTerm);
    };

    searchHandler = searchTerm => {
        if (searchTerm.length > 3) {
            this.props.getData({
                api: '/search/movie',
                data: {
                    query: searchTerm
                },
                scrollToTop: true
            });
        }
    };

    goBack() {
        this.props.history.goBack()
    }

    render() {
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
                                <span className={"goback-text" + (isPrev ? " show" : "")}>Back</span>
                            </div>
                        </div>
                        <div className="col text-center">
                            <img src={logo} className="logo" alt="Movie Search"/>
                            <h1 className="header-title pl-0"><Link to="/" title="Movie Search"><strong>LIVE</strong>SCORES</Link></h1>
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
                    <li><a href="/">SubMenu 3</a></li>
                </ul>
                <section className="searchbar">
                    <div className="container px-0 position-relative">
                        <Icon name="fas fa-search search-icon"/>
                        <input
                            ref={(input) => {
                                this.searchInput = input;
                            }}
                            placeholder="Search..."
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

export default withRouter(Navbar)

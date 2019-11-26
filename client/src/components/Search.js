import React, { Component } from 'react';
import Icon from './common/Icon';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';

class Search extends Component {
    constructor(props) {
        super(props);
        this.searchInput = React.createRef();
    }

    componentDidMount() {
        this.searchHandler = this.debounce(this.searchHandler, 300);
    }

    debounce = (cb, delay) => {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                timeout = null;
                cb.apply(context, args);
            }, delay);
        };
    };

    componentDidUpdate() {
        if (this.props.searchbarOpened) this.searchInput.current.focus();
    }

    clearInput() {
        this.searchInput.current.value = '';
        this.props.hideSearch();
    }

    onChangeHandler = event => {
        const searchTerm = event.target.value.toLowerCase();
        this.searchHandler(searchTerm);
    };

    searchHandler = searchTerm => {
        console.log(searchTerm);
    };

    render() {
        const { t } = this.props;
        return (
            <section className="searchbar">
                <div className="container px-0 position-relative">
                    <Icon name="fas fa-search search-icon" />
                    <input
                        ref={this.searchInput}
                        placeholder={t('Search...')}
                        className="search-input"
                        onChange={this.onChangeHandler}
                    />
                    <button className="header-btn search-clear-btn" onClick={this.clearInput.bind(this)}>
                        <div className="close-icon" />
                    </button>
                </div>
                <div className="result-dropdown"></div>
            </section>
        );
    }
}

export default withTranslation('translations')(withRouter(Search));

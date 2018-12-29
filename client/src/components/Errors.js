import React, {Component} from 'react';
import Icon from "./Icon";
import {Trans} from "react-i18next";
import Link from "react-router-dom/es/Link";

class Errors extends Component {

    render() {
        if (this.props.type === "no-live-game") {
            return <NoLiveGame/>;
        } else if (this.props.type === "no-matched-game") {
            return <NothingFound/>;
        } else if (this.props.type === "page-not-found") {
            return <PageNotFound/>;
        } else {
            return <Error message={this.props.message}/>
        }
    }
}

const NoLiveGame = () => {
    return(
        <div className="error error-no-game">
            <p>No live games at the moment</p>
            <p className="gray">Please check again later.<br/>
                Meanwhile here is a list of all football events for today.</p>
        </div>
    )
};

const NothingFound = () => {
    return(
        <div className="error error-no-game">
            <h3>Nothing found.</h3>
            <p className="gray">Please try different filter or date<br/></p>
        </div>
    )
};

const PageNotFound = () => {
    return (
        <div className="not-found">
            <div className="container text-center">
                <div className="title">
                    <span className="bold">404.</span> Whoops!
                </div>
                <img className="picture mb-4" src={"/static/media/not-found.png"} alt="Page Not Found"/>
                <p className="mb-4 subtitle">
                    <Trans>We couldn't find the page you are looking for</Trans>
                </p>
                <Link to="/" className="btn">
                    <Trans>Back to Homepage</Trans> <Icon name="fas fa-arrow-right"/>
                </Link>
            </div>
        </div>
    )
};

const Error = props => {
    const refresh = () => {
        window.location.reload();
    };
    return (
            <div className="error fetch-alert">
                <strong>Error!</strong>
                <p>Something went wrong :( </p>
                <div className={"error-refresh-wrapper mt-3 mb-5 d-inline-block"} onClick={refresh}>
                    <p className="error-refresh-btn mb-0"><Icon name="fas fa-redo"/></p>
                    <p className={"error-refresh-text"}>Refresh!</p>
                </div>
                <p className="small-text">
                    <code>{ props.message || ""}</code>
                </p>
            </div>
    )
};

export default Errors

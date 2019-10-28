import React from 'react';
import {Trans} from "react-i18next";
import { Link } from 'react-router-dom';
import Icon from '../Icon';
import imgNotFound from '../../../assets/images/not-found.png'

const Error = ({ type, message }) => {
    if (type === "no-live-game") {
        return <NoLiveGame/>;
    }
    if (type === "no-matched-game") {
        return <NothingFound/>;
    }
    if (type === "page-not-found") {
        return <PageNotFound/>;
    }
    return <ErrorStandard message={message}/>
};

Error.defaultProps = {
    message: '',
};

const NoLiveGame = () => {
    return (
        <div className="error error-no-game">
            <p>No live games at the moment</p>
            <p className="gray">Please check again later.<br/>
                Meanwhile here is a list of all football events for today.</p>
        </div>
    )
};

const NothingFound = () => {
    return (
        <div className="not-found error">
            <div className="container text-center">
                <div className="title">
                    <div className="bold">Whoops!</div><Trans>No Match Found</Trans>
                </div>
                <img className="picture mb-4 pt-3" src={imgNotFound} alt="Page Not Found"/>
                <div className="mb-4 subtitle">
                    <Trans>Please use a different filter</Trans>.
                </div>
            </div>
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
                <img className="picture mb-4" src={imgNotFound} alt="Page Not Found"/>
                <p className="mb-4 subtitle">
                    <Trans>We couldn't find the page you are looking for</Trans>
                </p>
                <Link to="/" className="btn">
                    <Trans>Back to Homepage</Trans> <Icon name="fas fa-arrow-right ml-2"/>
                </Link>
            </div>
        </div>
    )
};

const ErrorStandard = ({ message }) => {
    const refreshHandler = () => {
        window.location.reload();
    };
    return (
        <div className="not-found error">
            <div className="container text-center">
                <div className="title">
                    Whoops!
                </div>
                <img className="picture mb-4" src={imgNotFound} alt="Page Not Found"/>
                <p className="mb-4 subtitle">
                    <Trans>{message}</Trans>
                </p>
                <button type="button" className="btn mb-2" onClick={refreshHandler}>
                    <Trans>Refresh the Page</Trans> <Icon name="fas fa-redo ml-1"/>
                </button>
                <div className="my-4"/>
                <Link to="/" className="btn2 simple">
                    <Trans>Back to Homepage</Trans> <Icon name="fas fa-arrow-right ml-1"/>
                </Link>
            </div>
        </div>
    )
};

export default Error;

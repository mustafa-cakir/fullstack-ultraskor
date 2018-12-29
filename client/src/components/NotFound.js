import React, {Component} from 'react';
import {Trans, withNamespaces} from "react-i18next";
import Icon from "./Icon";
import Link from "react-router-dom/es/Link";

class NotFound extends Component {
    render() {
        return (
            <div className="not-found">
                <div className="container text-center">
                    <div className="title">
                        <span className="bold">404.</span> Whoops!
                    </div>
                    <img className="picture mb-4" src={"/static/media/not-found.png"} alt="Page Not Found"/>
                    <p className="mb-4">
                        <Trans>We couldn't find the page <br/>you are looking for</Trans>
                    </p>
                    <Link to="/" className="btn">
                        <Trans>Homepage <Icon name="fas fa-arrow-right"/></Trans>
                    </Link>
                </div>
            </div>
        )
    }
}

export default withNamespaces('translations')(NotFound)

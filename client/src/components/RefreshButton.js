import React, {Component} from 'react';
import Icon from "./common/Icon";
import {Trans} from "react-i18next";

class RefreshButton extends Component {
    render() {
        let currentUrl = window.location.href;
        return (
	        <a href={currentUrl} className="refresh-btn"><div className="icon"><Icon name="fas fa-sync"/></div><Trans>Refresh</Trans></a>
        )
    }
}

export default RefreshButton

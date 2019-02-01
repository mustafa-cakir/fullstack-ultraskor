import React, {Component} from 'react';
import Icon from "./Icon";
import {Trans} from "react-i18next";

class RefreshButton extends Component {
    render() {
        return (
	        <div className="refresh-btn" onClick={() => window.location.reload()}><div className="icon"><Icon name="fas fa-sync"/></div><Trans>Refresh</Trans></div>
        )
    }
}

export default RefreshButton

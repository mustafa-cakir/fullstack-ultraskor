import React, {Component} from 'react';
import Icon from "./Icon";

class refreshBtn extends Component {
    render() {
        return (
            <div className="refresh-btn" onClick={() => window.location.reload()}><Icon name="fas fa-sync"/> Refresh</div>
        )
    }
}

export default refreshBtn

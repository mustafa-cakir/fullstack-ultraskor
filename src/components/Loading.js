import React, {Component} from 'react';
import logoBlack from "../logo-black.png";

class Loading extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {type} = this.props;
        return (
            <div className={"loadingAbstract " + type}>
                <div className="loading-ball">
                    <div className="lds-ripple">
                        <div/>
                        <div/>
                    </div>
                    <img src={logoBlack} alt="Loading"/>
                </div>
            </div>
        )
    }
}

export default Loading

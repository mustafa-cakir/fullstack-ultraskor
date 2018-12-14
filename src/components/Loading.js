import React, {Component} from 'react';
import logoBlack from "../logo-black.png";

class Loading extends Component {
    render() {
        return (
            <div className="loadingAbstract">
                <div className="loading-ball">
                    <div className="lds-ripple">
                        <div/>
                        <div/>
                    </div>
                    <img src={logoBlack} alt="Loading"/>
                </div>

                {/*<div className="loading-ball"><img src={logoBlack} alt="Loading"/></div>*/}
                {/*<div className="sk-circle">*/}
                    {/*<div className="sk-circle1 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle2 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle3 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle4 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle5 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle6 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle7 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle8 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle9 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle10 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle11 sk-child">&nbsp;</div>*/}
                    {/*<div className="sk-circle12 sk-child">&nbsp;</div>*/}
                {/*</div>*/}
            </div>
        )
    }
}

export default Loading

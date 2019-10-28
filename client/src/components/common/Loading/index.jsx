import React from 'react';
import logoBlack from '../../../assets/images/logo-black.png';

const Loading = ({ type }) => {
    return (
        <div className={`loadingAbstract ${type}`}>
            <div className="loading-ball">
                <div className="lds-ripple">
                    <div />
                    <div />
                </div>
                <img src={logoBlack} alt="Loading" />
            </div>
        </div>
    );
};

Loading.defaultProps = {
    type: ''
};

export default Loading;

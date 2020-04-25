import React, { Component } from 'react';

class Switch extends Component {
    render() {
        const { active, label, handler } = this.props;
        //console.log(active);
        return (
            <React.Fragment>
                <label className="form-switch" onClick={handler}>
                    <input type="checkbox" checked={active ? active : false} readOnly={true} />
                    <i />
                    {label ? label : ''}
                </label>
            </React.Fragment>
        );
    }
}

export default Switch;

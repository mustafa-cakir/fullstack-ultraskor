import React, {Component} from 'react';

class TestComp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
        }
    }

    render() {
        const {index} = this.state;

        return (
            <div>
                test comp content goes here
                <p>
                    {index}
                </p>
            </div>
        )
    }
}

export default TestComp

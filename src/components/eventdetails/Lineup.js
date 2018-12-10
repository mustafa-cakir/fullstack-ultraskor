import React, {Component} from 'react';
import Loading from "../Loading";

class Lineup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lineupData: null
        };
    }

    componentDidMount() {
        const {eventData} = this.props;
        this.getData("/event/" + eventData.event.id + "/lineups/json");
    };

    componentDidUpdate() {
        this.props.swipeAdjustHeight()
    }

    getData = api => {
        let jsonData = {};
        fetch('https://www.sofascore.com' + api, {referrerPolicy: "no-referrer", cache: "no-store"})
            .then(res => res.json())
            .then(
                (result) => {
                    jsonData = result;
                },
                (error) => {
                    jsonData = {error: error.toString()};
                }
            )
            .then(() => {
                this.setState({
                    lineupData: jsonData,
                });
            })
    };
    render() {
        const {lineupData} = this.state;
        //const {eventData} = this.props;
        if (!lineupData) return <Loading/>;
        //const standingsTables = lineupData.standingsTables[0];
        return (
            <div>
                <div className="lineup container">
                    <div className="white-box mt-2">
                        <div className="row heading align-items-center">
                            heyoo
                        </div>
                        <div className="body">
                            body here
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Lineup
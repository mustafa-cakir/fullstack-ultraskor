import React, {Component} from 'react';

class Stats extends Component {


    render() {
        const {eventData} = this.props;
        return (
            <div>
                <div className="stats container">
                    <div className="white-box mt-2">
                        {eventData.statistics.periods[0].groups.map((group, index) => {
                            if (group.groupName === "Possession") {
                                return (
                                    <div>
                                        <div className="group-title" key={index}>
                                            {group.groupName}
                                        </div>
                                        {group.statisticsItems.map((item, index) => {
                                            return (
                                                <div className="horizontal-bar" key={index}>
                                                    <div className="row">
                                                        <div className="col home" style={{maxWidth: item.home}}>
                                                            {item.home}
                                                        </div>
                                                        <div className="col col-space"/>
                                                        <div className="col away" style={{maxWidth: item.away}}>
                                                            {item.away}
                                                        </div>
                                                    </div>
                                                    <hr/>
                                                </div>
                                            )
                                        })}
                                    </div>
                                );
                            } else if (group.groupName === "Shots") {
                                return (
                                    <div>
                                        <div className="group-title" key={index}>
                                            {group.groupName}
                                        </div>
                                        {group.statisticsItems.map((item, index) => {
                                            return (
                                                <div className="horizontal-bar style-2 mb-3" key={index}>
                                                    <div className="row labels">
                                                        <div className="col text-left f-700">{item.home}</div>
                                                        <div className="col mb-1 f-300">{item.name}</div>
                                                        <div className="col text-right f-700">{item.away}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col">
                                                            <div className="row col-container">
                                                                <div className="col" style={{maxWidth: ((parseInt(item.home) > parseInt(item.away)) ? "25%" : ((parseInt(item.away) * 75 / parseInt(item.home)) + "%"))}}/>
                                                                <div className="col home"/>
                                                            </div>
                                                        </div>
                                                        <div className="col">
                                                            <div className="row col-container">
                                                                <div className="col away"/>
                                                                <div className="col" style={{maxWidth: ((parseInt(item.away) > parseInt(item.home)) ? "25%" : ((parseInt(item.away) * 25 / parseInt(item.home)) + "%"))}}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <hr/>
                                    </div>
                                );
                            } else {
                                return group.statisticsItems.map((item, index) => {
                                    return (
                                        <div className="row border-bottom align-items-center" key={index}>
                                            <div className="col text-left home">
                                                <span
                                                    className={"indicator " + (item.compareCode === 1 ? "active" : "")}>{item.home}</span>
                                            </div>
                                            <div className="col text-center">
                                                <span>{item.name}</span>
                                            </div>
                                            <div className="col text-right away">
                                                <span
                                                    className={"indicator " + (item.compareCode === 2 ? "active" : "")}>{item.away}</span>
                                            </div>
                                        </div>
                                    )
                                });
                            }
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export default Stats

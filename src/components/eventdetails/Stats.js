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
                                    <div key={index}>
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
                            } else if (group.groupName === "Shots" || group.groupName === "TVData") {
                                return (
                                    <div key={index}>
                                        <div className="group-title" key={index}>
                                            {group.groupName}
                                        </div>
                                        {group.statisticsItems.map((item, index) => {
                                            item.home = parseInt(item.home, 10);
                                            item.away = parseInt(item.away, 10);
                                            let homeWidth = Math.floor((100 * item.home) / (item.away + item.home)),
                                                awayWidth = Math.floor((100 * item.away) / (item.away + item.home));
                                            return (
                                                <div className="horizontal-bar style-2 mb-3" key={index}>
                                                    <div className="row labels mb-2">
                                                        <div className="col text-left f-700">{item.home}</div>
                                                        <div className="col f-300">{item.name}</div>
                                                        <div className="col text-right f-700">{item.away}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col">
                                                            <div className="row col-container">
                                                                <div className="col"style={{maxWidth: 100 - homeWidth + "%"}}/>
                                                                <div className="col home"  style={{maxWidth: homeWidth + "%"}}/>
                                                            </div>
                                                        </div>
                                                        <div className="col col-space"/>
                                                        <div className="col">
                                                            <div className="row col-container">
                                                                <div className="col away"  style={{maxWidth: awayWidth + "%"}}/>
                                                                <div className="col" style={{maxWidth: 100 - awayWidth + "%"}}/>
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

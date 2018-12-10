import React, {Component} from 'react';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.groups = [];
    };

    componentDidMount() {
        const {eventData} = this.props;
        const customSorting = ["Possession", "Shots", "Passes", "TVData", "Duels", "Defending"];
        this.groups = eventData.statistics.periods[0].groups;
        this.groups = this.groups.reduce((total, item) => {
            if (item.groupName === "Shots extra") {
                let shotIndex = total.findIndex(item => item.groupName === "Shots");
                item.statisticsItems.forEach((item) => {
                    total[shotIndex].statisticsItems.push(item);
                });
            } else {
                item['sorting'] = customSorting.indexOf(item.groupName) !== -1 ? customSorting.indexOf(item.groupName) : 99;
                total.push(item);
            }
            return total;
        }, []);
        this.groups.sort((a, b) => (a.sorting > b.sorting) ? 1 : ((b.sorting > a.sorting) ? -1 : 0));
    };

    render() {

        return (
            <div>
                <div className="stats container">
                    <div className="white-box mt-2 pb-2">
                        {this.groups.map((group, index) => {
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
                            } else if (group.groupName === "Shots2") {
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
                            } else {
                                return (
                                    <div key={index}>
                                        <div className="group-title" key={index}>
                                            {group.groupName === "TVData" ? "Discipline" : group.groupName}
                                        </div>
                                        {group.statisticsItems.map((item, index) => {
                                            let homeNum = parseInt(item.home, 10),
                                                awayNum = parseInt(item.away, 10),
                                                homeWidth = Math.floor((100 * homeNum) / (awayNum + homeNum)),
                                                awayWidth = Math.floor((100 * awayNum) / (awayNum + homeNum));
                                            return (
                                                <div className="horizontal-bar style-2 mb-3" key={index}>
                                                    <div className="row labels mb-2">
                                                        <div className="col text-left f-700"><span
                                                            className={"num home-num " + (homeNum > awayNum ? "higher" : "")}>{item.home}</span>
                                                        </div>
                                                        <div className="col f-300">{item.name}</div>
                                                        <div className="col text-right f-700"><span
                                                            className={"num away-num " + (awayNum > homeNum ? "higher" : "")}>{item.away}</span>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col">
                                                            <div className="row col-container">
                                                                <div className="col"
                                                                     style={{maxWidth: 100 - homeWidth + "%"}}/>
                                                                <div className="col home"
                                                                     style={{maxWidth: homeWidth + "%"}}/>
                                                            </div>
                                                        </div>
                                                        <div className="col col-space"/>
                                                        <div className="col">
                                                            <div className="row col-container">
                                                                <div className="col away"
                                                                     style={{maxWidth: awayWidth + "%"}}/>
                                                                <div className="col"
                                                                     style={{maxWidth: 100 - awayWidth + "%"}}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <hr/>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export default Stats
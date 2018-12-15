import React, {Component} from 'react';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.groups = [];
        this.state = {
            period: 0
        };
        this.periodChangeHandler = this.periodChangeHandler.bind(this);
    };

    periodChangeHandler(period) {
        this.setState({
            period: period
        })
    }

    render() {
        const periods = this.props.eventData.statistics.periods;
        if (!periods[this.state.period]) return;
        const customSorting = ["Possession", "Shots", "Shots extra", "Passes", "TVData", "Duels", "Defending"];
        let groups = periods[this.state.period].groups.reduce((total, item) => {
            item['sorting'] = customSorting.indexOf(item.groupName) !== -1 ? customSorting.indexOf(item.groupName) : 99;
            total.push(item);
            return total;
        }, []);
        groups.sort((a, b) => (a.sorting > b.sorting) ? 1 : ((b.sorting > a.sorting) ? -1 : 0));
        return (
            <div>
                <div className="stats container">
                    <div className="white-box mt-2 pb-2">
                        {periods[1] && periods[2] ? (
                            <ul className="horizontal-tab">
                                <li className={this.state.period === 0 ? "active" : ""}
                                    onClick={() => this.periodChangeHandler(0)}><span>Overal</span></li>
                                <li className={this.state.period === 1 ? "active" : ""}
                                    onClick={() => this.periodChangeHandler(1)}><span>1st Half</span></li>
                                <li className={this.state.period === 2 ? "active" : ""}
                                    onClick={() => this.periodChangeHandler(2)}><span>2nd Half</span></li>
                            </ul>
                        ) : ""}
                        {groups.map((group, index) => {
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

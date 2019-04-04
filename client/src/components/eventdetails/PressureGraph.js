import React, {Component} from 'react';
import {Trans} from "react-i18next";
import {withTranslation} from "react-i18next";

class PressureGraph extends Component {
    render() {
        const {eventData, t} = this.props;
        if (!eventData.liveForm || eventData.liveForm.length === 0) return false;
        return (
            <div>
                <div className="title"><Trans>Pressure</Trans></div>
                <div className="body">
                    <div className="pressure-graph-container mt-2">
                        <div className="row mx-0">
                            <div className="col pressure-graph p-0">
                                <div className="row m-0">
                                    {eventData.liveForm.map((item, i) => {
                                        let direction = (item.value < 0) ? "away" : (item.value !== 0) ? "home" : "",
                                            style = {
                                                height: Math.abs(item.value) + "%",
                                                top: (item.value > 0) ? "-" + item.value + "%" : ""
                                            };
                                        return (
                                            <div key={i} className={"col " + direction} style={style}/>
                                        )
                                    })}
                                </div>
                            </div>
                            {eventData.liveForm.length < 91 ? <div className="col blank p-0" style={{
                                flex: "0 0 " + (91 - eventData.liveForm.length + 5) + "%",
                                maxWidth: (91 - eventData.liveForm.length + 5) + "%"
                            }}/> : ""}
                        </div>
                        <div className="pressure-graph-animation"/>
                        <div className="homeLabel">
                            <img
                                alt={t(eventData.event.homeTeam.name)}
                                src={window.ImageServer + '/images/team-logo/football_' + eventData.event.homeTeam.id + '.png'}
                            />
                        </div>
                        <div className="awayLabel">
                            <img
                                alt={t(eventData.event.awayTeam.name)}
                                src={window.ImageServer + '/images/team-logo/football_' + eventData.event.awayTeam.id + '.png'}
                            />
                        </div>
                    </div>
                    <div className="minute-measure row flex-nowrap mt-0 mb-2">
                        <div className="col label"><Trans>Minutes</Trans></div>
                        <div className="col empty-space"/>
                        <div className="col">15'</div>
                        <div className="col">30'</div>
                        <div className="col">45'</div>
                        <div className="col">60'</div>
                        <div className="col">75'</div>
                        <div className="col last">90'</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withTranslation('translations')(PressureGraph)

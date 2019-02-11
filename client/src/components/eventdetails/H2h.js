import React, {Component} from 'react';
import Loading from "../Loading";
import Errors from "../common/Errors";
import Tournament from "../common/Tournament";
import {Trans} from "react-i18next";

class H2h extends Component {
	constructor(props) {
		super(props);
		this.state = {
			h2hData: null,
			tab: 'h2h'
		};
	}

	componentDidMount() {
		const {eventData} = this.props;
		this.initSocket("/event/" + eventData.event.id + "/matches/json");
	};

	componentDidUpdate() {
		this.props.swipeAdjustHeight()
	}

	initSocket = api => {

		fetch(`/api/?query=${api}&page=h2h`)
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw Error(`Can't retrieve information from server, ${res.status}`);
				}
			})
			.then(res => {
				this.setState({
					h2hData: res
				});
			})
			.catch(err => {
				this.setState({
					h2hData: {error: err.toString()},
				});
			});


		// socket.emit('get-main', options);
		//
		// socket.once('return-main-h2h', res => {
		// 	this.setState({
		// 		h2hData: res
		// 	});
		// });
		//
		// socket.on('return-error-h2h', err => {
		// 	this.setState({
		// 		h2hData: {error: err.toString()},
		// 	});
		// });

	};

	tabSwitcherHandler(tab) {
		this.setState({
			tab: tab
		});
	}

	render() {
		const {h2hData, tab} = this.state;
		if (!h2hData) return <Loading type="inside"/>;
		if (h2hData.error) return <Errors type="error" message={h2hData.error}/>;
		const {eventData} = this.props;
		let tournaments = (tab === "h2h") ? h2hData.h2h.events.tournaments : h2hData[tab].recent.tournaments;
		return (
			<div className="h2h container">
				<div className="white-box mt-2 p-0">
					<ul className="horizontal-tab pt-4 mb-4">
						<li className={tab === 'h2h' ? "active" : ""}
						    onClick={() => this.tabSwitcherHandler('h2h')}>
							<span className="tab-container"><Trans>H2H</Trans></span>
						</li>
						<li className={tab === 'home' ? "active" : ""}
						    onClick={() => this.tabSwitcherHandler('home')}>
							<span className="tab-container">
								<img
									className="team-logo"
									alt={eventData.event.homeTeam.name}
									src={window.ImageServer + '/images/team-logo/football_' + eventData.event.homeTeam.id + ''}
								/>
								<div className="team-name">{eventData.event.homeTeam.name}</div>
							</span>
						</li>
						<li className={tab === 'away' ? "active" : ""}
						    onClick={() => this.tabSwitcherHandler('away')}>
							<span className="tab-container">
								<img
									className="team-logo"
									alt={eventData.event.awayTeam.name}
									src={window.ImageServer + '/images/team-logo/football_' + eventData.event.awayTeam.id + ''}
								/>
								<div className="team-name">{eventData.event.awayTeam.name}</div>
							</span>
						</li>
					</ul>
					<div className="h2h-list">
						<Tournament tournaments={tournaments} from={"h2h"}/>
					</div>
				</div>
			</div>
		)
	}
}

export default H2h

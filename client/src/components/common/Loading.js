import React, {Component} from 'react';
import logoBlack from "../../logo-black.png";
import RefreshButton from "./RefreshButton";

class Loading extends Component {
	constructor(props) {
		super(props);
		this.state = {
			refreshBtn: false
		}
	}

	componentDidMount() {
		this.waitTimeout= setTimeout(() => {
			this.setState({
				refreshBtn: true
			})
		}, 5000);
	}

	componentWillUnmount() {
		clearTimeout(this.waitTimeout);
	}

	render() {
		const {type} = this.props;
		return (
			<div className={"loadingAbstract " + type}>
				<div className="loading-ball">
					<div className="lds-ripple">
						<div/>
						<div/>
					</div>
					<img src={logoBlack} alt="Loading"/>
				</div>
				{this.state.refreshBtn ? <RefreshButton/> : ""}
			</div>
		)
	}
}

export default Loading

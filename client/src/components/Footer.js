import React, {Component} from 'react';
import {Trans} from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

class Footer extends Component {
	render() {
		return (
			<footer className="text-center">
				<div className="mt-3 text-center">
					<LanguageSwitcher/>
				</div>
				<p>
					<Trans>This app has no commercial intents.</Trans><br/><Trans>Developed just for fun using
					React</Trans> ;)
				</p>
				<small className="gray">Copyright © 2019. <Trans>All rights reserved.</Trans></small>
			</footer>
		)
	}
}

export default Footer

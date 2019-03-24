import React, {Component} from 'react';
import {Trans} from "react-i18next";
import LanguageSwitcher from "./common/LanguageSwitcher";

class Footer extends Component {
	emailLinkAction(e) {
		e.preventDefault();
		window.location.href="mailto:contact@ultraskor.com"
	}
	render() {
		return (
			<footer className="text-center">
				<div className="mt-3 text-center">
					<LanguageSwitcher/>
				</div>
				<p>
					<Trans>This app has no commercial intents.</Trans><br/><Trans>Developed just for fun using
					React</Trans>
				</p>
				<p><a href="#contact" title="Contact" onClick={this.emailLinkAction}><Trans>Contact</Trans></a>
				</p>
				<small className="gray">Copyright © 2019. <Trans>All rights reserved.</Trans></small>
			</footer>
		)
	}
}

export default Footer

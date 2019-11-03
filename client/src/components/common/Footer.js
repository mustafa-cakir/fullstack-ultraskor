import React, { Component } from "react";
import { Trans } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

class Footer extends Component {
    // emailLinkAction(e) {
    // 	e.preventDefault();
    // 	window.location.href="mailto:contact@ultraskor.com"
    // }
    render() {
        return (
            <footer className="row mx-0 align-items-center">
                <div className="col text-left">
                    Copyright © 2019 —{" "}
                    <a href="mailto:contact@ultraskor.com" title="Contact">
                        <Trans>Contact</Trans>
                    </a>
                    <br />
                </div>
                <div className="col col-switcher">
                    <LanguageSwitcher type="small" />
                </div>
            </footer>
        );
    }
}

export default Footer;

import React, {Component} from 'react';
import {Trans, withNamespaces} from "react-i18next";

class Footer extends Component {
    render() {
        const {i18n} = this.props;
        const changeLanguageHandler = lng => {
            i18n.changeLanguage(lng);
        };
        return (
            <div>
                <div className="mt-3 text-center">
                    <button onClick={() => changeLanguageHandler('tr')}>Türkçe</button> - <button
                    onClick={() => changeLanguageHandler('en')}>English</button>
                </div>
                <footer className="text-center">
                    <p>
                        <code>
                            <Trans>Built with React by Mustafa Cakir</Trans><br/>(mc@flexiblewebdesign.com)
                        </code>
                    </p>
                    <p>
                        <Trans>This app has no commercial intents.</Trans><br /><Trans>Developed just for fun</Trans> ;)
                    </p>
                    <small className="gray">Copyright © 2019. <Trans>All rights reserved.</Trans></small>
                </footer>
            </div>
        )
    }
}

export default withNamespaces('translations')(Footer)

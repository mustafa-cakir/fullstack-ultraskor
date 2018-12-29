import React, {Component} from 'react';
import {Trans} from "react-i18next";

class Footer extends Component {
    render() {
        return (
            <div>
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

export default Footer

import React, {Component} from 'react';
import Loading from "./Loading";
import {Trans, withNamespaces} from "react-i18next";

class TestComp extends Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        const { t } = this.props;
        return (
            <div>
                <Loading/>
                test comp content goes here
                <p>
                    {t('feed_no_change')}
                </p>
                <p>
                    <Trans>Menu 1</Trans>
                </p>
            </div>
        )
    }
}
export default withNamespaces('translations')(TestComp)

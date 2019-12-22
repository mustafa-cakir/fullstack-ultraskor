import React, { Component } from 'react';
import i18n from 'i18next';
import { HelperTranslateUrlTo } from '../../core/utils/helper';

class LanguageSwitcher extends Component {
    render() {
        const { language } = i18n;
        const { type } = this.props;
        return (
            <div className="language-switcher">
                <a
                    href={HelperTranslateUrlTo('tr')}
                    className={'btn ' + (language === 'tr' ? 'active' : '')}
                    alt="Dili Türkçe'ye çevirebilirsiniz"
                >
                    {type === 'small' ? 'Tr' : 'Türkçe'}
                </a>
                <a
                    href={HelperTranslateUrlTo('en')}
                    className={'btn ' + (language === 'en' ? 'active' : '')}
                    alt="Change language to English"
                >
                    {type === 'small' ? 'En' : 'English'}
                </a>
            </div>
        );
    }
}

export default LanguageSwitcher;

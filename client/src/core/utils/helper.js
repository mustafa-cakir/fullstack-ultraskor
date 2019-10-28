import React from 'react';
import ReactGA from 'react-ga';

class TranslateUrlHandler {
    constructor() {
        this.regEx = {
            toEnglish: {
                '/mac/': '/match/',
                'canli-skor-': 'live-score-',
                '/lig/': '/league/',
                '-puan-durumu-': '-standing-',
                '-sezon-': '-season-',
                '/maclar/': '/matches/',
                'tarih-': 'date-',
                '/takim/': '/team/'
            },
            toTurkish: {
                '/en': '',
                '/match/': '/mac/',
                'live-score-': 'canli-skor-',
                '/league/': '/lig/',
                '-standing-': '-puan-durumu-',
                '-season-': '-sezon-',
                '/matches/': '/maclar/',
                'date-': 'tarih-',
                '/team/': '/takim/'
            }
        };
    }

    replaceAll(str, mapObj) {
        const re = new RegExp(Object.keys(mapObj).join('|'), 'gi');
        return str.replace(re, function(matched) {
            return mapObj[matched.toLowerCase()];
        });
    }

    toEnglish(force) {
        let url = window.location.origin;
        let pathname = window.location.pathname;
        if (force) {
            url += this.replaceAll(pathname, this.regEx.toEnglish);
        } else {
            if (pathname.split('/')[1] !== 'en') {
                pathname = this.replaceAll(pathname, this.regEx.toEnglish);
                url += '/en' + pathname;
            } else {
                url += pathname;
            }
        }
        return url;
    }

    toTurkish(force) {
        let url = window.location.origin;
        let pathname = window.location.pathname;
        if (force) {
            url += this.replaceAll(pathname, this.regEx.toTurkish);
        } else {
            if (pathname.split('/')[1] === 'en') {
                pathname = this.replaceAll(pathname, this.regEx.toTurkish);
                url += pathname;
            } else {
                url += pathname;
            }
        }
        return url;
    }
}

class UpdateMetaHandler {
    constructor() {
        this.els = {
            canonical: document.querySelector('[data-meta="canonical"]'),
            alternate: document.querySelector('[data-meta="alternate"]'),
            description: document.querySelector('[data-meta="description"]'),
            keywords: document.querySelector('[data-meta="keywords"]')
        };
    }

    update(props) {
        const { title, canonical, description, keywords, alternate, hrefLang } = props;

        if (canonical) {
            if (this.els.canonical) {
                this.els.canonical.setAttribute('href', canonical);
            } else {
                let link = document.createElement('link');
                link.rel = 'canonical';
                link.href = canonical;
                link.setAttribute('data-meta', 'canonical');
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        }
        if (alternate && hrefLang) {
            if (this.els.alternate) {
                this.els.alternate.href = alternate;
                this.els.alternate.setAttribute('hreflang', hrefLang);
            } else {
                let link = document.createElement('link');
                link.rel = 'alternate';
                link.href = alternate;
                link.setAttribute('hreflang', hrefLang);
                link.setAttribute('data-meta', 'alternate');
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        }

        if (title) document.title = title;
        if (description) this.els.description.content = description;
        if (keywords) this.els.keywords.content = keywords;
    }
}

export function HelperTranslateUrlTo(to, force = false) {
    const translateUrlInstance = new TranslateUrlHandler();
    return to === 'en' ? translateUrlInstance.toEnglish(force) : translateUrlInstance.toTurkish(force);
}

export function HelperUpdateMeta(props) {
    const updateMetaInstance = new UpdateMetaHandler();
    updateMetaInstance.update(props);
}

export function flagImg(tournament) {
    const storedCustomLogos = [7, 27];
    const customLogos = [11, 384, 480, 679];

    if (storedCustomLogos.indexOf(tournament.tournament.uniqueId) > -1) {
        return (
            <div className="col flag-img">
                <img src={`/static/media/${tournament.tournament.uniqueId}.png`} alt={tournament.tournament.name} />
            </div>
        );
    }
    if (customLogos.indexOf(tournament.tournament.uniqueId) > -1) {
        return (
            <div className="col flag-img">
                <img
                    src={`${window.ImageServer}/images/u-tournament/${tournament.tournament.uniqueId}.png`}
                    alt={tournament.tournament.name}
                />
            </div>
        );
    }
    return <div className={`col flag flag-${tournament.category.icon}`} />;
}

export function Throttle(func, wait, options) {
    let context;
    let args;
    let result;
    let timeout = null;
    let previous = 0;
    if (!options) options = {};
    const later = () => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        const now = Date.now();
        if (!previous && options.leading === false) previous = now;
        const remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}

export function ratingClass(value) {
    value = parseFloat(value);
    switch (true) {
        case value > 8.0:
            return 'amazing bg';
        case value > 7.5:
            return 'great bg';
        case value > 6.9:
            return 'good bg';
        case value > 5.9:
            return 'mediocre bg';
        case value > 4.9:
            return 'underwhelming bg';
        default:
            return 'unrated';
    }
}

export function generateSlug(text) {
    const a = 'çıüğöşàáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
    const b = 'ciugosaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special chars
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

export function getQueryStringFromUrl(key) {
    key = key.replace(/[[\]]/g, '\\$&');
    let url = window.location.href,
        regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function updateQueryString(key, value) {
    let uri = window.location.href,
        re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i'),
        separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
        return uri + separator + key + '=' + value;
    }
}

export function removeScrollY() {
    try {
        sessionStorage.removeItem('ultraskor_homepage_scrollY');
    } catch (err) {
        console.log('error removing item from sessionStorage', err);
    }
}

export function storeScrollY() {
    try {
        sessionStorage.setItem('ultraskor_homepage_scrollY', window.scrollY);
    } catch (err) {
        console.log('error setting to sessionStorage', err);
    }
}

export function restoreScrollY() {
    let prev_scrollY;
    try {
        prev_scrollY = sessionStorage.getItem('ultraskor_homepage_scrollY');
    } catch (err) {
        console.log('error getting from sessionStorage', err);
    }
    if (prev_scrollY) {
        window.scroll(0, prev_scrollY);
        removeScrollY();
    }
}

export const marketGroups = [
    {
        id: 1,
        name: 'All Bets',
        markets: []
    },
    {
        id: 2,
        name: 'Side Bets',
        markets: [
            '1-1',
            '2-7',
            '2-10',
            '2-11',
            '2-36',
            '2-42',
            '2-69',
            '2-72',
            '2-77',
            '2-88',
            '2-90',
            '2-92',
            '2-100',
            '2-643',
            '2-644',
            '4-4',
            '4-12',
            '4-23',
            '4-27',
            '4-47',
            '4-129',
            '4-321',
            '4-625'
        ]
    },
    {
        id: 3,
        name: 'Over/Under',
        markets: ['2-101-0.5', '2-101-1.5', '2-101-2.5', '2-101-3.5', '2-101-4.5', '2-101-5.5']
    },
    {
        id: 4,
        name: 'Goal',
        markets: [
            '2-4',
            '2-6',
            '2-7',
            '2-43',
            '2-44',
            '2-45',
            '2-46',
            '2-47',
            '2-60',
            '2-84',
            '2-85',
            '2-87',
            '2-89',
            '2-91',
            '2-101',
            '2-603',
            '2-604',
            '4-14',
            '4-34',
            '4-54',
            '4-63',
            '4-131',
            '4-136',
            '4-199',
            '4-203',
            '4-207',
            '4-262'
        ]
    },
    {
        id: 5,
        name: 'Corner',
        markets: [
            '2-48',
            '2-49',
            '2-52',
            '2-53',
            '2-56',
            '2-67',
            '2-68',
            '4-210',
            '4-211',
            '4-215',
            '4-217',
            '4-218',
            '4-222'
        ]
    },
    {
        id: 6,
        name: 'Handicap',
        markets: ['2-100-1', '2-100-2', '2-100-3', '2-100-4', '2-100--1', '2-100--2', '2-100--3', '2-100--4']
    },
    {
        id: 7,
        name: 'Score',
        markets: ['2-86', '4-252']
    },
    {
        id: 8,
        name: 'Special',
        markets: ['2-3', '2-12', '2-17', '2-658', '2-661']
    }
];

export const lockedOddsPlaceholder = [
    {
        mn: 'Maç Sonucu',
        muk: '1_1',
        o: [
            {
                ona: '1',
                locked: true
            },
            {
                ona: '0',
                locked: true
            },
            {
                ona: '2',
                locked: true
            }
        ]
    },
    {
        mn: 'Karşılıklı Gol',
        o: [
            {
                ona: 'Var',
                locked: true
            },
            {
                ona: 'Yok',
                locked: true
            }
        ]
    },
    {
        mn: 'Maçın Geri Kalanını Kim Kazanır ',
        o: [
            {
                ona: '1',
                locked: true
            },
            {
                ona: '0',
                locked: true
            },
            {
                ona: '2',
                locked: true
            }
        ]
    },
    {
        mn: 'Sıradaki Golü Kim Atar',
        o: [
            {
                ona: '1',
                locked: true
            },
            {
                ona: 'Olmaz',
                locked: true
            },
            {
                ona: '2',
                locked: true
            }
        ]
    },
    {
        mn: 'Toplam Korner Sayısı',
        o: [
            {
                ona: '0-8',
                locked: true
            },
            {
                ona: '9-11',
                locked: true
            },
            {
                ona: '12+',
                locked: true
            }
        ]
    }
];

export const prepareRes = res => {
    let { tournaments } = res;
    // UEFA - CL - 7
    // UEFA - Europa League - 679
    // Turkey - Super Lig - 52
    // Turkey - TFF 1. Lig - 98
    // England - Premier League - 17
    // England - Championship - 18

    // Spain - LaLiga - 8
    // Germany - Bundesliga - 35
    // Italy - Seria A - 23
    // France - Liga 1 - 34
    // Holland - Eredivisie - 37
    // Belgium - First Division A - 38

    // Portugal - Primeira Liga - 238
    // Norway - Eliteserien - 20
    // Sweeden - Allsvenskan - 40
    // Denmark - Superliga - 39
    // Russia - Premier Liga - 203
    // Croatia - 1. HNL - 170
    // Czech Republic - 1. Liga - 172
    // Greece - Super League - 185
    // Israel - Premier League - 266
    // Ukraine - Premier League - 218

    // Spain - LaLiga 2 - 54
    // Germany - Bundesliga 2 - 44
    // Italy - Serie B - 53
    // France - Ligue 2 - 182
    // Holland - Eerste Divisie - 131
    // England - League One - 24
    // Switzerland - Super League - 215
    //
    // Mexico - Primera Division, Apertura - 11621
    // Argentina - Superliga - 155
    // Brasileiro Série A - 325
    //

    // Custom Sorting - Move some tournaments to the top or bottom of the list (FYI: 62 = Turkey Super Lig, 309 = CONMEBOL Libertadores)
    const moveToTop = [
        7,
        679,
        52,
        98,
        17,
        18,
        8,
        35,
        23,
        34,
        37,
        38,
        238,
        20,
        40,
        39,
        203,
        170,
        172,
        185,
        266,
        218,
        54,
        44,
        53,
        182,
        131,
        24,
        215
    ]; // tournament Id's in order that you want at top i.e: [62, 36, 33]

    const priorityTournaments = tournaments.filter(x => moveToTop.indexOf(x.tournament.uniqueId) > -1);
    priorityTournaments.sort((a, b) => {
        if (moveToTop.indexOf(a.tournament.uniqueId) < moveToTop.indexOf(b.tournament.uniqueId)) {
            return -1;
        }
        if (moveToTop.indexOf(a.tournament.uniqueId) > moveToTop.indexOf(b.tournament.uniqueId)) {
            return 1;
        }
        return 0;
    });

    const otherTournaments = tournaments.filter(x => moveToTop.indexOf(x.tournament.uniqueId) === -1);
    tournaments = priorityTournaments.concat(otherTournaments);

    // const moveToBottom = [null]; // tournament Id's in the reverse order that you want at the bottom i.e: [309,310]
    // for (let i = 0; i < tournaments.length; i += 1) {
    //     if (moveToBottom.length > 0) {
    //         for (let k = 0; k < moveToBottom.length; k += 1) {
    //             if (tournaments[i].tournament.id === moveToBottom[k]) {
    //                 const a = tournaments.splice(i, 1); // removes the item
    //                 tournaments.push(a[0]); // adds it back to the end
    //                 break;
    //             }
    //         }
    //     }
    // }

    return tournaments;
};

export const trackPage = page => {
    ReactGA.set({
        page
    });
    ReactGA.pageview(page);
};

export const appendValueToArray = (arr, value) => {
    if (arr.indexOf(value) > -1) return arr;
    arr.push(value);
    return arr;
};

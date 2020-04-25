import Mp3Goal from '../../assets/sound/goal.mp3';
import Mp3Cancel from '../../assets/sound/cancel.mp3';
import Mp3Finish from '../../assets/sound/finish.mp3';
import Mp3RedCard from '../../assets/sound/red-card.mp3';
import Mp3HalfTime from '../../assets/sound/half-time.mp3';
import Mp3Start from '../../assets/sound/start.mp3';

export const imageServer =
    window.location.hostname === 'localhost' ? 'http://localhost:5002' : 'https://www.ultraskor.com';

export const printImageSrc = path => {
    return imageServer + path;
};

export const getFromLocalStorage = page => {
    const persistState = localStorage.getItem(`ultraskor_${page}`);
    let result;
    if (persistState) {
        try {
            result = JSON.parse(persistState);
        } catch (e) {
            result = {};
        }
    }
    return result;
};

export const setToLocaleStorage = (page, data) => {
    localStorage.setItem(`ultraskor_${page}`, JSON.stringify(data));
};

export const testFunction = () => {};

export const audioFiles = {
    goal: new Audio(Mp3Goal),
    cancel: new Audio(Mp3Cancel),
    finish: new Audio(Mp3Finish),
    redcard: new Audio(Mp3RedCard),
    halftime: new Audio(Mp3HalfTime),
    start: new Audio(Mp3Start)
};

export const toggleValueInArray = (arr, val) => {
    return arr.indexOf(val) > -1 ? arr.filter(x => x !== val) : [...arr, val];
};

export const scrollToTop = isSmooth => {
    window.scrollTo({
        top: 0,
        ...(isSmooth && { behavior: 'smooth' })
    });
};

export const scrollTopOnClick = e => {
    if (e && (e.shiftKey || e.ctrlKey || e.metaKey)) return false;
    scrollToTop(false);
    return false;
};

export const isEmpty = obj => {
    return Object.keys(obj).length === 0;
};

const padZero = (str, len) => {
    len = len || 2;
    const zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
};

export const invertColor = (hex, isBlackOrWhite) => {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    let r = parseInt(String(hex).slice(0, 2), 16);
    let g = parseInt(String(hex).slice(2, 4), 16);
    let b = parseInt(String(hex).slice(4, 6), 16);
    if (isBlackOrWhite) {
        return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
    }
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    return `#${padZero(r)}${padZero(g)}${padZero(b)}`;
};

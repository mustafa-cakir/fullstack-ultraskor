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

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
            result = null;
        }
    }
    return result;
};

export const setToLocaleStorage = (page, data) => {
    delete data.data;
    localStorage.setItem(`ultraskor_${page}`, JSON.stringify(data));
};

export const testFunction = () => {};

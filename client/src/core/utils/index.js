export const imageServer =
    window.location.hostname === 'localhost' ? 'http://localhost:5002' : 'https://www.ultraskor.com';

export const printImageSrc = path => {
    return imageServer + path;
};
export const testFunction = () => {};

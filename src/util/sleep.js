/**
 * Returns a promise that resolves after a set amount of time.
 * You can await this promise to force the thread to sleep for some
 * amount of time.
 * @param {*} ms Time to sleep, in milliseconds
 * @returns {Promise} A Promise object
 */
 const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

 export default sleep; 
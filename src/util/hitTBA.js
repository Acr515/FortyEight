import { TBA_KEY } from "../config";

/**
 * Makes a request to The Blue Alliance.
 * @param {string} command The command to send to TBA
 * @param {function} callback A function to run when the server request is successful. Only param is a text response
 * @param {function} failCallback Optional. A function to run when the server request fails
 * @returns The server reponse in the form of a JSON object. This method **automatically** parses the response string
 */
 export default function hitTBA(command, callback, failCallback = () => {}) {
    const SERVER_PATH = "https://www.thebluealliance.com/api/v3/" + command;
    fetch(SERVER_PATH, {
        method: 'GET',
        headers:  {
			'Access-Control-Request-Method': 'GET',
            'Accept': 'application/json',
			'X-TBA-Auth-Key': TBA_KEY
        },
    }).then((response => { return response.text(); })).then((responseRaw) => {
        var responseJson = JSON.parse(responseRaw);
        return callback(responseJson);
    }).catch((error) => {
        console.error(error);
        return failCallback(error);
    });
}
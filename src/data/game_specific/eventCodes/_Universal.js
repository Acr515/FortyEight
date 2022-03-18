/**
 * Searches for an event in an event listing by code
 * @param {Event[]} events The event listing to look through
 * @param {string} code A string containing the event to look for 
 * @returns `null` if no event is found; otherwise, the event is returned
 */
export function findEvent(events, code) {
    let found = null;
    events.forEach(event => {
        if (event.code == code) found = event;
    });
    return found;
}
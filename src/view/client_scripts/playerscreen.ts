import { socket_listener_setup } from "./utils.js";


let name: string | undefined;        // name of this player
let auth_code: string | undefined;   // corresponding authentication code

/**
 * Send a message over the socket in a format that suits the server.
 * @param answer The answer to send. Always has to be a string type.
 */
export function socketMessage(answer: string) {
    const msg: {[key: string]: any} = {answer: answer};
    if (name && auth_code) {
        msg["name"] = name;
        msg["auth_code"] = auth_code;
    }
    socket.send(JSON.stringify(msg));
}

/**
 * An unsafe version of the `socketMessage` function, which in this case
 * allows the caller to send any object directly to the client. Will be used
 * by the lobby widget to send the login stuff
 * @param message The object to be sent
 */
export function socketMessageUnsafe(message: {[key: string]: any}) {
    socket.send(JSON.stringify(message));
}

/**
 * Set the name and auth code. Will now also be stored in session storage.
 * @param new_name The name to set
 * @param new_auth_code The auth_code to set
 */
export function setCreds(new_name: string, new_auth_code: string) {
    name = new_name;
    auth_code = new_auth_code;
    sessionStorage.setItem("name", new_name);
    sessionStorage.setItem("auth_code", new_auth_code);
}

// Setting up the socket:
const socket = new WebSocket(`ws://${window.location.host}`, "player");
socket_listener_setup(socket);

// First message to send. When it is able to load name and auth code, and these
// are valid according to the server, this will immediately cause a promotion.
socket.onopen = (ev) => {
    const tmp_name = sessionStorage.getItem("name");
    const tmp_auth_code = sessionStorage.getItem("auth_code");
    if (tmp_name && tmp_auth_code) {
        name = tmp_name;
        auth_code = tmp_auth_code;
    }
    socketMessage("-");
}

document.addEventListener("player_update", (event) => {
    // TODO (this is for showing your own score)
});
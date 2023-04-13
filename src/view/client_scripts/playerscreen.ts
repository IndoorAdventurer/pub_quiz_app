import { socket_listener_setup } from "./utils.js";


export let name: string | undefined;        // name of this player
export let auth_code: string | undefined;   // corresponding authentication code

/**
 * Send a message over the socket in a format that suits the server.
 * @param answer The answer to send. Always has to be a string type.
 */
export function socketMessage(answer: string) {
    const msg = {answer: answer};
    if (name && auth_code) {
        msg["name"] = name;
        msg["auth_code"] = auth_code;
    }
    socket.send(JSON.stringify(msg));
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
        auth_code = auth_code;
    }
    socketMessage("-");
}

document.addEventListener("player_state", (event) => {
    // TODO
});















/*
EXAMPLE IN CHROME:
const s = new WebSocket(`ws://${window.location.host}`, "player");
undefined
s.addEventListener("message", (event) => console.log("Msg!: ", event.data));
undefined
s.send(JSON.stringify({hi: "hello?"}));
undefined
VM746:1 Msg!:  {"widget_name":"lobby","general_info":{"all_players":{}}}
s.send(JSON.stringify({hi: "hello?"}));
undefined
VM746:1 Msg!:  {"widget_name":"lobby","general_info":{"all_players":{}}}
s.send(JSON.stringify({name: "vincent"}));
undefined
VM746:1 Msg!:  {"status":"success","auth_code":"90266"}
s.send(JSON.stringify({name: "vincent"}));
undefined 
*/
import {
    socket_listener_setup,
    add_fullscreen_functionality,
    add_wakelock_functionality
} from "./utils.js";


let name: string | undefined;        // name of this player
let auth_code: string | undefined;   // corresponding authentication code

// Setting up the socket (either over tls or not):
const protocol = document.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${protocol}//${window.location.host}`, "player");
socket_listener_setup(socket);
add_fullscreen_functionality();
add_wakelock_functionality();

// First message to send. When it is able to load name and auth code, and these
// are valid according to the server, this will immediately cause a promotion.
socket.onopen = ev => {
    const tmp_name = sessionStorage.getItem("name");
    const tmp_auth_code = sessionStorage.getItem("auth_code");
    if (tmp_name && tmp_auth_code) {
        name = tmp_name;
        auth_code = tmp_auth_code;
    }
    socketMessage("-");
}

/**
 * Send a message over the socket in a format that suits the server.
 * @param answer The answer to send. Always has to be a string type.
 */
export function socketMessage(answer: string) {
    answer = answer.trim();
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

// Update the info the player sees about him/herself
document.addEventListener("player_update", (event) => {
    const data = (event as CustomEvent).detail.player_update;
    const name_div = document.getElementById("player_name");
    const score_div = document.getElementById("player_score");
    if (name_div && score_div) {
        name_div.textContent = name || '-';
        score_div.textContent = data.score.toString() || '-';
    }
});


// Event listener for status codes:
document.addEventListener("server_status", (ev) => {
    const data = (ev as CustomEvent).detail;

    // Server tells us to forget any credentials because they were wrong:
    if (data.status === "forget_creds") {
        name = undefined;
        auth_code = undefined;
        sessionStorage.removeItem("name");
        sessionStorage.removeItem("name");
        socketMessage("-");
    }
    
    // Log user in if it received a success status
    if (data.name && data.auth_code)
        setCreds(data.name, data.auth_code);
});


// Add eventlistener to authorize button. Authorization page will show when
// player is not logged in, but we are also not in the lobby phase
document.addEventListener("authorize", (ev: Event) => {
    const authorize_btn = document.getElementById("authorize_btn");
    if (!authorize_btn)
        return;
    
    authorize_btn.onclick = (ev) => {
        const name =
            document.getElementById("authorize_name") as HTMLInputElement | null;
        const auth_code = document.getElementById("authorize_auth_code") as
            HTMLInputElement | null;
    
        if (name && auth_code &&
            name.value.length > 0 && auth_code.value.length > 0) {
        
            socketMessageUnsafe({
                name: name.value,
                auth_code: auth_code.value
            });
        }
    };
});


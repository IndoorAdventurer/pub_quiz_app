import { socket_listener_setup } from "./utils.js";

// Setting up the socket:
const socket = new WebSocket(`ws://${window.location.host}`, "admin");
socket_listener_setup(socket);

/**
 * Send a message over the websocket
 * @param msg The message to be sent: a javascript object.
 */
export function socketMessage(msg: { [key: string]: any }) {
    socket.send(JSON.stringify(msg));
}

// Adding listener for login button:
const login_btn = document.getElementById("login_panel_btn");
login_btn?.addEventListener("click", (ev) => {
    const name =
        document.getElementById("login_panel_name") as HTMLInputElement | null;
    const auth_code = document.getElementById("login_panel_auth_code") as
        HTMLInputElement | null;

    if (name && auth_code &&
        name.value.length > 0 && auth_code.value.length > 0) {

        socketMessage({ name: name.value, auth_code: auth_code.value });
    }
});

// Event listener for status codes:
document.addEventListener("server_status", (ev) => {
    const data = (ev as CustomEvent).detail;
    
    // If we receive a "logged in" staus, we are logged in and we can delete
    // the login div:
    if (data.status && data.status === "logged in") {
        const login_div = document.getElementById("login_panel");
        login_div?.parentElement?.removeChild(login_div);
    }
})
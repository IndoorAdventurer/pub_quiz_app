import { socket_listener_setup } from "./utils.js";

// Setting up the socket:
const socket = new WebSocket(`ws://${window.location.host}`, "bigscreen");
socket_listener_setup(socket);

document.addEventListener("player_update", (event) => {
    // TODO (this is for showing the top 3 players on the big screen)
});
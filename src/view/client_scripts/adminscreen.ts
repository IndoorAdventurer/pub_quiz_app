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
        login_div?.remove();
    }
})

// Add event listener for player updates and updating "player_data" div:
document.addEventListener("player_update", (ev) => {
    const player_data_tbody =
        document.getElementById("player_data")?.getElementsByTagName("tbody")[0];
    const data = (ev as CustomEvent).detail.player_update;
    if (!player_data_tbody)
        return;

    const clone = player_data_tbody.cloneNode(false);
    for (const row of data)
        clone.appendChild(create_player_row(row));
    player_data_tbody.parentElement?.replaceChild(clone, player_data_tbody);
});

function create_player_row(row_data: player_data_type): HTMLTableRowElement {
    // First col is name:
    const tr = document.createElement("tr");
    const name_th = document.createElement("th");
    name_th.textContent = row_data.name;
    tr.appendChild(name_th);

    // Second col is score. If you click it it lets you change the score
    const score_th = document.createElement("th");
    score_th.textContent = row_data.score.toString();
    score_th.style.cursor = "pointer";
    tr.appendChild(score_th);
    score_th.addEventListener("click", (ev) => {
        const score_text = prompt("New score for " + name_th.textContent);
        const score_num = parseInt(score_text || '')
        if (isNaN(score_num))
            return;
        socketMessage({
            action: "set_score",
            player: name_th.textContent,
            score: score_num
        });
    })

    // Third col is "isplaying" state. You can toggle this with a checkbox
    const is_playing_th = document.createElement("th");
    const check_box = document.createElement("input");
    check_box.type = "checkbox";
    check_box.checked = row_data.isplaying;
    is_playing_th.appendChild(check_box);
    tr.appendChild(is_playing_th);
    check_box.addEventListener("change", (ev) => {
        socketMessage({
            action: "set_isplaying",
            player: name_th.textContent,
            isplaying: check_box.checked
        });
    })

    // Fourth col is the remove button. Lets you remove a player
    const remove_th = document.createElement("th");
    const btn = document.createElement("button");
    btn.textContent = "Remove player";
    remove_th.appendChild(btn);
    tr.appendChild(remove_th);
    btn.addEventListener("click", (ev) => {
        if (confirm(`Are you sure you want to delete ${name_th.textContent}?`))
            socketMessage({
                action: "remove_player",
                player: name_th.textContent,
            });
    })


    return tr;
}

type player_data_type = { name: string, score: number, isplaying: boolean };
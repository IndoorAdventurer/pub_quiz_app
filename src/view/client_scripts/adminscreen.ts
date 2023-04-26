import { socket_listener_setup } from "./utils.js";

// Setting up the socket:
const socket = new WebSocket(`ws://${window.location.host}`, "admin");
socket_listener_setup(socket);

//---FUNCTION DEFINITIONS:------------------------------------------------------
/**
 * Send a message over the websocket
 * @param msg The message to be sent: a javascript object.
 */
export function socketMessage(msg: { [key: string]: any }) {
    socket.send(JSON.stringify(msg));
}

/**
 * Send a message about switching to another game state
 * @param idx The index into the list of game states to move to. If
 * `relative` is `true`, then the index will be relative to the current
 * state.
 * @param relative Boolean value. If `true`, it will considered `idx` to be
 * relative to the current state. I.e. if we are at state 5 and `idx` is 1,
 * we move to state 6. If `false` (default), it will consider `idx` as
 * absolute.
 */
function setGameState(idx: number, relative: boolean) {
    socketMessage({
        action: "set_game_state",
        idx: idx,
        relative: relative
    });
}


//---ADMIN LOGIN:---------------------------------------------------------------

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


//---GAMESTATE NAVIGATION:------------------------------------------------------

// Adding a listener for the "previous" button:
const game_nav_prev_btn = document.getElementById("game_nav_prev");
game_nav_prev_btn?.addEventListener("click", (ev) => {
    setGameState(-1, true);
});

// Adding a listener for the "next" button:
const game_nav_next_btn = document.getElementById("game_nav_next");
game_nav_next_btn?.addEventListener("click", (ev) => {
    setGameState(1, true);
});

// Adding functionality for relative checkbox
const game_nav_set_btn = document.getElementById("game_nav_set");
game_nav_set_btn?.addEventListener("click", (ev) => {
    const number_inp =
        document.getElementById("game_nav_num") as HTMLInputElement | null;
    const relative_checkbox = 
    document.getElementById("game_nav_relative") as HTMLInputElement | null;
    if (number_inp && number_inp.value.length > 0 && relative_checkbox) {
        setGameState(parseInt(number_inp.value), relative_checkbox.checked);
    }
});


//---ADDING PLAYERS AND SOCKETS OUTSIDE OF LOBBY:-------------------------------

// Adding a listener for the "new_player_add" button:
const new_player_add_btn = document.getElementById("new_player_add_btn");
new_player_add_btn?.addEventListener("click", (ev) => {
    const name_field =
        document.getElementById("new_player_name") as HTMLInputElement | null;
    if (name_field?.value && name_field.value.length > 0) {
        socketMessage({ action: "add_player", name: name_field.value });
        name_field.value = "";
    }
});

// Set a wildcard code a player can use to login outside of the lobby state
const set_code_btn = document.getElementById("set_code_btn");
set_code_btn?.addEventListener("click", (ev) => {
    const code_field = document.getElementById("new_socket_auth_code") as
        HTMLInputElement | null;
    if (code_field?.value && code_field.value.length > 0) {
        socketMessage({
            action: "set_wildcard_auth",
            auth_code: code_field.value
        });
        code_field.value = "";
    }
});


//---STANDARD EVENT LISTENERS:--------------------------------------------------

// Event listener for status codes:
document.addEventListener("server_status", (ev) => {
    const data = (ev as CustomEvent).detail;

    if (data.status === "state_info") {
        const info_span = document.getElementById("state_info");
        if (info_span) {
            const at: number = data.widget_index + 1;
            const of: number = data.num_widgets;
            const wname: string = data.widget_name;
            info_span.textContent =
                `At state ${at} of ${of} (${wname})`;
        }
    }
    
    // If we receive a "logged in" status, we are logged in and we can delete
    // the login div:
    if (data.status === "logged in") {
        const login_div = document.getElementById("login_panel");
        login_div?.remove();
    }
});

// Add event listener for player updates and that redraws "player_data" div:
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


//---EXTRA FUNCTIONS:-----------------------------------------------------------

/**
 * Creates a single row for the `player_data` table, corrseponding to a single
 * player.
 * @param row_data The data to put into the row
 * @returns The row, such that you can do: `table.appendChild(row)`
 */
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
    });

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
    });

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
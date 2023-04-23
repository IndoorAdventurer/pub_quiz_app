import { socket_listener_setup } from "./utils.js";

// Setting up the socket:
const socket = new WebSocket(`ws://${window.location.host}`, "bigscreen");
socket_listener_setup(socket);

// Showing the top n players and their scores:
document.addEventListener("player_update", (event) => {
    const data = (event as CustomEvent).detail.player_update;
    const leaderboard = document.getElementById("leaderboard");
    if (!leaderboard)
        return;
    
    const clone = leaderboard.cloneNode(false);

    for (let idx = 0; idx != data.length; ++idx) {
        const card_div = document.createElement("div");
        card_div.className = "player_card";

        const nth_div = document.createElement("div");
        nth_div.className = "player_card_nth";
        nth_div.textContent = (idx + 1).toString();
        card_div.appendChild(nth_div)
        
        const name_div = document.createElement("div");
        name_div.className = "player_card_name";
        name_div.textContent = data[idx].name;
        card_div.appendChild(name_div);

        const score_div = document.createElement("div");
        score_div.className = "player_card_score";
        score_div.textContent = data[idx].score.toString();
        card_div.appendChild(score_div);

        clone.appendChild(card_div);
    }

    leaderboard.parentElement?.replaceChild(clone, leaderboard);

});
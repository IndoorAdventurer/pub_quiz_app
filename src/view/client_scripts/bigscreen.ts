import { socket_listener_setup } from "./utils.js";

// Setting up the socket (either over tls or not):
const protocol = document.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${protocol}//${window.location.host}`, "bigscreen");
socket_listener_setup(socket);

// Showing the top n players and their scores:
document.addEventListener("player_update", (event) => {
    const data: player_data | undefined = (event as CustomEvent).detail.player_update;
    if (!data)
        return;
    
    let map = make_name_map();

    const wait_300ms = fade_out_players(data, map);
    map = map.length < data.length ? [] : map;
    
    if (wait_300ms)
        setTimeout(() => update_leaderboard(data, map), 300);
    else
        update_leaderboard(data, map);

});


/**
 * Finds all existing player cards and maps them to the corresponding name.
 * @returns A table where each row contains a player name and the corresponding
 * *existing* "player_card" `div`. The order is the order from left to right,
 * i.e. the #1 player is idx 0 etc., so that is some extra info you have.
 */
function make_name_map() {
    const map: [string, HTMLElement][] = [];

    const name_divs = document.getElementsByClassName("player_card_name");
    for (const div of name_divs)
        if (div.textContent && div.parentElement)
            map.push([div.textContent, div.parentElement]);

    return map;
}

/**
 * Finds all players that were in the leaderboard on the previous update, but
 * are not anymore in the previous message. It will make these show a fading
 * animation, by translating it out of view.
 * 
 * If the number of divs in `map` is lower than the number of players specified
 * in `data`, all divs get faded out.
 * @param data The message received from the server, giving names and scores
 * @param map The map gotten from `make_name_map`
 * @returns True if it made any changes. False otherwise.
 */
function fade_out_players(data: player_data, map: [string, HTMLElement][]) {
    let made_changes = false;

    for (const [name, card] of map) {
        if (!data.some(elem => elem.name === name) || map.length < data.length) {
            card.style.transform = "translateY(50vh)";
            made_changes = true;
        }
    }

    return made_changes;
}

/**
 * Completely redraws the leaderboard. Also animates them by making them swap
 * places if a swap occurs, or making them come in from the bottom if a new
 * player makes it to the leaderboard.
 * @param data The message received from the server, giving names and scores
 * @param map The map gotten from `make_name_map`
 * @returns 
 */
function update_leaderboard(data: player_data, map: [string, HTMLElement][]) {
    const leaderboard = document.getElementById("leaderboard");
    if (!leaderboard)
        return;
    
        const clone = leaderboard.cloneNode(false);
        const arr: HTMLDivElement[] = [];

        for (let idx = 0; idx != data.length; ++idx) {
            const card_div = document.createElement("div");
            card_div.className = "player_card";
            
            // grey out nonplayers:
            if (!data[idx].isplaying) {
                card_div.style.backgroundColor = "#ababab";
                card_div.style.color = "#5c5c5c";
            }
    
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

            const elem = map.find(([name]) => name === data[idx].name)?.[1];
            if (elem && idx < map.length) {
                const old_x = elem.getBoundingClientRect().x;
                const new_x = map[idx][1].getBoundingClientRect().x
                card_div.style.transform = `translateX(${old_x - new_x}px)`;
            }
            else {
                card_div.style.transform = "translateY(70vh)";
            }
    
            clone.appendChild(card_div);
            arr.push(card_div);
        }
    
        leaderboard.parentElement?.replaceChild(clone, leaderboard);

        setTimeout(() => arr.forEach(elem => elem.style.transform = "none"), 30);
}

type player_data = {name: string, score: number, isplaying: boolean}[];
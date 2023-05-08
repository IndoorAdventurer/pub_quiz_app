import { socketMessage } from "../client_scripts/adminscreen.js";
(function() {

    let groupMap: Map<string, [number, string[]]> | undefined;
    let selectedPlayer: [string, string] | undefined;
    let selected_span: HTMLElement | undefined;

    document.addEventListener("lobby", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const names: string[] = msg?.general_info?.all_players;
        const scores: number[] = msg?.general_info?.all_scores;
        const clear_btn = document.getElementById("remove_all_players_btn");
        if (!names || !scores || !clear_btn || names.length !== scores.length)
            return;
        
        // If you press the clear button, it first stores all names/scores in
        // `groupMap`, and then sends command to server to remove all players:
        clear_btn.onclick = (ev) => {
            groupMap = new Map();
            for (let idx = 0; idx !== names.length; ++idx)
                groupMap.set(names[idx], [scores[idx], []]);
            socketMessage({ action: "remove_all_players" });
        }
        
        // Draw the table for linking players to groups:
        drawTable(names);

    });

    /**
     * Draws the table showing groups together with players in that group
     * @param names The names of all players received from the server
     */
    function drawTable(names: string[]) {
        const table = document.getElementById("player_group_table");
        selected_span = document.getElementById("selected_player") || undefined;
        if (!groupMap || !table || !selected_span)
            return;
        
        // Add none_group to map. Add all players to it that arent in any group:
        groupMap.set("none_group", [1, []]);
        for (const name of names) {
            const isIn = Array.from(groupMap.values()).some(([, sArr]) => {
                return sArr.indexOf(name) !== -1;
            });
            if (!isIn)
                groupMap.get("none_group")?.[1].push(name);
        }

        // Draw table where first column is group name, and rest are players:
        const clone = table.cloneNode(false);
        for (const [group_name, [score, players]] of groupMap) {
            
            // Add group name element:
            const tr = document.createElement("tr");
            const th_first = document.createElement("th");
            th_first.textContent = `${group_name} (${score} points)`;
            tr.appendChild(th_first);

            // Give it onclick listener to add selected player to group:
            th_first.onclick = ev => group_btn_click(group_name);

            // Add all player names to the list:
            for (const player of players) {
                const th = document.createElement("th");
                th.textContent = player;
                tr.appendChild(th);
                th.onclick = ev => {
                    selectedPlayer = [player, group_name];
                    if (selected_span)
                        selected_span.textContent = player;
                }
            }
            clone.appendChild(tr);
        }
        table.parentElement?.replaceChild(clone, table);
    }

    /**
     * Function that is called when you click on a group button. Puts selected
     * player in that group.
     * @param group_name The name of the group associated with the button
     */
    function group_btn_click(group_name: string) {
        if (!selectedPlayer || !selected_span || !groupMap)
            return;
        
        // Remove player from list it came from:
        const from_list = groupMap.get(selectedPlayer[1])?.[1];
        const idx = from_list?.indexOf(selectedPlayer[0]);
        if (!from_list || idx === undefined || idx === -1)
            return;
        from_list.splice(idx, 1);

        // Add player to list of group it is moved to:
        groupMap.get(group_name)?.[1].push(selectedPlayer[0]);

        // Update the score of the selected player (this will also redraw all
        // because lobby is a player listener):
        socketMessage({
            action: "set_score",
            player: selectedPlayer[0],
            score: groupMap.get(group_name)?.[0]
        });

        selectedPlayer = undefined;
        selected_span.textContent = "-";
    }
})();
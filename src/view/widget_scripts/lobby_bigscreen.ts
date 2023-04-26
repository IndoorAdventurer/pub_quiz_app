(function() {

    document.addEventListener("lobby", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg.general_info;
        const players = msg.all_players;

        // Display message on the screen
        const msg_div = document.getElementById("welcome_msg");
        if (msg_div && msg_div.textContent !== msg.big_screen_msg)
            msg_div.textContent = msg.big_screen_msg || "😊";

        // Update the list of names with the array of names gotten from the
        // server
        const html_list = document.getElementById("lobby_player_list");
        if (html_list) {
            const new_list = html_list.cloneNode(false);
            for (const player of players) {
                const player_div = document.createElement("div");
                player_div.className = "lobby_player_li";
                player_div.innerHTML = player
                new_list.appendChild(player_div);
            }
            html_list.parentElement?.replaceChild(new_list, html_list);
        }
    });

})();
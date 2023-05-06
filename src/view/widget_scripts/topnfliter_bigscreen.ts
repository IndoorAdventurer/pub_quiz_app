(function(){
    
    // Type for received array:
    type player_data_arr = {name: string, score: number}[];
    
    document.addEventListener("topnfliter", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const top_n_data: player_data_arr = msg?.general_info?.top_n;
        const top_n_span = document.getElementById("top_n_span");
        const hero_ol = document.getElementById("hero_ol");
        if (!top_n_data || !top_n_span || !hero_ol)
            return;
        
        // Specify in the titel how long the top N list is:
        top_n_span.textContent = top_n_data.length.toString();
        
        // Show the list of players left over:
        const clone = hero_ol.cloneNode(false);
        for (const p_dat of top_n_data) {
            const li = document.createElement("li");
            li.textContent = `${p_dat.name} (${p_dat.score} punten)`
            clone.appendChild(li);
        }
        hero_ol.parentElement?.replaceChild(clone, hero_ol);
    });
})();
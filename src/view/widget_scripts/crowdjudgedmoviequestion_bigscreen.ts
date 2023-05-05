import { crowdJudgedRedraw } from "../client_scripts/crowdjudgedutils.js"
(function(){
    document.addEventListener("crowdjudgedmoviequestion", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        
        // Show the answers that were already given and name of active player:
        crowdJudgedRedraw(msg, "answers_list", "active_player_span");
    });
})();
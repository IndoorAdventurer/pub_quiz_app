import { crowdJudgedRedraw } from "../client_scripts/crowdjudgedutils.js"
(function(){
    document.addEventListener("cjudgedopenquestion", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;

        // Show the answers that were already given:
        crowdJudgedRedraw(msg, "answers_list", "active_player_span");

        // Show the question:
        const qfield = document.getElementById("question_field");
        if (!msg?.general_info?.question || !qfield)
            return;
        
        qfield.textContent = msg.general_info.question;

    });
})();
import { crowdJudgedRedraw } from "../client_scripts/crowdjudgedutils.js";
(function(){
    document.addEventListener("crowdjudgedshowanswers", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        
        crowdJudgedRedraw(msg, "answers_list");
    });
})();
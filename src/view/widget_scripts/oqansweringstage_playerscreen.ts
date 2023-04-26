import { socketMessage } from "../client_scripts/playerscreen.js"
(function(){
    document.addEventListener("oqansweringstage", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const msg_old = (ev as CustomEvent).detail.old_msg;

        const question: string | undefined = msg?.general_info?.question;
        
        // Not the first time this screen gets drawn, so ignoring:
        if (!question || question === msg_old?.general_info?.question)
            return;

        const q_field = document.getElementById("question_field");
        
        if (q_field)
            q_field.textContent = question;
        
        // Adding event listener to button:
        const oq_btn = document.getElementById("oq_btn");

        if (!oq_btn)
            return;

        oq_btn.onclick =  (ev) => {
            const oq_inp = document.getElementById("oq_input") as
                HTMLInputElement | null;
            if (oq_inp && oq_inp.value.length > 0)
                socketMessage(oq_inp.value);
        };
    });
})();
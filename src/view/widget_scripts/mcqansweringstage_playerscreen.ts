import { socketMessage } from "../client_scripts/playerscreen.js"
(function(){

    const bigA = "A".charCodeAt(0);

    document.addEventListener("mcqansweringstage", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const msg_old = (ev as CustomEvent).detail.old_msg;

        const question: string | undefined = msg?.general_info?.question;
        
        // Not the first time this screen gets drawn, so ignoring:
        if (!question || question === msg_old?.general_info?.question)
            return;

        const q_field = document.getElementById("question_field");
        
        if (q_field)
            q_field.textContent = question;

        
        // Adding the buttons:
        const options: string[] | undefined = msg?.general_info?.options;
        const btn_div = document.getElementById("mc_buttons");

        if (options && btn_div) {
            const clone = btn_div.cloneNode(false);
            for (let idx = 0; idx != options.length; ++idx) {
                const btn = document.createElement("button");
                btn.className = "color-list-li";

                const span = document.createElement("span");
                span.textContent = String.fromCharCode(bigA + idx);
                btn.appendChild(span);

                btn.append(document.createTextNode(options[idx]));

                // Adding onclick listener:
                btn.onclick = ev => socketMessage(options[idx]);

                clone.appendChild(btn);
            }
            btn_div.parentElement?.replaceChild(clone, btn_div);
        }
    });
})();
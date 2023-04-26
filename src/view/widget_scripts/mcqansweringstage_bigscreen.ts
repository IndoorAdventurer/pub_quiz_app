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

        
        // Adding the multiple choice options to the screen:
        const options: string[] | undefined = msg?.general_info?.options;
        const mc_list = document.getElementById("mc_list");

        if (options && mc_list) {
            const clone = mc_list.cloneNode(false);
            for (let idx = 0; idx != options.length; ++idx) {
                const option_div = document.createElement("div");
                option_div.className = "color-list-li";

                const span = document.createElement("span");
                span.textContent = String.fromCharCode(bigA + idx);
                option_div.appendChild(span);

                option_div.append(document.createTextNode(options[idx]));

                clone.appendChild(option_div);
            }
            mc_list.parentElement?.replaceChild(clone, mc_list);
        }
    });
})();
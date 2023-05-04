(function(){
    document.addEventListener("connectionansweringstage", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        if (!msg?.general_info?.connection_answers)
            return;
        
        const answ_list = document.getElementById("connection_answers");
        if (!answ_list)
            return;
        
        // Display the list of answers on screen:
        const clone = answ_list.cloneNode(false);
        const answers: string[] = msg.general_info.connection_answers;
        for (const answ of answers) {
            const a_div = document.createElement("div");
            a_div.textContent = answ;
            clone.appendChild(a_div);
        }

        answ_list.parentElement?.replaceChild(clone, answ_list);
    });
})();
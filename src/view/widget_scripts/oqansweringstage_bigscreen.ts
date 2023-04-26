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
    });
})();
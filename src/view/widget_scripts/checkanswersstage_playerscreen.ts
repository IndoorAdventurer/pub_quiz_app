(function(){
    document.addEventListener("checkanswersstage", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg.player_specific_info;
        const msg_old = (ev as CustomEvent).detail.old_msg;
        
        // We already did it:
        if (msg_old.widget_name === "checkanswersstage")
            return;
        
        const main = document.getElementById("main");
        
        // Showing player if he/she answered correctly:
        if (msg?.answer_correct)
            main?.appendChild(document.createTextNode("💃🎈🥳"));
        else
            main?.appendChild(document.createTextNode("😿🥺😭"));

    });
})();
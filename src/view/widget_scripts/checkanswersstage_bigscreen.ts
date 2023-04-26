// Use following function in player widgets to send message to server:
// import { socketMessage } from "../client_scripts/playerscreen.js"
(function(){
    document.addEventListener("checkanswersstage", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg?.general_info;
        const msg_old = (ev as CustomEvent).detail.old_msg?.general_info;
        
        // Check if we already did it:
        if (!("answer" in msg) || msg.answer === msg_old?.answer)
            return;

        // Showing the message on screen:
        const ans_span = document.getElementById("answer_span");

        if (!ans_span)
            return;
        
        ans_span.textContent = msg.answer;
    });
})();
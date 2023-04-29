// Use following function in player widgets to send message to server:
// import { socketMessage } from "../client_scripts/playerscreen.js"
(function(){
    document.addEventListener("crowdjudge_np", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        // const msg_old = (ev as CustomEvent).detail.old_msg;
        // TODO
    });
})();
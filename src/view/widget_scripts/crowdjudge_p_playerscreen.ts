import { socketMessage } from "../client_scripts/playerscreen.js"
(function () {
    document.addEventListener("crowdjudge_p", (ev: Event) => {
        const msg_old = (ev as CustomEvent).detail.old_msg;

        // Already did it:
        if (msg_old?.widget_name === "crowdjudge_p")
            return;

        const pass_btn = document.getElementById("crowd_pass_btn");
        if (!pass_btn)
            return;

        // Pass button simply sends "PASS":
        pass_btn.onclick = (ev) => {
            socketMessage("pass");
        }
    });
})();
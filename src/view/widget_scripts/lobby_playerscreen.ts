import { setCreds, socketMessageUnsafe } from "../client_scripts/playerscreen.js"

(function() {
    
    document.addEventListener("lobby", (ev: Event) => {
        const data = (ev as CustomEvent).detail;

        // Adding listener to button:
        if (data.old_msg.widget_name !== data.new_msg.widget_name) {
            const inp = (document.getElementById("lobby_name_field") as
                HTMLInputElement | null);
            const btn = document.getElementById("lobby_btn");
            
            btn?.addEventListener("click", (ev) => {
                if (inp?.value) {
                    socketMessageUnsafe({name: inp.value});
                }
            });
        }

        // We received an auth_code! Saving it and going to wait screen.
        if (data.new_msg.name && data.new_msg.auth_code) {
            setCreds(data.new_msg.name, data.new_msg.auth_code);
            
            const main = document.getElementsByClassName("main")[0];
            const wait_screen = document.getElementById("wait_screen");
            if (wait_screen) {
                main.id = wait_screen.id;
                main.innerHTML = wait_screen.innerHTML;
            }
        }
    });

})();
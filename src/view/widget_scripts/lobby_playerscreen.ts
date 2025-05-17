import { socketMessageUnsafe } from "../client_scripts/playerscreen.js"

(function() {
    
    document.addEventListener("lobby", (ev: Event) => {
        const data = (ev as CustomEvent).detail;

        // Adding listener to button:
        if (data.old_msg.widget_name !== data.new_msg.widget_name) {
            const inp = (document.getElementById("lobby_name_field") as
                HTMLInputElement | null);
            const btn = document.getElementById("lobby_btn");
            
            if (!btn)
                return;
            
            btn.onclick = (ev) => {
                if (inp?.value) {
                    // Manually trimming away whitespace: we don't want "Michiel"
                    // and "Michiel " to be different names...
                    const trimmed_name = inp.value.trim();

                    if (trimmed_name.length > 0)
                        socketMessageUnsafe({name: inp.value.trim()});

                }
            };
        }
    });

})();
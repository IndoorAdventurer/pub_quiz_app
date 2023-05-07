import { socketMessage } from "../client_scripts/adminscreen.js";
(function(){
    
    const curlyRegEx = /{([^}]*)}/g;
    
    document.addEventListener("finalconnection", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const raw_text: string = msg?.admin_info?.text;
        const text_p = document.getElementById("finalconnection_text");
        if (!raw_text || !text_p)
            return;
        
        // Show text, but put keywords in own span:
        const innerhtml = raw_text.replace(
            curlyRegEx,
            `<span class="connection_text_highlight">$1</span>`);
        text_p.innerHTML = innerhtml;

        // onclick listener that directly sends the word clicked on to server:
        text_p.onclick = (ev) => {
            const target = ev.target as HTMLElement;
            if (target.className !== "connection_text_highlight")
                return;
            
            socketMessage({ keyword: target.textContent });
        }
    });
})();
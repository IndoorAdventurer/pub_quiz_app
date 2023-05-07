// Use following function in player widgets to send message to server:
// import { socketMessage } from "../client_scripts/playerscreen.js"
(function(){
    document.addEventListener("finalconnection", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const keywords: string[] = msg?.general_info?.given_keywords;
        const kw_list = document.getElementById("connection_answers");
        if (!keywords || !kw_list)
            return;
        
        // Display the list of answers on screen:
        const clone = kw_list.cloneNode(false);
        for (const keyword of keywords) {
            const a_div = document.createElement("div");
            a_div.textContent = keyword;
            clone.appendChild(a_div);
        }

        kw_list.parentElement?.replaceChild(clone, kw_list);
    });
})();
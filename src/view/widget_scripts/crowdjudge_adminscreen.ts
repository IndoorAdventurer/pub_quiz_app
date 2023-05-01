import { socketMessage } from "../client_scripts/adminscreen.js";
(function () {
    document.addEventListener("crowdjudge", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const ap_div = document.getElementById("active_player_div");
        if (!msg?.general_info?.active_player || !ap_div)
            return;
        ap_div.textContent = msg.general_info.active_player;

        const amap: { [key: string]: [number, number] } | undefined =
            msg.general_info.answer_map;
        const container = document.getElementById("btn_container_div");
        if (!amap || !container)
            return;

        // For each answer a button. If admin clicks, will immediately be marked
        // as given:
        const clone = container.cloneNode(false);
        for (const answer in amap) {
            const btn = document.createElement("button");
            btn.style.height = "10rem";  // Fitts law :-p I need to be fast
            btn.style.padding = "1rem 3rem 1rem 3rem";
            const y = Math.round(amap[answer][0] * 100);
            const n = Math.round(amap[answer][1] * 100);
            btn.textContent = `${answer} (y=${y}, n=${n})`;
            btn.ondblclick = (ev) => socketMessage({ answer: answer });
            clone.appendChild(btn);
        }
        container.parentElement?.replaceChild(clone, container);

        // Only doing next part twice:
        const old_msg = (ev as CustomEvent).detail.old_msg;
        if (old_msg?.widget_name === "crowdjudge")
            return;
        
        // Set the threshold change listeners:
        for (const th of ["correct_threshold", "incorrect_threshold"]) {
            const btn = document.getElementById(th + "_btn");
            if (!btn)
                continue;
            btn.onclick = (ev) => {
                const inp = document.getElementById(th + "_inp");
                if (!inp)
                    return;
                const msg: {[key: string]: number} = {};
                msg[th] = parseFloat((inp as HTMLInputElement).value);
                socketMessage(msg);
            }
            
        }
    });
})();
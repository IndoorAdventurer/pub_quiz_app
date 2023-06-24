import { socketMessage } from "../client_scripts/playerscreen.js"
(function () {
    document.addEventListener("crowdjudge_np", (ev: Event) => {
        const msg: any | undefined = (ev as CustomEvent).detail.new_msg;
        const container = document.getElementById("voting_container");
        if (!msg?.general_info?.answer_map || !container)
            return;
        
        // Get all data and clone container:
        const amap: [string, number, number][] = msg.general_info.answer_map;
        const [yes, no] = getOwnAnswers(msg);
        const clone = container.cloneNode(false);

        // For each answer add a trey with a yes button and an optional no btn
        for (const [answer, yVal, nVal] of amap) {
            const trey = document.createElement("div");
            trey.className = "voting_trey";

            // Only show nope button if at least one person clicked yes
            // and the answer wasn't marked given yet:
            if (yVal > 0 && yVal !== 1) {
                const no_btn = 
                    createButtonDiv("no_btn", nVal, answer, no.has(answer));
                trey.appendChild(no_btn);
            }

            const yes_btn =
                createButtonDiv("yes_btn", yVal, answer, yes.has(answer));
            trey.appendChild(yes_btn);

            clone.appendChild(trey);
        }
        container.parentElement?.replaceChild(clone, container);

    });

    /**
     * We possibly get two lists back from the server: one containing all
     * question the player voted yes on, and the other where he/she voted no
     * on. This function takes the message `msg` as input, and returns two sets
     * based on these array. Might, ofc, be empty
     */
    function getOwnAnswers(msg: any): [Set<string>, Set<string>] {
        if (!msg?.player_specific_info?.pmap)
            return [new Set(), new Set()];

        const map: [string[], string[]] = msg.player_specific_info.pmap;
        return [new Set(map[0]), new Set(map[1])];
    }

    /**
     * Each answer has associated with it a yes and an optional no button, which
     * players use to vote. This function can make both of these types.
     * @param cls The css class to give to this button. Can either be "yes_btn"
     * or "no_btn"
     * @param fill The button is also like a loading bar. Say what portion of
     * the button should be filled from 0 to 1.
     * @param answer The answer this button regards
     * @param given A boolean stating if this player gave the answer already. If
     * so, a "✓" will be prepended 😊
     * @returns The div that represents a button. Not using an actual button
     * because I don't want to use the button css.
     */
    function createButtonDiv(
        cls: "yes_btn" | "no_btn",
        fill: number, 
        answer: string,
        given: boolean
    ) {
        const isyes = cls === "yes_btn";
        const isfilled = fill === 1;
        let text = isyes ? answer : "";
        text = given && isyes ? "✓ " + text : text;

        // Creating div and adding basic properties:
        const btn = document.createElement("div");
        btn.textContent = text;
        btn.className = isyes && isfilled ? "yes_btn_filled" : cls;
        btn.style.setProperty("--fill", `${Math.round(100 * fill)}%`);

        // Only not filled up buttons are still clickable:
        if (!isfilled)
            btn.onclick = ev => socketMessage((isyes ? "Y" : "N") + answer);

        return btn;
    }

})();
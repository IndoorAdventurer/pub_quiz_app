import { socketMessage } from "../client_scripts/adminscreen.js";
(function(){
    document.addEventListener("adminanswercheck", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg?.admin_info;
        const msg_old = (ev as CustomEvent).detail.old_msg;
        
        // Ignore if we get the same message twice. Assuming corresponding
        // game state can't occur twice in a row for this, ofc. And also that
        // no extra data can be added during this state.
        if (msg_old?.widget_name === "adminanswercheck")
            return;
        
        const answer_p = document.getElementById("exemplar_answer");
        const table = document.getElementById("player_answer_table");
        const player_answers: [string, string][] | undefined = msg.player_answers;

        if (!answer_p || !table || !player_answers)
            return;
        
        // Showing admin what the answer should be:
        answer_p.textContent = msg?.exemplar_answer || "-";

        // Mapping between answers and checkbox elements:
        const ans_chckbx_mp: [string, HTMLInputElement][] = [];

        // Drawing table and collecting table:
        table.innerHTML = "";
        for (const [name, answer] of player_answers) {
            const [tr, check_box] = create_answer_row(name, answer);
            table.appendChild(tr);
            ans_chckbx_mp.push([answer, check_box]);
        }

        // Setting the button listener:
        const btn = document.getElementById("submit_correct_answers");
        if (!btn)
            return;
        
        btn.onclick = (ev) => {
            
            // Getting all answers where the checkbox is checked:
            const correct_answers = ans_chckbx_mp
                .filter(([_, chck_bx]) => chck_bx.checked)
                .map(([answer]) => answer);
            
            // And sending it:
            socketMessage({correct_answers: correct_answers});
        };

    });

    /**
     * Auxilary function that creates a row for the table described above:
     * @param name Name of a player
     * @param answer The answer this player gave
     * @returns Returns two thing. The first is simply the row element, so it
     * can be appended to the table. The second is a reference to the checkbox
     * so we have it later when the button is pressed and we need to collect all
     * the checkbox values :-)
     */
    function create_answer_row(name: string, answer: string):
        [HTMLTableRowElement, HTMLInputElement] {
        const tr = document.createElement("tr");

        // Name:
        const name_th = document.createElement("th");
        name_th.textContent = name;
        tr.appendChild(name_th);

        // Answer:
        const ans_th = document.createElement("th");
        ans_th.textContent = answer;
        tr.appendChild(ans_th);

        // Checkbutton:
        const check_th = document.createElement("th");
        const check_box = document.createElement("input");
        check_box.type = "checkbox";
        check_th.appendChild(check_box);
        tr.appendChild(check_th);

        return [tr, check_box];
    }

})();
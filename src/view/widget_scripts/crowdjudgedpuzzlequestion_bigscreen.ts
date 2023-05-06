import { crowdJudgedRedraw } from "../client_scripts/crowdjudgedutils.js"
(function () {

    // same as defined in src/view/widgets_css/colorlist.css:
    const color_list = [
        "rgb(255, 182, 99)",
        "rgb(102, 181, 255)",
        "rgb(127, 202, 97)",
        "rgb(255, 145, 206)"
    ];

    // Type we get from the server:
    type keywords_type = { keyword: string, answer: string }[];

    document.addEventListener("crowdjudgedpuzzlequestion", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;

        // Show the answers that were already given:
        const liMap = crowdJudgedRedraw(msg, "answers_list", "active_player_span");
        if (!liMap)
            return;

        // Create map from answers to colors:
        const answers: string[] = msg?.general_info?.answers;
        const colorMap = new Map<string, string>();
        for (let idx = 0; idx !== answers.length; ++idx)
            colorMap.set(answers[idx], color_list[idx % color_list.length]);

        // Giving all given answers their associated color:
        for (const [answer, li] of liMap) {
            const color = colorMap.get(answer);
            if (color)
                li.style.color = color;
        }

        // Creating the table:
        const keywords: keywords_type = msg?.general_info?.keywords;
        const numColumns = msg?.general_info?.x1;
        const puzzle_table = document.getElementById("puzzle_table");
        if (!keywords || !numColumns || !puzzle_table)
            return;

        const clone = puzzle_table.cloneNode(false);
        while (keywords.length !== 0) {
            const tr = document.createElement("tr");
            for (let idx = 0; idx !== numColumns; ++idx) {
                const kw = keywords.pop();
                if (!kw)
                    break;

                const th = document.createElement("th");
                th.textContent = kw.keyword;
                const color = colorMap.get(kw.answer);  // giving them the color
                if (color) {                            // of associated answer
                    th.style.backgroundColor = color;   // if given
                    th.style.color = "white";
                }

                tr.appendChild(th);

            }
            clone.appendChild(tr);
        }

        puzzle_table.parentElement?.replaceChild(clone, puzzle_table);

    });
})();
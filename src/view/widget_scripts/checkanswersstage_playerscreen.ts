(function(){
    
    const right_gif = "/img/correct_ans_gif.gif";
    
    // Gifs showing that the answer is wrong 😈:
    const wrong_gifs = [
        "/img/wrong_ans_gif1.gif",
        "/img/wrong_ans_gif2.gif",
        "/img/wrong_ans_gif3.gif",
        "/img/wrong_ans_gif4.gif",
        "/img/wrong_ans_gif5.gif",
        "/img/wrong_ans_gif6.gif",
        "/img/wrong_ans_gif7.gif",
        "/img/wrong_ans_gif8.gif",
        "/img/wrong_ans_gif9.gif",
        "/img/wrong_ans_gif10.gif"
    ];

    // Pre-loading the gifs:
    [...wrong_gifs, right_gif].forEach((file) => {
        const img = new Image();
        img.src = file;
    });
    
    
    /**
     * Spectacular reveal with GIFs and colors to show an answer :-)
     * @param path 
     * @param bg_color 
     */
    function reveal_answer(path: string, bg_color: string, bg_delay: number) {
        const main = document.getElementById("main");

        // Adding a GIF:
        const gif = document.createElement("img");
        gif.id = "eval_gif";
        gif.src = path;
        gif.alt = "Je hebt het goed of slecht, maar de GIF laadt niet..";
        main?.appendChild(gif);

        // Temporarily changing background with big div:
        const bg = document.createElement("div");
        bg.id = "color_bg";
        bg.style.backgroundColor = bg_color;
        main?.appendChild(bg);

        // bg is transparant at start. Making it opaque after some time:
        setTimeout(() => bg.style.opacity = "1", bg_delay);
    }
    
    document.addEventListener("checkanswersstage", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg.player_specific_info;
        const msg_old = (ev as CustomEvent).detail.old_msg;
        
        // We already did it:
        if (msg_old.widget_name === "checkanswersstage")
            return;
        
        const main = document.getElementById("main");
        
        // Showing player if he/she answered correctly:
        if (msg?.answer_correct)
            reveal_answer(right_gif, "#004500", 1900);
        else {
            const img = wrong_gifs[Math.floor(Math.random() * wrong_gifs.length)];
            reveal_answer(img, "#530101", 50);
        }
    });
})();
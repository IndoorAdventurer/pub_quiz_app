(function(){
    
    // Indeces for moving around 3 x 3 table in clockwise direction:
    const conversion_table = [0, 1, 2, 5, 8, 7, 6, 3];
    
    document.addEventListener("horsejump", (ev: Event) => {
        // Adding horse jump to table:
        const msg = (ev as CustomEvent).detail.new_msg;
        const word: string = msg?.general_info?.scrambled_word;
        const table = document.getElementById("hj_table");
        const thArr = table?.getElementsByTagName("th");
        if (!word || !thArr || thArr.length !== 9)
            return;
        
        for (let idx = 0; idx !== 8; ++idx) {
            const i = conversion_table[idx];
            const ch = word[idx];
            thArr[i].textContent = ch;
        }

        // Set duration for time bar (i.e. hourglass⌛):
        const time = msg.general_info.time_seconds;
        const tBar = document.getElementById("hj_timebar");
        if (!time || !tBar)
            return;
        
        tBar.style.setProperty("--time_to_fill", `${time}s`);

    });
})();
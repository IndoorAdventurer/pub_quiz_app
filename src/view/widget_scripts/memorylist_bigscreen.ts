(function(){
    document.addEventListener("memorylist", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        
        // Show list of items:
        const list: string[] = msg?.general_info?.list;
        const ol = document.getElementById("memory_ol");
        if (!list || !ol)
            return;
        
        const clone = ol.cloneNode(false);
        for (const item of list) {
            const li = document.createElement("li");
            li.textContent = item;
            clone.appendChild(li);
        }
        ol.parentElement?.replaceChild(clone, ol);

        // Set duration for time bar (i.e. hourglass⌛):
        const time = msg.general_info.time_seconds;
        const tBar = document.getElementById("ml_timebar");
        if (!time || !tBar)
            return;
        
        tBar.style.setProperty("--time_to_fill", `${time}s`);
    });
})();
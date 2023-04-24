(function(){
    document.addEventListener("staticpage", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg.general_info;
        const main = document.getElementById("main");

        // Simply directly place the html on the screen:
        if ("html" in msg && main && msg.html !== main.innerHTML) {
            main.innerHTML = msg.html;
        }
    });
})();
(function(){
    document.addEventListener("crowdjudge", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        const jsonDiv = document.getElementById("json_raw");
        if (!msg || !jsonDiv)
            return;
        
        jsonDiv.innerText = JSON.stringify(msg, null, 2);
    });
})();
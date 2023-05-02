(function(){
    document.addEventListener("adminmsgstate", (ev: Event) => {
        
        // Set text of p element to the received message:
        const msg = (ev as CustomEvent).detail.new_msg;
        if (!msg?.admin_info?.message)
            return;
        const message_p = document.getElementById("admin_message_p");
        if (!message_p)
            return;
        
        message_p.textContent = msg.admin_info.message;
    });
})();
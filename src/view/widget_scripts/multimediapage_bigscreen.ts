(function () {
    document.addEventListener("multimediapage", (ev: Event) => {
        const main = document.getElementById("main");
        const msg = (ev as CustomEvent).detail.new_msg;
        if (!main || !msg?.general_info?.path || !msg.general_info.type)
            return;

        // Don't want to refresh: we are probably showing a video
        const msg_old = (ev as CustomEvent).detail.old_msg;
        if (msg_old?.widget_name === "multimediapage" &&
            msg_old.general_info?.path === msg.general_info.path
        ) {
            return;
        }

        let elem: HTMLElement | undefined;
        switch (msg.general_info.type) {
            case "video":
                const video = document.createElement("video");
                video.className = "visual_element";
                video.src = msg.general_info.path;
                video.autoplay = true;
                video.controls = true;
                elem = video;
                break;

            case "audio":
                const audio = document.createElement("audio");
                audio.src = msg.general_info.path;
                audio.autoplay = true;
                audio.controls = true;
                elem = audio;
                break;

            case "image":
                const img = document.createElement("img");
                img.className = "visual_element";
                img.src = msg.general_info.path;
                img.alt = "Laadt niet 😢";
                elem = img;
                break;
            default:
                return;
        }
        main.innerHTML = "";
        main.appendChild(elem);
    });
})();
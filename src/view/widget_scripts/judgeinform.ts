(function () {
    document.addEventListener("judgeinform", (ev: Event) => {
        const msg: any | undefined = (ev as CustomEvent).detail.new_msg;
        const q: string = msg?.general_info?.judgeinform_question;
        const as: string[] = msg?.general_info?.judgeinform_answers;
        const qDiv = document.getElementById("judgeinform_question");
        const aDiv = document.getElementById("judgeinform_answers");
        if (!q || !as || !qDiv || !aDiv)
            return;
        
        // Show question:
        qDiv.textContent = q;

        // Show answers:
        const clone = aDiv.cloneNode(false);
        for (const a of as) {
            const li = document.createElement("li");
            li.textContent = a;
            clone.appendChild(li);
        }
        aDiv.parentElement?.replaceChild(clone, aDiv);
    });

})();
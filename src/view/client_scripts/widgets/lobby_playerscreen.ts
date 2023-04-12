(function() {
    
    console.log("Hi from lobby!");
    
    const t = document.getElementById("lobby");
    const m = document.getElementsByClassName("main")[0];
    
    if (t?.innerHTML && t.id) {
        m.innerHTML = t?.innerHTML;
        m.id = t.id;
    }

    const b = document.getElementById("proceed_button");

    b?.addEventListener("click", () => {
        console.log("Cool! The button was clicked :-D.");
        console.log("Btw. The name is: ", (document.getElementById("name_field") as HTMLInputElement).value);
    });

})();
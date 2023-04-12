console.log("Hello from player!");

/*
EXAMPLE IN CHROME:
const s = new WebSocket(`ws://${window.location.host}`, "player");
undefined
s.addEventListener("message", (event) => console.log("Msg!: ", event.data));
undefined
s.send(JSON.stringify({hi: "hello?"}));
undefined
VM746:1 Msg!:  {"widget_name":"lobby","general_info":{"all_players":{}}}
s.send(JSON.stringify({hi: "hello?"}));
undefined
VM746:1 Msg!:  {"widget_name":"lobby","general_info":{"all_players":{}}}
s.send(JSON.stringify({name: "vincent"}));
undefined
VM746:1 Msg!:  {"status":"success","auth_code":"90266"}
s.send(JSON.stringify({name: "vincent"}));
undefined 
*/
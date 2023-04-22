import Game from "./model/game.js";
import Server from "./controller/server.js";
import AdminServer from "./controller/adminserver.js";
import PlayerServer from "./controller/playerserver.js";
import BigScreenServer from "./controller/bigscreenserver.js";

const g = new Game();
const s = new Server();
const bss = new BigScreenServer(g, s);
const ps = new PlayerServer(g, s);
const as = new AdminServer(g, s, ps, "admin", "admin");
console.log("Number of game states: ", g.numberOfStates());
console.log("Current game state: ", g.currentState().name)


s.listen(8080);
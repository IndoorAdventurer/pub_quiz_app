import Game from "./model/game.js";
import Server from "./controller/server.js";
import PlayerServer from "./controller/playerserver.js";
import BigScreenServer from "./controller/bigscreenserver.js";

const g = new Game();
const s = new Server();
const ps = new PlayerServer(g, s);
const bss = new BigScreenServer(g, s);
console.log("Number of game states: ", g.numberOfStates());
console.log("Current game state: ", g.currentState().name)


s.listen(8080);
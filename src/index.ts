import Game from "./model/game.js";
import Server from "./controller/server.js";
import PlayerServer from "./controller/playerserver.js";

const g = new Game();
const s = new Server();
const pc = new PlayerServer(g, s);


s.listen(8080);
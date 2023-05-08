import Game from "./model/game.js";
import Server from "./controller/server.js";
import AdminServer from "./controller/adminserver.js";
import PlayerServer from "./controller/playerserver.js";
import BigScreenServer from "./controller/bigscreenserver.js";
import { readFileSync } from "fs";
import yesOrThrow from "./utils/yesorthrow.js";
import gamelogger from "./utils/datarecording.js";

const config_file = "./tests/test_game.json"; // TODO: get from CLI arguments
const config = JSON.parse(readFileSync(config_file, "utf-8"));
const name = yesOrThrow(config, "admin_name");
const auth = yesOrThrow(config, "admin_auth_code");
const logfile = yesOrThrow(config, "logfile")

gamelogger.setTargetFile(logfile);
gamelogger.log("Starting setup.");

const g = new Game(config);
const s = new Server();
const bss = new BigScreenServer(g, s);
const ps = new PlayerServer(g, s);
const as = new AdminServer(g, s, ps, name, auth);

gamelogger.log("Setup complete. Number of game states is " + g.numberOfStates());

s.listen(8080);
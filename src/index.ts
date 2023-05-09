import Game from "./model/game.js";
import Server from "./controller/server.js";
import AdminServer from "./controller/adminserver.js";
import PlayerServer from "./controller/playerserver.js";
import BigScreenServer from "./controller/bigscreenserver.js";
import { readFileSync } from "fs";
import yesOrThrow from "./utils/yesorthrow.js";
import gamelogger from "./utils/datarecording.js";
import usage from "./usage.js";

try {
    
    const arg = process.argv.at(-1);
    if (arg === "--help") {
        usage();
        process.exit();
    }
    if (!arg || !arg.endsWith(".json"))
        throw new Error("No json file given as argument.");
    
    const config = JSON.parse(readFileSync(arg, "utf-8"));
    config.config_path = arg;
    const name = yesOrThrow(config, "admin_name");
    const auth = yesOrThrow(config, "admin_auth_code");
    const logfile = yesOrThrow(config, "logfile")

    gamelogger.setTargetFile(logfile);
    gamelogger.log("Starting setup.");

    const g = new Game(config);
    const s = new Server(config);
    const bss = new BigScreenServer(g, s);
    const ps = new PlayerServer(g, s);
    const as = new AdminServer(g, s, ps, name, auth);

    gamelogger.log("Setup complete. Number of game states is " + g.numberOfStates());

    s.listen();
}
catch (e) {
    console.log("An error has occured!");
    console.log(e);
    usage();
}
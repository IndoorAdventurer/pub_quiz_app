import Game from "../model/game.js";
import { GameDataMsg, PlayerListener, GameListener, PlayerDataMsg }
    from "../model/gametypes.js";
import Server, { ServerListener } from "./server.js";
import { Request, Response } from "express";
import { WebSocket } from "ws";


/**
 * This class is responsible for sending data to Big Screen clients. These are
 * passive web pages that are displayed on a big screen (e.g. a TV) and show,
 * for example, the question, or a video fragment, etc.
 * 
 * This class serves as a middleman between the `Game` object, and the big screen
 * client.
 */
export default class BigScreenServer implements PlayerListener, GameListener, ServerListener {
    
    private game: Game;
    private server: Server;

    private clients: WebSocket[] = [];


    /**
     * Constructor. Sets up all the infrastructure.
     * @param game The Game to listen to, and interact with
     * @param server The server that gives new socket connection etc
     */
    constructor(game: Game, server: Server) {
        const route = "/bigscreen";

        this.game = game;
        this.server = server;

        game.addPlayerListener(this);
        game.addGameListener(this);
        server.addServerListener(route, this);
    }

    //---`GameListener`/`PlayerListener`-methods:-------------------------------
    /**
     * The update method that gets called by game whenever something changed.
     * @param val Specifies the topic of the change. This can either be "player"
     * or "game". The former means, for example, that the scores of the players
     * were updated. The latter means, for example, that we went to the next
     * question.
     * @param msg When `val` is "player", this will be a `PlayerDataMsg` object.
     * If `val` is "game", it will be a `GameDataMsg`. In either case it
     * contains all the information needed to act accordingly.
     */
    public update(val: "player" | "game", msg: PlayerDataMsg | GameDataMsg): void {
        if (val === "player")
            this.player_update(msg as PlayerDataMsg);
        else
            this.game_update(msg as GameDataMsg);
    }

    /**
     * Gets called by `update()` whenever there is an update regarding players.
     * @param msg An array containing all information of all players.
     */
    private player_update(msg: PlayerDataMsg) {
        console.log(msg);
    }
    
    /**
     * Gets called by `update()` whenever there is an update regarding the state
     * of the game.
     * @param msg An informative message describing the state of the game.
     */
    private game_update(msg: GameDataMsg) {
        for (const socket of this.clients)
            this.sendGameUpdate(socket, msg);
    }

    //---`ServerListener`-methods:----------------------------------------------

    // See `ServerListener` for docs
    public express_get(req: Request, res: Response): void {
        res.send(this.game.bigScreenView);
    }
    
    // See `ServerListener` for docs
    public add_websocket(socket: WebSocket): void {
        this.clients.push(socket);

        socket.onclose = (event) => {
            const idx = this.clients.indexOf(socket);
            if (idx !== -1)
                this.clients.splice(idx, 1);
            
            console.log("A bigscreen websocket connection was closed.");
        }

        const msg = this.game.getGameDataMsg();
        this.sendGameUpdate(socket, msg);
    }


    //---The-fun-stuff:---------------------------------------------------------
    
    /**
     * Send an update to the big screen client containing the current game state
     * information.
     * @param socket The socket to send it to
     * @param msg The message obtained from the current active `GameState`
     */
    private sendGameUpdate(socket: WebSocket, msg: GameDataMsg) {
        const gi = msg.general_info;
        const wn = "widget_name" in gi ? gi.widget_name : msg.widget_name;
        socket.send(JSON.stringify({
            widget_name: wn,
            general_info: gi
        }));
    }
}
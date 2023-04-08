import Game, {GameDataMsg, PlayerListener, GameListener, PlayerDataMsg} from "../model/game.js";
import Server, {ServerListener} from "./server.js";
import { Request, Response } from "express";
import { WebSocket } from "ws";

/**
 * This class is responsible for handling all traffic to and from the players.
 * This includes both handling of HTTP GET requests, as well as websocket
 * traffic.
 * 
 * It acts as the middleman between the `Game` object defined in
 * `src/model/game.ts`, and the clients. This means that this class should
 * also listen for updates from the `Game` object, and notify the clients
 * about this via the WebSocket connection.
 */
export default class PlayerServer implements PlayerListener, GameListener, ServerListener {
    
    
    private game: Game;
    private server: Server;

    // New websocket clients get stored in `anonymous_clients` first.
    private anonymous_clients: WebSocket[] = [];

    // After they identified themselves with a name (and received a code), they
    // will be moved from `anonymous_clients` to `known_clients`, where their
    // name is the key/entry into the map.
    private known_clients: SocketMap = new Map<string, SocketData>();

    
    constructor(game: Game, server: Server) {
        this.game = game;
        this.server = server;

        game.addPlayerListener(this);
        game.addGameListener(this);
        server.addServerListener("/player", this);
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
            this.player_update(<PlayerDataMsg>msg);
        else
            this.game_update(<GameDataMsg>msg);
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
        console.log(msg);
    }
    
    //---`ServerListener`-methods:----------------------------------------------
    public express_get(req: Request, res: Response) {
        res.send("Have to implement this method still. Also requires stuff in game.ts etc to be added. Much work!");
    }
    public add_websocket(socket: WebSocket) {
        // Temp implementation! TODO REMOVE AND REDO
        
        this.anonymous_clients.push(socket);
        
        socket.onclose = (event) => {
            const idx = this.anonymous_clients.indexOf(socket);
            if (idx !== -1)
                this.anonymous_clients.splice(idx, 1);
        }

        socket.onmessage = (event) => {
            console.log(event.data);
            socket.send(`I got your message!. Btw I have ${this.anonymous_clients.length} clients now.`);
        }
    }

    //---The-fun-stuff:---------------------------------------------------------
    
}

// A map of all client sockets that have already identified themselves.
type SocketData = {auth_code: string, socket: WebSocket}
type SocketMap = Map<string, SocketData>;
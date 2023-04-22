import Game from "../model/game.js";
import { GameDataMsg, PlayerListener, GameListener, PlayerDataMsg }
    from "../model/gametypes.js";
import Server, { ServerListener } from "./server.js";
import { Request, Response } from "express";
import { WebSocket, MessageEvent } from "ws";


/**
 * This class handles communication with the admin client. The admin client is
 * the quiz master (i.e. me 😜). He/she has to authorize him/herself using a
 * name and password that is specified in the JSON file specifying the whole
 * game and all the questions. The admin has control over the game and can,
 * for example, move to the next question, manipulate the players' scores or
 * even delete them, and check answers to open questions.
 * 
 * This class acts as the middleman between the `Game` and such admin clients.
 * This means that this class should also listen for updates from `Game` and
 * forward these to the admin clients.
 */
export default class AdminServer implements PlayerListener, GameListener, ServerListener {


    private game: Game;

    private clients: WebSocket[] = [];
    private name: string;
    private auth_code: string;

    /**
     * Constructor. Sets up all the infrastructure for admin
     * @param game The Game to listen to, and interact with
     * @param server The server that gives new socket connection etc
     */
    constructor(game: Game, server: Server, name: string, auth_code: string) {
        const route = "/admin";

        this.game = game;

        this.name = name;
        this.auth_code = auth_code;

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
        res.send(this.game.adminView);
    }

    // See `ServerListener` for docs
    public add_websocket(socket: WebSocket): void {
        // Add an initial onmessage listener that checks if the 
        socket.onmessage = (event) => this.anonymous_client_listener(socket, event);
    }

    //---The-fun-stuff:---------------------------------------------------------
    /**
     * Method that receives messages from known admin clients. These will
     * always be commands to change something in the game, like deleting a
     * player or moving to the next question/game state.
     * @param socket The socket that sent the message
     * @param event The event containing the message
     */
    private known_client_listener(socket: WebSocket, event: MessageEvent) {
        try {
            console.log("TODO");
            console.log(event.data);
        } catch (e: any) {
            console.warn("Known admin threw an error!");
        }
    }
    
    /**
     * Listens for messages from clients that connected but did authorize
     * themselves yet. Sees if they sent valid credentials and give them
     * full authority if yes.
     * @param socket The admin client socket that sent the message
     * @param event The event containing the message data
     */
    private anonymous_client_listener(socket: WebSocket, event: MessageEvent) {
        try {
            const data = JSON.parse(event.data.toString());
            if ("name" in data && "auth_code" in data &&
                data.name === this.name && data.auth_code === this.auth_code) {

                this.clients.push(socket);
                socket.onclose = (event) => {
                    const idx = this.clients.indexOf(socket);
                    if (idx !== -1)
                        this.clients.splice(idx, 1);

                    console.log("An admin websocket connection was closed.");
                }

                socket.onmessage = (ev) => this.known_client_listener(socket, ev);

                socket.send(JSON.stringify({status: "logged in"}));
                
                const msg = this.game.getGameDataMsg();
                this.sendGameUpdate(socket, msg);
            }
            else
                socket.send(JSON.stringify({
                    status: "failure",
                    error_msg: "Invalid name and/or auth_code"
                }));
        } catch (e: any) {
            console.warn("anonymous admin threw error!", e);
            socket.close();
        }
    }

    /**
     * Notifies the admin client of a change in the state of the game
     * @param socket The socket to send the message to
     * @param msg The `GameDataMsg` describing the current state of the game
     */
    private sendGameUpdate(socket: WebSocket, msg: GameDataMsg) {
        const gi = msg.general_info;
        const ai = msg.admin_info;
        const wn = ai && "widget_name" in ai ? gi.widget_name : msg.widget_name;
        socket.send(JSON.stringify({
            widget_name: wn,
            admin_info: ai,
            general_info: gi
        }));
    }

}
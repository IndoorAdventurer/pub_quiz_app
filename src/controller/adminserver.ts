import Game from "../model/game.js";
import { GameDataMsg, PlayerListener, GameListener, PlayerDataMsg }
    from "../model/gametypes.js";
import Server, { ServerListener } from "./server.js";
import { Request, Response } from "express";
import { WebSocket, MessageEvent } from "ws";
import PlayerServer from "./playerserver.js";


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
    private player_server: PlayerServer;

    private clients: WebSocket[] = [];
    private name: string;
    private auth_code: string;

    /**
     * Constructor. Sets up all the infrastructure for admin
     * @param game The Game to listen to, and interact with
     * @param server The server that gives new socket connection etc
     */
    constructor(game: Game, server: Server, player_server: PlayerServer,
        name: string, auth_code: string) {

        const route = "/admin";

        this.game = game;
        this.player_server = player_server

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
     * In the case of admin just sends all the data over :-)
     * @param msg An array containing all information of all players.
     */
    private player_update(msg: PlayerDataMsg) {
        for (const socket of this.clients)
            this.sendPlayerUpdate(socket, msg);
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
            const data = JSON.parse(event.data.toString());
            switch (data.action) {
                // Changing which game state is active:
                case "set_game_state":
                    if ("idx" in data && "relative" in data)
                        this.game.setCurState(data.idx, data.relative);
                    return;
                
                // Changing the score of an individual player:
                case "set_score":
                    if ("player" in data && "score" in data)
                        this.game.updateScores(
                            new Map([[data.player, data.score]]), false);
                    return;
                
                // Changing the isplaying boolean of an individual player:
                case "set_isplaying":
                    if ("player" in data && "isplaying" in data)
                        this.game.setIsPlaying(
                            new Set([data.player]), data.isplaying);
                    return;
                
                // Remove a player from the game:
                case "remove_player":
                    if ("player" in data)
                        this.game.removePlayer(data.player);
                    return;
                
                // Add a player to the game:
                case "add_player":
                    if (!("name" in data && this.game.addPlayer(data.name))) {
                        socket.send(JSON.stringify({
                            status: "failure",
                            error_msg: "Name is taken"
                        }));
                    }
                    return;
                
                // If action undefined or anything else, we let the game deal
                // with it :-)
                default:
                    this.game.currentState().adminAnswer(data);
                
                // Set wildcard authcode of PlayerServer:
                case "set_wildcard_auth":
                    if ("auth_code" in data)
                        this.player_server.setWildcardAuthCode(data.auth_code);
                    return;
            }
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

                // Sending bunch of update messages directly:
                socket.send(JSON.stringify({ status: "logged in" }));

                const msgGame = this.game.getGameDataMsg();
                this.sendGameUpdate(socket, msgGame);

                const msgPlayer = this.game.playerDataDump();
                this.sendPlayerUpdate(socket, msgPlayer);
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
        const wn = ai && "widget_name" in ai ? ai.widget_name : msg.widget_name;
        socket.send(JSON.stringify({
            widget_name: wn,
            admin_info: ai,
            general_info: gi
        }));
        socket.send(JSON.stringify({
            status: "state_info",
            widget_name: wn,
            widget_index: this.game.currentStateIdx(),
            num_widgets: this.game.numberOfStates()
        }));
    }

    private sendPlayerUpdate(socket: WebSocket, msg: PlayerDataMsg) {
        socket.send(JSON.stringify({ player_update: msg }));
    }

}
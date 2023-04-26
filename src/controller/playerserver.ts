import Game from "../model/game.js";
import { GameDataMsg, PlayerListener, GameListener, PlayerDataMsg }
    from "../model/gametypes.js";
import Server, { ServerListener } from "./server.js";
import { Request, Response } from "express";
import { WebSocket, MessageEvent } from "ws";

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

    // New websocket clients get stored in `anonymous_clients` first.
    private anonymous_clients: WebSocket[] = [];

    // After they identified themselves with a name (and received a code), they
    // will be moved from `anonymous_clients` to `known_clients`, where their
    // name is the key/entry into the map.
    private known_clients: SocketMap = new Map<string, SocketData>();

    // Sometimes, for example if a player joins in later, he has to be able to
    // get into the game outside of the lobby state. For that the admin can set
    // a wildcard authorization code, which the player can then fill in manually
    private wildcard_auth_code: string | undefined;


    /**
     * Constructor. Sets up all the infrastructure for players
     * @param game The Game to listen to, and interact with
     * @param server The server that gives new socket connection etc
     */
    constructor(game: Game, server: Server) {
        const route = "/player";

        this.game = game;

        game.addPlayerListener(this);
        game.addGameListener(this);
        server.addServerListener(route, this);
        server.setDefaultRoute(route);
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
        // First checking if we have to remove clients:
        if (msg.length !== this.known_clients.size) {
            const names = new Set(this.known_clients.keys());
            for (const p of msg)
                names.delete(p.name);
            for (const n of names) {
                this.known_clients.get(n)?.socket?.close();
                this.known_clients.delete(n);
            }
        }

        // Send the player its most up to date score:
        for (const p of msg) {
            this.sendPlayerUpdate(p.name, p.score);
        }
    }

    /**
     * Gets called by `update()` whenever there is an update regarding the state
     * of the game.
     * @param msg An informative message describing the state of the game.
     */
    private game_update(msg: GameDataMsg) {

        // If we are in the lobby, we send unregistered clients the game state:
        if (msg.widget_name === "lobby") {
            const toSend = this.anon_lobby_msg(msg);
            for (const s of this.anonymous_clients)
                s.send(toSend);
        }

        // We always send all registered clients the game state:
        for (const [name, s_data] of this.known_clients)
            if (s_data.socket)
                this.sendGameUpdate(name, s_data.socket, msg);
    }

    //---`ServerListener`-methods:----------------------------------------------

    // See `ServerListener` for docs
    public express_get(req: Request, res: Response) {
        res.send(this.game.playerView);
    }

    // See `ServerListener` for docs
    public add_websocket(socket: WebSocket) {

        this.anonymous_clients.push(socket);

        // Add an on-close listener:
        socket.onclose = (event) => {
            let idx = this.anonymous_clients.indexOf(socket);
            if (idx !== -1)
                this.anonymous_clients.splice(idx, 1);
            else {
                // In the map we just set the socket to null, so that we keep
                // the auth_code, and maybe can let the same client re-join
                // later
                const arr = Array.from(this.known_clients.entries());
                const entry = arr.find(([_, s]) => s.socket === socket);
                if (entry)
                    entry[1].socket = null;
            }
            console.log("A player websocket connection was closed.");
        }

        socket.onmessage = (event) => this.anonymous_client_listener(socket, event);
    }

    //---The-fun-stuff:---------------------------------------------------------

    /**
     * Sets the wildcard authorization code. This can be used, for example,
     * by players who join the game at a later moment. They will ask the admin
     * to set this, and then they can fill it out manually to join.
     * @param auth_code An authorization code
     */
    public setWildcardAuthCode(auth_code: string) {
        this.wildcard_auth_code = auth_code;
    }

    /**
     * This method gets called when a known client socket sends a message. It
     * first checks if everything is in order (authentication). If so, it
     * forwards the received message to the active GameState object.
     * @param socket The socket that sent the message
     * @param event The MessageEvent containing the message data
     */
    private known_client_listener(socket: WebSocket, event: MessageEvent) {
        try {
            // Checking if everything okay, and then forward answer to GameState.
            const data = JSON.parse(event.data.toString());
            if (!("name" in data &&
                "auth_code" in data &&
                "answer" in data &&
                this.known_clients.has(data.name) &&
                this.known_clients.get(data.name)?.auth_code === data.auth_code &&
                this.game.currentState().playerAnswer(data.name, data.answer))) {

                // No news is good news:
                socket.send(JSON.stringify({
                    status: "failure",
                    error_msg: "Kon je antwoord niet verwerken."
                }));
                return;
            }
        }
        catch (e: any) {
            // Here I won't immediately close the connection since that might
            // cause more harm than good stuff. I forgot how it goes..
            console.warn("known_client_listener threw error!\n", e);
        }
    }

    /**
     * This method gets called when a socket that has not yet identified itself
     * sends a message. If the Game is in the "lobby" state, it will allow the
     * client to interact with it to get itself signed in. If the game is not
     * in this state, but the client sends a valid name and auth_code, then the
     * client will get promoted immediately
     * @param socket The socket that sent the message
     * @param event The MessageEvent containing the message data
     */
    private anonymous_client_listener(socket: WebSocket, event: MessageEvent) {
        try {
            const data = JSON.parse(event.data.toString());
            const state_name = this.game.currentState().name;
            if ("name" in data && "auth_code" in data) {
                if (this.auto_promote(socket, data.name, data.auth_code) ||
                    this.wildcard_login(socket, data.name, data.auth_code))
                    this.sendDualUpdate(data.name, socket);
                else {
                    socket.send(JSON.stringify({
                        status: "failure",
                        error_msg: "Je hebt (automatisch) een ongeldige naam " +
                        "of code gestuurd. Open deze website op een nieuwe " +
                        "pagina."
                    }));
                }
            }
            else if (!("name" in data) && state_name === "lobby") {
                // We are in the lobby, so in that case we can treat it as any other
                // client and give it a state message.
                const msg = this.game.getGameDataMsg();
                socket.send(this.anon_lobby_msg(msg));
            }
            else if ("name" in data && state_name === "lobby") {
                // If the lobby returns true, the player is added to the game! :-D
                if (this.game.currentState().playerAnswer(data.name, "")) {
                    this.promote_and_notify(data.name, socket);
                    this.sendDualUpdate(data.name, socket);
                }
                else
                    socket.send(JSON.stringify({
                        status: "failure",
                        error_msg: "Deze naam is al in gebruik!"
                    }));
            }
            else {
                // If no name is given and we are not in the lobby, send the
                // player to the authorize page, where he has to manually fill
                // out a valid name and auth code (auth code given by admin).
                socket.send(JSON.stringify({ widget_name: "authorize" }));
            }
        }
        catch (e: any) {
            console.warn("anonymous player threw error!", e);
            socket.close();
        }
    }

    /**
     * Inform a client of an update to the game state
     * @param name The name of the client
     * @param socket The socket of the client to send the data to
     * @param msg The update message
     */
    private sendGameUpdate(name: string, socket: WebSocket, msg: GameDataMsg) {
        const psiArr = msg.player_specific_info;
        const psi = name in psiArr ? psiArr[name] : {};
        const wn = "widget_name" in psi ? psi.widget_name : msg.widget_name;
        socket.send(JSON.stringify({
            widget_name: wn,
            general_info: msg.general_info,
            player_specific_info: psi
        }));
    }

    /**
     * Send the player an update about its own score.
     * @param name The name of the player to send the message to
     * @param score The score to send to the player
     */
    private sendPlayerUpdate(name: string, score: number) {
        this.known_clients.get(name)?.socket?.send(JSON.stringify({
            player_update: { score: score }
        }));
    }

    /**
     * Send both game update as well as player update at once. E.g. on first
     * connection
     * @param name Name of the player
     * @param socket Socket to send it to
     */
    private sendDualUpdate(name: string, socket: WebSocket) {
        const msgGame = this.game.getGameDataMsg();
        this.sendGameUpdate(name, socket, msgGame);
        const score = this.game.playerDataDump()
            .find((p) => p.name === name)?.score;
        this.sendPlayerUpdate(name, score || 0);
    }

    /**
     * Promote a player from being unknown to known.
     * @param name The name the player chose, and that was approved by `Game`.
     * @param socket The socket that currently is in `anonymous_clients`, and
     * will be put into `known_clients`.
     */
    private promote_and_notify(name: string, socket: WebSocket, auth: string | null = null) {

        // Generate random authorization code if needed:
        if (!auth) {
            const nums = "0123456789";
            auth = "";
            for (let idx = 0; idx != 5; ++idx)
                auth += nums.charAt(Math.floor(Math.random() * nums.length))
        }

        // Add to known clients:
        this.known_clients.set(name, { auth_code: auth, socket: socket });

        // Remove from unknown clients:
        let idx = this.anonymous_clients.indexOf(socket);
        if (idx !== -1)
            this.anonymous_clients.splice(idx, 1);

        // Giving it a sparkling new onmessage handler! 😍
        socket.onmessage = (event) => this.known_client_listener(socket, event);

        // Notifying it of the success by sending name and auth_code!
        socket.send(JSON.stringify({
            status: "login_succes",
            name: name,
            auth_code: auth
        }));
    }

    /**
     * If a client connects and sends a name and auth_code, it might be one that
     * lost connection and now reconnects. This method checks if the name and
     * auth code match up, and if so restores the socket in the list of known
     * clients
     * @param socket The socket that claims it is known
     * @param name The name it says it has/had
     * @param auth_code The auth code it says it received from the server
     * @returns True if it was restored, false if not.
     */
    private auto_promote(socket: WebSocket, name: string, auth_code: string): boolean {

        // Check if user message makes sense:
        const sock_dat = this.known_clients.get(name);
        if (sock_dat?.auth_code !== auth_code)
            return false;

        // Close socket if there is still another one:
        sock_dat.socket?.close();

        // Promote:
        this.promote_and_notify(name, socket, auth_code);

        return true;
    }

    /**
     * Lets a client login at any state of the game. Only condition is that it
     * sents an auth_code equal to the wildcard auth code set by the admin, and
     * that its name is already present in the game.
     * @param socket The unknown socket to be promoted if all goes well
     * @param name The name this sockets says it has
     * @param auth_code The wildcard auth code
     * @returns `true` on success, `false` on failure.
     */
    private wildcard_login(socket: WebSocket, name: string, auth_code: string): boolean {

        // Auth code must equal wildcard, and game must include name:
        if (auth_code !== this.wildcard_auth_code ||
            !this.game.getPlayerNames().includes(name))
            return false;

        // Maybe there was already a client for this player, so deleting:
        this.known_clients.get(name)?.socket?.close();

        // Promote:
        this.promote_and_notify(name, socket, auth_code);

        // Unset wildcard code:
        this.wildcard_auth_code = undefined;

        return true;
    }

    /**
     * Creates an lobby message for anon players
     * @param msg The GameState update message
     * @returns A string that can directly be sent to the client
     */
    private anon_lobby_msg(msg: GameDataMsg): string {
        const toSend = { widget_name: "lobby", general_info: msg.general_info };
        return JSON.stringify(toSend);
    }
}

// A map of all client sockets that have already identified themselves.
type SocketData = { auth_code: string, socket: WebSocket | null }
type SocketMap = Map<string, SocketData>;
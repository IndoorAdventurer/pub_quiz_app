import { Player, GameListener, PlayerListener, GameDataMsg, PlayerDataMsg }
    from "./gametypes.js";
import type GameState from "./gamestate.js";
import WidgetSnippets from "../view/widgetsnippets.js";
import Lobby from "./lobby.js";

import { readFileSync } from "fs";

/**
 * The main class managing all the data for a game. Most notably, it
 * maintains a list of `Player` objects (see definition below), as well as a list
 * of upcomming rounds/questions.
 */
export default class Game {

    static readonly START_SCORE = 60;

    private state_sequence: GameState[] = [];       // see `gamestate.ts`
    private cur_state_idx: number = 0;              // index into state_sequence
    private players = new Map<string, Player>();    // stores all players

    // These contain the HTML that should be sent to a client at the beginning
    // of a new game.
    public readonly bigScreenView: string;
    public readonly playerView: string;
    public readonly adminView: string;

    // Event listeners for two different topics:
    private gameStateListeners: GameListener[] = [];
    private playerListeners: PlayerListener[] = [];

    /**
     * TODO should get folder as input, such that it can loop over the dirs
     * and find all levels. Or a JSON file or something.
     */
    constructor() {

        // `Lobby` is always the first gamestate of any game. It allows users
        // to enter the game before it really starts.
        new Lobby(this);

        // TODO construct the other game states :-p

        this.bigScreenView =
            this.createView("./src/view/html/bigscreen.html", "bigScreenWidgets");
        this.playerView =
            this.createView("./src/view/html/playerscreen.html", "playerScreenWidgets");
        this.adminView =
            this.createView("./src/view/html/adminscreen.html", "adminScreenWidgets");
    }


    //---STUFF-FOR-GAME-STATES:-------------------------------------------------

    /**
     * ❗**WARNING**❗ This method will be called by the constructor defined
     * in `./gamestate.ts`, such that every `GameState` object will add itself
     * to the game when it is constructed. Making it protected so future me, or
     * other contributors won't screw up, **since this method should never be
     * called elsewhere!!!** In fact, nothing else should ever modify
     * `state_sequence`.
     * @param gs The gamestate that will add itself by calling this method from
     * the `GameState` abstract base class its constructor.
     */
    protected makeGameStateAddSelf(gs: GameState) {
        this.state_sequence.push(gs);
    }

    /**
     * @returns A reference to the game state that is currently active.
     */
    public currentState(): GameState {
        return this.state_sequence[this.cur_state_idx];
    }

    /**
     * @returns The index of the current state. Use, for example, together with
     * `numberOfStates()` to show to user that we are at state X out of Y.
     */
    public currentStateIdx(): number {
        return this.cur_state_idx;
    }

    /**
     * @returns The total number of states. Use, for example, together with
     * `stateIdx()` to show to user that we are at state X out of Y.
     */
    public numberOfStates(): number {
        return this.state_sequence.length;
    }

    /**
     * Move the game to the next state. I.e. the next question, etc.
     */
    public toNextState(): void {
        this.setCurState(this.cur_state_idx + 1);
    }

    /**
     * Move the Game to the gamestate at index `idx`.
     * @param idx The index into the list of game states to move to.
     */
    public setCurState(idx: number): void {
        if (idx < 0 ||
            idx >= this.state_sequence.length ||
            this.state_sequence.length === 0) {
            console.warn("Index for state_sequence out of range. Ignoring.");
            return;
        }

        this.state_sequence[this.cur_state_idx].end_active()
        this.cur_state_idx = idx;
        this.state_sequence[idx].begin_active();
    }

    /**
     * Move the question to a state relative to the current state.
     * @param move_idx Specifies how much states to move along. +1 gives
     * identical behavior to `nextState()`.
     */
    public setRelativeState(move_idx: number): void {
        this.setCurState(this.cur_state_idx + move_idx);
    }

    /**
     * Add a listener to the list of objects interested in game state changes.
     * @param listener The listener to be added. It should implement
     * `listener.update("game")`
     */
    public addGameListener(listener: GameListener): void {
        this.gameStateListeners.push(listener);
    }

    /**
     * Removes a listener to the list of objects interested in game state changes.
     * @param listener The listener to be removed. It should implement
     * `listener.update("game")`
     */
    public removeGameListener(listener: GameListener): void {
        const idx = this.gameStateListeners.indexOf(listener);
        if (idx !== -1) {
            this.gameStateListeners.splice(idx, 1);
        }
    }

    /**
     * Notifies all listeners of a change in game state!
     * @param msg An object describing the state of the game.
     */
    public gameStateChange(msg: GameDataMsg): void {
        // IMPORTANT: following gives room to overwrite widget_name:
        msg = { widget_name: this.currentState().name, ...msg };
        for (const l of this.gameStateListeners) {
            l.update("game", msg);
        }
    }

    /**
     * A private method that I use to load an html-file and append all the
     * widgets to it. It only gets called in the constructor.
     * @param file_name An html file. This file MUST include the string
     * `<!-- !!!SPLIT!!! -->` twice. Where it occurs first, it will add the
     * extra css, and where it occurs second it will incert the html templates
     * and javascript IIFEs.
     * @param xScreenWidgets The name of one of the methods of `GameState` that
     * returns a `WidgetsSnippets` object. E.g. `"playerScreenWidgets"`
     * @returns The html that can be sent to a client.
     */
    private createView<T extends keyof GameState>(
        file_name: `${string}.html`,
        xScreenWidgets: T): string {

        // load html file:
        const file_split = readFileSync(file_name, "utf-8")
            .split("<!-- !!!SPLIT!!! -->");
        if (file_split.length !== 3)
            throw new Error("File given to createView() did not have 2 splits");

        // collect all widget snippets:
        const ws = new WidgetSnippets();
        for (const gs of this.state_sequence)
            ws.union((gs[xScreenWidgets] as () => WidgetSnippets)());

        // insert snippets into file:
        return file_split[0] +
            "<style>\n" + ws.get_css() + "\n</style>\n" +
            file_split[1] +
            ws.get_html() +
            "<script type=\"module\">\n" + ws.get_js() + "</script>\n" +
            file_split[2];
    }


    //---STUFF-FOR-PLAYERS:-----------------------------------------------------

    /**
     * Adds a new player to the game. Ideally done before the first round ofc
     * @param name The name of the player. Should be unique.
     * @returns True if the player was added; False if the name was already
     * in use.
     */
    public addPlayer(name: string): boolean {

        // Unique name:
        if (this.players.has(name))
            return false;

        // Add to map, with name as key.
        this.players.set(name, { score: Game.START_SCORE, isplaying: true });

        // Notify of update
        this.playerChange();

        return true;
    }

    /**
     * Removes the specified player
     * @param idx 
     */
    public removePlayer(name: string): void {
        if (!this.players.has(name)) {
            console.warn(`Player "${name}" does not exist. Ignoring`);
            return;
        }

        this.players.delete(name);

        // Notify of update
        this.playerChange();
    }

    /**
     * Get an array of names of players.
     * @param isplaying If `true` (default) it returns to names of all players
     * for which the `player.isplaying` attribute is `true`. If it is `false` it
     * instead returns the ones that are not playing anymore.
     * @returns Array of names
     */
    public getPlayerNames(isplaying: boolean = true): string[] {
        return Array.from(this.players)
            .filter(([_, player]) => player.isplaying === isplaying)
            .map(([name, _]) => name);
    }

    /**
     * @returns Array of objects containing all player data.
     * *Sorted in desceding order of score*
     */
    public playerDataDump(): PlayerDataMsg {
        // Get it as a list:
        const data = Array.from(this.players)
            .map(([name, fields]) => ({ name, ...fields }));

        // Sort in descending order based on score:
        data.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

        return data;
    }

    /**
     * Updates the score of multiple players at once.
     * @param map A map containing valid player names as keys, and score updates
     * as values. How scores are actually updated, depends on the `additive`
     * argument. It is possible to just give a single key-value pair per call,
     * but one should consider the fact that a message is send over the internet
     * to each client after each call to this function!
     * @param additive If this is `true` (default), the values found in `map`
     * will be *added* to the existing score of the corresponding players (i.e.
     * `new = old + update`). If it is `false`, the values found in `map` will
     * *overwrite* the old scores (i.e. `new = update`).
     */
    public updateScores(map: Map<string, number>, additive: boolean = true) {
        // Iterate over map and update all values
        for (const [name, score] of map.entries()) {
            const player = this.players.get(name);
            if (player)
                player.score = additive ? player.score + score : score;
            else
                console.warn("Tried updating non existing Player. Ignoring");
        }

        // Notify of update
        this.playerChange();
    }

    /**
     * Changes the isplaying attribute for all listed players
     * @param players A set of players. For each, their `player.isplaying` value
     * will be set to the `isplaying` value given as second argument to this
     * method.
     * @param isplaying A boolean value. True means the player is still
     * competing for the price; false means he/she is not.
     */
    public setIsPlaying(players: Set<string> | string[], isplaying: boolean) {
        for (const name of players) {
            const player = this.players.get(name);
            if (player)
                player.isplaying = isplaying;
            else
                console.warn("Tried updating non existing Player. Ignoring");
        }

        // Notify of update
        this.playerChange();
    }

    /**
     * Add a listener to the list of objects interested in player changes.
     * @param listener The listener to be added. It should implement
     * `listener.update("player")`
     */
    public addPlayerListener(listener: PlayerListener): void {
        this.playerListeners.push(listener);
    }

    /**
     * Removes a listener to the list of objects interested in player changes.
     * @param listener The listener to be removed. It should implement
     * `listener.update("player")`
     */
    public removePlayerListener(listener: PlayerListener): void {
        const idx = this.playerListeners.indexOf(listener);
        if (idx !== -1) {
            this.playerListeners.splice(idx, 1);
        }
    }

    /**
     * Notifies all listeners of a change regarding the players. E.g. change in
     * score.
     */
    public playerChange(): void {
        const datadump = this.playerDataDump();
        for (const l of this.playerListeners) {
            l.update("player", datadump);
        }
    }
}
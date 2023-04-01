
/**
 * The main class managing all the data for a game. Most notably, it
 * maintains a list of players (see `Player` class), as well as a list of
 * upcomming rounds/questions. In addition, it should forward many function
 * calls directly to a `GameState`, as these have all the responsibilites of
 * making the game go forward.
 */
export default class Game {

    static readonly START_SCORE = 60;

    private state_sequence: GameState[] = [];       // i.e. questions; see below
    private players = new Map<string, Player>();    // stores all players

    // Event listeners for two different topics:
    private gameStateListeners: Listener<"game">[] = [];
    private playerListeners: Listener<"player">[] = [];

    /**
     * TODO should get folder as input, such that it can loop over the dirs
     * and find all levels.
     */
    constructor() {
        // TODO!
    }


    //---STUFF-FOR-GAME-STATES:-------------------------------------------------

    /**
     * Moves the game to the next state/question.
     */
    public nextStateManip(): void {
        if (this.state_sequence.length !== 0)
            return;

        this.state_sequence.shift().end_active();
        this.state_sequence[0].begin_active();
    }

    /**
     * Add a listener to the list of objects interested in game state changes.
     * @param listener The listener to be added. It should implement
     * `listener.update("game")`
     */
    public addGameListener(listener: Listener<"game">): void {
        this.gameStateListeners.push(listener);
    }

    /**
     * Removes a listener to the list of objects interested in game state changes.
     * @param listener The listener to be removed. It should implement
     * `listener.update("game")`
     */
    public removeGameListener(listener: Listener<"game">): void {
        const idx = this.gameStateListeners.indexOf(listener);
        if (idx !== -1) {
            this.gameStateListeners.splice(idx, 1);
        }
    }

    /**
     * Notifies all listeners of a change in game state!
     * @param obj An object describing the state of the game.
     */
    public gameStateChange(obj: Object): void {
        for (const l of this.gameStateListeners) {
            l.update("game", obj);
        }
    }


    //---STUFF-FOR-PLAYERS:-----------------------------------------------------

    /**
     * Adds a new player to the game. Ideally done before the first round ofc
     * @param name The name of the player. Should be unique. Else gets padded
     * with Xs till it is unique
     */
    public addPlayer(name: string): void {

        // Unique name:
        while (this.players.has(name))
            name += "X";

        // Add to map, with name as key.
        this.players.set(name, { score: Game.START_SCORE, isplaying: true });

        // Notify of update
        this.playerChange();
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
     * @returns The number of Players registered
     */
    public numberOfPlayers(): number {
        return this.players.size;
    }

    /**
     * @returns All the names of players
     */
    public getAllPlayerNames(): Set<string> {
        return new Set(this.players.keys());
    }

    /**
     * @returns Array of objects containing all player data. Sorted in desceding
     * order of score
     */
    public playerDataDump(): { name: string, score: number, isplaying: boolean }[] {
        // Get it as a list:
        const data = Array.from(this.players.entries())
            .map(([name, fields]) => ({ name, ...fields }));

        // Sort in descending order based on score:
        data.sort((a, b) => b.score - a.score);

        return data;
    }


    /**
     * Updates the scores of all players **Important! Use this instead of the
     * setter for individual players when possible, because every time you call
     * the setter a state change message has to be sent te each client!**
     * @param map A `Map<string, number>` where keys are player names, and
     * values are values to add to the corresponding player its score. Make sure
     * all players specified in map actually exist!
     */
    public addToScores(map: Map<string, number>): void {
        // Iterate over map and update all values
        for (const [name, score] of map.entries()) {
            const player = this.players.get(name);
            if (player)
                player.score += score;
            else
                console.warn("Tried updating non existing Player. Ignoring");
        }

        // Notify of update
        this.playerChange();
    }

    /**
     * Getter method for retrieving the score field for a Player given a name
     * @param name The name of the player to retrieve the score from 
     * @returns The retrieved score
     */
    public getScore(name: string): number | undefined {
        const player = this.players.get(name);
        return player?.score;
    }

    /**
     * Getter method for retrieving the isplaying field for a Player given a key
     * @param name The name of the player to retrieve the `isplaying` state from 
     * @returns The `isplaying` state: a boolean that specifies if the player
     * is still part of the playing people, or if he/she lost and is now going
     * for the consolation price.
     */
    public isPlaying(name: string): boolean | undefined {
        const player = this.players.get(name);
        return player?.isplaying;
    }

    /**
     * Setter method for setting the score field for a Player given a key
     * @param name The name of the player: key to retrieve player with
     * @param score The new score for this player.
     */
    public setScore(name: string, score: number): void {
        const player = this.players.get(name);
        if (player)
            player.score = score;
        else
            console.warn("Setter called for player that does not exist!");

        // Notify of update
        this.playerChange();
    }

    /**
     * Setter method for setting the isplaying field for a Player given a key
     * @param name The name of the player: key to retrieve player with
     * @param isplaying A boolean stating if the player is still in game or not
     */
    public setIsPlaying(name: string, isplaying: boolean): void {
        const player = this.players.get(name);
        if (player)
            player.isplaying = isplaying;
        else
            console.warn("Setter called for player that does not exist!");
        
        // Notify of update
        this.playerChange();
    }

    /**
     * Add a listener to the list of objects interested in player changes.
     * @param listener The listener to be added. It should implement
     * `listener.update("player")`
     */
    public addPlayerListener(listener: Listener<"player">): void {
        this.playerListeners.push(listener);
    }

    /**
     * Removes a listener to the list of objects interested in player changes.
     * @param listener The listener to be removed. It should implement
     * `listener.update("player")`
     */
    public removePlayerListener(listener: Listener<"player">): void {
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


/**
 * Represents a certain state of the game. For example, a specific question, or
 * a specific round. Even the pre-game state where people can log in should be
 * derived from this class. Gets access to the relevant internals of the `Game`
 * class, as it is responsible for manipulating these. For example, a question
 * is itself responsible for updating the points of individual players.
 */
export abstract class GameState {

    // GameState object needs to be able to interact with a game:
    protected parent_game: Game;

    // GameState object needs a name that gets appended to update messages
    // such that there is no confusion about what the active game state is
    public readonly abstract name: string;

    constructor(parent_game: Game) {
        this.parent_game = parent_game;
    }

    /**
     * Gets called when `Game` hands control over to this object, such that it
     * gets notified it is in charge now. It can, for example, set things up
     * to start a timer that makes the player's points tick away, or make sure
     * the players will see the appropriate screen, etc.
     */
    @GameState.stateChanger
    public begin_active(): void { }

    /**
     * Gets called when `Game` hands control over to the next `GameState`
     */
    // Not adding decorator here, since the next `GameState` its `begin_active`
    // will be called right afterwards.
    public end_active(): void { }

    /**
     * Has to return boiler plate code that gets put up on the big screen. For
     * example, for a multiple choice question, it should be a template html
     * structure to show a question and multiple possible answers (A, B, C, D).
     * The template should of course not show specific questions in this case.
     * A script that receives a specific questions from the clients should be
     * implemented for this (see) below. That modifies the template with these
     * specific questions.
     * 
     * 
     * @returns `HTML` boiler plate code of the following form:
     * ```html
     * <template id="somename">
     *     <!--boilerplate html-->
     * </template>
     * <script>
     * document.addEventListener("somename", (e) => {
     *   const obj = e.detail;
     *   // modify page described in <template somename>
     * })
     * </script>
     * ```
     * The script is optional. It should implement an event listener that
     * receives the object from the server in event.detail, and updates the
     * page described in the template accordingly.
     */
    public abstract bigScreenTemplate(): string;

    /**
     * Has to return the `HTML` the player gets to see on his or her screen. For
     * example, a screen with 4 buttons for a multiple choice answer.
     * @param name The name of the player that makes the request.
     */
    /**
     * Has to return boiler plate code for showing something on the screen of
     * an individual player. Just as with `bigScreenTemplate()`, this will all
     * be send beforehand to the client, such that most traffic that comes after
     * is via websocket updates (in a SPA-type manner).
     * 
     * @returns `HTML` boiler plate code of the following form:
     * ```html
     * <template id="somename">
     *     <!--boilerplate html-->
     * </template>
     * <script>
     * document.addEventListener("somename", (e) => {
     *   const obj = e.detail;
     *   // modify page described in <template somename>
     * })
     * </script>
     * ```
     * The script is optional. It should implement an event listener that
     * receives the object from the server in event.detail, and updates the
     * page described in the template accordingly.
     */
    public abstract playerScreenTemplate(): string;

    /**
     * When a player gives some response this function will have to process
     * that response. For example, if the response is a good answer, it can
     * calculate what score the player has gained, so it can add this later to
     * that players total using `Game.addToScores()`.
     * @param name The name of the player
     * @param response The response the player gave
     */
    public abstract playerAnswer(name: string, response: string): boolean;

    /**
     * A method decorator. Any method of a class that derives from
     * `GameState` should be decorated with `@GameState.updatesGame()` if it
     * makes some change to the visible state of the game.
     * @returns A decorator that ensures the `Game` object notifies all clients
     * of an update when it is called. **IMPORTANT!** it gives the return value
     * of the decorated method as argument to the update function
     */
    public static stateChanger: MethodDecorator = function(   target: Object,
        key: string | symbol,
        descriptor: PropertyDescriptor) {
        const of = descriptor.value;
        descriptor.value = function( ... args: any[]) {
        const out =  of.apply(this, args);
        (<Game>this.parent_game).gameStateChange(out);
        return out;
        }

        return descriptor;
}

}


/**
 * Represent a player in the game. Manages its data, such as score, etc.
 */
interface Player {
    score: number,          // The players score
    isplaying: boolean      // At some point, only the top-n players will keep
    // playing, while the left-over ones will compete  for the consolation price
}

/**
 * An interface for the observer pattern: Any class that wants to receive
 * a notification when the state of the game has changed, has to extend this
 * interface.
 * `T` should be a string specifying the topic. For example, we can have:
 * `class Foo implements Listener<"topic-x"> {}`
 */
interface Listener<T> {
    /**
     * The function that should be implemented
     * @param val a string describing the 'topic'
     * @param obj an object describing the state. Should contain all the info
     * the viewer would want.
     */
    update(val: T, obj: Object): void;
}
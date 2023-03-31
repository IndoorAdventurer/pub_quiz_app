
/**
 * The main class managing all the data for a game. Most notably, it
 * maintains a list of players (see `Player` class), as well as a list of
 * upcomming rounds/questions. In addition, it should forward many function
 * calls directly to a `GameState`, as these have all the responsibilites of
 * making the game go forward.
 */
export default class Game {

    static readonly START_SCORE = 60;

    private state_sequence: GameState[] = [];   // i.e. questions; see below
    private players: Player[] = [];             // The players playing. Should
    // always be sorted max2min

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


    //---STUFF-FOR-PLAYERS:-----------------------------------------------------

    /**
     * Adds a new player to the game. Ideally done before the first round ofc
     * @param name The name of the player. Should be unique. Else padded with Xs
     */
    public addPlayer(name: string): void {

        // unique name:
        while (this.players.some(player => player.name === name))
            name = name + "X";

        this.players.push({
            name: name,
            score: Game.START_SCORE,
            isplaying: true
        })
    }

    /**
     * Removes the player at a given index
     * @param idx 
     */
    public removePlayer(idx: number): void {
        if (idx >= this.players.length) {
            console.warn("Tried to remove an out of bounds object. Ignoring.");
            return;
        }

        this.players.splice(idx, 1);
    }

    /**
     * @returns The number of Players registered
     */
    public numberOfPlayers(): number {
        return this.players.length;
    }

    /**
     * @param idx Index of player to be accessed
     * @returns This Players its name
     */
    public getPlayerName(idx: number): string | null {
        if (idx >= this.players.length) {
            console.warn("Tried to access an out-of-bounds player. Ignoring.");
            return null;
        }
        return this.players[idx].name;
    }

    /**
     * @param idx Index of player to be accessed
     * @returns This Players its score
     */
    public getPlayerScore(idx: number): number | null {
        if (idx >= this.players.length) {
            console.warn("Tried to access an out-of-bounds player. Ignoring.");
            return null;
        }
        return this.players[idx].score;
    }

    /**
     * @param idx Index of player to be accessed
     * @returns This Players its `isPlaying` state (boolean)
     */
    public getPlayerIsPlaying(idx: number): boolean | null {
        if (idx >= this.players.length) {
            console.warn("Tried to access an out-of-bounds player. Ignoring.");
            return null;
        }
        return this.players[idx].isplaying;
    }

    /**
     * Change the score of a Player
     * @param idx The index of the Player who's score needs to be changed
     * @param score The new score
     * @returns True if success. False otherwise
     */
    public setPlayerScore(idx: number, score: number): boolean {
        if (idx >= this.players.length) {
            console.warn("Tried to set the score of an out-of-bounds player. Ignoring.");
            return false;
        }
        this.players[idx].score = score;
        this.sortPlayers();
        return true;
    }

    /**
     * Adds the array of scores to the scores of the array of players in an
     * element-wise manner
     * @param scoresToAdd The scores to add. Should match up correctly with the
     * players in the list!
     * @returns True on success. False on failure (incorrect sized `scoresToAdd`)
     */
    public addScores(scoresToAdd: number[]): boolean {
        if (scoresToAdd.length !== this.players.length) {
            console.warn("scoresToAdd not of right length. Ignoring.");
            return false;
        }

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].score += scoresToAdd[i];
        }

        this.sortPlayers();

        return true;
    }

    /**
     * Change the `isPlaying` state of a Player
     * @param idx The index of the Player who's score needs to be changed
     * @param score The new `isPlaying` state (boolean)
     * @returns True if success. False otherwise
     */
    public setPlayerIsPlaying(idx: number, isPlaying: boolean): boolean {
        if (idx >= this.players.length) {
            console.warn("Tried to set the isPlaying flag of an out-of-bounds player. Ignoring.");
            return false;
        }
        this.players[idx].isplaying = isPlaying;
        return true;
    }

    /**
     * Private method to sort players based on score in ascending order
     */
    private sortPlayers(): void {
        this.players.sort((a, b) => b.score - a.score);
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

    protected parent_game: Game;

    constructor(parent_game: Game) {
        this.parent_game = parent_game;
    }

    /**
     * Gets called when `Game` hands control over to this object, such that it
     * gets notified it is in charge now. It can, for example, set things up
     * to start a timer that makes the player's points tick away, or make sure
     * the players will see the appropriate screen, etc.
     */
    public begin_active(): void { }

    /**
     * Gets called when `Game` hands control over to the next `GameState`
     */
    public end_active(): void { }

}


/**
 * Represent a player in the game. Manages its data, such as score, etc.
 */
interface Player {
    name: string,           // A self chosen name of the player
    score: number,          // The players score
    isplaying: boolean      // At some point, only the top-n players will keep
    // playing, while the left-over ones will compete
    // for the consolation price
}
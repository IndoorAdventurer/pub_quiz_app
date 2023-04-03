import Game from "./game.js";

/**
 * Represents a certain state of the game. For example, a specific question, or
 * a specific round. Even the pre-game state where people can log in should be
 * derived from this class. Gets access to the relevant internals of the `Game`
 * class, as it is responsible for manipulating these. For example, a question
 * is itself responsible for updating the points of individual players.
 */
export default abstract class GameState {

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
     * 
     * **NOTE:** if you have more than one template you can return a set of
     * strings.
     */
    public abstract bigScreenTemplate(): string | Set<string>;

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
     * 
     * **NOTE:** if you have more than one template you can return a set of
     * strings.
     */
    public abstract playerScreenTemplate(): string | Set<string>;

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
    public static stateChanger: MethodDecorator = function (target: Object,
        key: string | symbol,
        descriptor: PropertyDescriptor) {
        const of = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const out = of.apply(this, args);
            (<Game>this.parent_game).gameStateChange(out);
            return out;
        }

        return descriptor;
    }

}